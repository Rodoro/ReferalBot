from aiogram import Bot, types
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram import Dispatcher
from aiogram.enums import ParseMode
from aiogram.utils.keyboard import InlineKeyboardBuilder, ReplyKeyboardBuilder
from database import Database
import asyncio

# Инициализация
TOKEN = '8017768385:AAGlDmiTX5RBHPvbf-AWPhMBsAUWZ2a8VsA'
CHANNEL_ID  = -4727328007
bot = Bot(token=TOKEN, parse_mode=ParseMode.HTML)
dp = Dispatcher(storage=MemoryStorage())
db = Database()

# Состояния
class RegistrationStates(StatesGroup):
    waiting_for_data = State()
    confirmation = State()
    signing_contract = State()

class SalesPointStates(StatesGroup):
    waiting_for_data = State()
    confirmation = State()
    signing_contract = State()

class AdminStates(StatesGroup):
    waiting_reason = State()

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
        callback_data="correct_data"))
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

# Обработчики
@dp.message(lambda message: message.text == "/start")
async def start_command(message: types.Message):
    welcome_text = """Здравствуйте, вы попали в бот регистрации Агентов сервиса "Подари Песню".

Если вы по адресу, нажмите кнопку "Старт" ниже."""
    await message.answer(welcome_text, reply_markup=start_inline_keyboard())

@dp.callback_query(lambda c: c.data == "start_registration")
async def start_registration(callback: types.CallbackQuery, state: FSMContext):
    if db.check_agent(callback.from_user.id):
        await callback.answer("Вы уже зарегистрированы!", show_alert=True)
        return
        
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
    
    # Сохраняем данные в ожидании подтверждения
    db.add_agent((
        callback.from_user.id,
        user_data['full_name'],
        user_data['city'],
        user_data['inn'],
        user_data['phone'],
        user_data['business_type'],
        user_data['bank_details'],
        False,  # Флаг одобрения
        ''
    ))
    
    # Отправляем заявку администратору
    application_text = f"""📄 Новая заявка от @{callback.from_user.username} (ID: {callback.from_user.id})
    
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
        await callback.message.edit_text("Отлично, мы получили вашу заявку, ждите одобрения", reply_markup=None)
    except:
        await callback.message.answer("Отлично, мы получили вашу заявку, ждите одобрения")
    
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

Поделитесь этой ссылкой с вашими точками продаж.""",
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
    agent_id = db.get_agent_by_referral(referral_code)
    
    if not agent_id:
        await message.answer("Неверная реферальная ссылка.")
        return
    
    if db.check_agent(message.from_user.id) or db.check_sales_point(message.from_user.id):
        await message.answer("Вы уже зарегистрированы в системе!")
        return
        
    welcome_text = """Здравствуйте! Вы перешли по реферальной ссылке агента.
    
Для регистрации как точка продаж нажмите кнопку "Старт" ниже."""
    
    await state.update_data(agent_id=agent_id)
    await message.answer(welcome_text, reply_markup=start_ref_inline_keyboard())

@dp.callback_query(lambda c: c.data == "start_registration_ref")
async def start_sales_point_registration(callback: types.CallbackQuery, state: FSMContext):
    data = await state.get_data()
    if 'agent_id' not in data:
        await callback.answer("Ошибка: не найден агент", show_alert=True)
        return
        
    instruction_text = """Введите данные точки продаж (каждое с новой строки):
ФИО
Город
Телефон"""
    
    try:
        await callback.message.edit_text(instruction_text, reply_markup=None)
    except:
        await callback.message.answer(instruction_text)
    
    await state.set_state(SalesPointStates.waiting_for_data)
    await callback.answer()

@dp.message(SalesPointStates.waiting_for_data)
async def process_sales_point_data(message: types.Message, state: FSMContext):
    data = [line.strip() for line in message.text.split('\n') if line.strip()]
    
    if len(data) != 3:
        msg = await message.answer("Пожалуйста, введите все 3 пункта в указанном формате. Попробуйте еще раз.")
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
        'phone': data[2],
        'agent_id': agent_id
    })
    
    confirmation_text = f"""Проверьте введенные данные:
    
ФИО: {data[0]}
Город: {data[1]}
Телефон: {data[2]}
Агент: {agent_id}"""

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
        user_data['phone'],
        False
    ))
    
    application_text = f"""📄 Новая заявка точки продаж от @{callback.from_user.username} (ID: {callback.from_user.id})
    
ФИО: {user_data['full_name']}
Город: {user_data['city']}
Телефон: {user_data['phone']}
Агент: {user_data['agent_id']}"""
    
    await bot.send_message(
        chat_id=CHANNEL_ID,
        text=application_text,
        reply_markup=admin_decision_keyboard(callback.from_user.id)
    )
    
    try:
        await callback.message.edit_text("Отлично, мы получили вашу заявку, ждите одобрения", reply_markup=None)
    except:
        await callback.message.answer("Отлично, мы получили вашу заявку, ждите одобрения")
    
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

async def main():
    await dp.start_polling(bot)

if __name__ == '__main__':
    print("Бот запущен...")
    asyncio.run(main())