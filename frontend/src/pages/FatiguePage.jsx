import { useEffect, useState } from "react";
import { api } from "../services/api";
import FatigueMeter from "../components/FatigueMeter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Moon, Flame, Smile, Dumbbell, CheckCircle, ChevronRight, Activity } from "lucide-react";

const SLIDERS = [
  { key:"sleep_hours", label:"Sleep", icon:<Moon size={18}/>, min:0, max:12, step:0.5, unit:"hrs", low:"< 5h", high:"8h+" },
  { key:"soreness", label:"Muscle Soreness", icon:<Flame size={18}/>, min:0, max:10, step:1, unit:"/10", low:"None", high:"Severe" },
  { key:"mood", label:"Mood & Energy", icon:<Smile size={18}/>, min:0, max:10, step:1, unit:"/10", low:"Terrible", high:"Excellent" },
  { key:"training_load", label:"Training Load", icon:<Dumbbell size={18}/>, min:0, max:10, step:1, unit:"/10", low:"Rest Day", high:"Max Effort" },
];

export default function FatiguePage() {
  const [checkin, setCheckin] = useState({ sleep_hours:7, soreness:3, mood:7, training_load:5, notes:"" });
  const [result, setResult] = useState(null);
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.getToday().then(d => { setToday(d); if (d?.fatigue_score !== undefined) setSubmitted(true); }).catch(() => {});
    api.getHistory(14).then(d => setHistory(d.history || [])).catch(() => {});
  }, []);

  async function submit() {
    setLoading(true);
    try {
      const r = await api.checkin(checkin);
      setResult(r);
      setSubmitted(true);
      const hist = await api.getHistory(14);
      setHistory(hist.history || []);
    } catch (e) { alert(e.message); }
    setLoading(false);
  }

  const current = result || today;
  const score = current?.fatigue_score ?? 0;

  const chartData = [...history].reverse().map((h, i) => ({
    day: new Date(h.date).toLocaleDateString("en-IN", { weekday:"short", day:"numeric" }),
    score: h.fatigue_score,
  }));

  const scoreColor = score < 35 ? "#22c55e" : score < 65 ? "#eab308" : score < 82 ? "#f97316" : "#ef4444";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Fatigue Tracker</h1>
        <p className="text-gray-500 text-sm mt-0.5">AI-powered 7-day pattern analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — meter or form */}
        <div className="bg-gradient-to-br from-gray-950 to-gray-800 rounded-3xl p-6 text-white shadow-2xl">
          {submitted && current ? (
            <>
              <div className="text-center mb-2">
                <p className="text-gray-400 text-sm uppercase tracking-widest mb-4">Today's Score</p>
                <div className="flex justify-center">
                  <FatigueMeter score={score} size={230} />
                </div>
              </div>

              {/* Zone legend */}
              <div className="grid grid-cols-4 gap-1.5 mt-4 mb-5">
                {[["Low","< 35","#22c55e"],["Moderate","35–65","#eab308"],["High","65–82","#f97316"],["Critical","82+","#ef4444"]].map(([l,r,c]) => (
                  <div key={l} className="text-center bg-white/5 rounded-xl p-2">
                    <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{background:c}} />
                    <p className="text-xs font-bold" style={{color:c}}>{l}</p>
                    <p className="text-xs text-gray-500">{r}</p>
                  </div>
                ))}
              </div>

              {current.gemini_reason && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={14} className="text-orange-400" />
                    <p className="text-xs text-orange-300 font-bold uppercase tracking-wider">AI Insight</p>
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{current.gemini_reason}</p>
                </div>
              )}

              {/* Today's inputs summary */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Sleep", `${current.sleep_hours}h`, <Moon size={14}/>],
                  ["Soreness", `${current.soreness}/10`, <Flame size={14}/>],
                  ["Mood", `${current.mood}/10`, <Smile size={14}/>],
                  ["Load", `${current.training_load}/10`, <Dumbbell size={14}/>],
                ].map(([l,v,ic]) => (
                  <div key={l} className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
                    <span className="text-gray-400">{ic}</span>
                    <div><p className="text-xs text-gray-500">{l}</p><p className="text-sm font-bold">{v}</p></div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-300 font-bold text-lg mb-1">Daily Check-In</p>
              <p className="text-gray-400 text-sm mb-6">Rate how you're feeling today</p>

              {SLIDERS.map(s => (
                <div key={s.key} className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-gray-300">
                      {s.icon} <span className="text-sm font-semibold">{s.label}</span>
                    </div>
                    <span className="font-black text-orange-400 text-lg">{checkin[s.key]}{s.unit}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={checkin[s.key]}
                    onChange={e => setCheckin(c => ({ ...c, [s.key]: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-700 rounded-full accent-orange-500 cursor-pointer" />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{s.low}</span><span>{s.high}</span>
                  </div>
                </div>
              ))}

              <div className="mb-5">
                <label className="text-sm font-semibold text-gray-300 block mb-2">Notes (optional)</label>
                <textarea rows={2} value={checkin.notes}
                  onChange={e => setCheckin(c => ({ ...c, notes: e.target.value }))}
                  placeholder="Any aches, disrupted sleep, hard session..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
              </div>

              <button onClick={submit} disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 text-white font-black py-4 rounded-2xl transition-all text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30">
                {loading ? "Analysing…" : <><CheckCircle size={18}/> Submit Check-In</>}
              </button>
            </>
          )}
        </div>

        {/* Right — history chart */}
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md">
            <h3 className="font-black text-gray-900 mb-1">14-Day History</h3>
            <p className="text-gray-400 text-sm mb-5">Fatigue trend over the last two weeks</p>
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis domain={[0,100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", fontSize: 12 }}
                    formatter={(v) => [`${v}/100`, "Fatigue"]}
                  />
                  <ReferenceLine y={35} stroke="#22c55e" strokeDasharray="4 4" label={{ value:"Low", position:"right", fontSize:10, fill:"#22c55e" }} />
                  <ReferenceLine y={65} stroke="#f97316" strokeDasharray="4 4" label={{ value:"High", position:"right", fontSize:10, fill:"#f97316" }} />
                  <Line type="monotone" dataKey="score" stroke="#f97316" strokeWidth={2.5} dot={{ r:4, fill:"#f97316", strokeWidth:0 }} activeDot={{ r:6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-300 text-sm">
                Complete more check-ins to see your trend
              </div>
            )}
          </div>

          {/* Recent log */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md">
            <h3 className="font-black text-gray-900 mb-4">Recent Check-Ins</h3>
            {history.length === 0 ? (
              <p className="text-gray-400 text-sm">No history yet.</p>
            ) : (
              <div className="space-y-2">
                {history.slice(0,5).map(h => {
                  const c = h.fatigue_score < 35 ? "#22c55e" : h.fatigue_score < 65 ? "#eab308" : h.fatigue_score < 82 ? "#f97316" : "#ef4444";
                  const lbl = h.fatigue_score < 35 ? "Low" : h.fatigue_score < 65 ? "Moderate" : h.fatigue_score < 82 ? "High" : "Critical";
                  return (
                    <div key={h.date} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(h.date).toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" })}
                        </p>
                        <p className="text-xs text-gray-400">Sleep {h.sleep_hours}h · Load {h.training_load}/10</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black" style={{color:c}}>{h.fatigue_score}</p>
                        <p className="text-xs font-bold" style={{color:c}}>{lbl}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
