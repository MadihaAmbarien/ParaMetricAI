from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date, timedelta
import models
from database import get_db
from services.ml_service import predict_fatigue
from services.gemini_service import fatigue_reason

router = APIRouter(prefix="/api/fatigue", tags=["fatigue"])


def get_profile(profile_id: Optional[str] = Header(None, alias="x-profile-id"), db: Session = Depends(get_db)):
    if not profile_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    p = db.query(models.AthleteProfile).filter_by(id=int(profile_id)).first()
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")
    return p


def score_label(score):
    if score < 35:
        return "Low Fatigue"
    if score < 65:
        return "Moderate"
    if score < 82:
        return "High Fatigue"
    return "Critical"


class CheckInReq(BaseModel):
    sleep_hours: float
    soreness: float
    mood: float
    training_load: float
    notes: Optional[str] = ""


@router.post("/checkin")
def checkin(req: CheckInReq, p=Depends(get_profile), db: Session = Depends(get_db)):
    today = date.today()
    hist_rows = db.query(models.DailyCheckin).filter(
        models.DailyCheckin.profile_id == p.id,
        models.DailyCheckin.date >= today - timedelta(days=7),
        models.DailyCheckin.date < today
    ).order_by(models.DailyCheckin.date.asc()).all()

    # Map stored fields to ML service expectations
    history = [{
        "sleep_quality": min(r.sleep_hours * 10 / 12, 10),
        "muscle_soreness": r.soreness,
        "mood_energy": r.mood,
        "session_duration": r.training_load,
        "session_intensity": r.training_load,
    } for r in hist_rows]

    sleep_norm = min(req.sleep_hours * 10 / 12, 10)
    result = predict_fatigue(
        sleep=sleep_norm,
        soreness=req.soreness,
        mood=req.mood,
        duration=req.training_load,
        intensity=req.training_load,
        history=history
    )

    reason = fatigue_reason(
        result["fatigue_score"], result["category"],
        result["rolling_stats"], result["trends"],
        {"sleep_hours": req.sleep_hours, "soreness": req.soreness,
         "mood": req.mood, "training_load": req.training_load},
        p.name
    )

    existing = db.query(models.DailyCheckin).filter_by(profile_id=p.id, date=today).first()
    if existing:
        existing.sleep_hours = req.sleep_hours
        existing.soreness = req.soreness
        existing.mood = req.mood
        existing.training_load = req.training_load
        existing.notes = req.notes or ""
        existing.fatigue_score = result["fatigue_score"]
        existing.fatigue_category = result["category"]
        existing.gemini_reason = reason
        db.commit()
    else:
        db.add(models.DailyCheckin(
            profile_id=p.id, date=today,
            sleep_hours=req.sleep_hours, soreness=req.soreness,
            mood=req.mood, training_load=req.training_load,
            notes=req.notes or "",
            fatigue_score=result["fatigue_score"],
            fatigue_category=result["category"],
            gemini_reason=reason,
        ))
        db.commit()

    return {
        "date": str(today),
        "fatigue_score": result["fatigue_score"],
        "label": score_label(result["fatigue_score"]),
        "gemini_reason": reason,
        "sleep_hours": req.sleep_hours,
        "soreness": req.soreness,
        "mood": req.mood,
        "training_load": req.training_load,
    }


@router.get("/today")
def today_checkin(p=Depends(get_profile), db: Session = Depends(get_db)):
    r = db.query(models.DailyCheckin).filter_by(profile_id=p.id, date=date.today()).first()
    if not r:
        return {"checked_in": False}
    return {
        "checked_in": True,
        "fatigue_score": r.fatigue_score,
        "label": score_label(r.fatigue_score or 0),
        "gemini_reason": r.gemini_reason,
        "sleep_hours": r.sleep_hours,
        "soreness": r.soreness,
        "mood": r.mood,
        "training_load": r.training_load,
    }


@router.get("/history")
def history(days: int = 14, p=Depends(get_profile), db: Session = Depends(get_db)):
    rows = db.query(models.DailyCheckin).filter(
        models.DailyCheckin.profile_id == p.id,
        models.DailyCheckin.date >= date.today() - timedelta(days=days)
    ).order_by(models.DailyCheckin.date.desc()).all()
    return {"history": [{
        "date": str(r.date),
        "fatigue_score": r.fatigue_score,
        "label": score_label(r.fatigue_score or 0),
        "gemini_reason": r.gemini_reason,
        "sleep_hours": r.sleep_hours,
        "soreness": r.soreness,
        "mood": r.mood,
        "training_load": r.training_load,
    } for r in rows]}
