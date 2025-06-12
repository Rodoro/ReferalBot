from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..db import Base


class RoleType(enum.Enum):
    STAFF = "STAFF"
    AGENT = "AGENT"
    SALES_POINT = "SALES_POINT"
    POET = "POET"
    VIDEO_EDITOR = "VIDEO_EDITOR"


class TokenType(enum.Enum):
    TELEGRAM_AUTH = "TELEGRAM_AUTH"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    avatar = Column(String, nullable=True)
    display_name = Column(String, nullable=False)
    telegram_teg = Column(String, nullable=False)
    telegram_id = Column(String, unique=True, nullable=False)
    role = Column(Enum(RoleType), nullable=False)

    tokens = relationship("Token", back_populates="user")


class Token(Base):
    __tablename__ = "tokens"

    id = Column(String, primary_key=True)
    token = Column(String, unique=True, nullable=False)
    type = Column(Enum(TokenType), nullable=False)
    expires_in = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    user = relationship("User", back_populates="tokens")
