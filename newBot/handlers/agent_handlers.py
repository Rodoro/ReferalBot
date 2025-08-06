import json
import os
from aiogram import Bot, types
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import (
    ReplyKeyboardRemove,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    InputMediaDocument,
)
from aiogram.utils.keyboard import InlineKeyboardBuilder

from newBot.config import settings
from newBot.lib.user_roles import get_user_roles
from newBot.services.agent_service import AgentService
from newBot.services.user_service import UserService
from newBot.db import SessionLocal

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
AGENT_CONTRACT_PATH = os.path.join(BASE_DIR, "files", "consultant_contract.pdf")

class AgentRegistrationStates(StatesGroup):
    waiting_for_mini_app = State()
    confirmation = State()

def agent_start_inline_keyboard():
    kb = InlineKeyboardBuilder()
    kb.add(types.InlineKeyboardButton(text="Старт регистрации консультанта", callback_data="start_agent_registration"))
    return kb.as_markup()

def agent_confirmation_keyboard():
    kb = InlineKeyboardBuilder()
    kb.add(types.InlineKeyboardButton(text="Исправить", callback_data="agent_correct_data"))
    kb.add(types.InlineKeyboardButton(text="Все верно", callback_data="agent_confirm_data"))
    return kb.as_markup()


# /start secret_<ADMIN_SECRET> для консультанта
async def cmd_start_agent_secret(message: types.Message, state: FSMContext):
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

    if any(item[0] == 'agent' for item in roles):
        await message.answer("Вы уже зарегистрированы как консультант.")
        return
    # Если здесь — значит ни консультанта, ни партнёр ещё не были
    await message.answer(
        "👤 Регистрация Консультанта.\n\nЧтобы начать, нажмите кнопку «Старт регистрации консультанта»",
        reply_markup=agent_start_inline_keyboard()
    )

# callback_data == "start_agent_registration"
async def start_agent_registration(callback: types.CallbackQuery, state: FSMContext):

    mini_app_url = f"{settings.WEBAPP_URL}/agent-form"
    web_app = types.WebAppInfo(url=mini_app_url)
    kb = types.ReplyKeyboardMarkup(
        keyboard=[[types.KeyboardButton(text="Заполнить форму консультанта", web_app=web_app)]],
        resize_keyboard=True,
        one_time_keyboard=True
    )
    await callback.message.answer("Пожалуйста, заполните форму регистрации консультанта:", reply_markup=kb)
    await state.set_state(AgentRegistrationStates.waiting_for_mini_app)
    await callback.answer()

