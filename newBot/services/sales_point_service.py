from sqlalchemy.orm import Session
from ..repositories.sales_point_repository import SalesPointRepository
from ..repositories.agent_repository import AgentRepository
from ..models.sales_point import SalesPoint
from newBot.config import settings

class SalesPointService:
    def __init__(self, db: Session):
        self.sp_repo = SalesPointRepository(db)
        self.agent_repo = AgentRepository(db)

    def register_sales_point(self, user_id: int, agent_id: int, full_name: str,
                             city: str, inn: str, phone: str, business_type: str,
                             bik: str, account: str, bank_name: str,
                             bank_ks: str, bank_details: str) -> SalesPoint:
        agent = self.agent_repo.get_by_user_id(agent_id)
        if not agent or not agent.approved:
            raise ValueError("Agent does not exist or is not approved")

        return self.sp_repo.create(
            user_id=user_id,
            agent_id=agent_id,
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

    def approve_sales_point(self, user_id: int) -> bool:
        return self.sp_repo.approve(user_id)

    def sign_sales_point_contract(self, user_id: int) -> str:
        ok = self.sp_repo.sign_contract(user_id)
        if not ok:
            raise ValueError("SalesPoint not found or not approved")
        code = self.sp_repo.generate_referral_code(user_id)
        return f"https://t.me/{settings.MAIN_BOT_USERNAME}?start=ref_{code}"

    def get_sales_point_profile(self, user_id: int) -> dict:
        sp = self.sp_repo.get_by_user_id(user_id)
        if not sp:
            return {}
        agent = self.agent_repo.get_by_user_id(sp.agent_id)
        return {
            "full_name": sp.full_name,
            "city": sp.city,
            "inn": sp.inn,
            "phone": sp.phone,
            "business_type": sp.business_type,
            "bank_details": sp.bank_details,
            "agent_full_name": (agent.full_name if agent else None),
            "agent_phone": (agent.phone if agent else None)
        }