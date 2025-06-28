import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.user import TokenType
from ..repositories.token_repository import TokenRepository
from .backend_client import BackendClient


class UserService:
    def __init__(self, db: Session):
        self.client = BackendClient()
        self.token_repo = TokenRepository(db)

    def get_or_create_user(self, telegram_id: int, full_name: str, username: str):
        payload = {
            "displayName": full_name,
            "telegramTeg": username or "",
            "telegramId": str(telegram_id)
        }
        return self.client.post("user/bot", payload)

    def get_user(self, user_id: int) -> dict:
        return self.client.get(f"user/bot/{user_id}")

    def generate_token(self, user: dict) -> str:
        existing = self.token_repo.get_by_user_and_type(user["id"], TokenType.TELEGRAM_AUTH)
        if existing:
            self.token_repo.delete(existing)
        token_value = str(uuid.uuid4())
        expires = datetime.utcnow() + timedelta(hours=4)
        token = self.token_repo.create(
            user["id"],
            token_value,
            TokenType.TELEGRAM_AUTH,
            expires,
        )
        return token.token

    def store_token(
        self,
        user: dict,
        token_value: str,
        chat_id: str,
        message_id: int,
    ) -> None:
        existing = self.token_repo.get_by_user_and_type(user["id"], TokenType.TELEGRAM_AUTH)
        if existing:
            self.token_repo.delete(existing)
        expires = datetime.utcnow() + timedelta(hours=4)
        self.token_repo.create(
            user["id"],
            token_value,
            TokenType.TELEGRAM_AUTH,
            expires,
            chat_id=chat_id,
            message_id=message_id,
        )