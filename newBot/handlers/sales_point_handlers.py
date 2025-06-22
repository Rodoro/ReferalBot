import json
import os
from aiogram import types, Bot
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import ReplyKeyboardRemove, InlineKeyboardMarkup, InlineKeyboardButton
from newBot.config import settings
from newBot.db import SessionLocal
from newBot.lib.user_roles import get_user_roles
from newBot.services.agent_service import AgentService
from newBot.services.sales_point_service import SalesPointService
from newBot.services.user_service import UserService

class SalesPointRegistrationStates(StatesGroup):
    waiting_for_start = State()        # после /start ref_<agent_id> мы в этот стан переходим
    waiting_for_mini_app = State()     # ждём WebAppData
    confirmation = State()             # ждём «подтверждения» данных

def sp_start_inline_keyboard():
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Старт регистрации точки продаж", callback_data="start_sp_registration")]
    ])
    return kb

def sp_confirmation_keyboard():
    kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="Исправить",   callback_data="sp_correct_data"),
            InlineKeyboardButton(text="Все верно",   callback_data="sp_confirm_data")
        ]
    ])
    return kb

# Команда /start ref_<agent_id>
async def cmd_start_sp_referral(message: types.Message, state: FSMContext):
    """
    Ловим /start ref_<код_агента> → проверяем, не зарегистрирован ли уже
    пользователь как агент или как точка. Если всё OK, выводим кнопку.
    """
    text = message.text or ""
    if not text.startswith("/start ref_"):
        return

    user_id = message.from_user.id

    db = SessionLocal()
    try:
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

        if any(item[0] == 'sales_point' for item in roles):
            await message.answer("Вы уже зарегистрированы как точка продажи.")
            return

        # 3) Проверяем корректность ссылки агента: найдём agent по коду
        try:
            _, ref_code = text.split("ref_", maxsplit=1)
            ref_code = ref_code.strip()
        except Exception:
            await message.answer("Неверная ссылка регистрации точки продаж.")
            return

        svc = AgentService()
        try:
            agent = svc.get_agent_by_code(ref_code)
        except Exception:
            await message.answer("Консультант не найден по этой ссылке или ссылка уже устарела.")
            return

        agent_id = agent.get("userId") or agent.get("user_id")
        agent_name = agent.get("fullName") or agent.get("full_name")

    finally:
        db.close()

    

    # Сохраняем agent_id и далее показываем кнопку «Старт регистрации точки продаж»
    await state.update_data(agent_id=agent_id, agent_name=agent_name)
    await state.set_state(SalesPointRegistrationStates.waiting_for_start)

    welcome_text = (
        f"Здравствуйте! Вы пришли по приглашению консультанта «{agent_name}».\n\n"
        "Чтобы продолжить регистрацию точки продаж, нажмите кнопку ниже."
    )
    await message.answer(welcome_text, reply_markup=sp_start_inline_keyboard())

# callback_data == "start_sp_registration"
async def start_sp_registration(callback: types.CallbackQuery, state: FSMContext):
    """
    Срабатывает, когда пользователь нажал «Старт регистрации точки продаж».
    Отправляем WebApp-кнопку с формой.
    """
    data = await state.get_data()
    agent_id = data.get("agent_id")
    if not agent_id:
        await callback.answer("Ошибка: agent_id не найден. Попробуйте сначала.", show_alert=True)
        return

    mini_app_url = f"{settings.WEBAPP_URL}/sales-point-form?ref={agent_id}"
    web_app = types.WebAppInfo(url=mini_app_url)
    kb = types.ReplyKeyboardMarkup(
        keyboard=[[types.KeyboardButton(text="Заполнить форму точки продаж", web_app=web_app)]],
        resize_keyboard=True,
        one_time_keyboard=True
    )
    await callback.message.answer("Пожалуйста, заполните форму регистрации точки продаж:", reply_markup=kb, parse_mode="HTML")
    await state.set_state(SalesPointRegistrationStates.waiting_for_mini_app)
    await callback.answer()

