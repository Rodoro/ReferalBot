from sqlalchemy.orm import Session
from ..repositories.poet_repository import PoetRepository
from ..models.poet import Poet

class PoetService:
    def __init__(self, db: Session):
        self.repo = PoetRepository(db)

    def register_poet(self, user_id: int, full_name: str, city: str,
                      inn: str, phone: str, business_type: str,
                      bik: str, account: str, bank_name: str,
                      bank_ks: str, bank_details: str) -> Poet:
        return self.repo.create(
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

    def approve_poet(self, user_id: int) -> bool:
        return self.repo.approve(user_id)

    def sign_poet_contract(self, user_id: int) -> None:
        ok = self.repo.sign_contract(user_id)
        if not ok:
            raise ValueError("Poet not found or not approved")

    def get_poet_profile(self, user_id: int) -> dict:
        poet = self.repo.get_by_user_id(user_id)
        if not poet:
            return {}
        return {
            "full_name": poet.full_name,
            "city": poet.city,
            "inn": poet.inn,
            "phone": poet.phone,
            "business_type": poet.business_type,
            "bank_details": poet.bank_details,
        }