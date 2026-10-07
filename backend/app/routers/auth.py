from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.database import get_db
from app import models, schemas
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

# --- Request / Response Schemas ---

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "guest"

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

# --- Endpoints ---

@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(models.User).filter(models.User.email == payload.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    hashed_pw = get_password_hash(payload.password)
    user = models.User(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        hashed_password=hashed_pw,
        role=payload.role if payload.role in ["guest", "host"] else "guest",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role, "avatar": user.avatar},
    }


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email.lower().strip()).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role, "avatar": user.avatar},
    }


@router.get("/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id, 
        "name": current_user.name, 
        "email": current_user.email, 
        "role": current_user.role, 
        "avatar": current_user.avatar
    }


@router.get("/demo", response_model=AuthResponse)
def get_demo_account(db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == "invigilator@airbnb.com").first()
    if not user:
        user = db.query(models.User).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo user not found.")

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role, "avatar": user.avatar},
    }
