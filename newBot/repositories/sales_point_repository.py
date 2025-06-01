from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from ..models.sales_point import SalesPoint

class SalesPointRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, agent_id: int, full_name: str, city: str,
               inn: str, phone: str, business_type: str,
               bik: str, account: str, bank_name: str,
               bank_ks: str, bank_details: str) -> SalesPoint:
        sp = SalesPoint(
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
            bank_details=bank_details,
            approved=False,
            contract_signed=False
        )
        self.db.add(sp)
        self.db.commit()
        self.db.refresh(sp)
        return sp

    def get_by_user_id(self, user_id: int) -> SalesPoint | None:
        return self.db.query(SalesPoint).filter(SalesPoint.user_id == user_id).first()

    def approve(self, user_id: int) -> bool:
        sp = self.get_by_user_id(user_id)
        if not sp:
            return False
        sp.approved = True
        self.db.commit()
        return True

    def sign_contract(self, user_id: int) -> bool:
        sp = self.get_by_user_id(user_id)
        if not sp:
            return False
        sp.contract_signed = True
        self.db.commit()
        return True

    def generate_referral_code(self, user_id: int) -> str | None:
        sp = self.get_by_user_id(user_id)
        if not sp:
            raise ValueError("SalesPoint not found")

        if sp.referral_code:
            return sp.referral_code

        import random, string
        while True:
            code = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
            exists = self.db.query(SalesPoint).filter(SalesPoint.referral_code == code).first()
            if not exists:
                sp.referral_code = code
                self.db.commit()
                self.db.refresh(sp)
                return code
            
    def delete_by_user_id(self, user_id: int) -> bool:
        """
        Удаляет точку продаж по user_id. Возвращает True, если запись удалена.
        """
        obj = self.get_by_user_id(user_id)
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True