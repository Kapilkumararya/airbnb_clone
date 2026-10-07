from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"))
    guest_id = Column(Integer, ForeignKey("users.id"))
    check_in = Column(DateTime)
    check_out = Column(DateTime)
    guests = Column(Integer)
    nightly_price = Column(Float, nullable=True)
    cleaning_fee = Column(Float, nullable=True, default=0.0)
    service_fee = Column(Float, nullable=True, default=0.0)
    total_price = Column(Float)
    status = Column(String, default="confirmed")
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing")
    guest = relationship("User")
