import json
from aiogram import Bot, types
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import ReplyKeyboardRemove, InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.utils.keyboard import InlineKeyboardBuilder

from newBot.config import settings
from newBot.services.agent_service import AgentService
from newBot.services.user_service import UserService
from newBot.db import SessionLocal

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
    # Если здесь — значит ни консультанта, ни точкой ещё не были
    await message.answer(
        "👤 Регистрация Консультанта.\n\nЧтобы начать, нажмите кнопку «Старт регистрации консультанта»",
        reply_markup=agent_start_inline_keyboard()
    )

# callback_data == "start_agent_registration"
async def start_agent_registration(callback: types.CallbackQuery, state: FSMContext):
    # Отправляем кнопку WebApp
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
            username=callback.from_user.username or "",
            role="",
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
    except Exception as e:
        await callback.message.answer(f"Ошибка при регистрации: {e}", show_alert=True)
        await state.clear()
        return

    # Уведомляем администратора в канал
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="✅ Одобрить",
                callback_data=f"approve_agent_{user_id}_{tg_id}"
            ),
            InlineKeyboardButton(
                text="❌ Отклонить",
                callback_data=f"reject_agent_{user_id}_{tg_id}"
            )
        ]
    ])

    # Отправляем админу не просто текст, а текст + клавиатуру:
    await bot.send_message(
        chat_id=settings.CHANNEL_ID,
        text=(
            f"Новый кандидат в консультанты:\n"
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
        ),
        reply_markup=keyboard
    )

    await callback.message.answer("✅ Ваша заявка отправлена на рассмотрение. Ждите ответа администратора.")
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
        referral_link = svc.sign_agent_contract(user_id)
    except Exception as e:
        await callback.answer(f"Ошибка при подписи договора: {e}", show_alert=True)
        return

    # Убираем кнопку «Подписать договор» под сообщением
    await callback.message.edit_reply_markup(reply_markup=None)

    # Отправляем пользователю его реферальную ссылку (текстом)
    await bot.send_message(
        chat_id=tg_id,
        text=(
            "✅ Вы успешно подписали договор как консультант!\n\n"
            f"Ваша реферальная ссылка:\n{referral_link}\n\n"
            "Чтобы просмотреть свой профиль, отправьте /start"
        )
    )

    # Уведомляем админ‐канал, что договор подписан
    await bot.send_message(
        chat_id=settings.CHANNEL_ID,
        text=f"➡️ Консультант {tg_id} подписал договор."
    )

    await callback.answer("Договор подписан. Ссылка отправлена.")