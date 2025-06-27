import asyncio
import logging
from pathlib import Path

from aiogram import Bot, Dispatcher, Router
from aiogram.enums import ParseMode
from aiogram.filters import Command
from aiogram.types import FSInputFile, Message
from aiogram.exceptions import TelegramBadRequest

from asyncio.subprocess import PIPE
from .config import settings

router = Router()

BACKUP_FILE = Path("backup.sql")
BACKUP_INTERVAL = 6 * 60 * 60  # seconds

async def run_backup() -> Path:
    """Dump database using docker and return path to created file."""
    cmd = [
        "docker",
        "exec",
        "-t",
        settings.POSTGRES_CONTAINER,
        "pg_dump",
        "-U",
        settings.DB_USER,
        settings.DB_NAME,
    ]
    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=PIPE,
        stderr=PIPE,
    )
    stdout, stderr = await process.communicate()
    if process.returncode != 0:
        raise RuntimeError(stderr.decode().strip() or "pg_dump failed")
    BACKUP_FILE.write_bytes(stdout)
    return BACKUP_FILE


async def periodic_backup(bot: Bot) -> None:
    """Periodically create and send database backups."""
    chat_id, thread_id = '-1002806831697', '2'
    while True:
        try:
            path = await run_backup()
            await bot.send_document(chat_id, FSInputFile(path), message_thread_id=thread_id)
            logging.info("Backup sent")
        except TelegramBadRequest as e:
            desc = f"{chat_id}" + (f"_{thread_id}" if thread_id else "")
            logging.error("Failed to send backup to chat %s: %s", desc, e)
        except Exception as e:
            logging.error("Backup failed: %s", e)
        await asyncio.sleep(BACKUP_INTERVAL)

@router.message(Command("backup"))
async def backup_handler(message: Message, bot: Bot) -> None:
    """Handle /backup command: create dump and send it."""
    await message.answer("Creating backup...")
    try:
        path = await run_backup()
    except Exception as e:
        await message.answer(f"Backup failed: {e}")
        return
    chat_id, thread_id = '-1002806831697', '2'
    try:
        await bot.send_document(chat_id, FSInputFile(path), message_thread_id=thread_id)
    except TelegramBadRequest as e:
        desc = f"{chat_id}" + (f"_{thread_id}" if thread_id else "")
        await message.answer(f"Failed to send backup to chat {desc}: {e}")
        if chat_id != message.chat.id or thread_id:
            await bot.send_document(message.chat.id, FSInputFile(path))

async def main() -> None:
    logging.basicConfig(level=logging.INFO)
    bot = Bot(token=settings.BACKUP_BOT_TOKEN, parse_mode=ParseMode.HTML)
    dp = Dispatcher()
    dp.include_router(router)
    asyncio.create_task(periodic_backup(bot))
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())