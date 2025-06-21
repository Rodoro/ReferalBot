from aiogram import types
from aiogram import Bot
from newBot.db import SessionLocal
from newBot.lib.user_roles import get_user_role, send_profile, ROLE_NAMES
from newBot.services.user_service import UserService


async def cmd_start(message: types.Message, bot: Bot) -> None:
    """Handle generic /start command."""
    user_id = message.from_user.id
    db = SessionLocal()
    try:
        user_svc = UserService(db)
        user_svc.get_or_create_user(
            telegram_id=user_id,
            full_name=message.from_user.full_name or "",
            username=message.from_user.username or "",
            role="",
        )
        role, profile = get_user_role(db, user_id)

        if role:
            await send_profile(bot, message.chat.id, role, profile, message.from_user, db)
        else:
            await message.answer(
                "Вы ещё не зарегистрированы. Используйте полученную ссылку для начала регистрации."
            )
    finally:
        db.close()