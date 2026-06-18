import { useState } from "react";
import { RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "../services/api";

export default function MealCard({ meal, onSwap }) {
  const [expanded, setExpanded] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [options, setOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  const catColor = {
    Breakfast: "bg-amber-100 text-amber-700",
    Lunch: "bg-orange-100 text-orange-700",
    Dinner: "bg-red-100 text-red-700",
    Snacks: "bg-green-100 text-green-700",
  }[meal.meal_category] || "bg-gray-100 text-gray-600";

  async function loadOptions() {
    if (options.length) { setShowOptions(!showOptions); return; }
    setSwapping(true);
    try {
      const data = await api.getSwapOptions(meal.meal_category);
      setOptions(data.options || []);
      setShowOptions(true);
    } catch {}
    setSwapping(false);
  }

  async function doSwap(foodId) {
    try {
      await api.swapMeal({ day: meal.day_of_week, slot: meal.slot, new_food_id: foodId });
      setShowOptions(false);
      setOptions([]);
      onSwap && onSwap();
    } catch {}
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1 ${catColor}`}>
            {meal.meal_category}
          </span>
          <h4 className="font-bold text-gray-900 text-sm leading-snug">{meal.food_name}</h4>
          <p className="text-xs text-gray-400">{meal.quantity_grams}g · {Math.round(meal.calories)} kcal</p>
        </div>
        <div className="flex gap-1">
          <button onClick={loadOptions} disabled={swapping}
            className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors">
            <RefreshCw size={14} className={swapping ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-50 text-center">
          {[["Protein", meal.protein_g, "g"], ["Carbs", meal.carbs_g, "g"], ["Fat", meal.fat_g, "g"]].map(([l,v,u]) => (
            <div key={l} className="bg-gray-50 rounded-lg py-1.5">
              <p className="text-xs text-gray-400">{l}</p>
              <p className="text-sm font-bold text-gray-800">{(v||0).toFixed(1)}{u}</p>
            </div>
          ))}
        </div>
      )}

      {showOptions && options.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
          <p className="text-xs text-gray-400 font-medium mb-2">Swap with:</p>
          {options.slice(0, 5).map(o => (
            <button key={o.food_id} onClick={() => doSwap(o.food_id)}
              className="w-full text-left text-sm px-3 py-2 rounded-xl hover:bg-orange-50 hover:text-orange-700 transition-colors flex justify-between items-center">
              <span className="font-medium">{o.food_name}</span>
              <span className="text-xs text-gray-400">{Math.round(o.calories)} kcal</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
