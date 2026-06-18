from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, timedelta
import models
from database import get_db
from services.rda import calculate_rda
from services.meal_generator import (
    get_food_by_id, calc_day_nutrients, get_all_foods,
    get_swap_options, generate_weekly_plan
)
from services.gemini_service import nutrition_gap

router = APIRouter(prefix="/api/nutrition", tags=["nutrition"])

DAY_NAMES = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]


def get_profile(profile_id: Optional[str] = Header(None, alias="x-profile-id"), db: Session = Depends(get_db)):
    if not profile_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    p = db.query(models.AthleteProfile).filter_by(id=int(profile_id)).first()
    if not p:
        raise HTTPException(status_code=404, detail="Profile not found")
    return p


def rda_flat(p):
    return calculate_rda(
        p.weight_kg or 70, p.height_cm or 170, p.age or 25,
        p.gender, p.activity_days, p.impairment_category
    )


def plan_to_meals(plan_db):
    """Convert stored plan dict {date_str: {slot: food}} to flat meal list."""
    meals = []
    idx = 0
    for date_str, slots in plan_db.plan.items():
        try:
            d = date.fromisoformat(date_str)
            day_name = DAY_NAMES[d.weekday()]
        except Exception:
            continue
        slot_to_cat = {
            "breakfast": "Breakfast", "lunch": "Lunch",
            "dinner": "Dinner", "snack1": "Snacks", "snack2": "Snacks"
        }
        for slot, food in slots.items():
            if not isinstance(food, dict):
                continue
            cat = slot_to_cat.get(slot, "Snacks")
            q = food.get("serving_g", 100)
            meals.append({
                "id": idx,
                "plan_id": plan_db.id,
                "day_of_week": day_name,
                "date_str": date_str,
                "slot": slot,
                "meal_category": cat,
                "food_id": food.get("id"),
                "food_name": food.get("name"),
                "quantity_grams": q,
                "calories": round(food.get("calories", 0) * q / (food.get("serving_g") or 100), 1),
                "protein_g": round(food.get("protein", 0) * q / (food.get("serving_g") or 100), 1),
                "carbs_g": round(food.get("carbs", 0) * q / (food.get("serving_g") or 100), 1),
                "fat_g": round(food.get("fat", 0) * q / (food.get("serving_g") or 100), 1),
            })
            idx += 1
    return meals


@router.get("/rda")
def get_rda(p=Depends(get_profile)):
    if not p.weight_kg:
        raise HTTPException(status_code=400, detail="Complete your profile first")
    r = rda_flat(p)
    return {
        "calories": r["calories"], "protein": r["protein_g"],
        "carbohydrates": r["carbs_g"], "fat": r["fat_g"],
        "iron": r["iron_mg"], "calcium": r["calcium_mg"], "fiber": r["fiber_g"],
    }


def _current_week_start():
    today = date.today()
    return today - timedelta(days=today.weekday())


def _diet_code(pref):
    return "non-veg" if (pref or "").lower() in ("non-vegetarian", "non-veg") else "veg"


@router.post("/meals/weekly")
def create_plan(p=Depends(get_profile), db: Session = Depends(get_db)):
    ws = _current_week_start()
    diet = _diet_code(p.dietary_preference)
    plan_data = generate_weekly_plan(diet, [], ws)
    existing = db.query(models.WeeklyMealPlan).filter_by(profile_id=p.id, week_start=ws).first()
    if existing:
        existing.plan = plan_data
        db.commit()
        db.refresh(existing)
        return {"meals": plan_to_meals(existing)}
    plan = models.WeeklyMealPlan(profile_id=p.id, week_start=ws, plan=plan_data)
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return {"meals": plan_to_meals(plan)}


@router.get("/meals/weekly")
def get_plan(p=Depends(get_profile), db: Session = Depends(get_db)):
    ws = _current_week_start()
    plan = db.query(models.WeeklyMealPlan).filter_by(profile_id=p.id, week_start=ws).first()
    if not plan:
        raise HTTPException(status_code=404, detail="No plan yet. Generate one first.")
    return {"meals": plan_to_meals(plan)}


class SwapReq(BaseModel):
    plan_id: Optional[int] = None
    day: str
    slot: str
    new_food_id: int


