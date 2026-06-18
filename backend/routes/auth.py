from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import models
from database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    sport: str
    impairment_category: str
    gender: str = "male"
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    training_hours_per_week: float = 10
    dietary_preference: str = "Vegetarian"


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    if db.query(models.AthleteProfile).filter_by(email=req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered. Try logging in.")
    profile = models.AthleteProfile(
        name=req.name, email=req.email,
        password_hash=models.AthleteProfile.hash_password(req.password),
        sport=req.sport, impairment_category=req.impairment_category,
        weight_kg=req.weight_kg, height_cm=req.height_cm, age=req.age,
        gender=req.gender, training_hours_per_week=req.training_hours_per_week,
        dietary_preference=req.dietary_preference,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return {"profile_id": profile.id, "name": profile.name}


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    profile = db.query(models.AthleteProfile).filter_by(email=req.email).first()
    if not profile or not profile.check_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return {"profile_id": profile.id, "name": profile.name}
