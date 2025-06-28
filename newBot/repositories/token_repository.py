from sqlalchemy.orm import Session
from ..models.user import Token


class TokenRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_and_type(self, user_id: str, token_type: str) -> Token | None:
        return (
            self.db.query(Token)
            .filter(Token.user_id == user_id, Token.type == token_type)
            .first()
        )

    def delete(self, token: Token):
        self.db.delete(token)
        self.db.commit()

    def create(
        self,
        user_id: str,
        token: str,
        token_type: str,
        expires_in,
        chat_id: str | None = None,
        message_id: int | None = None,
    ) -> Token:
        tk = Token(
            token=token,
            type=token_type,
            expires_in=expires_in,
            user_id=user_id,
            chat_id=chat_id,
            message_id=message_id,
        )
        self.db.add(tk)
        self.db.commit()
        self.db.refresh(tk)
        return tk