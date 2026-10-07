from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class ListingAmenity(Base):
    __tablename__ = "listing_amenities"
    listing_id = Column(Integer, ForeignKey("listings.id"), primary_key=True)
    amenity_id = Column(Integer, ForeignKey("amenities.id"), primary_key=True)

class Amenity(Base):
    __tablename__ = "amenities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class ListingImage(Base):
    __tablename__ = "listing_images"
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"))
    image_url = Column(String)
    display_order = Column(Integer, default=0)

    listing = relationship("Listing", back_populates="images")

class Listing(Base):
    __tablename__ = "listings"
    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(String)
    location = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    price_per_night = Column(Float)
    property_type = Column(String)
    max_guests = Column(Integer)
    rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan")
    amenities = relationship("Amenity", secondary="listing_amenities")
    host = relationship("User")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")
