import os
from typing import Dict, Tuple
from aiogram import types, Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.context import FSMContext
from sqlalchemy.orm import Session
from newBot.db import SessionLocal
from newBot.repositories.agent_repository import AgentRepository
from newBot.repositories.sales_point_repository import SalesPointRepository
from newBot.repositories.poet_repository import PoetRepository
from newBot.services.agent_service import AgentService
from newBot.services.sales_point_service import SalesPointService
from newBot.services.poet_service import PoetService

from ..services.agent_service import AgentService
from ..services.sales_point_service import SalesPointService

pending_rejections: Dict[int, Tuple[str, int]] = {}

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
AGENT_CONTRACT_PATH = os.path.join(BASE_DIR, "files", "agent_contract.docx")
SP_CONTRACT_PATH = os.path.join(BASE_DIR, "files", "sales_point_contract.docx")
POET_CONTRACT_PATH = os.path.join(BASE_DIR, "files", "poet_contract.docx")


async def handle_approve_user(
    callback: types.CallbackQuery,
    bot: Bot
):
    """
    Ожидаем callback.data вида "approve_<role>_<user_id>"
    Например: "approve_agent_123456"
    """
    data = callback.data  # строка "approve_agent_123456"
    parts = data.split("_")
    if len(parts) != 3:
        await callback.answer("Неверный формат команды.", show_alert=True)
        return

    _, role, uid = parts
    try:
        user_id = int(uid)
    except ValueError:
        await callback.answer("Неверный user_id.", show_alert=True)
        return

    db: Session = SessionLocal()
    try:
        if role == "agent":
            svc = AgentService(db)
            ok = svc.approve_agent(user_id)
            contract_path = AGENT_CONTRACT_PATH
            sign_prefix = "sign_contract_agent"
        elif role == "sp":
            svc = SalesPointService(db)
            ok = svc.approve_sales_point(user_id)
            contract_path = SP_CONTRACT_PATH
            sign_prefix = "sign_contract_sp"
        elif role == "poet":
            svc = PoetService(db)
            ok = svc.approve_poet(user_id)
            contract_path = POET_CONTRACT_PATH
            sign_prefix = "sign_contract_poet"
        # elif role == "ve":
        #     svc = VideoEditorService(db)
        #     ok = svc.approve_video_editor(user_id)
        else:
            await callback.answer("Неизвестная роль.", show_alert=True)
            return

        if ok:
            # Убираем кнопки под сообщением с заявкой
            await callback.message.edit_reply_markup(reply_markup=None)

            # Отправляем договор и кнопку "Подписать договор"
            if os.path.exists(contract_path):
                kb = InlineKeyboardMarkup(inline_keyboard=[
                    [
                        InlineKeyboardButton(
                            text="Подписать договор",
                            callback_data=f"{role}_sign_contract_{user_id}"
                        )
                    ]
                ])
                await bot.send_document(
                    chat_id=user_id,
                    document=types.FSInputFile(contract_path),
                    caption="🎉 Ваша заявка одобрена!\n\n"
                            "Пожалуйста, ознакомьтесь с договором и нажмите кнопку «Подписать договор» ниже.",
                    reply_markup=kb
                )
            else:
                # Если файла нет — просто уведомляем
                await bot.send_message(
                    chat_id=user_id,
                    text="🎉 Ваша заявка одобрена! Но файл договора не найден."
                )

            await callback.answer(f"Пользователь {user_id} ({role}) одобрен.")
        else:
            await callback.answer(f"Не удалось одобрить {role} {user_id}.", show_alert=True)
    finally:
        db.close()

async def handle_reject_user_callback(
    callback: types.CallbackQuery
):
    """
    Срабатывает на callback.data вида "reject_<role>_<user_id>"
    Пример: "reject_agent_123456"
    """
    parts = callback.data.split("_")
    if len(parts) != 3:
        await callback.answer("Неверный формат команды.", show_alert=True)
        return

    _, role, uid = parts
    try:
        user_id = int(uid)
    except ValueError:
        await callback.answer("Неверный user_id.", show_alert=True)
        return

    # Проверяем, что такая заявка реально есть (опционально)
    db: Session = SessionLocal()
    try:
        if role == "agent":
            exists = AgentService(db).get_agent_profile(user_id)  # вернёт {} или словарь␊
        elif role == "sp":
            exists = SalesPointService(db).get_sales_point_profile(user_id)
        elif role == "poet":
            exists = PoetService(db).get_poet_profile(user_id)
        # elif role == "ve":
        #     exists = VideoEditorService(db).get_video_editor_profile(user_id)
        else:
            exists = None

        if not exists:
            await callback.answer(f"Заявка {role} {user_id} не найдена.", show_alert=True)
            return
    finally:
        db.close()

    # Удаляем inline-кнопки «Одобрить/Отклонить» под сообщением
    await callback.message.edit_reply_markup(reply_markup=None)

    # Сохраняем в FSM: кому отказ, и роль
    admin_id = callback.from_user.id
    pending_rejections[admin_id] = (role, user_id)

    # Спрашиваем у админа причину отказа
    await callback.message.answer(f"📝 Укажите причину отказа для {role} {user_id} (текстом), Вам нужно ответить на это сообщение:")
    await callback.answer()

async def process_reject_reason(
    message: types.Message,
    bot: Bot
):
    """
    Срабатывает, когда админ отправил следующий текст после нажатия «Отклонить».
    Если его ID есть в pending_rejections, считаем присланный текст причиной отказа.
    """
    admin_id = message.from_user.id
    if admin_id not in pending_rejections:
        # Если админ пишет что-то «не по делу», просто выходим
        return

    role, user_id = pending_rejections.pop(admin_id)  # забираем и удаляем запись
    reason = message.text.strip()

    # Пробуем удалить запись из БД
    db: Session = SessionLocal()
    try:
        if role == "agent":
            repo = AgentRepository(db)
            deleted = repo.delete_by_user_id(user_id)
        elif role == "sp":
            repo = SalesPointRepository(db)
            deleted = repo.delete_by_user_id(user_id)
        elif role == "poet":
            repo = PoetRepository(db)
            deleted = repo.delete_by_user_id(user_id)
        else:
            deleted = False
    finally:
        db.close()

    # Отправляем кандидату уведомление об отказе с текстом причины
    try:
        await bot.send_message(
            chat_id=user_id,
            text=f"❌ Ваша заявка ({role}) отклонена.\n\nПричина: {reason}"
        )
    except Exception as e:
        await message.answer(f"Не удалось отправить уведомление пользователю {user_id}: {e}")

    # Уведомляем админа, что всё отправлено
    await message.answer(f"✅ Причина отказа отправлена пользователю {user_id} ({role}).")