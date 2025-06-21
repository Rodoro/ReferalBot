from __future__ import annotations

from sqlalchemy.orm import Session
from aiogram import Bot, types
from aiogram.utils.keyboard import InlineKeyboardButton, InlineKeyboardMarkup

from ..services.agent_service import AgentService
from ..services.sales_point_service import SalesPointService
from ..services.poet_service import PoetService
from ..services.video_editor_service import VideoEditorService
from ..services.user_service import UserService
from ..config import settings


class UserRole:
    AGENT = "agent"
    SALES_POINT = "sales_point"
    POET = "poet"
    VIDEO_EDITOR = "video_editor"


ROLE_NAMES = {
    UserRole.AGENT: "консультант",
    UserRole.SALES_POINT: "точка продаж",
    UserRole.POET: "поэт",
    UserRole.VIDEO_EDITOR: "видеомонтажёр",
}


def get_user_role(db: Session, user_id: int) -> tuple[str | None, dict]:
    """Return user's role and profile if registered."""
    # svc = AgentService(db)
    # profile = svc.get_agent_profile(user_id)
    # if profile:
    #     return UserRole.AGENT, profile

    # sp_svc = SalesPointService(db)
    # profile = sp_svc.get_sales_point_profile(user_id)
    # if profile:
    #     return UserRole.SALES_POINT, profile

    # poet_svc = PoetService(db)
    # profile = poet_svc.get_poet_profile(user_id)
    # if profile:
    #     return UserRole.POET, profile

    # ve_svc = VideoEditorService(db)
    # profile = ve_svc.get_video_editor_profile(user_id)
    # if profile:
    #     return UserRole.VIDEO_EDITOR, profile

    return None, {}


async def send_profile(
    bot: Bot,
    chat_id: int,
    role: str,
    profile: dict,
    tg_user: types.User,
    db: Session,
) -> None:
    """Send detailed profile to the user and provide dashboard link."""

    user_svc = UserService(db)
    user = user_svc.get_or_create_user(
        telegram_id=tg_user.id,
        full_name=tg_user.full_name,
        username=tg_user.username or "",
        role=role
    )
    token = user_svc.generate_token(user)
    link = f"{settings.DASHBOARD_URL}login?key={token}"

    if role == UserRole.AGENT:
        text = (
            f"<b>Профиль консультанта</b>\n"
            f"ФИО: {profile['full_name']}\n"
            f"Город: {profile['city']}\n"
            f"ИНН: {profile['inn']}\n"
            f"Телефон: {profile['phone']}\n"
            f"Тип: {profile['business_type']}\n"
        )
    elif role == UserRole.SALES_POINT:
        text = (
            f"<b>Профиль точки продаж</b>\n"
            f"Название: {profile['full_name']}\n"
            f"Город: {profile['city']}\n"
            f"ИНН: {profile['inn']}\n"
            f"Телефон: {profile['phone']}\n"
            f"Тип: {profile['business_type']}\n"
        )
    elif role == UserRole.POET:
        text = (
            f"<b>Профиль поэта</b>\n"
            f"ФИО: {profile['full_name']}\n"
            f"Город: {profile['city']}\n"
            f"ИНН: {profile['inn']}\n"
            f"Телефон: {profile['phone']}\n"
            f"Тип: {profile['business_type']}\n"
        )
    else:
        text = (
            f"<b>Профиль видеомонтажёра</b>\n"
            f"ФИО: {profile['full_name']}\n"
            f"Город: {profile['city']}\n"
            f"ИНН: {profile['inn']}\n"
            f"Телефон: {profile['phone']}\n"
            f"Тип: {profile['business_type']}\n"
        )

    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Открыть дашборд", url=link)]
        ]
    )
    await bot.send_message(chat_id, text, reply_markup=keyboard)