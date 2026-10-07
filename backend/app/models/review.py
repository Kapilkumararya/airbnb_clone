from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    rating = Column(Float, default=5.0)
    comment = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    listing = relationship("Listing", back_populates="reviews")
