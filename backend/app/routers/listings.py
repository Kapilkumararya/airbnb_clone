from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app import models, schemas
from app.database import get_db
from app.auth import get_current_user, get_optional_user

router = APIRouter(
    prefix="/api/listings",
    tags=["listings"]
)

@router.get("/", response_model=List[schemas.Listing])
def read_listings(
    skip: int = 0, 
    limit: int = 100, 
    location: Optional[str] = None,
    category: Optional[str] = None,
    checkIn: Optional[str] = None,
    checkOut: Optional[str] = None,
    guests: Optional[int] = None,
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Listing)
    
    if location and location.strip():
        loc_clean = location.strip()
        if loc_clean.lower() not in ["nearby", "anywhere", "all", "india", "flexible"]:
            parts = [p.strip() for p in loc_clean.split(",") if p.strip()]
            city_term = parts[0]
            from sqlalchemy import or_
            query = query.filter(
                or_(
                    models.Listing.location.ilike(f"%{city_term}%"),
                    models.Listing.title.ilike(f"%{city_term}%"),
                    models.Listing.location.ilike(f"%{loc_clean}%")
                )
            )
        
    if category and category.lower() not in ["all", "any"]:
        query = query.filter(models.Listing.property_type.ilike(f"%{category.strip()}%"))
        
    if guests:
        query = query.filter(models.Listing.max_guests >= guests)
        
    if minPrice is not None:
        query = query.filter(models.Listing.price_per_night >= minPrice)
        
    if maxPrice is not None:
        query = query.filter(models.Listing.price_per_night <= maxPrice)
    
    # Filter out listings that are already booked for the requested date span
    if checkIn and checkOut:
        try:
            ci = datetime.fromisoformat(checkIn.replace("Z", "+00:00")) if "T" in checkIn else datetime.strptime(checkIn, "%Y-%m-%d")
            co = datetime.fromisoformat(checkOut.replace("Z", "+00:00")) if "T" in checkOut else datetime.strptime(checkOut, "%Y-%m-%d")
            
            span_days = (co - ci).days
            if span_days <= 14:
                unavailable_listing_ids = db.query(models.Booking.listing_id).filter(
                    models.Booking.check_in < co,
                    models.Booking.check_out > ci,
                    models.Booking.status == 'confirmed'
                ).subquery()
                
                query = query.filter(~models.Listing.id.in_(unavailable_listing_ids))
        except Exception:
            pass

    listings = query.order_by(models.Listing.id.asc()).offset(skip).limit(limit).all()
    return listings


@router.get("/host/my", response_model=List[schemas.Listing])
def get_my_hosted_listings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    listings = db.query(models.Listing).filter(
        models.Listing.host_id == current_user.id
    ).order_by(models.Listing.id.desc()).all()
    return listings


@router.get("/{listing_id}", response_model=schemas.Listing)
def read_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@router.get("/{listing_id}/booked-dates", response_model=List[schemas.BookedDateRange])
def get_listing_booked_dates(listing_id: int, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(
        models.Booking.listing_id == listing_id,
        models.Booking.status == 'confirmed'
    ).all()
    return [{"check_in": b.check_in, "check_out": b.check_out} for b in bookings]


@router.post("/", response_model=schemas.Listing)
def create_listing(
    listing_in: schemas.ListingCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    data = listing_in.dict()
    image_url = data.pop("image_url", None)
    images = data.pop("images", None) or []
    amenities = data.pop("amenities", None) or []
    
    # Associate with authenticated host
    data["host_id"] = current_user.id
    
    # Upgrade user to host role if they weren't already
    if current_user.role != "host":
        current_user.role = "host"
        db.add(current_user)
        db.commit()
    
    new_listing = models.Listing(**data)
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    
    # Handle single or multiple images
    all_images = []
    if image_url:
        all_images.append(image_url)
    if images:
        all_images.extend(images)
    if not all_images:
        all_images.append("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80")
        
    for idx, img_u in enumerate(all_images):
        new_img = models.ListingImage(listing_id=new_listing.id, image_url=img_u, display_order=idx)
        db.add(new_img)
        
    # Handle amenities
    for a_name in amenities:
        amenity = db.query(models.Amenity).filter(models.Amenity.name == a_name).first()
        if not amenity:
            amenity = models.Amenity(name=a_name)
            db.add(amenity)
            db.commit()
            db.refresh(amenity)
        db.add(models.ListingAmenity(listing_id=new_listing.id, amenity_id=amenity.id))
        
    db.commit()
    db.refresh(new_listing)
    return new_listing


@router.put("/{listing_id}", response_model=schemas.Listing)
def update_listing(
    listing_id: int, 
    updated: schemas.ListingUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    if listing.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to edit this listing.")
        
    data = updated.dict(exclude_unset=True)
    image_url = data.pop("image_url", None)
    images = data.pop("images", None)
    
    for key, value in data.items():
        if value is not None:
            setattr(listing, key, value)
            
    if image_url:
        first_img = db.query(models.ListingImage).filter(models.ListingImage.listing_id == listing_id).first()
        if first_img:
            first_img.image_url = image_url
        else:
            db.add(models.ListingImage(listing_id=listing.id, image_url=image_url, display_order=0))

    db.commit()
    db.refresh(listing)
    return listing


@router.delete("/{listing_id}")
def delete_listing(
    listing_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    if listing.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this listing.")
        
    db.delete(listing)
    db.commit()
    return {"message": "Listing deleted successfully", "id": listing_id}