# WebAppData → «подтверждение» данных
async def handle_sp_webapp_data(message: types.Message, state: FSMContext):
    """
    Ожидаем JSON от WebApp (точка продаж). Пример:
    {
      "full_name":"ООО Ромашка",
      "city":"Санкт-Петербург",
      "inn":"7701234567",
      "phone":"+71234567890",
      "business_type":"ООО",
      "bik":"044525225",
      "account":"30101810400000000225",
      "bank_details":"Банк: ПАО \"Сбербанк\" БАНК\nБИК: 044525225\nКорр. счет: 30101810400000000225",
      "isSales":"<agent_id>"
    }
    """
    try:
        payload = message.web_app_data.data
        data = json.loads(payload)
    except Exception:
        await message.answer("Ошибка: некорректные данные от формы.")
        return

    # Поля, которые обязательно должны прийти
    required = [
        "full_name", "city", "inn", "phone", "business_type", "bank_details", "isSales"
    ]
    if not all(field in data and str(data[field]).strip() for field in required):
        await message.answer("Не все поля заполнены. Пожалуйста, заполните форму полностью.")
        return

    # Извлекаем agent_id из data["isSales"]
    try:
        agent_id = int(data["isSales"])
    except ValueError:
        await message.answer("Неверный ID консультанта в данных формы.")
        return

    # Парсим bank_details для bank_name и bank_ks (примерно так же, как у агента)
    bank_details_str = data["bank_details"]
    bank_name = None
    bank_ks = None
    for line in bank_details_str.split("\n"):
        line = line.strip()
        if line.lower().startswith("банк:"):
            bank_name = line.split(":", 1)[1].strip()
        elif line.lower().startswith("корр.") or line.lower().startswith("корр. счет:"):
            bank_ks = line.split(":", 1)[1].strip()

    if not bank_name or not bank_ks:
        await message.answer(
            "Не удалось распознать из `bank_details` название банка или кор. счет.\n"
            "Убедитесь, что формат:\n"
            "Банк: <имя банка>\n"
            "…\n"
            "Корр. счет: <номер кор. счета>\n"
        )
        return

    # Сохраняем всё в state
    await state.update_data({
        "full_name":     data["full_name"],
        "city":          data["city"],
        "inn":           data["inn"],
        "phone":         data["phone"],
        "business_type": data["business_type"],
        "bik":           data.get("bik", ""),
        "account":       data.get("account", ""),
        "bank_name":     bank_name,
        "bank_ks":       bank_ks,
        "bank_details":  bank_details_str,
        "agent_id":      agent_id
    })

    # Формируем текст подтверждения
    confirmation_text = (
        "<b>Проверьте введённые данные (Точка продаж):</b>\n\n"
        f"ФИО: {data['full_name']}\n"
        f"Город: {data['city']}\n"
        f"ИНН: {data['inn']}\n"
        f"Телефон: {data['phone']}\n"
        f"Тип: {data['business_type']}\n\n"
        f"<b>БИК:</b> {data.get('bik','')}\n"
        f"<b>Расчётный счёт:</b> {data.get('account','')}\n"
        f"<b>Название банка:</b> {bank_name}\n"
        f"<b>Корр. счет:</b> {bank_ks}"
    )
    await message.answer("Данные получены:", reply_markup=ReplyKeyboardRemove(), parse_mode="HTML")
    await message.answer(confirmation_text, reply_markup=sp_confirmation_keyboard(), parse_mode="HTML")
    await state.set_state(SalesPointRegistrationStates.confirmation)

# callback_data == "sp_confirm_data"
async def sp_confirm_data(callback: types.CallbackQuery, state: FSMContext, bot: Bot):
    """
    Если администратор еще не просил форму, то мы сохраняем запись,
    а затем отправляем администраторам сообщение с кнопками Одобрить/Отклонить.
    """
    data = await state.get_data()
    tg_id = callback.from_user.id

    # Обязательно должен быть agent_id, иначе кто-то хитрит
    agent_id = data.get("agent_id")
    if not agent_id:
        await callback.answer("Ошибка: agent_id не передан.", show_alert=True)
        return

    db = SessionLocal()
    try:
        user_svc = UserService(db)
        user = user_svc.get_or_create_user(
            telegram_id=tg_id,
            full_name=callback.from_user.full_name or "",
            username=callback.from_user.username or "",
        )
        user_id = user.get("id")
    finally:
        db.close()

    sp_svc = SalesPointService()
    try:
        sp_svc.register_sales_point(
            user_id=user_id,
            agent_id=agent_id,
            full_name=data["full_name"],
            city=data["city"],
            inn=data["inn"],
            phone=data["phone"],
            business_type=data["business_type"],
            bik=data.get("bik", ""),
            account=data.get("account", ""),
            bank_name=data["bank_name"],
            bank_ks=data["bank_ks"],
            bank_details=data["bank_details"]
        )
    except Exception as e:
        await callback.message.answer(f"Ошибка при регистрации: {e}", show_alert=True)
        await state.clear()
        return

    # Уведомляем админа в канал:
    # составляем Inline-клавиатуру с кнопками «Одобрить» / «Отклонить»
    admin_kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="✅ Одобрить", callback_data=f"approve_sp_{user_id}_{tg_id}"),
        InlineKeyboardButton(text="❌ Отклонить", callback_data=f"reject_sp_{user_id}_{tg_id}")
    ]])

    # Текст админа (без подробных банковских полей, они в БД)
    admin_text = (
        f"📄 Новая заявка ТОЧКИ ПРОДАЖ:\n"
        f"- Telegram ID: {tg_id}\n"
        f"- Agent ID: {agent_id}\n"
        f"- ФИО: {data['full_name']}\n"
        f"- Город: {data['city']}\n"
        f"- ИНН: {data['inn']}\n"
        f"- Телефон: {data['phone']}\n"
        f"- Тип: {data['business_type']}\n"
        f"- Банк: {data['bank_name']}\n"
        f"- Корр. счет: {data['bank_ks']}"
    )
    await bot.send_message(chat_id=settings.CHANNEL_ID, text=admin_text, reply_markup=admin_kb)

    await callback.message.answer("✅ Ваша заявка отправлена на рассмотрение. Ждите ответа администратора.")
    await state.clear()
    await callback.answer()

