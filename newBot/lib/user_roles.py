from __future__ import annotations

from sqlalchemy.orm import Session
from aiogram import Bot, types
from aiogram.utils.keyboard import InlineKeyboardButton, InlineKeyboardMarkup
import uuid

from ..services.agent_service import AgentService
from ..services.sales_point_service import SalesPointService
from ..services.poet_service import PoetService
from ..services.video_editor_service import VideoEditorService
from ..services.user_service import UserService
from ..config import settings


class UserRole:
    STAFF = "staff"
    AGENT = "agent"
    SALES_POINT = "sales_point"
    POET = "poet"
    VIDEO_EDITOR = "video_editor"


ROLE_NAMES = {
    UserRole.AGENT: "Ваша ссылка консультанта:",
    UserRole.SALES_POINT: "Ваша ссылка партнёра:",
    UserRole.POET: "Вы зарегистрированы как поэт.",
    UserRole.VIDEO_EDITOR: "Вы зарегистрированы как видеомонтажёр.",
    UserRole.STAFF: "Ссылки для приглашения:",
}


def get_user_roles(db: Session, user_id: int) -> list[tuple[str, dict]]:
    """Fetch all user roles via backend and return list of profiles."""
    user_svc = UserService(db)
    user = user_svc.get_user(user_id)

    roles: list[tuple[str, dict]] = []
    if user.get("staff"):
        roles.append((UserRole.STAFF, user["staff"]))
    if user.get("agent"):
        roles.append((UserRole.AGENT, user["agent"]))
    if user.get("sales"):
        roles.append((UserRole.SALES_POINT, user["sales"]))
    if user.get("poet"):
        roles.append((UserRole.POET, user["poet"]))
    video_profile = user.get("vidio_editor") or user.get("video_editor")
    if video_profile:
        roles.append((UserRole.VIDEO_EDITOR, video_profile))

    return roles

def build_referral_links(roles: list[tuple[str, dict]]) -> str:
    """Create message text with referral links for given roles."""
    parts: list[str] = []
    for role, profile in roles:
        code = profile.get("referralCode") or profile.get("referral_code")

        if role == UserRole.STAFF:
            agent_link = f"https://t.me/{settings.BOT_USERNAME}?start=secret_{settings.ADMIN_SECRET}"
            poet_link = f"https://t.me/{settings.BOT_USERNAME}?start=poet_{settings.POET_SECRET}"
            ve_link = f"https://t.me/{settings.BOT_USERNAME}?start=ve_{settings.VE_SECRET}"
            staff_text = (
                f"<b>{ROLE_NAMES.get(role, role)}</b>\n"
                f"Консультант: {agent_link}\n"
                f"Поэт: {poet_link}\n"
                f"Видеомонтажёр: {ve_link}"
            )
            parts.append(staff_text)
            continue

        if not code:
            parts.append(f"<b>{ROLE_NAMES.get(role, role)}</b>")
            continue

        if role == UserRole.SALES_POINT:
            link = f"https://t.me/{settings.MAIN_BOT_USERNAME}?start=ref_{code}"
        else:
            link = f"https://t.me/{settings.BOT_USERNAME}?start=ref_{code}"

        parts.append(f"<b>{ROLE_NAMES.get(role, role)}</b>\n{link}")
    return "\n\n".join(parts)

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
        username=tg_user.username or ""
    )
    token_value = str(uuid.uuid4())
    link = f"{settings.DASHBOARD_URL}login?key={token_value}"

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
            f"<b>Профиль партнёра</b>\n"
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
        inline_keyboard=[[InlineKeyboardButton(text="Открыть дашборд", url=link)]]
    )
    sent = await bot.send_message(chat_id, text, reply_markup=keyboard)
    user_svc.store_token(
        user,
        token_value,
        chat_id=str(sent.chat.id),
        message_id=sent.message_id,
    )