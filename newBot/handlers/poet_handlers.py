import json
import os
from sqlalchemy.orm import Session
from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types import ReplyKeyboardRemove, InlineKeyboardButton, InlineKeyboardMarkup
from newBot.config import settings
from newBot.db import SessionLocal
from newBot.lib.user_roles import get_user_roles
from newBot.services.poet_service import PoetService
from aiogram import Bot

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
POET_CONTRACT_PATH = os.path.join(BASE_DIR, "files", "poet_contract.docx")

from newBot.services.user_service import UserService

class PoetRegistrationStates(StatesGroup):
    waiting_for_mini_app = State()
    confirmation = State()

def poet_start_inline_keyboard():
    kb = InlineKeyboardBuilder()
    kb.add(types.InlineKeyboardButton(text="Старт регистрации поэта", callback_data="start_poet_registration"))
    return kb.as_markup()

def poet_confirmation_keyboard():
    kb = InlineKeyboardBuilder()
    kb.add(types.InlineKeyboardButton(text="Исправить", callback_data="poet_correct_data"))
    kb.add(types.InlineKeyboardButton(text="Все верно", callback_data="poet_confirm_data"))
    return kb.as_markup()

async def cmd_start_poet_secret(message: types.Message, state: FSMContext):
    db = SessionLocal()
    try:
        user_svc = UserService(db)
        user = user_svc.get_or_create_user(
            telegram_id=message.from_user.id,
            full_name=message.from_user.full_name or "",
            username=message.from_user.username or "",
        )
        user_id = user.get("id")
    finally:
        db.close()

    
    roles = get_user_roles(db, user_id)

    if any(item[0] == 'poet' for item in roles):
        await message.answer("Вы уже зарегистрированы как поэт.")
        return

    await message.answer(
        "✍️ Регистрация Поэта.\n\nЧтобы начать, нажмите кнопку «Старт регистрации поэта»",
        reply_markup=poet_start_inline_keyboard(),
    )

