from sqlalchemy.orm import Session
from ..models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_telegram_id(self, telegram_id: int | str) -> User | None:
        return self.db.query(User).filter(User.telegram_id == str(telegram_id)).first()

    def create(self, display_name: str, telegram_tag: str, telegram_id: int | str, role: str) -> User:
        user = User(
            display_name=display_name,
            telegram_teg=telegram_tag,
            telegram_id=str(telegram_id),
            role=role
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user