# WebAppData → ожидание подтверждения
async def handle_agent_webapp_data(message: types.Message, state: FSMContext):
    """
    Ожидаем JSON от WebApp (консультант-форма). Пример:
    {
      "full_name":"Шум Даня",
      "city":"Москва",
      "inn":"1231231111",
      "phone":"12888291922",
      "business_type":"ИП",
      "bik":"049205805",
      "account":"30101810000000000805",
      "bank_details":"Банк: ПАО \"АК БАРС\" БАНК\nБИК: 049205805\nКорр. счет: 30101810000000000805\nРасчетный счет: 30101810000000000805",
      "isSales": ""
    }
    """
    try:
        payload = message.web_app_data.data  # строка JSON
        data = json.loads(payload)           # превращаем в dict
    except Exception:
        await message.answer("Ошибка: некорректные данные от формы.")
        return

    # Список полей, которые точно должны быть заполнены
    required = [
        "full_name", "city", "inn", "phone",
        "business_type", "bik", "account", "bank_details"
    ]
    if not all(field in data and data[field].strip() for field in required):
        await message.answer("Не все поля заполнены. Пожалуйста, заполните форму полностью.")
        return

    # Разбираем многострочное поле bank_details:
    bank_details_str = data["bank_details"]
    bank_name = None
    bank_ks = None

    for line in bank_details_str.split("\n"):
        # Убираем возможные лишние пробелы
        line = line.strip()
        if line.lower().startswith("банк:"):
            # всё, что после "Банк:"
            bank_name = line.split(":", 1)[1].strip()
        elif line.lower().startswith("корр.") or line.lower().startswith("корр. счет:"):
            # можно ловить "Корр. счет:" либо "корр. счет:" 
            # здесь всё, что после ":"
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

    # Сохраняем в FSM только нужные поля (включая отдельно bank_name и bank_ks)
    await state.update_data({
        "full_name":     data["full_name"],
        "city":          data["city"],
        "inn":           data["inn"],
        "phone":         data["phone"],
        "business_type": data["business_type"],
        "bik":           data["bik"],
        "account":       data["account"],
        "bank_name":     bank_name,
        "bank_ks":       bank_ks,
        "bank_details":  bank_details_str,  # оставляем «как было»
    })

    # Текст подтверждения (можно вывести банк и корр. счет отдельно)
    confirmation_text = (
        "<b>Проверьте введённые данные (Консультант):</b>\n\n"
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
    await message.answer(confirmation_text, reply_markup=agent_confirmation_keyboard(), parse_mode="HTML")
    await state.set_state(AgentRegistrationStates.confirmation)

# callback_data == "agent_confirm_data"
async def agent_confirm_data(callback: types.CallbackQuery, state: FSMContext, bot: Bot):
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
    tg_id = callback.from_user.id

    svc = AgentService()
    try:
        svc.register_agent(
            user_id=user_id,
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
        svc.approve_agent(user_id)
    except Exception as e:
        await callback.message.answer(f"Ошибка при регистрации: {e}", show_alert=True)
        await state.clear()
        return

    # Отправляем договор и кнопку "Подписать договор"
    if os.path.exists(AGENT_CONTRACT_PATH):
        kb = InlineKeyboardMarkup(inline_keyboard=[[
            InlineKeyboardButton(
                text="Подписать договор",
                callback_data=f"agent_sign_contract_{user_id}_{tg_id}"
            )
        ]])
        await bot.send_document(
            chat_id=tg_id,
            document=types.FSInputFile(AGENT_CONTRACT_PATH),
            caption="🎉 Вы зарегистрированы!\n\n"
                    "Пожалуйста, ознакомьтесь с договором и нажмите кнопку «Подписать договор» ниже.  (Подписания договора может занять немного больше, чем Вы думаете)",
            reply_markup=kb
        )
    else:
        await bot.send_message(
            chat_id=tg_id,
            text="🎉 Вы зарегистрированы! Но файл договора не найден."
        )

    # Уведомляем администратора о регистрации
    await bot.send_message(
        chat_id='-1002806831697',
        message_thread_id=63,
        text=(
            f"Зарегистрирован новый консультант:\n"
            f"- Telegram ID: {telegram_id}\n"
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

# callback_data == "agent_correct_data"
async def agent_correct_data(callback: types.CallbackQuery, state: FSMContext):
    # Просто перенаправляем на WebApp повторно
    mini_app_url = f"{settings.WEBAPP_URL}/agent-form"
    web_app = types.WebAppInfo(url=mini_app_url)
    kb = types.ReplyKeyboardMarkup(
        keyboard=[[types.KeyboardButton(text="Повторно заполнить форму", web_app=web_app)]],
        resize_keyboard=True,
        one_time_keyboard=True
    )
    await callback.message.answer("Исправьте данные, пожалуйста:", reply_markup=kb)
    await state.set_state(AgentRegistrationStates.waiting_for_mini_app)
    await callback.answer()

async def handle_agent_sign_contract(
    callback: types.CallbackQuery,
    bot: Bot
):
    """
    Ловим callback.data вида "agent_sign_contract_<user_id>".
    Помечаем в базе contract_signed и отправляем пользователю реферальную ссылку.
    """
    parts = callback.data.split("_")  # ["agent", "sign", "contract", "<user_id>"]
    if len(parts) != 5:
        await callback.answer("Неверный формат подписи договора.", show_alert=True)
        return

    _, _, _, uid, tg_id = parts
    try:
        user_id = int(uid)
    except ValueError:
        await callback.answer("Неверённый user_id.", show_alert=True)
        return

    svc = AgentService()
    try:
        sp_banner_paths, sp_qr_path, sp_link, agent_qr_path, agent_link = svc.sign_agent_contract(user_id)  
    except Exception as e:
        await callback.answer(f"Ошибка при подписи договора: {e}", show_alert=True)
        return

    # Убираем кнопку «Подписать договор» под сообщением
    await callback.message.edit_reply_markup(reply_markup=None)

    # Отправляем пользователю баннеры и QR-код
    await bot.send_message(
        chat_id=tg_id,
        text=(
            "✅ Вы успешно подписали договор как консультант!\n\n"
            f"1. Ваша ссылка консультанта (для регистрации партнеров):\n{agent_link}\n\n"
            f"3. Ваша ссылка точки продаж (для приглашения клиентов в бот создания песен):\n{sp_link}\n\n"
            "Ниже два баннера с QR-кодом для клиентов и партнеров. Сохраните или поделитесь ими."
        ),
    )

    media = [
        InputMediaDocument(media=types.FSInputFile(p))
        for p in sp_banner_paths
        if p and os.path.exists(p)
    ]

    if media:
        await bot.send_media_group(chat_id=tg_id, media=media)
    if agent_qr_path and os.path.exists(agent_qr_path):
        await bot.send_document(
            chat_id=tg_id,
            document=types.FSInputFile(agent_qr_path),
            caption="Ваш QR-код консультанта (для регистрации партнеров)",
        )
    if sp_qr_path and os.path.exists(sp_qr_path):
        await bot.send_document(
            chat_id=tg_id,
            document=types.FSInputFile(sp_qr_path),
            caption="Ваш QR-код точки продажи (для приглашения клиентов в бота создания песен)",
        )
    for p in sp_banner_paths + [agent_qr_path, sp_qr_path]:
        if p and os.path.exists(p):
            os.remove(p)

    # Уведомляем админ‐канал, что договор подписан
    await bot.send_message(
        chat_id='-1002806831697',
        message_thread_id=63,
        text=f"➡️ Консультант {tg_id} подписал договор."
    )

    await callback.answer("Договор подписан. Ссылка отправлена.")