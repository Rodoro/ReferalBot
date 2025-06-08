import logging
import asyncio
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.filters import StateFilter

from  newBot.config import settings
from newBot.handlers.agent_handlers import (
    cmd_start_agent_secret, start_agent_registration, handle_agent_webapp_data,
    agent_confirm_data, agent_correct_data, handle_agent_sign_contract,
    AgentRegistrationStates,
)
from newBot.handlers.sales_point_handlers import (
    cmd_start_sp_referral, start_sp_registration, handle_sp_webapp_data,
    sp_confirm_data, sp_correct_data, handle_sp_sign_contract
)
from newBot.handlers.poet_handlers import (
    cmd_start_poet_secret, start_poet_registration, handle_poet_webapp_data,
    poet_confirm_data, poet_correct_data, handle_poet_sign_contract,
    PoetRegistrationStates,
)
from newBot.handlers.admin_handlers import (
    handle_approve_user,
    handle_reject_user_callback,
    process_reject_reason
)
from newBot.lib.webapp_utils import payload_sales_id, payload_form_type
 
logging.basicConfig(level=logging.INFO)

async def main():
    bot = Bot(token=settings.BOT_TOKEN, parse_mode=ParseMode.HTML)
    dp = Dispatcher(storage=MemoryStorage())

    # --- Точка Продаж ---
    dp.message.register(cmd_start_sp_referral, lambda msg: msg.text and msg.text.startswith(f"/start ref_"))
    dp.callback_query.register(start_sp_registration, lambda c: c.data == "start_sp_registration")
    dp.message.register(
        handle_sp_webapp_data,
        lambda msg: msg.web_app_data and payload_sales_id(msg.web_app_data.data) is not None
    )
    dp.callback_query.register(sp_confirm_data, lambda c: c.data == "sp_confirm_data")
    dp.callback_query.register(sp_correct_data, lambda c: c.data == "sp_correct_data")
    dp.callback_query.register(handle_sp_sign_contract,lambda c: c.data and c.data.startswith("sp_sign_contract_"))

    # --- Агент ---
    dp.message.register(cmd_start_agent_secret, lambda msg: msg.text and msg.text.startswith(f"/start secret_{settings.ADMIN_SECRET}"))
    dp.callback_query.register(start_agent_registration, lambda c: c.data == "start_agent_registration")
    dp.message.register(
        handle_agent_webapp_data,
        StateFilter(AgentRegistrationStates.waiting_for_mini_app),
        lambda msg: (
            msg.web_app_data
            and payload_sales_id(msg.web_app_data.data) is None
            and payload_form_type(msg.web_app_data.data) != "poet"
        )
    )
    dp.callback_query.register(agent_confirm_data, lambda c: c.data == "agent_confirm_data")
    dp.callback_query.register(agent_correct_data, lambda c: c.data == "agent_correct_data")
    dp.callback_query.register(handle_agent_sign_contract,lambda c: c.data and c.data.startswith("agent_sign_contract_"))

    # --- Поэт ---
    dp.message.register(
        cmd_start_poet_secret,
        lambda msg: msg.text and msg.text.startswith(f"/start poet_{settings.POET_SECRET}")
    )
    dp.callback_query.register(start_poet_registration, lambda c: c.data == "start_poet_registration")
    dp.message.register(
        handle_poet_webapp_data,
        StateFilter(PoetRegistrationStates.waiting_for_mini_app),
        lambda msg: (
            msg.web_app_data
            and payload_form_type(msg.web_app_data.data) == "poet"
        )
    )
    dp.callback_query.register(poet_confirm_data, lambda c: c.data == "poet_confirm_data")
    dp.callback_query.register(poet_correct_data, lambda c: c.data == "poet_correct_data")
    dp.callback_query.register(handle_poet_sign_contract, lambda c: c.data and c.data.startswith("poet_sign_contract_"))

    # # --- Видеомонтажёр ---
    # dp.message.register(cmd_start_ve, lambda msg: msg.text and msg.text == "/start_ve")
    # dp.callback_query.register(start_ve_registration, lambda c: c.data == "start_ve_registration")
    # dp.message.register(handle_ve_webapp_data, content_types=types.ContentType.WEB_APP_DATA)
    # dp.callback_query.register(ve_confirm_data, lambda c: c.data == "ve_confirm_data")
    # dp.callback_query.register(ve_correct_data, lambda c: c.data == "ve_correct_data")

    # --- Админка: approve/reject для всех ролей ---
    dp.callback_query.register(handle_approve_user,lambda c: c.data and c.data.startswith("approve_"))
    dp.callback_query.register(handle_reject_user_callback,lambda c: c.data and c.data.startswith("reject_"))
    dp.message.register(process_reject_reason)

    logging.info("Bot is starting...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())