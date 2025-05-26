import secrets
from aiogram import Bot, types, Dispatcher, F
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram import Dispatcher
from aiogram.enums import ParseMode
from aiogram.utils.keyboard import InlineKeyboardBuilder, ReplyKeyboardBuilder
from aiogram.enums.content_type import ContentType
from database import Database
import asyncio
import logging
import json

logging.basicConfig(level=logging.INFO)

# Инициализация
SECRETS = '6A3C3FFB'
TOKEN = '8017768385:AAGlDmiTX5RBHPvbf-AWPhMBsAUWZ2a8VsA'
CHANNEL_ID  = -4955772742
bot = Bot(token=TOKEN, parse_mode=ParseMode.HTML)
dp = Dispatcher(storage=MemoryStorage())
db = Database()

# Состояния
class RegistrationStates(StatesGroup):
    waiting_for_mini_app = State()
    confirmation = State()
    waiting_for_data = State()
    confirmation = State()
    signing_contract = State()
    handle_agent_mini_app_data = State()

class SalesPointStates(StatesGroup):
    waiting_for_mini_app = State()
    waiting_for_data = State()
    confirmation = State()
    signing_contract = State()

class AdminStates(StatesGroup):
    waiting_reason = State()

class AgentStates(StatesGroup):
    view_profile = State()
    view_points = State()
    view_statistics = State()
    view_contract = State()
    view_payments = State()

class SalesPointMenuStates(StatesGroup):
    view_profile = State()
    view_statistics = State()
    view_contract = State()
    view_payments = State()

# Inline-кнопки
def start_inline_keyboard():
    builder = InlineKeyboardBuilder()
    builder.add(types.InlineKeyboardButton(
        text="Старт",
        callback_data="start_registration"))
    return builder.as_markup()

def start_ref_inline_keyboard():
    builder = InlineKeyboardBuilder()
    builder.add(types.InlineKeyboardButton(
        text="Старт",
        callback_data="start_registration_ref"))
    return builder.as_markup()

def confirmation_inline_keyboard():
    builder = InlineKeyboardBuilder()
    builder.add(types.InlineKeyboardButton(
        text="Исправить",
        callback_data="start_registration"))
    builder.add(types.InlineKeyboardButton(
        text="Все верно",
        callback_data="confirm_data"))
    return builder.as_markup()

def admin_decision_keyboard(user_id):
    builder = InlineKeyboardBuilder()
    builder.add(types.InlineKeyboardButton(
        text="✅ Одобрить",
        callback_data=f"approve_{user_id}"))
    builder.add(types.InlineKeyboardButton(
        text="❌ Отклонить",
        callback_data=f"reject_{user_id}"))
    return builder.as_markup()

def agent_main_keyboard():
    builder = InlineKeyboardBuilder()
    builder.row(
        types.InlineKeyboardButton(text="👥 Мои точки", callback_data="agent_view_points"),
        types.InlineKeyboardButton(text="📊 Статистика", callback_data="agent_view_stats")
    )
    builder.row(
        types.InlineKeyboardButton(text="📝 Договор", callback_data="agent_view_contract"),
        types.InlineKeyboardButton(text="💰 Выплаты", callback_data="agent_view_payments")
    )
    return builder.as_markup()

def back_to_profile_keyboard():
    builder = InlineKeyboardBuilder()
    builder.add(types.InlineKeyboardButton(
        text="← Назад",
        callback_data="back_to_profile"))
    return builder.as_markup()

def sales_point_main_keyboard():
    builder = InlineKeyboardBuilder()
    builder.row(
        types.InlineKeyboardButton(text="📊 Статистика", callback_data="point_view_stats"),
        types.InlineKeyboardButton(text="📝 Договор", callback_data="point_view_contract")
    )
    builder.row(
        types.InlineKeyboardButton(text="💰 Выплаты", callback_data="point_view_payments")
    )
    return builder.as_markup()

def back_to_point_profile_keyboard():
    builder = InlineKeyboardBuilder()
    builder.add(types.InlineKeyboardButton(
        text="← Назад",
        callback_data="back_to_point_profile"))
    return builder.as_markup()

