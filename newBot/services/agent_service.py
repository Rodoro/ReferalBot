from sqlalchemy.orm import Session
from ..repositories.agent_repository import AgentRepository
from ..repositories.sales_point_repository import SalesPointRepository
from ..models.agent import Agent
from newBot.config import settings

class AgentService:
    def __init__(self, db: Session):
        self.agent_repo = AgentRepository(db)
        self.sp_repo = SalesPointRepository(db)

    def register_agent(self, user_id: int, full_name: str, city: str,
                       inn: str, phone: str, business_type: str,
                       bik: str, account: str, bank_name: str,
                       bank_ks: str, bank_details: str) -> Agent:
        return self.agent_repo.create(
            user_id=user_id,
            full_name=full_name,
            city=city,
            inn=inn,
            phone=phone,
            business_type=business_type,
            bik=bik,
            account=account,
            bank_name=bank_name,
            bank_ks=bank_ks,
            bank_details=bank_details
        )

    def approve_agent(self, user_id: int) -> bool:
        return self.agent_repo.approve(user_id)

    def sign_agent_contract(self, user_id: int) -> str:
        """
        Подписывает договор, генерирует реферальный код и возвращает ссылку.
        """
        ok = self.agent_repo.sign_contract(user_id)
        if not ok:
            raise ValueError("Agent not found or not approved")
        code = self.agent_repo.generate_referral_code(user_id)
        return f"https://t.me/{settings.BOT_USERNAME}?start=ref_{code}"

    def get_agent_profile(self, user_id: int) -> dict:
        agent = self.agent_repo.get_by_user_id(user_id)
        if not agent:
            return {}
        points_count = self.agent_repo.count_points(user_id)
        return {
            "full_name": agent.full_name,
            "city": agent.city,
            "inn": agent.inn,
            "phone": agent.phone,
            "business_type": agent.business_type,
            "bank_details": agent.bank_details,
            "referral_link": (None if not agent.referral_code else f"https://t.me/{settings.BOT_USERNAME}?start=ref_{agent.referral_code}"),
            "points_count": points_count
        }

    def list_agent_points(self, user_id: int) -> list[dict]:
        sps = self.sp_repo.db.query(self.sp_repo.db.query(self.sp_repo).filter_by(agent_id=user_id)).all()
        return [
            {
                "full_name": sp.full_name,
                "city": sp.city,
                "phone": sp.phone,
            }
            for sp in sps
        ]