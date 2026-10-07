from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app import models, schemas
from app.database import get_db
from app.auth import get_current_user, get_optional_user

router = APIRouter(
    prefix="/api/listings",
    tags=["reviews"]
)

@router.get("/{listing_id}/reviews", response_model=List[schemas.Review])
def get_listing_reviews(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    reviews = db.query(models.Review).filter(
        models.Review.listing_id == listing_id
    ).order_by(models.Review.created_at.desc()).all()
    return reviews


@router.get("/{listing_id}/review-eligibility")
def check_review_eligibility(
    listing_id: int, 
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_user)
):
    if not current_user:
        return {
            "can_review": False, 
            "reason": "Please sign in to check your review eligibility."
        }
    
    now = datetime.utcnow()
    completed_booking = db.query(models.Booking).filter(
        models.Booking.listing_id == listing_id,
        models.Booking.guest_id == current_user.id,
        models.Booking.status == 'confirmed',
        models.Booking.check_out <= now
    ).first()
    
    if completed_booking:
        return {
            "can_review": True, 
            "reason": "Verified guest stay completed. You are eligible to review this listing."
        }
    
    # Check if guest has an upcoming or ongoing reservation
    active_booking = db.query(models.Booking).filter(
        models.Booking.listing_id == listing_id,
        models.Booking.guest_id == current_user.id,
        models.Booking.status == 'confirmed',
        models.Booking.check_out > now
    ).first()
    if active_booking:
        return {
            "can_review": False, 
            "reason": "Your stay is upcoming or currently underway. You can leave a review after checkout."
        }
    
    return {
        "can_review": False, 
        "reason": "Only guests who have completed a stay at this property can leave a review."
    }


@router.post("/{listing_id}/reviews", response_model=schemas.Review)
def create_review(
    listing_id: int,
    review_in: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    # Check if user has a completed stay at this listing
    now = datetime.utcnow()
    completed_booking = db.query(models.Booking).filter(
        models.Booking.listing_id == listing_id,
        models.Booking.guest_id == current_user.id,
        models.Booking.status == 'confirmed',
        models.Booking.check_out <= now
    ).first()

    if not completed_booking:
        active_booking = db.query(models.Booking).filter(
            models.Booking.listing_id == listing_id,
            models.Booking.guest_id == current_user.id,
            models.Booking.status == 'confirmed'
        ).first()
        if active_booking:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your reservation has not completed yet. You can submit a review after your stay has ended."
            )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only guests who have completed a stay at this property can leave a review."
        )

    new_review = models.Review(
        listing_id=listing_id,
        user_id=current_user.id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    # Recalculate listing rating and count
    all_reviews = db.query(models.Review).filter(models.Review.listing_id == listing_id).all()
    if all_reviews:
        avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)
        listing.rating = round(avg_rating, 2)
        listing.review_count = len(all_reviews)
        db.commit()
        db.refresh(listing)
        
    return new_review
