import os
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    # Telegram Bot
    BOT_TOKEN: str = Field(..., env="BOT_TOKEN")
    ADMIN_SECRET: str = Field(..., env="ADMIN_SECRET")
    POET_SECRET: str = Field(..., env="POET_SECRET")
    VE_SECRET: str = Field(..., env="VE_SECRET")
    CHANNEL_ID: int = Field(..., env="CHANNEL_ID")

    BOT_USERNAME: str = Field(..., env="BOT_USERNAME")
    MAIN_BOT_USERNAME: str = Field(..., env="MAIN_BOT_USERNAME")
    WEBAPP_URL: str = Field(..., env="WEBAPP_URL")

    # PostgreSQL
    DB_HOST: str = Field(..., env="POSTGRES_HOST")
    DB_PORT: int = Field(..., env="POSTGRES_PORT")
    DB_NAME: str = Field(..., env="POSTGRES_DATABASE")
    DB_USER: str = Field(..., env="POSTGRES_USER")
    DB_PASSWORD: str = Field(..., env="POSTGRES_PASSWORD")

    # CSV URL (для генератора QR)
    CSV_URL: str = Field(..., env="CSV_URL")

    # Настройки QR-кода
    QR_DEFAULT_SIZE: int = Field(170, env="QR_DEFAULT_SIZE")
    QR_FILL_COLOR: str = Field("black", env="QR_FILL_COLOR")
    QR_BACK_COLOR: str = Field("#FFE6C4", env="QR_BACK_COLOR")

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "..", ".env")
        env_file_encoding = "utf-8"

settings = Settings()