# Обработчики
@dp.message(lambda message: message.text and message.text.startswith("/start secret_" + SECRETS))
async def start_command(message: types.Message):
    welcome_text = """Здравствуйте, вы попали в бот регистрации Агентов сервиса "Подари Песню".

Если вы по адресу, нажмите кнопку "Старт" ниже."""
    await message.answer(welcome_text, reply_markup=start_inline_keyboard())

@dp.message(lambda message: message.text == "/start")
async def start_command(message: types.Message):
    if db.check_sales_point(message.from_user.id):
        point_data = db.get_sales_point_data(message.from_user.id)
        agent_data = db.get_agent_data(point_data['agent_id'])
        
        if point_data and agent_data:
            profile_text = f"""<b>🏪 Ваш профиль точки продаж</b>

<b>ФИО:</b> {point_data['full_name']}
<b>Город:</b> {point_data['city']}
<b>ИНН:</b> {point_data['inn']}
<b>Телефон:</b> {point_data['phone']}
<b>Тип:</b> {point_data['business_type']}
<b>Реквизиты:</b> {point_data['bank_details']}

<b>Ваш агент:</b> {agent_data['full_name']}
<b>Телефон агента:</b> {agent_data['phone']}"""
            
            await message.answer(profile_text, reply_markup=sales_point_main_keyboard())
            return
    if db.check_agent(message.from_user.id):
        agent_data = db.get_agent_data(message.from_user.id)
        if agent_data:
            profile_text = f"""<b>👤 Ваш профиль агента</b>

<b>ФИО:</b> {agent_data['full_name']}
<b>Город:</b> {agent_data['city']}
<b>ИНН:</b> {agent_data['inn']}
<b>Телефон:</b> {agent_data['phone']}
<b>Тип:</b> {agent_data['business_type']}
<b>Реквизиты:</b> {agent_data['bank_details']}

<b>Реферальная ссылка:</b>
https://t.me/TestBotReferalSystemBot?start=ref_{agent_data['referral_code']}

<b>Количество точек:</b> {db.get_agent_points_count(message.from_user.id)}"""
            
            await message.answer(profile_text, reply_markup=agent_main_keyboard())
            return

@dp.callback_query(lambda c: c.data == "start_registration")
async def start_registration(callback: types.CallbackQuery, state: FSMContext):
    if db.check_agent(callback.from_user.id):
        await callback.answer("Вы уже зарегистрированы!", show_alert=True)
        return
        
    # Ссылка на Mini App для агента
    mini_app_url = "https://giftsong.online/agent-form"
    web_app = types.WebAppInfo(url=mini_app_url)
    
    keyboard = types.ReplyKeyboardMarkup(
        keyboard=[
            [types.KeyboardButton(text='Заполнить форму регистрации', web_app=web_app)]
        ],
        resize_keyboard=True,
        one_time_keyboard=True
    )
    
    await callback.message.answer(
        "Пожалуйста, заполните форму регистрации агента:",
        reply_markup=keyboard
    )
    
    await state.set_state(RegistrationStates.waiting_for_mini_app)
    await callback.answer()

@dp.message(RegistrationStates.waiting_for_data)
async def process_data(message: types.Message, state: FSMContext):
    data = [line.strip() for line in message.text.split('\n') if line.strip()]
    
    if len(data) != 6:
        msg = await message.answer("Пожалуйста, введите все 6 пунктов в указанном формате. Попробуйте еще раз.")
        await asyncio.sleep(3)
        try:
            await bot.delete_message(chat_id=message.chat.id, message_id=msg.message_id)
            await bot.delete_message(chat_id=message.chat.id, message_id=message.message_id)
        except:
            pass
        return
    
    await state.update_data({
        'full_name': data[0],
        'city': data[1],
        'inn': data[2],
        'phone': data[3],
        'business_type': data[4],
        'bank_details': data[5]
    })
    
    confirmation_text = f"""Проверьте введенные данные:
    
ФИО: {data[0]}
Город: {data[1]}
ИНН: {data[2]}
Телефон: {data[3]}
ИП/самозанятый: {data[4]}
Банковские реквизиты: {data[5]}"""

    await message.answer(confirmation_text, reply_markup=confirmation_inline_keyboard())
    await state.set_state(RegistrationStates.confirmation)

