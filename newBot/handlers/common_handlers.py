from aiogram import types
from aiogram import Bot
from newBot.db import SessionLocal
from newBot.lib.user_roles import get_user_role, send_profile, ROLE_NAMES


async def cmd_start(message: types.Message, bot: Bot) -> None:
    """Handle generic /start command."""
    user_id = message.from_user.id
    db = SessionLocal()
    try:
        role, profile = get_user_role(db, user_id)
    finally:
        db.close()

    if role:
        await send_profile(bot, message.chat.id, role, profile)
    else:
        await message.answer(
            "Вы ещё не зарегистрированы. Используйте полученную ссылку для начала регистрации."
        )