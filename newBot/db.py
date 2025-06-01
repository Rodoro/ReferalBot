from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

DATABASE_URL = (
    f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}"
    f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
)

# Создаём движок и сессию
engine = create_engine(DATABASE_URL, echo=False)  # echo=True для отладки SQL
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()

def get_db():
    """
    FastAPI/aiogram (если используется Dependency Injection) может
    получать сессию, а потом закрывать её в конце запроса/хендлера.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
