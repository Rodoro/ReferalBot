import json
import os
from aiogram import types, Bot
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from aiogram.types import (
    ReplyKeyboardRemove,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    InputMediaDocument,
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

    outlet_type = data.get("type", "SELLER").strip()
    name = data.get("name", "").strip()
    telegram_id = data.get("telegramId", "").strip()
    address = data.get("address", "").strip()
    link = data.get("link", "").strip()
    description = data.get("description", "").strip()

    if not name:
        await message.answer(
            "Не все поля заполнены. Пожалуйста, заполните форму полностью."
        )
        return

    if outlet_type == "SELLER" and (not telegram_id or not address):
        await message.answer(
            "Не все поля заполнены. Пожалуйста, заполните форму полностью."
        )
        return
    if outlet_type == "SALES_POINT" and not address:
        await message.answer(
            "Не все поля заполнены. Пожалуйста, заполните форму полностью."
        )
        return
    if outlet_type == "INFORMATION_RESOURCE" and not link:
        await message.answer(
            "Не все поля заполнены. Пожалуйста, заполните форму полностью."
        )
        return

    await state.update_data(
        type=outlet_type,
        name=name,
        telegram_id=telegram_id,
        address=address,
        link=link,
        description=description,
    )

    header = "Продавец" if outlet_type == "SELLER" else (
        "Точка продажи" if outlet_type == "SALES_POINT" else "Информационный ресурс"
    )
    parts = [f"<b>Проверьте введённые данные ({header}):</b>"]
    if telegram_id:
        parts.append(f"Telegram ID: {telegram_id}")
    parts.append(f"Название: {name}")
    if address:
        parts.append(f"Адрес: {address}")
    if link:
        parts.append(f"Ссылка: {link}")
    if description:
        parts.append(f"Описание: {description}")
    confirmation_text = "\n".join(parts)
    await message.answer(
        "Данные получены:", reply_markup=ReplyKeyboardRemove(), parse_mode="HTML"
    )
    await message.answer(
        confirmation_text,
        reply_markup=outlet_confirmation_keyboard(),
        parse_mode="HTML",
    )
    await state.set_state(SalesOutletStates.confirmation)


async def outlet_confirm_data(callback: types.CallbackQuery, state: FSMContext, bot: Bot):
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
        outlet = svc.create_outlet(
            partner_id,
            name=data.get("name"),
            address=data.get("address"),
            description=data.get("description", ""),
            outlet_type=data.get("type", "SELLER"),
            telegram_id=data.get("telegram_id"),
            link=data.get("link"),
        )
    except Exception as e:
        await callback.message.answer(f"Ошибка при регистрации: {e}", show_alert=True)
        await state.clear()
        return

    referral_code = outlet.get("referralCode") or outlet.get("referral_code")
    if referral_code:
        referral_link = f"https://t.me/{settings.MAIN_BOT_USERNAME}?start=ref_{referral_code}"
        banners, qr_path = svc.generate_referral_assets(data.get("name", "outlet"), referral_link)
        await callback.message.answer(
            (
                "✅ Точка продажи зарегистрирована.\n\n"
                f"Ваша ссылка:\n{referral_link}\n\n"
                "Ниже QR-код и баннеры."
            )
        )
        media = [InputMediaDocument(media=types.FSInputFile(p)) for p in banners]
        if media:
            await bot.send_media_group(chat_id=callback.from_user.id, media=media)
        await bot.send_document(
            chat_id=callback.from_user.id,
            document=types.FSInputFile(qr_path),
            caption="Отдельный QR-код",
        )
        for p in banners + [qr_path]:
            os.remove(p)
    else:
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