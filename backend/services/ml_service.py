import numpy as np, joblib
from pathlib import Path

_cache = None
W7 = np.array([0.5,0.7,0.8,0.9,1.0,1.2,1.5]); W7 /= W7.sum()
W3 = np.array([0.8,1.0,1.3]); W3 /= W3.sum()

def _load():
    global _cache
    if not _cache:
        pkg = joblib.load(Path(__file__).parent.parent / "ml" / "fatigue_rf.pkl")
        _cache = pkg
    return _cache["model"], _cache["features"]

def predict_fatigue(sleep, soreness, mood, duration, intensity, history):
    model, features = _load()
    load = duration * intensity
    hist = history[-7:] if len(history) >= 7 else history
    pad = 7 - len(hist)
    s7 = [3.0]*pad + [h["sleep_quality"] for h in hist]
    r7 = [2.0]*pad + [h["muscle_soreness"] for h in hist]
    m7 = [3.0]*pad + [h["mood_energy"] for h in hist]
    l7 = [1.0]*pad + [h["session_duration"]*h["session_intensity"] for h in hist]
    s3,r3,m3,l3 = s7[-3:],r7[-3:],m7[-3:],l7[-3:]
    idx = np.arange(7)
    row = {
        "sleep_quality":sleep,"muscle_soreness":soreness,"mood_energy":mood,
        "session_duration":duration,"session_intensity":intensity,"today_load":load,
        "avg_sleep_7d":float(np.mean(s7)),"avg_soreness_7d":float(np.mean(r7)),
        "avg_mood_7d":float(np.mean(m7)),"avg_load_7d":float(np.mean(l7)),
        "w_sleep_7d":float(np.average(s7,weights=W7)),"w_soreness_7d":float(np.average(r7,weights=W7)),
        "w_mood_7d":float(np.average(m7,weights=W7)),"w_load_7d":float(np.average(l7,weights=W7)),
        "avg_sleep_3d":float(np.mean(s3)),"avg_soreness_3d":float(np.mean(r3)),
        "avg_mood_3d":float(np.mean(m3)),"avg_load_3d":float(np.mean(l3)),
        "sleep_trend_7d":float(np.polyfit(idx,s7,1)[0]),
        "soreness_trend_7d":float(np.polyfit(idx,r7,1)[0]),
        "mood_trend_7d":float(np.polyfit(idx,m7,1)[0]),
    }
    score = float(np.clip(model.predict([[row[f] for f in features]])[0], 0, 100))
    cat = "train_hard" if score < 40 else ("rest" if score >= 70 else "train_light")
    return {"fatigue_score":round(score,1),"category":cat,
            "rolling_stats":{"avg_sleep_7d":round(float(np.mean(s7)),2),"avg_soreness_7d":round(float(np.mean(r7)),2),
                             "avg_mood_7d":round(float(np.mean(m7)),2),"avg_load_7d":round(float(np.mean(l7)),2)},
            "trends":{"sleep_trend":round(float(np.polyfit(idx,s7,1)[0]),3),
                      "soreness_trend":round(float(np.polyfit(idx,r7,1)[0]),3),
                      "mood_trend":round(float(np.polyfit(idx,m7,1)[0]),3)}}
