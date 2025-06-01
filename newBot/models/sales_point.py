from sqlalchemy import Column, Integer, BigInteger, String, Boolean, Text, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import relationship
from ..db import Base

class SalesPoint(Base):
    __tablename__ = "sales_points"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(BigInteger, unique=True, nullable=False, index=True)
    agent_id = Column(BigInteger, ForeignKey("agents.user_id", ondelete="CASCADE"), nullable=False)
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

    # Опциональная связь с агентом, если понадобится
    agent = relationship("Agent", backref="sales_points", lazy="joined")
