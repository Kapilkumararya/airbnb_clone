from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing")
    user = relationship("User")
