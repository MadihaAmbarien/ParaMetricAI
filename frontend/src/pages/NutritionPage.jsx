import { useEffect, useState } from "react";
import { api } from "../services/api";
import MealCard from "../components/MealCard";
import NutrientBar from "../components/NutrientBar";
import { Plus, RefreshCw, Calendar, BarChart2, BookOpen, Search, X, ChevronDown, ChevronUp } from "lucide-react";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function NutritionPage() {
  const [rda, setRda] = useState(null);
  const [plan, setPlan] = useState([]);
  const [compliance, setCompliance] = useState(null);
  const [tab, setTab] = useState("plan");
  const [generating, setGenerating] = useState(false);
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const today = new Date().toISOString().split("T")[0];
  const [nutrients, setNutrients] = useState(null);
  const [logDate, setLogDate] = useState(today);

  useEffect(() => {
    api.getRDA().then(setRda).catch(() => {});
    api.getWeeklyPlan().then(d => setPlan(d.meals || [])).catch(() => {});
    api.getCompliance().then(setCompliance).catch(() => {});
    api.getDailyNutrients(today).then(setNutrients).catch(() => {});
  }, [today]);

  async function generate() {
    setGenerating(true);
    try {
      await api.generateWeeklyPlan();
      const d = await api.getWeeklyPlan();
      setPlan(d.meals || []);
    } catch (e) { alert(e.message); }
    setGenerating(false);
  }

  const dayMeals = plan.filter(m => m.day_of_week === activeDay);
  const categories = ["Breakfast","Lunch","Dinner","Snacks"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Nutrition Planner</h1>
          <p className="text-gray-500 text-sm mt-0.5">ICMR-adjusted meal plan for your impairment category</p>
        </div>
        <button onClick={generate} disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-sm shadow-md">
          <RefreshCw size={15} className={generating ? "animate-spin" : ""} />
          {generating ? "Generating…" : "Generate New Plan"}
        </button>
      </div>

      {/* RDA Summary */}
      {rda && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
          <p className="text-orange-100 text-xs font-bold uppercase tracking-wider mb-3">Your Daily Nutritional Targets</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[["Calories",Math.round(rda.calories),"kcal"],["Protein",Math.round(rda.protein),"g"],["Iron",Math.round(rda.iron),"mg"],["Calcium",Math.round(rda.calcium),"mg"]].map(([l,v,u]) => (
              <div key={l} className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-xl font-black">{v}<span className="text-sm font-normal opacity-80 ml-0.5">{u}</span></p>
                <p className="text-orange-100 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[["plan","Weekly Plan",<Calendar size={14}/>],["log","Log Meals",<Plus size={14}/>],["analysis","Analysis",<BarChart2 size={14}/>]].map(([t,l,ic]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all
            ${tab===t ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {ic}{l}
          </button>
        ))}
      </div>

      {tab === "plan" && (
        <div>
          {/* Day selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {DAYS.map(d => (
              <button key={d} onClick={() => setActiveDay(d)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all
                ${activeDay===d ? "bg-orange-500 text-white shadow-md" : "bg-white text-gray-600 border border-gray-100 hover:border-orange-200"}`}>
                {d.slice(0,3)}
              </button>
            ))}
          </div>

          {dayMeals.length === 0 ? (
            <div className="bg-orange-50 border-2 border-dashed border-orange-200 rounded-2xl p-12 text-center mt-4">
              <BookOpen size={36} className="text-orange-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium mb-4">No meal plan generated yet</p>
              <button onClick={generate} disabled={generating}
                className="px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
                {generating ? "Generating…" : "Generate AI Meal Plan"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {categories.map(cat => {
                const meals = dayMeals.filter(m => m.meal_category?.toLowerCase() === cat.toLowerCase());
                return (
                  <div key={cat}>
                    <h3 className="font-bold text-gray-700 text-sm mb-2 uppercase tracking-wide">{cat}</h3>
                    <div className="space-y-3">
                      {meals.length ? meals.map(m => <MealCard key={m.id} meal={m} onSwap={() => api.getWeeklyPlan().then(d => setPlan(d.meals||[]))} />)
                        : <p className="text-gray-300 text-sm p-3 border border-dashed rounded-xl text-center">No meals</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "log" && <LogTab date={logDate} setDate={setLogDate} onLogged={() => api.getDailyNutrients(logDate).then(setNutrients).catch(()=>{})} />}

      {tab === "analysis" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's nutrients */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
            <h3 className="font-black text-gray-900 mb-4">Today's Intake</h3>
            {nutrients && rda ? (
              <div className="space-y-4">
                {[
                  { label:"Calories", curr:nutrients.calories, tgt:rda.calories, unit:" kcal", color:"bg-orange-500" },
                  { label:"Protein", curr:nutrients.protein, tgt:rda.protein, unit:"g", color:"bg-blue-500" },
                  { label:"Carbohydrates", curr:nutrients.carbs, tgt:rda.carbohydrates, unit:"g", color:"bg-yellow-500" },
                  { label:"Fat", curr:nutrients.fat, tgt:rda.fat, unit:"g", color:"bg-pink-500" },
                  { label:"Iron", curr:nutrients.iron, tgt:rda.iron, unit:"mg", color:"bg-red-500" },
                  { label:"Calcium", curr:nutrients.calcium, tgt:rda.calcium, unit:"mg", color:"bg-green-500" },
                  { label:"Fiber", curr:nutrients.fiber, tgt:rda.fiber, unit:"g", color:"bg-purple-500" },
                ].map(n => <NutrientBar key={n.label} label={n.label} current={n.curr||0} target={n.tgt} unit={n.unit} color={n.color} />)}
              </div>
            ) : <p className="text-gray-400 text-sm">No meals logged today.</p>}
          </div>

          {/* Compliance */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
            <h3 className="font-black text-gray-900 mb-4">Weekly Compliance</h3>
            {compliance ? (
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-36 h-36 mb-4">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
                    <circle cx="72" cy="72" r="60" fill="none" stroke="#fff7ed" strokeWidth="12" />
                    <circle cx="72" cy="72" r="60" fill="none" stroke="#f97316" strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 60 * compliance.compliance_score / 100} ${2 * Math.PI * 60}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-3xl font-black text-orange-600">{compliance.compliance_score}%</p>
                    <p className="text-xs text-gray-400">compliance</p>
                  </div>
                </div>
                <p className="text-gray-600 font-medium">{compliance.logged_days} of {compliance.total_days} days logged</p>
                {compliance.gemini_analysis && (
                  <div className="bg-orange-50 rounded-xl p-4 mt-4 text-left">
                    <p className="text-xs text-orange-500 font-bold uppercase tracking-wider mb-1">AI Feedback</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{compliance.gemini_analysis}</p>
                  </div>
                )}
              </div>
            ) : <p className="text-gray-400 text-sm">Log meals to see compliance.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function LogTab({ date, setDate, onLogged }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [meal_type, setMealType] = useState("Lunch");
  const [quantity, setQuantity] = useState(100);
  const [logging, setLogging] = useState(false);
  const [loggedToday, setLoggedToday] = useState([]);

  useEffect(() => {
    api.getDailyNutrients(date).then(d => setLoggedToday(d.items || [])).catch(() => {});
  }, [date]);

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    try { const d = await api.searchFoods(query); setResults(d.foods || []); } catch {}
    setSearching(false);
  }

  async function logFood() {
    if (!selected) return;
    setLogging(true);
    try {
      await api.logDaily({ food_id: selected.food_id, meal_type, quantity_grams: quantity, date, notes: "" });
      setSelected(null); setQuery(""); setResults([]);
      const d = await api.getDailyNutrients(date);
      setLoggedToday(d.items || []);
      onLogged && onLogged();
    } catch (e) { alert(e.message); }
    setLogging(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
        <h3 className="font-black text-gray-900 mb-4">Log a Meal</h3>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">Meal Type</label>
          <div className="flex gap-2 flex-wrap">
            {["Breakfast","Lunch","Dinner","Snacks"].map(m => (
              <button key={m} onClick={() => setMealType(m)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${meal_type===m ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-orange-50"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-3">
          <label className="text-sm font-medium text-gray-700 block mb-1">Search Food</label>
          <div className="flex gap-2">
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key==="Enter"&&search()}
              placeholder="e.g. idli, dal, roti…"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <button onClick={search} disabled={searching}
              className="px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors">
              <Search size={16} />
            </button>
          </div>
        </div>
        {results.length > 0 && (
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-4 max-h-48 overflow-y-auto">
            {results.map(f => (
              <button key={f.food_id} onClick={() => { setSelected(f); setResults([]); setQuery(f.food_name); }}
                className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0">
                <span className="text-sm font-medium text-gray-800">{f.food_name}</span>
                <span className="text-xs text-gray-400 ml-2">{Math.round(f.calories_per_100g)} kcal/100g</span>
              </button>
            ))}
          </div>
        )}
        {selected && (
          <div className="bg-orange-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900">{selected.food_name}</p>
                <p className="text-xs text-gray-500">{Math.round(selected.calories_per_100g * quantity / 100)} kcal for {quantity}g</p>
              </div>
              <button onClick={() => { setSelected(null); setQuery(""); }} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-gray-600">Quantity (g)</label>
              <input type="number" value={quantity} onChange={e => setQuantity(+e.target.value)} min={10} max={1000}
                className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <button onClick={logFood} disabled={logging}
              className="w-full mt-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
              {logging ? "Logging…" : "Log this food"}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md">
        <h3 className="font-black text-gray-900 mb-4">Today's Log</h3>
        {loggedToday.length === 0 ? (
          <p className="text-gray-400 text-sm">Nothing logged yet for {date}.</p>
        ) : (
          <div className="space-y-2">
            {loggedToday.map((it, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{it.food_name}</p>
                  <p className="text-xs text-gray-400">{it.meal_type} · {it.quantity_grams}g</p>
                </div>
                <span className="text-sm font-bold text-orange-600">{Math.round(it.calories)} kcal</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
