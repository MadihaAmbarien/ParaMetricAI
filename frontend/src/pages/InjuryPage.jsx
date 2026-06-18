import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Info,
  Heart,
  ChevronRight,
  BrainCircuit,
  Award,
} from "lucide-react";

export default function InjuryPage() {
  const [status, setStatus] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const st = await api.getInjuryStatus();
        const an = await api.getInjuryAnalytics();
        setStatus(st);
        setAnalytics(an);
      } catch (err) {
        console.error("Error loading injury metrics:", err);
        setError(err.message || "Failed to load injury risk data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500 text-sm font-semibold">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mr-2" />
        Analyzing injury risk models...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-3xl border border-red-100 flex items-start gap-3">
        <AlertTriangle className="shrink-0 mt-0.5" />
        <div>
          <h4 className="font-black">Could not load Injury Risk Monitor</h4>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-xs mt-3 text-red-500">
            Please make sure you have submitted at least one Daily Check-in to enable evaluation.
          </p>
        </div>
      </div>
    );
  }

  const score = status?.score ?? 0;
  const category = status?.category ?? "Low Risk";
  const atRiskArea = status?.at_risk_area ?? "None";
  const recommendation = status?.recommendation ?? "Patterns appear healthy. Continue daily checks.";
  const breakdown = status?.breakdown ?? {};
  const trend = status?.trend ?? { direction: "stable", value: 0 };

  const categoryColors = {
    "High Risk": {
      bg: "bg-red-50 border-red-200 text-red-800",
      pill: "bg-red-500 text-white shadow-red-500/20",
      meter: "text-red-500",
      glow: "shadow-red-500/30",
    },
    "Medium Risk": {
      bg: "bg-amber-50 border-amber-200 text-amber-800",
      pill: "bg-amber-500 text-white shadow-amber-500/20",
      meter: "text-amber-500",
      glow: "shadow-amber-500/30",
    },
    "Low Risk": {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
      pill: "bg-emerald-500 text-white shadow-emerald-500/20",
      meter: "text-emerald-500",
      glow: "shadow-emerald-500/30",
    },
  };

  const currentTheme = categoryColors[category] || categoryColors["Low Risk"];

  // Format 7d trend for recharts
  const trendChartData = (analytics?.trend_7d || []).map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
    "Risk Score": t.risk_score,
    "Fatigue Score": t.fatigue_score,
  }));

  // Format pain frequency for recharts
  const barChartData = (analytics?.frequent_locations || []).slice(0, 8).map((l) => ({
    name: l.location,
    Reported: l.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Injury Risk Monitor</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Proactive physical feedback and risk evaluations for para-athletes
        </p>
      </div>

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Risk Score Wheel & Overview */}
        <div className="bg-gradient-to-br from-gray-950 to-gray-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">
                Daily Risk Index
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-black shadow-lg ${currentTheme.pill}`}>
                {category.toUpperCase()}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative flex items-center justify-center">
                {/* Circular indicator glow */}
                <div
                  className={`w-36 h-36 rounded-full border-[10px] border-white/5 flex flex-col items-center justify-center`}
                >
                  <span className="text-4xl font-black">{score}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    Risk / 100
                  </span>
                </div>
              </div>

              {/* Trend label */}
              <div className="flex items-center gap-1.5 mt-5">
                {trend.direction === "up" ? (
                  <div className="flex items-center gap-1 text-red-400 text-xs font-bold bg-red-950/30 px-2.5 py-1 rounded-xl">
                    <TrendingUp size={14} /> +{trend.value} points vs yesterday
                  </div>
                ) : trend.direction === "down" ? (
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-950/30 px-2.5 py-1 rounded-xl">
                    <TrendingDown size={14} /> -{trend.value} points vs yesterday
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs font-bold bg-white/5 px-2.5 py-1 rounded-xl">
                    Stable risk index
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mt-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">At-Risk Region:</span>
              <span className="font-black text-orange-400">{atRiskArea}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Risk Assessment:</span>
              <span className="font-semibold">{category}</span>
            </div>
          </div>
        </div>

        {/* Middle Column: Preventive Action & Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs text-orange-500 font-black uppercase tracking-wider block mb-1">
                Preventive Recommendations
              </span>
              <h2 className="text-lg font-black text-gray-900">Preventive Actions List</h2>
            </div>

            {/* Recommendation Box */}
            <div className={`p-4 rounded-2xl border text-sm leading-relaxed ${currentTheme.bg}`}>
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="shrink-0 mt-0.5" size={18} />
                <p className="font-semibold">{recommendation}</p>
              </div>
            </div>

            {/* Breakdown Bars */}
            <div>
              <span className="text-xs text-gray-400 font-black uppercase tracking-wider block mb-3">
                Risk Factor Contributions
              </span>
              <div className="space-y-3">
                {[
                  { label: "Daily Fatigue level", val: breakdown.fatigue || 0, color: "bg-orange-500" },
                  { label: "7-Day Training Load volume", val: breakdown.training_load || 0, color: "bg-blue-500" },
                  { label: "Active Pain points frequency", val: breakdown.pain_reports || 0, color: "bg-red-500" },
                  { label: "Onboarding Injury History link", val: breakdown.injury_history || 0, color: "bg-purple-500" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>{item.label}</span>
                      <span>+{item.val} pts</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                        style={{ width: `${Math.min(item.val * 2.5, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
            <Info size={12} className="shrink-0" />
            <span>This is an injury risk assessment, not a medical diagnostic tool.</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 7-day trend & Correlation */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md">
          <h3 className="font-black text-gray-900 mb-1">Fatigue & Risk Correlation</h3>
          <p className="text-gray-400 text-sm mb-5">Comparison of Daily Fatigue and calculated Injury Risk</p>
          {trendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendChartData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="Risk Score"
                  stroke="#f97316"
                  fillOpacity={1}
                  fill="url(#colorRisk)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="Fatigue Score"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorFatigue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-300 text-xs">
              Insufficient log data to generate trend charts.
            </div>
          )}
        </div>

        {/* Chart 2: Pain Location Frequencies */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md">
          <h3 className="font-black text-gray-900 mb-1">Pain Location Frequencies</h3>
          <p className="text-gray-400 text-sm mb-5">Pain and soreness occurrences by region (30-day window)</p>
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barChartData} margin={{ left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="Reported" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-300 text-xs">
              No pain logs reported in the last 30 days.
            </div>
          )}
        </div>
      </div>

      {/* Future Machine Learning Integration Box */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-6 text-white border border-indigo-900/30 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <BrainCircuit className="text-indigo-400 shrink-0" size={20} />
              <span className="text-xs text-indigo-300 font-extrabold uppercase tracking-widest">
                ML Pipeline Integration
              </span>
            </div>
            <h3 className="text-lg font-black text-white">XGBoost & Random Forest Adaptation</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              The rule-based injury risk monitor is engineered as a drop-in abstraction. This interface will be directly swapped with an XGBoost/Random Forest model in production. The model will automatically train on local CSV/SQLite datasets of historical training load compliance, daily sleep metrics, and joint soreness patterns to perform customized anomaly detection.
            </p>
          </div>

          <div className="shrink-0 bg-white/5 border border-white/10 rounded-2xl p-4 text-center min-w-[150px] backdrop-blur">
            <Award className="text-indigo-400 mx-auto mb-1.5" size={24} />
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Predictive Status</p>
            <p className="text-xs text-white font-extrabold mt-1">Ready for swap</p>
          </div>
        </div>
      </div>
    </div>
  );
}
