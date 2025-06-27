import os
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    BACKUP_BOT_TOKEN: str = Field(..., env="BACKUP_BOT_TOKEN")
    BACKUP_CHAT_ID: int = Field(..., env="BACKUP_CHAT_ID")
    POSTGRES_CONTAINER: str = Field("postgres-bot", env="POSTGRES_CONTAINER")
    DB_USER: str = Field("root", env="POSTGRES_USER")
    DB_NAME: str = Field("bot", env="POSTGRES_DATABASE")

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "..", ".env")
        env_file_encoding = "utf-8"

settings = Settings()