@dp.callback_query(RegistrationStates.confirmation, lambda c: c.data == "correct_data")
async def correct_data(callback: types.CallbackQuery, state: FSMContext):
    instruction_text = """Введите свои данные (каждое с новой строки):
ФИО
Город
ИНН
Телефон
ИП или самозанятый?
Банковские реквизиты"""
    
    try:
        await callback.message.edit_text(instruction_text, reply_markup=None)
    except:
        await callback.message.answer(instruction_text)
    
    await state.set_state(RegistrationStates.waiting_for_data)
    await callback.answer()

@dp.callback_query(RegistrationStates.confirmation, lambda c: c.data == "confirm_data")
async def confirm_data(callback: types.CallbackQuery, state: FSMContext):
    user_data = await state.get_data()
    
    # Проверяем, не является ли это точкой продаж
    if 'isSales' in user_data and user_data['isSales']:
        await callback.answer("Ошибка: неверный тип регистрации", show_alert=True)
        return
    
    # Сохраняем данные как агента
    db.add_agent((
        callback.from_user.id,
        user_data['full_name'],
        user_data['city'],
        user_data['inn'],
        user_data['phone'],
        user_data['business_type'],
        user_data.get('bik', ''),
        user_data.get('account', ''),
        user_data.get('bank_name', ''),
        user_data.get('bank_ks', ''),
        user_data['bank_details'],
        False,  # Флаг одобрения
        ''      # Реферальный код (будет сгенерирован после одобрения)
    ))
    
    # Отправляем заявку администратору
    application_text = f"""📄 Новая заявка АГЕНТА от @{callback.from_user.username} (ID: {callback.from_user.id})
    
ФИО: {user_data['full_name']}
Город: {user_data['city']}
ИНН: {user_data['inn']}
Телефон: {user_data['phone']}
ИП/самозанятый: {user_data['business_type']}

<b>Банковские реквизиты:</b>
{user_data['bank_details']}"""
    
    await bot.send_message(
        chat_id=CHANNEL_ID,
        text=application_text,
        reply_markup=admin_decision_keyboard(callback.from_user.id),
        parse_mode=ParseMode.HTML
    )
    
    try:
        await callback.message.edit_text("Отлично, мы получили вашу заявку как агент, ждите одобрения", reply_markup=None)
    except:
        await callback.message.answer("Отлично, мы получили вашу заявку как агент, ждите одобрения")
    
    await state.clear()
    await callback.answer()

@dp.callback_query(SalesPointStates.confirmation, lambda c: c.data == "confirm_data")
async def confirm_sales_point_data(callback: types.CallbackQuery, state: FSMContext):
    user_data = await state.get_data()

    # Проверяем, что это действительно точка продаж
    if 'agent_id' not in user_data:
        await callback.answer("Ошибка: не указан агент для точки продаж", show_alert=True)
        return

    # Сохраняем данные как точку продаж
    db.add_sales_point((
        callback.from_user.id,
        user_data['agent_id'],
        user_data['full_name'],
        user_data['city'],
        user_data['inn'],
        user_data['phone'],
        user_data['business_type'],
        '',
        '',
        '',
        '',
        user_data['bank_details'],
        False,  # Флаг одобрения
        ''      # Подпись договора
    ))

    application_text = f"""📄 Новая заявка ТОЧКИ ПРОДАЖ от @{callback.from_user.username} (ID: {callback.from_user.id})
    
ФИО: {user_data['full_name']}
Город: {user_data['city']}
ИНН: {user_data['inn']}
Телефон: {user_data['phone']}
ИП/самозанятый: {user_data['business_type']}
Банковские реквизиты: {user_data['bank_details']}"""

    await bot.send_message(
        chat_id=CHANNEL_ID,
        text=application_text,
        reply_markup=admin_decision_keyboard(callback.from_user.id)
    )

    try:
        await callback.message.edit_text("Отлично, мы получили вашу заявку как точка продаж, ждите одобрения", reply_markup=None)
    except:
        await callback.message.answer("Отлично, мы получили вашу заявку как точка продаж, ждите одобрения")

    await state.clear()
    await callback.answer()
