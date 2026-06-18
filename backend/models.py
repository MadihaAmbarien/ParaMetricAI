from sqlalchemy import Column, Integer, Float, String, Date, JSON, DateTime
from sqlalchemy.sql import func
from database import Base
import hashlib


class AthleteProfile(Base):
    __tablename__ = "athlete_profiles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    sport = Column(String)
    impairment_category = Column(String)
    weight_kg = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, default="male")
    training_hours_per_week = Column(Float, default=10)
    dietary_preference = Column(String, default="Vegetarian")
    created_at = Column(DateTime, default=func.now())

    @staticmethod
    def hash_password(pw: str) -> str:
        return hashlib.sha256(pw.encode()).hexdigest()

    def check_password(self, pw: str) -> bool:
        return self.password_hash == hashlib.sha256(pw.encode()).hexdigest()

    @property
    def activity_days(self):
        h = self.training_hours_per_week or 10
        return max(1, min(7, int(h / 2)))


class WeeklyMealPlan(Base):
    __tablename__ = "weekly_meal_plans"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, index=True)
    week_start = Column(Date)
    plan = Column(JSON)


class DailyLog(Base):
    __tablename__ = "daily_logs"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, index=True)
    date = Column(Date)
    # stores list of {food_id, food_name, meal_type, quantity_grams, calories, protein, carbs, fat, iron, calcium, fiber}
    entries = Column(JSON, default=[])


class DailyCheckin(Base):
    __tablename__ = "daily_checkins"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, index=True)
    date = Column(Date, index=True)
    sleep_hours = Column(Float)
    soreness = Column(Float)
    mood = Column(Float)
    training_load = Column(Float)
    notes = Column(String, nullable=True)
    fatigue_score = Column(Float)
    fatigue_category = Column(String)
    gemini_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
