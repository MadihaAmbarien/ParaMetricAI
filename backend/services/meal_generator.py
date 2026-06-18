import json, random
from pathlib import Path
from datetime import date, timedelta

with open(Path(__file__).parent.parent / "data" / "indian_foods.json") as f:
    ALL_FOODS = json.load(f)

def get_foods(cat, diet, allergies=[]):
    return [f for f in ALL_FOODS if f["category"]==cat and (diet=="non-veg" or f["type"]=="veg")
            and not any(a.lower() in f["name"].lower() for a in allergies)]

def pick(cat, diet, allergies, exclude=[]):
    pool = [f for f in get_foods(cat, diet, allergies) if f["id"] not in exclude]
    return random.choice(pool or get_foods(cat, diet, allergies))

def generate_weekly_plan(diet, allergies, week_start):
    plan, used = {}, {"breakfast":[],"lunch":[],"dinner":[],"snack":[]}
    for i in range(7):
        day = (week_start + timedelta(days=i)).isoformat()
        b = pick("breakfast", diet, allergies, used["breakfast"])
        l = pick("lunch", diet, allergies, used["lunch"])
        d = pick("dinner", diet, allergies, used["dinner"])
        s1 = pick("snack", diet, allergies, used["snack"])
        s2 = pick("snack", diet, allergies, used["snack"]+[s1["id"]])
        [used[k].append(v) for k,v in [("breakfast",b["id"]),("lunch",l["id"]),("dinner",d["id"]),("snack",s1["id"]),("snack",s2["id"])]]
        plan[day] = {"breakfast":b,"lunch":l,"dinner":d,"snack1":s1,"snack2":s2}
    return plan

def get_food_by_id(fid):
    return next((f for f in ALL_FOODS if f["id"]==fid), None)

def get_all_foods():
    return ALL_FOODS

def get_swap_options(cat, diet, allergies, current_id):
    return [f for f in get_foods(cat, diet, allergies) if f["id"]!=current_id][:8]

def calc_day_nutrients(meals):
    t = {"calories":0,"protein":0,"carbs":0,"fat":0,"iron":0,"calcium":0,"fiber":0}
    for f in meals.values():
        if isinstance(f, dict) and "calories" in f:
            for k in t: t[k] += f.get(k, 0)
    return {k: round(v,1) for k,v in t.items()}