# Обработчики для администратора
@dp.callback_query(lambda c: c.data.startswith("approve_"))
async def approve_application(callback: types.CallbackQuery):
    user_id = int(callback.data.split("_")[1])

    # Определяем, кто это — агент или точка
    is_agent = db.is_user_agent(user_id)
    
    if is_agent is None:
        await callback.answer("Ошибка: пользователь не найден ни как агент, ни как точка.", show_alert=True)
        return

    # Обновляем статус в базе данных
    if is_agent:
        db.approve_agent(user_id)
        file_path = "Агентский договор.docx"
        caption = """🎉 Поздравляем, ваша кандидатура как Агента одобрена.
        
Пожалуйста, ознакомьтесь с договором и нажмите кнопку "Подписать договор" ниже."""
    else:
        db.approve_sales_point(user_id)
        file_path = "Договор с точкой продаж.docx"
        caption = """🎉 Поздравляем, ваша кандидатура как Точки продаж одобрена.
        
Пожалуйста, ознакомьтесь с договором и нажмите кнопку "Подписать договор" ниже."""
    
    try:
        with open(file_path, "rb") as file:
            # Создаем клавиатуру для подписания
            sign_builder = InlineKeyboardBuilder()
            sign_builder.add(types.InlineKeyboardButton(
                text="Подписать договор",
                callback_data=f"sign_contract_{'agent' if is_agent else 'sales'}_{user_id}"))
            
            await bot.send_document(
                chat_id=user_id,
                document=types.FSInputFile(file_path),
                caption=caption,
                reply_markup=sign_builder.as_markup()
            )
    except Exception as e:
        await callback.answer(f"Не удалось отправить договор: {e}", show_alert=True)
        return
    
    await callback.message.edit_text(f"✅ Заявка пользователя {user_id} одобрена. Договор отправлен.")
    await callback.answer()

    await callback.answer()

@dp.callback_query(lambda c: c.data.startswith("sign_contract_"))
async def sign_contract(callback: types.CallbackQuery):
    parts = callback.data.split("_")
    role = parts[2]
    user_id = int(parts[3])
    is_agent = (role == "agent")
    
    try:
        db.sign_contract(user_id, is_agent=is_agent)
        
        if is_agent:
            referral_code = db.generate_referral_code(user_id)
            referral_link = f"https://t.me/TestBotReferalSystemBot?start=ref_{referral_code}"
            
            await callback.message.answer(
                text=f"""✅ Вы успешно подписали договор. Теперь вы официальный агент сервиса!
                
Ваша реферальная ссылка для приглашения точек продаж:
{referral_link}

Поделитесь этой ссылкой с вашими точками продаж.

Что бы просмотреть профиль, пропишите /start""",
                reply_markup=None
            )
        else:
            await callback.message.answer(
                text="✅ Вы успешно подписали договор. Теперь вы официальная точка продаж!",
                reply_markup=None
            )
        
        try:
            await bot.delete_message(
                chat_id=callback.message.chat.id,
                message_id=callback.message.message_id
            )
        except:
            pass
        
        await bot.send_message(
            chat_id=CHANNEL_ID,
            text=f"Пользователь {user_id} подписал договор ({'агент' if is_agent else 'точка продаж'})."
        )
        
        await callback.answer()
        
    except Exception as e:
        await callback.answer(f"Ошибка при подписании договора: {e}", show_alert=True)

