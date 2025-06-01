from sqlalchemy import Column, Integer, BigInteger, String, Boolean, Text, TIMESTAMP, func
from ..db import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(BigInteger, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    inn = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    business_type = Column(String, nullable=False)

    # Банковские данные
    bik = Column(String, nullable=True)
    account = Column(String, nullable=True)
    bank_name = Column(String, nullable=True)
    bank_ks = Column(String, nullable=True)
    bank_details = Column(Text, nullable=False)

    approved = Column(Boolean, default=False)
    contract_signed = Column(Boolean, default=False)
    referral_code = Column(String, unique=True, nullable=True)
    registration_date = Column(TIMESTAMP(timezone=True), server_default=func.now())