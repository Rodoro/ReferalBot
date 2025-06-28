from aiogram import types
from aiogram import Bot
from newBot.db import SessionLocal
from newBot.lib.user_roles import (
    get_user_roles,
    build_referral_links,
)
from newBot.services.user_service import UserService
from newBot.config import settings


async def cmd_start(message: types.Message, bot: Bot) -> None:
    """Handle generic /start command."""
    user_id = message.from_user.id
    db = SessionLocal()
    try:
        user_svc = UserService(db)
        user = user_svc.get_or_create_user(
            telegram_id=user_id,
            full_name=message.from_user.full_name or "",
            username=message.from_user.username or "",
        )
        # print("ID: ", user.get("id"))
        roles = get_user_roles(db, user.get("id"))
        # print(roles)

        if roles:
            text = build_referral_links(roles)
            token_value = user_svc.generate_token(user)

            keyboard = types.InlineKeyboardMarkup(
                inline_keyboard=[[
                    types.InlineKeyboardButton(
                        text="Перейти на сайт",
                        url=f"{settings.DASHBOARD_URL}login?key={token_value}",
                    )
                ]]
            )

        else:
            text = (
                "Вы ещё не зарегистрированы. Используйте полученную ссылку для начала регистрации."
            )

        sent = await bot.send_message(message.chat.id, text, reply_markup=keyboard, parse_mode="HTML")
        if roles:
            user_svc.store_token(
                user,
                token_value,
                chat_id=str(sent.chat.id),
                message_id=sent.message_id,
            )
    finally:
        db.close()