@dp.message(lambda message: message.text and message.text.startswith("/start ref_"))
async def start_with_referral(message: types.Message, state: FSMContext):
    referral_code = message.text.split("ref_")[1].strip()
    agent_info = db.get_agent_info_by_referral(referral_code)
    
    if not agent_info:
        await message.answer("Неверная реферальная ссылка.")
        return
    
    if db.check_agent(message.from_user.id) or db.check_sales_point(message.from_user.id):
        await message.answer("Вы уже зарегистрированы в системе!")
        return
        
    welcome_text = f"""Здравствуйте! Вы перешли по ссылке агента {agent_info['full_name']}
    
Для регистрации в качестве точки продаж нажмите кнопку "Старт" ниже."""
    
    await state.update_data(agent_id=agent_info['user_id'])
    await message.answer(welcome_text, reply_markup=start_ref_inline_keyboard())

@dp.callback_query(lambda c: c.data == "start_registration_ref")
async def start_sales_point_registration(callback: types.CallbackQuery, state: FSMContext):
    data = await state.get_data()
    if 'agent_id' not in data:
        await callback.answer("Ошибка: не найден агент", show_alert=True)
        return
        
    print(481, data['agent_id'])
    # Ссылка на Mini App для точки продаж
    mini_app_url = "https://giftsong.online/sales-point-form?ref="+str(data['agent_id'])
    web_app = types.WebAppInfo(url=mini_app_url)
    
    keyboard = types.ReplyKeyboardMarkup(
        keyboard=[
            [types.KeyboardButton(text='Заполнить форму регистрации', web_app=web_app)]
        ],
        resize_keyboard=True,
        one_time_keyboard=True
    )
    
    await callback.message.answer(
        "Пожалуйста, заполните форму регистрации точки продаж:",
        reply_markup=keyboard
    )
    
    await state.set_state(SalesPointStates.waiting_for_mini_app)
    await callback.answer()

@dp.message(SalesPointStates.waiting_for_data)
async def process_sales_point_data(message: types.Message, state: FSMContext):
    data = [line.strip() for line in message.text.split('\n') if line.strip()]
    
    if len(data) != 6:
        msg = await message.answer("Пожалуйста, введите все 6 пунктов в указанном формате. Попробуйте еще раз.")
        await asyncio.sleep(3)
        try:
            await bot.delete_message(chat_id=message.chat.id, message_id=msg.message_id)
            await bot.delete_message(chat_id=message.chat.id, message_id=message.message_id)
        except:
            pass
        return

    state_data = await state.get_data()
    agent_id = state_data['agent_id']

    await state.update_data({
        'full_name': data[0],
        'city': data[1],
        'inn': data[2],
        'phone': data[3],
        'business_type': data[4],
        'bank_details': data[5],
        'agent_id': agent_id
    })

    confirmation_text = f"""Проверьте введенные данные:
    
ФИО: {data[0]}
Город: {data[1]}
ИНН: {data[2]}
Телефон: {data[3]}
ИП/самозанятый: {data[4]}
Банковские реквизиты: {data[5]}"""

    await message.answer(confirmation_text, reply_markup=confirmation_inline_keyboard())
    await state.set_state(SalesPointStates.confirmation)

@dp.callback_query(SalesPointStates.confirmation, lambda c: c.data == "confirm_data")
async def confirm_sales_point_data(callback: types.CallbackQuery, state: FSMContext):
    user_data = await state.get_data()

    db.add_sales_point((
        callback.from_user.id,
        user_data['agent_id'],
        user_data['full_name'],
        user_data['city'],
        user_data['inn'],
        user_data['phone'],
        user_data['business_type'],
        user_data['bank_details'],
        False,
        ''
    ))

    application_text = f"""📄 Новая заявка Точки продаж от @{callback.from_user.username} (ID: {callback.from_user.id})
    
ФИО: {user_data['full_name']}
Город: {user_data['city']}
ИНН: {user_data['inn']}
Телефон: {user_data['phone']}
ИП/самозанятый: {user_data['business_type']}
Банковские реквизиты: {user_data['bank_details']}"""

    await bot.send_message(
        chat_id=CHANNEL_ID,
        text=application_text,
        reply_markup=admin_decision_keyboard(callback.from_user.id)
    )

    try:
        await callback.message.edit_text("Отлично, мы получили вашу заявку как точка продаж, ждите одобрения", reply_markup=None)
    except:
        await callback.message.answer("Отлично, мы получили вашу заявку как точка продаж, ждите одобрения")

    await state.clear()
    await callback.answer()