# callback_data == "sp_correct_data"
async def sp_correct_data(callback: types.CallbackQuery, state: FSMContext):
    """
    Позволяет пользователю-торговой точке вернуться на WebApp и исправить данные.
    """
    data = await state.get_data()
    agent_id = data.get("agent_id")
    if not agent_id:
        await callback.answer("Ошибка: agent_id не найден.", show_alert=True)
        return

    mini_app_url = f"{settings.WEBAPP_URL}/sales-point-form?ref={agent_id}"
    web_app = types.WebAppInfo(url=mini_app_url)
    kb = types.ReplyKeyboardMarkup(
        keyboard=[[types.KeyboardButton(text="Повторно заполнить форму", web_app=web_app)]],
        resize_keyboard=True,
        one_time_keyboard=True
    )
    await callback.message.answer("Исправьте данные, пожалуйста:", reply_markup=kb)
    await state.set_state(SalesPointRegistrationStates.waiting_for_mini_app)
    await callback.answer()

# callback_data == "sp_sign_contract_<user_id>"
async def handle_sp_sign_contract(callback: types.CallbackQuery, bot: Bot):
    """
    После одобрения админ отправил точке продаж договор (admin_handlers),
    точка просмотра нажала «Подписать договор» → сюда попадёт callback.data вида "sp_sign_contract_<user_id>".
    Мы вызываем service.sign_sales_point_contract, получаем path к PNG-лого (баннер+QR)
    и отсылаем его точке, а также уведомляем админ-канал.
    """
    parts = callback.data.split("_")
    # ["sp", "sign", "contract", "<user_id>", "<tg_id>"]
    if len(parts) != 5:
        await callback.answer("Неверный формат подписи договора.", show_alert=True)
        return

    try:
        user_id = int(parts[3])
        tg_id = int(parts[4])
    except ValueError:
        await callback.answer("Неверённый user_id.", show_alert=True)
        return

    sp_svc = SalesPointService()
    try:
        banner_path, referral_link = sp_svc.sign_sales_point_contract(user_id)
    except Exception as e:
        await callback.answer(f"Ошибка при подписи договора: {e}", show_alert=True)
        return

    # Убираем кнопку «Подписать договор»
    await callback.message.edit_reply_markup(reply_markup=None)

    # Отправляем точке продаж баннер с QR-кодом и ссылку
    await bot.send_message(
        chat_id=tg_id,
        text=(
            "✅ Вы успешно подписали договор как точка продаж!\n\n"
            f"Ваша реферальная ссылка:\n{referral_link}\n\n"
            "Ниже ваш баннер с QR-кодом. Сохраните или поделитесь им для привлечения клиентов."
        )
    )
    await bot.send_document(
        chat_id=tg_id,
        document=types.FSInputFile(banner_path),
        caption="Ваш баннер с QR-кодом"
    )
    os.remove(banner_path)

    # Уведомляем админ-канал, что договор подписан
    await bot.send_message(chat_id=settings.CHANNEL_ID, text=f"➡️ Точка продаж {tg_id} подписала договор.")

    await callback.answer("Договор подписан. Баннер отправлен.")