async def start_poet_registration(callback: types.CallbackQuery, state: FSMContext):
    user_id = callback.from_user.id
    db = SessionLocal()
    try:
        from newBot.lib.user_roles import get_user_role, ROLE_NAMES, UserRole, send_profile
        role, profile = get_user_role(db, user_id)
        if role:
            if role == UserRole.POET:
                await send_profile(callback.message.bot, callback.message.chat.id, role, profile, callback.from_user, db)
            else:
                await callback.answer(
                    f"Вы уже зарегистрированы как {ROLE_NAMES[role]}!", show_alert=True
                )
            return
    finally:
        db.close()

    mini_app_url = f"{settings.WEBAPP_URL}/poet-form"
    web_app = types.WebAppInfo(url=mini_app_url)
    kb = types.ReplyKeyboardMarkup(
        keyboard=[[types.KeyboardButton(text="Заполнить форму поэта", web_app=web_app)]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )
    await callback.message.answer("Пожалуйста, заполните форму регистрации поэта:", reply_markup=kb)
    await state.set_state(PoetRegistrationStates.waiting_for_mini_app)
    await callback.answer()

async def handle_poet_webapp_data(message: types.Message, state: FSMContext):
    try:
        payload = message.web_app_data.data
        data = json.loads(payload)
    except Exception:
        await message.answer("Ошибка: некорректные данные от формы.")
        return

    required = [
        "full_name", "city", "inn", "phone",
        "business_type", "bik", "account", "bank_details",
    ]
    if not all(field in data and str(data[field]).strip() for field in required):
        await message.answer("Не все поля заполнены. Пожалуйста, заполните форму полностью.")
        return

    bank_details_str = data["bank_details"]
    bank_name = None
    bank_ks = None
    for line in bank_details_str.split("\n"):
        line = line.strip()
        if line.lower().startswith("банк:"):
            bank_name = line.split(":", 1)[1].strip()
        elif line.lower().startswith("корр.") or line.lower().startswith("корр.счет:"):
            bank_ks = line.split(":", 1)[1].strip()
    if not bank_name or not bank_ks:
        await message.answer(
            "Не удалось распознать из `bank_details` название банка или корр. счет.\n"
            "Убедитесь, что формат:\n"
            "Банк: <имя банка>\n"
            "…\n"
            "Корр. счет: <номер корр. счета>\n"
        )
        return

    await state.update_data({
        "full_name": data["full_name"],
        "city": data["city"],
        "inn": data["inn"],
        "phone": data["phone"],
        "business_type": data["business_type"],
        "bik": data["bik"],
        "account": data["account"],
        "bank_name": bank_name,
        "bank_ks": bank_ks,
        "bank_details": bank_details_str,
    })

    confirmation_text = (
        "<b>Проверьте введённые данные (Поэт):</b>\n\n"
        f"ФИО: {data['full_name']}\n"
        f"Город: {data['city']}\n"
        f"ИНН: {data['inn']}\n"
        f"Телефон: {data['phone']}\n"
        f"Тип: {data['business_type']}\n\n"
        f"<b>БИК:</b> {data['bik']}\n"
        f"<b>Расчетный счет:</b> {data['account']}\n"
        f"<b>Название банка:</b> {bank_name}\n"
        f"<b>Корр. счет:</b> {bank_ks}"
    )

    await message.answer("Данные получены:", reply_markup=ReplyKeyboardRemove(), parse_mode="HTML")
    await message.answer(confirmation_text, reply_markup=poet_confirmation_keyboard(), parse_mode="HTML")
    await state.set_state(PoetRegistrationStates.confirmation)

async def poet_confirm_data(callback: types.CallbackQuery, state: FSMContext, bot: Bot):
    telegram_id = callback.from_user.id
    data = await state.get_data()

    db = SessionLocal()
    try:
        user_svc = UserService(db)
        user = user_svc.get_or_create_user(
            telegram_id=telegram_id,
            full_name=callback.from_user.full_name or "",
            username=callback.from_user.username or ""
        )
        user_id = user.get("id")
    finally:
        db.close()

    svc = PoetService()
    try:
        svc.register_poet(
            user_id=user_id,
            telegram_id=telegram_id,
            full_name=data["full_name"],
            city=data["city"],
            inn=data["inn"],
            phone=data["phone"],
            business_type=data["business_type"],
            bik=data["bik"],
            account=data["account"],
            bank_name=data["bank_name"],
            bank_ks=data["bank_ks"],
            bank_details=data["bank_details"],
        )
        svc.approve_poet(user_id)
    except Exception as e:
        await callback.message.answer(f"Ошибка при регистрации: {e}", show_alert=True)
        await state.clear()
        return

    if os.path.exists(POET_CONTRACT_PATH):
        kb = InlineKeyboardMarkup(inline_keyboard=[[
            InlineKeyboardButton(
                text="Подписать договор",
                callback_data=f"poet_sign_contract_{user_id}_{telegram_id}"
            )
        ]])
        await bot.send_document(
            chat_id=telegram_id,
            document=types.FSInputFile(POET_CONTRACT_PATH),
            caption="🎉 Вы зарегистрированы!\n\n"
                    "Пожалуйста, ознакомьтесь с договором и нажмите кнопку «Подписать договор» ниже.  (Подписания договора может занять немного больше, чем Вы думаете)",
            reply_markup=kb
        )
    else:
        await bot.send_message(
            chat_id=telegram_id,
            text="🎉 Вы зарегистрированы! Но файл договора не найден."
        )

    await bot.send_message(
        chat_id='-1002806831697',
        message_thread_id=63,
        text=(
            f"Зарегистрирован новый поэт:\n"
            f"- Telegram ID: {user_id}\n"
            f"- ФИО: {data['full_name']}\n"
            f"- Город: {data['city']}\n"
            f"- ИНН: {data['inn']}\n"
            f"- Телефон: {data['phone']}\n"
            f"- Тип: {data['business_type']}\n"
            f"- БИК: {data['bik']}\n"
            f"- Расчетный счет: {data['account']}\n"
            f"- Название банка: {data['bank_name']}\n"
            f"- Корр. счет: {data['bank_ks']}\n"
        )
    )

    await callback.message.answer("✅ Вы зарегистрированы. Проверьте сообщения с договором.")
    await state.clear()
    await callback.answer()

async def poet_correct_data(callback: types.CallbackQuery, state: FSMContext):
    mini_app_url = f"{settings.WEBAPP_URL}/poet-form"
    web_app = types.WebAppInfo(url=mini_app_url)
    kb = types.ReplyKeyboardMarkup(
        keyboard=[[types.KeyboardButton(text="Повторно заполнить форму", web_app=web_app)]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )
    await callback.message.answer("Исправьте данные, пожалуйста:", reply_markup=kb)
    await state.set_state(PoetRegistrationStates.waiting_for_mini_app)
    await callback.answer()

async def handle_poet_sign_contract(callback: types.CallbackQuery, bot: Bot):
    parts = callback.data.split("_")
    if len(parts) != 5:
        await callback.answer("Неверный формат подписи договора.", show_alert=True)
        return

    _, _, _, uid, tg_id = parts
    try:
        user_id = int(uid)
    except ValueError:
        await callback.answer("Неверённый user_id.", show_alert=True)
        return

    svc = PoetService()
    try:
        svc.sign_poet_contract(user_id)
    except Exception as e:
        await callback.answer(f"Ошибка при подписи договора: {e}", show_alert=True)
        return

    await callback.message.edit_reply_markup(reply_markup=None)

    await bot.send_message(
        chat_id=tg_id,
        text=(
            "✅ Вы успешно подписали договор как поэт!\n\n"
            "Теперь вы зарегистрированы как поэт."
        ),
    )

    await bot.send_message(
        chat_id='-1002806831697',
        message_thread_id=63,
        text=f"➡️ Поэт {tg_id} подписал договор.",
    )

    await callback.answer("Договор подписан.")