@dp.callback_query(lambda c: c.data.startswith("reject_"))
async def reject_application(callback: types.CallbackQuery, state: FSMContext):
    user_id = int(callback.data.split("_")[1])
    await state.update_data(reject_user_id=user_id)
    
    await callback.message.answer("📝 Укажите причину отказа:")
    await state.set_state(AdminStates.waiting_reason)
    await callback.answer()

@dp.message(AdminStates.waiting_reason)
async def process_reject_reason(message: types.Message, state: FSMContext):
    data = await state.get_data()
    user_id = data['reject_user_id']
    reason = message.text
    
    # Отправляем уведомление пользователю
    try:
        await bot.send_message(
            chat_id=user_id,
            text=f"❌ Ваша заявка отклонена.\n\nПричина: {reason}"
        )
    except Exception as e:
        await message.answer(f"Не удалось отправить сообщение пользователю: {e}")
        return
    
    await message.answer(f"❌ Пользователю {user_id} отправлено уведомление об отказе.")
    await state.clear()

@dp.callback_query(lambda c: c.data == "back_to_profile")
async def back_to_profile(callback: types.CallbackQuery):
    agent_data = db.get_agent_data(callback.from_user.id)
    if agent_data:
        profile_text = f"""<b>👤 Ваш профиль агента</b>

<b>ФИО:</b> {agent_data['full_name']}
<b>Город:</b> {agent_data['city']}
<b>ИНН:</b> {agent_data['inn']}
<b>Телефон:</b> {agent_data['phone']}
<b>Тип:</b> {agent_data['business_type']}
<b>Реквизиты:</b> {agent_data['bank_details']}

<b>Реферальная ссылка:</b>
https://t.me/TestBotReferalSystemBot?start=ref_{agent_data['referral_code']}

<b>Количество точек:</b> {db.get_agent_points_count(callback.from_user.id)}"""
        
        try:
            await callback.message.edit_text(profile_text, reply_markup=agent_main_keyboard())
        except:
            await callback.message.answer(profile_text, reply_markup=agent_main_keyboard())
    await callback.answer()

@dp.callback_query(lambda c: c.data == "agent_view_points")
async def agent_view_points(callback: types.CallbackQuery):
    points = db.get_agent_points(callback.from_user.id)
    if points:
        points_text = "<b>👥 Ваши точки продаж:</b>\n\n"
        for i, point in enumerate(points, 1):
            points_text += f"{i}. <b>{point['full_name']}</b>\nГород: {point['city']}\nТелефон: {point['phone']}\n\n"
    else:
        points_text = "У вас пока нет зарегистрированных точек продаж."
    
    try:
        await callback.message.edit_text(
            points_text,
            reply_markup=back_to_profile_keyboard()
        )
    except:
        await callback.message.answer(
            points_text,
            reply_markup=back_to_profile_keyboard()
        )
    await callback.answer()

@dp.callback_query(lambda c: c.data == "agent_view_stats")
async def agent_view_stats(callback: types.CallbackQuery):
    stats = db.get_agent_statistics(callback.from_user.id)
    stats_text = f"""<b>📊 Ваша статистика</b>

<b>Всего точек:</b> {stats['total_points']}
<b>Активных точек:</b> {stats['active_points']}
<b>Общий оборот:</b> {stats['total_turnover']} руб.
<b>Ваш доход:</b> {stats['total_income']} руб.
<b>Последняя выплата:</b> {stats['last_payment'] or 'нет данных'}"""
    
    try:
        await callback.message.edit_text(
            stats_text,
            reply_markup=back_to_profile_keyboard()
        )
    except:
        await callback.message.answer(
            stats_text,
            reply_markup=back_to_profile_keyboard()
        )
    await callback.answer()

