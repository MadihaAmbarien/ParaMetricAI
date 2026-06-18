import os
from dotenv import load_dotenv
load_dotenv()

def _client():
    from google import genai
    return genai.Client(api_key=os.getenv("GEMINI_API_KEY",""))

def nutrition_gap(nutrients, rda, name):
    try:
        c = _client()
        gaps=[]
        for n,rk in [("protein","protein_g"),("carbs","carbs_g"),("iron","iron_mg"),("calcium","calcium_mg")]:
            consumed=nutrients.get(n,0); target=rda.get(rk,0)
            if target and consumed < target*0.85:
                gaps.append(f"{n}: {consumed} of {target} ({round(consumed/target*100)}%)")
        if not gaps: return f"Excellent {name}! All nutritional targets met today."
        prompt=f"Nutritionist for para-athlete {name}. Gaps: {', '.join(gaps)}. Write 2 concise actionable sentences with specific Indian foods. No bullets."
        return c.models.generate_content(model="gemini-2.0-flash",contents=prompt).text.strip()
    except: return _nutrition_fallback(nutrients,rda,name)

def fatigue_reason(score, category, rolling, trends, today, name):
    try:
        c = _client()
        prompt=f"""Para-athlete {name}. Fatigue score {score:.0f}/100 → {category.replace('_',' ')}.
Sleep {today.get('sleep_hours',today.get('sleep_quality','?'))}h, Soreness {today.get('soreness',today.get('muscle_soreness','?'))}/10, Mood {today.get('mood',today.get('mood_energy','?'))}/10.
7d avg sleep (normalised) {rolling['avg_sleep_7d']:.1f}, 7d avg soreness {rolling['avg_soreness_7d']:.1f}.
Write ONE sentence (max 25 words) explaining why. Focus on the multi-day pattern. No bullets."""
        return c.models.generate_content(model="gemini-2.0-flash",contents=prompt).text.strip()
    except: return _fatigue_fallback(score,category,rolling,name)

def _nutrition_fallback(n,r,name):
    msgs=[]
    if n.get("protein",0)<r.get("protein_g",0)*0.85: msgs.append("add a bowl of dal or 2 boiled eggs for protein")
    if n.get("iron",0)<r.get("iron_mg",0)*0.85: msgs.append("have rajma or palak paneer for iron")
    if n.get("calcium",0)<r.get("calcium_mg",0)*0.85: msgs.append("drink a glass of milk for calcium")
    return f"Hey {name}! " + (" and ".join(msgs) + ".") if msgs else f"Great work {name}! Nutrition is on track."

def _fatigue_fallback(score,cat,r,name):
    if cat=="rest": return f"{name}, accumulated fatigue from low sleep avg ({r['avg_sleep_7d']}/5) needs recovery today."
    if cat=="train_light": return f"{name}, moderate fatigue detected — keep today's session controlled."
    return f"{name}, recovery indicators are solid — ready for an intense session."
