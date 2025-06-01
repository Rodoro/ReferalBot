from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from ..models.agent import Agent
import random
import string

class AgentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, full_name: str, city: str, inn: str,
               phone: str, business_type: str, bik: str, account: str,
               bank_name: str, bank_ks: str, bank_details: str) -> Agent:
        agent = Agent(
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
            bank_details=bank_details,
            approved=False,
            contract_signed=False
        )
        self.db.add(agent)
        self.db.commit()
        self.db.refresh(agent)
        return agent
    
    def get_by_referral_code(self, code: str) -> Agent | None:
        return self.db.query(Agent).filter(Agent.referral_code == code).first()

    def get_by_user_id(self, user_id: int) -> Agent | None:
        return self.db.query(Agent).filter(Agent.user_id == user_id).first()

    def approve(self, user_id: int) -> bool:
        agent = self.get_by_user_id(user_id)
        if not agent:
            return False
        agent.approved = True
        self.db.commit()
        return True

    def sign_contract(self, user_id: int) -> bool:
        agent = self.get_by_user_id(user_id)
        if not agent:
            return False
        agent.contract_signed = True
        self.db.commit()
        return True

    def generate_referral_code(self, user_id: int) -> str:
        """
        Генерируем уникальный код длиной 8 символов.
        Проверяем на уникальность, если уже есть — пробуем снова.
        """
        agent = self.get_by_user_id(user_id)
        if not agent:
            raise ValueError("Agent not found")

        # Если уже есть, просто возвращаем
        if agent.referral_code:
            return agent.referral_code

        while True:
            code = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
            exists = self.db.query(Agent).filter(Agent.referral_code == code).first()
            if not exists:
                agent.referral_code = code
                self.db.commit()
                self.db.refresh(agent)
                return code

    def count_points(self, user_id: int) -> int:
        from ..models.sales_point import SalesPoint
        return self.db.query(SalesPoint).filter(SalesPoint.agent_id == user_id).count()
    
    def delete_by_user_id(self, user_id: int) -> bool:
        """
        Удаляет агента по user_id. Возвращает True, если запись была удалена.
        """
        obj = self.get_by_user_id(user_id)
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True