IMPAIRMENT_FACTOR = {
    "wheelchair_user": 0.75, "lower_limb_impairment": 0.85,
    "upper_limb_impairment": 1.0, "visual_impairment": 1.0,
    "hearing_impairment": 1.0, "intellectual_disability": 0.95, "other": 0.90,
}
ACTIVITY_MULT = {1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725, 5: 1.9}

def calculate_rda(weight_kg, height_cm, age, gender, activity_days, impairment):
    if gender.lower() == "male":
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    tdee = bmr * ACTIVITY_MULT.get(activity_days, 1.375) * IMPAIRMENT_FACTOR.get(impairment, 0.90)
    protein_g = weight_kg * 1.6
    fat_g = (tdee * 0.25) / 9
    carbs_g = (tdee - protein_g * 4 - fat_g * 9) / 4
    return {
        "calories": round(tdee), "protein_g": round(protein_g, 1),
        "carbs_g": round(carbs_g, 1), "fat_g": round(fat_g, 1),
        "iron_mg": 21 if gender.lower() == "female" else 17, "calcium_mg": 1000, "fiber_g": 30,
    }
