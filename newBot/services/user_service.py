import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.user import RoleType, TokenType
from ..repositories.user_repository import UserRepository
from ..repositories.token_repository import TokenRepository


class UserService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)
        self.token_repo = TokenRepository(db)

    def get_or_create_user(self, telegram_id: int, full_name: str, username: str, role: str):
        user = self.user_repo.get_by_telegram_id(telegram_id)
        if user:
            return user
        return self.user_repo.create(
            display_name=full_name,
            telegram_tag=username or "",
            telegram_id=telegram_id,
            role=role.upper()
        )

    def generate_token(self, user):
        existing = self.token_repo.get_by_user_and_type(user.id, TokenType.TELEGRAM_AUTH)
        if existing:
            self.token_repo.delete(existing)
        token_value = str(uuid.uuid4())
        expires = datetime.utcnow() + timedelta(minutes=5)
        token = self.token_repo.create(user.id, token_value, TokenType.TELEGRAM_AUTH, expires)
        return token.token