@dp.callback_query(lambda c: c.data == "agent_view_contract")
async def agent_view_contract(callback: types.CallbackQuery):
    try:
        with open("Агентский договор.docx", "rb") as file:
            await bot.send_document(
                chat_id=callback.from_user.id,
                document=types.FSInputFile("Агентский договор.docx"),
                caption="📝 Ваш агентский договор",
                reply_markup=back_to_profile_keyboard()
            )
            try:
                await callback.message.delete()
            except:
                pass
    except Exception as e:
        await callback.message.edit_text(
            "Не удалось загрузить договор. Обратитесь в поддержку.",
            reply_markup=back_to_profile_keyboard()
        )
    await callback.answer()

@dp.callback_query(lambda c: c.data == "agent_view_payments")
async def agent_view_payments(callback: types.CallbackQuery):
    payments = db.get_agent_payments(callback.from_user.id)
    if payments:
        payments_text = "<b>💰 История выплат</b>\n\n"
        for payment in payments:
            payments_text += f"<b>{payment['date']}</b>\nСумма: {payment['amount']} руб.\nСтатус: {payment['status']}\n\n"
    else:
        payments_text = "У вас пока нет выплат."
    
    try:
        await callback.message.edit_text(
            payments_text,
            reply_markup=back_to_profile_keyboard()
        )
    except:
        await callback.message.answer(
            payments_text,
            reply_markup=back_to_profile_keyboard()
        )
    await callback.answer()

@dp.callback_query(lambda c: c.data == "back_to_point_profile")
async def back_to_point_profile(callback: types.CallbackQuery):
    point_data = db.get_sales_point_data(callback.from_user.id)
    agent_data = db.get_agent_data(point_data['agent_id'])
    
    if point_data and agent_data:
        profile_text = f"""<b>🏪 Ваш профиль точки продаж</b>

<b>ФИО:</b> {point_data['full_name']}
<b>Город:</b> {point_data['city']}
<b>ИНН:</b> {point_data['inn']}
<b>Телефон:</b> {point_data['phone']}
<b>Тип:</b> {point_data['business_type']}
<b>Реквизиты:</b> {point_data['bank_details']}

<b>Ваш агент:</b> {agent_data['full_name']}
<b>Телефон агента:</b> {agent_data['phone']}"""
        
        try:
            await callback.message.edit_text(profile_text, reply_markup=sales_point_main_keyboard())
        except:
            await callback.message.answer(profile_text, reply_markup=sales_point_main_keyboard())
    await callback.answer()

@dp.callback_query(lambda c: c.data == "point_view_stats")
async def point_view_stats(callback: types.CallbackQuery):
    stats = db.get_sales_point_statistics(callback.from_user.id)
    stats_text = f"""<b>📊 Ваша статистика</b>

<b>Всего продаж:</b> {stats['total_sales']}
<b>Текущий месяц:</b> {stats['month_sales']} руб.
<b>Общий оборот:</b> {stats['total_turnover']} руб.
<b>Ваш доход:</b> {stats['total_income']} руб.
<b>Последняя выплата:</b> {stats['last_payment'] or 'нет данных'}"""
    
    try:
        await callback.message.edit_text(
            stats_text,
            reply_markup=back_to_point_profile_keyboard()
        )
    except:
        await callback.message.answer(
            stats_text,
            reply_markup=back_to_point_profile_keyboard()
        )
    await callback.answer()

@dp.callback_query(lambda c: c.data == "point_view_contract")
async def point_view_contract(callback: types.CallbackQuery):
    try:
        with open("Договор с точкой продаж.docx", "rb") as file:
            await bot.send_document(
                chat_id=callback.from_user.id,
                document=types.FSInputFile("Договор с точкой продаж.docx"),
                caption="📝 Ваш договор с точкой продаж",
                reply_markup=back_to_point_profile_keyboard()
            )
            try:
                await callback.message.delete()
            except:
                pass
    except Exception as e:
        await callback.message.edit_text(
            "Не удалось загрузить договор. Обратитесь в поддержку.",
            reply_markup=back_to_point_profile_keyboard()
        )
    await callback.answer()

