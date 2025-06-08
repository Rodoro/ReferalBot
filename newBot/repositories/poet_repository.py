from sqlalchemy.orm import Session
from ..models.poet import Poet

class PoetRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, full_name: str, city: str, inn: str,
               phone: str, business_type: str, bik: str, account: str,
               bank_name: str, bank_ks: str, bank_details: str) -> Poet:
        poet = Poet(
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
        self.db.add(poet)
        self.db.commit()
        self.db.refresh(poet)
        return poet

    def get_by_user_id(self, user_id: int) -> Poet | None:
        return self.db.query(Poet).filter(Poet.user_id == user_id).first()

    def approve(self, user_id: int) -> bool:
        poet = self.get_by_user_id(user_id)
        if not poet:
            return False
        poet.approved = True
        self.db.commit()
        return True

    def sign_contract(self, user_id: int) -> bool:
        poet = self.get_by_user_id(user_id)
        if not poet:
            return False
        poet.contract_signed = True
        self.db.commit()
        return True

    def delete_by_user_id(self, user_id: int) -> bool:
        obj = self.get_by_user_id(user_id)
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True