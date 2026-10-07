from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app import models, schemas
from app.database import get_db
from app.auth import get_current_user, get_optional_user

router = APIRouter(
    prefix="/api/bookings",
    tags=["bookings"]
)

@router.post("/", response_model=schemas.Booking)
def create_booking(
    booking: schemas.BookingCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check if listing exists
    listing = db.query(models.Listing).filter(models.Listing.id == booking.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    # Check date validity
    if booking.check_out <= booking.check_in:
        raise HTTPException(status_code=400, detail="Checkout date must be after check-in date.")
        
    # Check date overlap with confirmed bookings
    overlap = db.query(models.Booking).filter(
        models.Booking.listing_id == booking.listing_id,
        models.Booking.status == 'confirmed',
        models.Booking.check_in < booking.check_out,
        models.Booking.check_out > booking.check_in
    ).first()
    
    if overlap:
        raise HTTPException(status_code=400, detail="These dates are already reserved by another guest. Please pick alternative dates.")
        
    nights = max(1, (booking.check_out - booking.check_in).days)
    nightly_price = listing.price_per_night
    base_price = nights * nightly_price
    extra_guests = max(0, (booking.guests or 1) - 1)
    extra_guest_fee = extra_guests * round(nightly_price * 0.15) * nights
    subtotal = base_price + extra_guest_fee
    cleaning_fee = booking.cleaning_fee if booking.cleaning_fee is not None else round(nightly_price * 0.25)
    service_fee = booking.service_fee if booking.service_fee is not None else round(subtotal * 0.12)
    total_price = subtotal + cleaning_fee + service_fee
    
    new_booking = models.Booking(
        listing_id=booking.listing_id,
        guest_id=current_user.id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        guests=booking.guests,
        nightly_price=nightly_price,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        total_price=total_price,
        status='confirmed'
    )
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return new_booking


@router.get("/my", response_model=List[schemas.Booking])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    bookings = db.query(models.Booking).filter(
        models.Booking.guest_id == current_user.id
    ).order_by(models.Booking.check_in.desc()).all()
    return bookings


@router.get("/host", response_model=List[schemas.Booking])
def get_host_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Find bookings on listings owned by this user
    owned_listing_ids = [l.id for l in db.query(models.Listing.id).filter(models.Listing.host_id == current_user.id).all()]
    if not owned_listing_ids:
        return []
    bookings = db.query(models.Booking).filter(
        models.Booking.listing_id.in_(owned_listing_ids)
    ).order_by(models.Booking.check_in.desc()).all()
    return bookings


@router.get("/listing/{listing_id}/booked-dates", response_model=List[schemas.BookedDateRange])
def get_listing_booked_dates(listing_id: int, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(
        models.Booking.listing_id == listing_id,
        models.Booking.status == 'confirmed'
    ).all()
    return [{"check_in": b.check_in, "check_out": b.check_out} for b in bookings]


@router.delete("/{booking_id}")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")
    
    # Check if user is either the guest or the listing's host
    listing = db.query(models.Listing).filter(models.Listing.id == booking.listing_id).first()
    is_guest = booking.guest_id == current_user.id
    is_host = listing and listing.host_id == current_user.id
    
    if not (is_guest or is_host):
        raise HTTPException(status_code=403, detail="You do not have permission to cancel this reservation.")
    
    booking.status = "cancelled"
    db.commit()
    return {"message": "Reservation successfully cancelled.", "id": booking_id, "status": "cancelled"}


@router.get("/", response_model=List[schemas.Booking])
def read_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_optional_user)
):
    if current_user:
        # Return current user's bookings if logged in
        return db.query(models.Booking).filter(
            models.Booking.guest_id == current_user.id
        ).order_by(models.Booking.check_in.desc()).all()
    return []
