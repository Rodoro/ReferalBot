import json
from aiogram import types, Bot
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from aiogram.types import (
    ReplyKeyboardRemove,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
)

from newBot.config import settings
from newBot.db import SessionLocal
from newBot.services.sales_point_service import SalesPointService
from newBot.services.sales_outlet_service import SalesOutletService
from newBot.services.user_service import UserService


class SalesOutletStates(StatesGroup):
    waiting_for_mini_app = State()
    confirmation = State()


def outlet_confirmation_keyboard() -> InlineKeyboardMarkup:
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Исправить", callback_data="outlet_correct_data"
                ),
                InlineKeyboardButton(
                    text="Все верно", callback_data="outlet_confirm_data"
                ),
            ]
        ]
    )
    return kb


async def start_outlet_registration(callback: types.CallbackQuery, state: FSMContext):
    mini_app_url = f"{settings.WEBAPP_URL}/sales-outlet-form"
    web_app = types.WebAppInfo(url=mini_app_url)
    kb = types.ReplyKeyboardMarkup(
        keyboard=[
            [types.KeyboardButton(text="Заполнить форму точки", web_app=web_app)]
        ],
        resize_keyboard=True,
        one_time_keyboard=True,
    )
    await callback.message.answer(
        "Пожалуйста, заполните форму точки продажи:", reply_markup=kb
    )
    await state.set_state(SalesOutletStates.waiting_for_mini_app)
    await callback.answer()


async def handle_outlet_webapp_data(message: types.Message, state: FSMContext):
    try:
        data = json.loads(message.web_app_data.data)
    except Exception:
        await message.answer("Ошибка: некорректные данные от формы.")
        return

    required = ["name", "address"]
    if not all(field in data and str(data[field]).strip() for field in required):
        await message.answer(
            "Не все поля заполнены. Пожалуйста, заполните форму полностью."
        )
        return

    await state.update_data(
        name=data["name"],
        address=data["address"],
        description=data.get("description", ""),
    )

    confirmation_text = (
        "<b>Проверьте введённые данные (Точка продажи):</b>\n\n"
        f"Название: {data['name']}\n"
        f"Адрес: {data['address']}\n"
        f"Описание: {data.get('description', '')}"
    )
    await message.answer(
        "Данные получены:", reply_markup=ReplyKeyboardRemove(), parse_mode="HTML"
    )
    await message.answer(
        confirmation_text,
        reply_markup=outlet_confirmation_keyboard(),
        parse_mode="HTML",
    )
    await state.set_state(SalesOutletStates.confirmation)


async def outlet_confirm_data(callback: types.CallbackQuery, state: FSMContext):
    data = await state.get_data()
    db = SessionLocal()
    try:
        user_svc = UserService(db)
        user = user_svc.get_or_create_user(
            telegram_id=callback.from_user.id,
            full_name=callback.from_user.full_name or "",
            username=callback.from_user.username or "",
        )
        user_id = user.get("id")
        sp_service = SalesPointService()
        profile = sp_service.get_sales_point_profile(user_id)
        partner_id = profile.get("id") or profile.get("partnerId")
    finally:
        db.close()

    svc = SalesOutletService()
    try:
        svc.create_outlet(
            partner_id, data["name"], data["address"], data.get("description", "")
        )
    except Exception as e:
        await callback.message.answer(f"Ошибка при регистрации: {e}", show_alert=True)
        await state.clear()
        return

    await callback.message.answer("✅ Точка продажи зарегистрирована.")
    await state.clear()
    await callback.answer()


async def outlet_correct_data(callback: types.CallbackQuery, state: FSMContext):
    mini_app_url = f"{settings.WEBAPP_URL}/sales-outlet-form"
    web_app = types.WebAppInfo(url=mini_app_url)
    kb = types.ReplyKeyboardMarkup(
        keyboard=[
            [types.KeyboardButton(text="Повторно заполнить форму", web_app=web_app)]
        ],
        resize_keyboard=True,
        one_time_keyboard=True,
    )
    await callback.message.answer("Исправьте данные, пожалуйста:", reply_markup=kb)
    await state.set_state(SalesOutletStates.waiting_for_mini_app)
    await callback.answer()