@router.post("/meals/swap")
def swap(req: SwapReq, p=Depends(get_profile), db: Session = Depends(get_db)):
    ws = _current_week_start()
    plan = db.query(models.WeeklyMealPlan).filter_by(profile_id=p.id, week_start=ws).first()
    if not plan:
        raise HTTPException(status_code=404, detail="No plan found")
    food = get_food_by_id(req.new_food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    pd = dict(plan.plan)
    day_idx = DAY_NAMES.index(req.day) if req.day in DAY_NAMES else None
    if day_idx is not None:
        target_date = (ws + timedelta(days=day_idx)).isoformat()
        if target_date in pd:
            pd[target_date][req.slot] = food
    plan.plan = pd
    db.commit()
    return {"new_food": food}


@router.get("/meals/swap-options")
def swap_options(category: str, p=Depends(get_profile)):
    cat_map = {"Breakfast":"breakfast","Lunch":"lunch","Dinner":"dinner","Snacks":"snack"}
    cat = cat_map.get(category, category.lower())
    diet = _diet_code(p.dietary_preference)
    options = get_swap_options(cat, diet, [], -1)
    return {"options": [{"food_id": f["id"], "food_name": f["name"], "calories": f["calories"], "serving_g": f.get("serving_g", 100)} for f in options]}


@router.get("/meals/foods")
def search_foods(q: str = ""):
    foods = get_all_foods()
    if q:
        foods = [f for f in foods if q.lower() in f["name"].lower()]
    return {"foods": [{"food_id": f["id"], "food_name": f["name"],
                       "calories_per_100g": round(f["calories"] * 100 / (f.get("serving_g") or 100), 1),
                       "category": f["category"]} for f in foods[:30]]}


class LogReq(BaseModel):
    food_id: int
    meal_type: str
    quantity_grams: float = 100
    date: str
    notes: Optional[str] = ""


@router.post("/log")
def log_food(req: LogReq, p=Depends(get_profile), db: Session = Depends(get_db)):
    food = get_food_by_id(req.food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Food not found")
    ratio = req.quantity_grams / (food.get("serving_g") or 100)
    entry = {
        "food_id": food["id"], "food_name": food["name"], "meal_type": req.meal_type,
        "quantity_grams": req.quantity_grams, "notes": req.notes or "",
        "calories": round(food["calories"] * ratio, 1),
        "protein": round(food["protein"] * ratio, 1),
        "carbs": round(food["carbs"] * ratio, 1),
        "fat": round(food["fat"] * ratio, 1),
        "iron": round(food["iron"] * ratio, 2),
        "calcium": round(food["calcium"] * ratio, 1),
        "fiber": round(food["fiber"] * ratio, 1),
    }
    log_date = date.fromisoformat(req.date)
    log = db.query(models.DailyLog).filter_by(profile_id=p.id, date=log_date).first()
    if log:
        entries = list(log.entries or [])
        entries.append(entry)
        log.entries = entries
    else:
        db.add(models.DailyLog(profile_id=p.id, date=log_date, entries=[entry]))
    db.commit()
    return {"message": "Logged"}


@router.get("/daily/{date_str}")
def daily_nutrients(date_str: str, p=Depends(get_profile), db: Session = Depends(get_db)):
    log = db.query(models.DailyLog).filter_by(profile_id=p.id, date=date.fromisoformat(date_str)).first()
    if not log or not log.entries:
        return {"calories": 0, "protein": 0, "carbs": 0, "fat": 0, "iron": 0, "calcium": 0, "fiber": 0, "items": []}
    totals = {"calories":0, "protein":0, "carbs":0, "fat":0, "iron":0, "calcium":0, "fiber":0}
    for e in log.entries:
        for k in totals:
            totals[k] += e.get(k, 0)
    return {**{k: round(v, 1) for k, v in totals.items()}, "items": log.entries}


@router.get("/compliance/weekly")
def compliance(p=Depends(get_profile), db: Session = Depends(get_db)):
    today = date.today()
    ws = _current_week_start()
    logs = db.query(models.DailyLog).filter(
        models.DailyLog.profile_id == p.id,
        models.DailyLog.date >= ws,
        models.DailyLog.date <= today
    ).all()
    total_days = today.weekday() + 1
    logged_days = len([l for l in logs if l.entries])
    score = round(logged_days / total_days * 100) if total_days else 0
    gemini = None
    try:
        if logs:
            all_entries = [e for l in logs for e in (l.entries or [])]
            nutrients = calc_day_nutrients({str(i): e for i, e in enumerate(all_entries)}) if all_entries else {}
            rda = calculate_rda(p.weight_kg or 70, p.height_cm or 170, p.age or 25, p.gender, p.activity_days, p.impairment_category)
            gemini = nutrition_gap(nutrients, rda, p.name)
    except Exception:
        pass
    return {"compliance_score": score, "logged_days": logged_days, "total_days": total_days, "gemini_analysis": gemini}
