from __future__ import annotations

from sqlalchemy.orm import Session
from aiogram import Bot

from ..services.agent_service import AgentService
from ..services.sales_point_service import SalesPointService
from ..services.poet_service import PoetService
from ..services.video_editor_service import VideoEditorService


class UserRole:
    AGENT = "agent"
    SALES_POINT = "sales_point"
    POET = "poet"
    VIDEO_EDITOR = "video_editor"


ROLE_NAMES = {
    UserRole.AGENT: "агент",
    UserRole.SALES_POINT: "точка продаж",
    UserRole.POET: "поэт",
    UserRole.VIDEO_EDITOR: "видеомонтажёр",
}


def get_user_role(db: Session, user_id: int) -> tuple[str | None, dict]:
    """Return user's role and profile if registered."""
    svc = AgentService(db)
    profile = svc.get_agent_profile(user_id)
    if profile:
        return UserRole.AGENT, profile

    sp_svc = SalesPointService(db)
    profile = sp_svc.get_sales_point_profile(user_id)
    if profile:
        return UserRole.SALES_POINT, profile

    poet_svc = PoetService(db)
    profile = poet_svc.get_poet_profile(user_id)
    if profile:
        return UserRole.POET, profile

    ve_svc = VideoEditorService(db)
    profile = ve_svc.get_video_editor_profile(user_id)
    if profile:
        return UserRole.VIDEO_EDITOR, profile

    return None, {}


async def send_profile(bot: Bot, chat_id: int, role: str, profile: dict) -> None:
    """Send profile info to the user.\n
    Placeholder implementation – customise for each role."""
    if role == UserRole.AGENT:
        # TODO: send agent profile
        await bot.send_message(chat_id, "Профиль агента")
    elif role == UserRole.SALES_POINT:
        # TODO: send sales point profile
        await bot.send_message(chat_id, "Профиль точки продаж")
    elif role == UserRole.POET:
        # TODO: send poet profile
        await bot.send_message(chat_id, "Профиль поэта")
    elif role == UserRole.VIDEO_EDITOR:
        # TODO: send video editor profile
        await bot.send_message(chat_id, "Профиль видеомонтажёра")