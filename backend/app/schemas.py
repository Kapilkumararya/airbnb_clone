from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: str
    avatar: Optional[str] = None
    role: str = "guest"

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

# --- Amenity Schemas ---
class AmenityBase(BaseModel):
    name: str

class Amenity(AmenityBase):
    id: int

    class Config:
        from_attributes = True

# --- Listing Image Schemas ---
class ListingImageBase(BaseModel):
    image_url: str
    display_order: int = 0

class ListingImage(ListingImageBase):
    id: int

    class Config:
        from_attributes = True

# --- Review Schemas ---
class ReviewBase(BaseModel):
    rating: float = 5.0
    comment: str

class ReviewCreate(ReviewBase):
    pass

class Review(ReviewBase):
    id: int
    listing_id: int
    user_id: int
    created_at: datetime
    user: Optional[User] = None

    class Config:
        from_attributes = True

# --- Listing Schemas ---
class ListingBase(BaseModel):
    title: str
    description: str
    location: str
    price_per_night: float
    property_type: str
    max_guests: int
    rating: float = 0.0
    review_count: int = 0
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ListingCreate(ListingBase):
    host_id: Optional[int] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    price_per_night: Optional[float] = None
    property_type: Optional[str] = None
    max_guests: Optional[int] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None

class Listing(ListingBase):
    id: int
    host_id: int
    images: List[ListingImage] = []
    amenities: List[Amenity] = []
    host: Optional[User] = None
    reviews: List[Review] = []
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# --- Booking Schemas ---
class BookingBase(BaseModel):
    listing_id: int
    check_in: datetime
    check_out: datetime
    guests: int
    nightly_price: Optional[float] = None
    cleaning_fee: Optional[float] = None
    service_fee: Optional[float] = None
    total_price: Optional[float] = None

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    id: int
    guest_id: int
    total_price: float
    status: str
    created_at: datetime
    listing: Optional[Listing] = None
    guest: Optional[User] = None
    
    class Config:
        from_attributes = True

class BookedDateRange(BaseModel):
    check_in: datetime
    check_out: datetime

    class Config:
        from_attributes = True

# --- Favorite / Wishlist Schemas ---
class FavoriteBase(BaseModel):
    listing_id: int

class Favorite(FavoriteBase):
    id: int
    user_id: int
    created_at: datetime
    listing: Optional[Listing] = None

    class Config:
        from_attributes = True
