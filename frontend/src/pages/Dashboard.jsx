import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Utensils, Brain, TrendingUp, Calendar, ArrowRight, AlertCircle } from "lucide-react";
import { api } from "../services/api";
import FatigueMeter from "../components/FatigueMeter";
import NutrientBar from "../components/NutrientBar";

export default function Dashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("profile_name") || "Athlete";
  const today = new Date().toISOString().split("T")[0];

  const [fatigue, setFatigue] = useState(null);
  const [nutrients, setNutrients] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [rda, setRda] = useState(null);

  useEffect(() => {
    api.getToday().then(setFatigue).catch(() => {});
    api.getDailyNutrients(today).then(setNutrients).catch(() => {});
    api.getCompliance().then(setCompliance).catch(() => {});
    api.getRDA().then(setRda).catch(() => {});
  }, [today]);

  const fatigueScore = fatigue?.fatigue_score ?? null;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Good {greeting()}, {name.split(" ")[0]} 👋</h1>
        <p className="text-gray-500 text-sm mt-0.5">{new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}</p>
      </div>

      {/* Quick status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          icon={<Brain size={20} className="text-purple-500" />}
          title="Today's Fatigue"
          value={fatigueScore !== null ? `${fatigueScore}/100` : "Not checked in"}
          subtitle={fatigue?.label || "Do your daily check-in"}
          color="purple"
          onClick={() => navigate("/app/fatigue")}
        />
        <StatusCard
          icon={<Utensils size={20} className="text-orange-500" />}
          title="Nutrition Today"
          value={nutrients?.calories ? `${Math.round(nutrients.calories)} kcal` : "No meals logged"}
          subtitle={rda ? `Target: ${Math.round(rda.calories)} kcal` : "Log your meals"}
          color="orange"
          onClick={() => navigate("/app/nutrition")}
        />
        <StatusCard
          icon={<TrendingUp size={20} className="text-green-500" />}
          title="Weekly Compliance"
          value={compliance ? `${compliance.compliance_score}%` : "—"}
          subtitle={compliance ? `${compliance.logged_days} of ${compliance.total_days} days logged` : "Keep tracking"}
          color="green"
          onClick={() => navigate("/app/nutrition")}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fatigue Panel */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-black text-lg">Fatigue Monitor</h2>
              <p className="text-gray-400 text-sm">7-day ML prediction</p>
            </div>
            <button onClick={() => navigate("/app/fatigue")}
              className="flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors">
              Details <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex flex-col items-center">
            <FatigueMeter score={fatigueScore ?? 0} size={200} />
            {fatigueScore === null && (
              <p className="text-gray-400 text-sm mt-3 text-center">Complete today's check-in to see your fatigue score</p>
            )}
            {fatigue?.gemini_reason && (
              <div className="mt-4 bg-white/5 rounded-2xl p-4 w-full">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">AI Analysis</p>
                <p className="text-sm text-gray-200 leading-relaxed">{fatigue.gemini_reason}</p>
              </div>
            )}
          </div>
          {fatigueScore === null && (
            <button onClick={() => navigate("/app/fatigue")}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl transition-colors">
              Do Today's Check-In
            </button>
          )}
        </div>

        {/* Nutrition Panel */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-orange-50">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-black text-lg text-gray-900">Nutrition Today</h2>
              <p className="text-gray-400 text-sm">Nutrient coverage vs RDA</p>
            </div>
            <button onClick={() => navigate("/app/nutrition")}
              className="flex items-center gap-1 text-orange-500 hover:text-orange-600 text-sm font-semibold transition-colors">
              Manage <ArrowRight size={14} />
            </button>
          </div>

          {nutrients && rda ? (
            <div className="space-y-4">
              {[
                { label:"Calories", curr: nutrients.calories, tgt: rda.calories, unit:" kcal", color:"bg-orange-500" },
                { label:"Protein", curr: nutrients.protein, tgt: rda.protein, unit:"g", color:"bg-blue-500" },
                { label:"Iron", curr: nutrients.iron, tgt: rda.iron, unit:"mg", color:"bg-red-500" },
                { label:"Calcium", curr: nutrients.calcium, tgt: rda.calcium, unit:"mg", color:"bg-green-500" },
                { label:"Fiber", curr: nutrients.fiber, tgt: rda.fiber, unit:"g", color:"bg-purple-500" },
              ].map(n => (
                <NutrientBar key={n.label} label={n.label} current={n.curr || 0} target={n.tgt} unit={n.unit} color={n.color} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <AlertCircle size={32} className="text-orange-200 mb-3" />
              <p className="text-gray-400 text-sm">No meals logged today.</p>
              <button onClick={() => navigate("/app/nutrition")}
                className="mt-3 px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-colors">
                Log Meals
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickAction
          icon={<Brain size={22} className="text-purple-400" />}
          title="Daily Check-In"
          desc="Rate sleep, soreness & energy. Takes 2 min."
          cta="Start Check-In"
          onClick={() => navigate("/app/fatigue")}
          dark
        />
        <QuickAction
          icon={<Calendar size={22} className="text-orange-500" />}
          title="Weekly Meal Plan"
          desc="View your AI-generated Indian meal plan."
          cta="View Plan"
          onClick={() => navigate("/app/nutrition")}
        />
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function StatusCard({ icon, title, value, subtitle, color, onClick }) {
  const border = { purple:"border-purple-100 hover:border-purple-200", orange:"border-orange-100 hover:border-orange-200", green:"border-green-100 hover:border-green-200" }[color];
  return (
    <button onClick={onClick} className={`bg-white rounded-2xl p-5 border ${border} text-left w-full hover:shadow-md transition-all group`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">{icon}</div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
      </div>
      <p className="text-xl font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </button>
  );
}

function QuickAction({ icon, title, desc, cta, onClick, dark }) {
  return (
    <div className={`${dark ? "bg-gray-900 text-white" : "bg-orange-50 text-gray-900"} rounded-2xl p-6 flex items-center justify-between gap-4`}>
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-2xl ${dark ? "bg-white/10" : "bg-white"} flex items-center justify-center shrink-0`}>{icon}</div>
        <div>
          <h3 className="font-bold text-base">{title}</h3>
          <p className={`text-sm mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>{desc}</p>
        </div>
      </div>
      <button onClick={onClick}
        className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors
        ${dark ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
        {cta}
      </button>
    </div>
  );
}