@dp.callback_query(lambda c: c.data == "point_view_payments")
async def point_view_payments(callback: types.CallbackQuery):
    payments = db.get_sales_point_payments(callback.from_user.id)
    if payments:
        payments_text = "<b>💰 История выплат</b>\n\n"
        for payment in payments:
            payments_text += f"<b>{payment['date']}</b>\nСумма: {payment['amount']} руб.\nСтатус: {payment['status']}\n\n"
    else:
        payments_text = "У вас пока нет выплат."
    
    try:
        await callback.message.edit_text(
            payments_text,
            reply_markup=back_to_point_profile_keyboard()
        )
    except:
        await callback.message.answer(
            payments_text,
            reply_markup=back_to_point_profile_keyboard()
        )
    await callback.answer()

@dp.message(F.content_type == ContentType.WEB_APP_DATA)
async def handle_mini_app_data(message: types.Message, state: FSMContext):
    print("WebApp data received:", message.web_app_data)
    try:
        data = json.loads(message.web_app_data.data)

        # Проверяем, является ли пользователь точкой продаж
        is_sales_point = 'isSales' in data and data['isSales']
        
        if is_sales_point:
            # Обработка для точки продаж
            required_fields = ['full_name', 'city', 'inn', 'phone', 'business_type', 'bank_details', 'isSales']
            if not all(field in data for field in required_fields):
                await message.answer("Не все обязательные поля заполнены. Пожалуйста, попробуйте еще раз.")
                return
            
            agent_id = data['isSales']  # isSales содержит ID агента для точки продаж
            
            await state.update_data({
                'full_name': data['full_name'],
                'city': data['city'],
                'inn': data['inn'],
                'phone': data['phone'],
                'business_type': data['business_type'],
                'bank_details': data['bank_details'],
                'agent_id': agent_id
            })
            
            confirmation_text = f"""Проверьте введенные данные (точка продаж):
            
ФИО: {data['full_name']}
Город: {data['city']}
ИНН: {data['inn']}
Телефон: {data['phone']}
ИП/самозанятый: {data['business_type']}
Банковские реквизиты: {data['bank_details']}"""
            
            await message.answer(
                "Данные получены", 
                reply_markup=types.ReplyKeyboardRemove()
            )
            
            await message.answer(
                confirmation_text, 
                reply_markup=confirmation_inline_keyboard()
            )
            await state.set_state(SalesPointStates.confirmation)
            
        else:
            # Обработка для агента
            required_fields = ['full_name', 'city', 'inn', 'phone', 'business_type', 'bik', 'account']
            if not all(field in data for field in required_fields):
                await message.answer("Не все обязательные поля заполнены. Пожалуйста, попробуйте еще раз.")
                return
            
            await state.update_data({
                'full_name': data['full_name'],
                'city': data['city'],
                'inn': data['inn'],
                'phone': data['phone'],
                'business_type': data['business_type'],
                'bik': data['bik'],
                'account': data['account'],
                'bank_details': data['bank_details']
            })
            
            confirmation_text = f"""Проверьте введенные данные (агент):
            
ФИО: {data['full_name']}
Город: {data['city']}
ИНН: {data['inn']}
Телефон: {data['phone']}
ИП/самозанятый: {data['business_type']}

<b>Банковские реквизиты:</b>
{data['bank_details']}"""

            await message.answer(
                "Данные получены", 
                reply_markup=types.ReplyKeyboardRemove()
            )
            
            await message.answer(
                confirmation_text, 
                reply_markup=confirmation_inline_keyboard(),
                parse_mode=ParseMode.HTML
            )
            await state.set_state(RegistrationStates.confirmation)

    except Exception as e:
        await message.answer(f"Произошла ошибка при обработке данных: {str(e)}")

async def main():
    await dp.start_polling(bot)

if __name__ == '__main__':
    print("Бот запущен...")
    asyncio.run(main())