import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { api } from "../services/api";

const SPORTS = ["Athletics","Swimming","Wheelchair Basketball","Wheelchair Tennis","Sitting Volleyball","Cycling","Rowing","Archery","Shooting","Weightlifting","Other"];
const IMPAIRMENTS = ["Limb Deficiency","Leg Length Difference","Impaired Muscle Power","Impaired Range of Motion","Hypertonia","Ataxia","Athetosis","Vision Impairment","Intellectual Impairment"];
const GENDERS = ["male","female","other"];

export default function Auth({ mode = "login" }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState(mode);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    sport: "", impairment_category: "", gender: "male",
    age: "", weight_kg: "", height_cm: "",
    training_hours_per_week: "10", dietary_preference: "Vegetarian"
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleLogin(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await api.login({ email: form.email, password: form.password });
      localStorage.setItem("profile_id", res.profile_id);
      localStorage.setItem("profile_name", res.name);
      navigate("/app");
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  async function handleSignup(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password,
        sport: form.sport, impairment_category: form.impairment_category,
        gender: form.gender, age: parseInt(form.age),
        weight_kg: parseFloat(form.weight_kg), height_cm: parseFloat(form.height_cm),
        training_hours_per_week: parseFloat(form.training_hours_per_week),
        dietary_preference: form.dietary_preference,
      };
      const res = await api.signup(payload);
      localStorage.setItem("profile_id", res.profile_id);
      localStorage.setItem("profile_name", res.name);
      navigate("/app");
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{background:"#fff7ed"}}>
      {/* Texture background */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{zIndex:0}}>
        <defs>
          <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="2" fill="#f97316" opacity="0.18"/>
          </pattern>
          <pattern id="lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40 L40 0" stroke="#fb923c" strokeWidth="1" opacity="0.1"/>
          </pattern>
          <radialGradient id="authGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#fdba74" stopOpacity="0.35"/>
            <stop offset="100%" stopColor="#fff7ed" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)"/>
        <rect width="100%" height="100%" fill="url(#lines)"/>
        <rect width="100%" height="100%" fill="url(#authGlow)"/>
        {/* Decorative blobs */}
        <circle cx="10%" cy="15%" r="120" fill="#fb923c" opacity="0.08"/>
        <circle cx="90%" cy="80%" r="160" fill="#f97316" opacity="0.07"/>
        <circle cx="85%" cy="12%" r="80" fill="#fdba74" opacity="0.12"/>
        <circle cx="5%" cy="85%" r="100" fill="#ea580c" opacity="0.06"/>
      </svg>
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:"28rem"}}>
        <Link to="/" className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100">
          {/* Logo */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6 text-white text-center">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Activity size={24} className="text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-black">Para<span className="opacity-80">Metric</span></h1>
            <p className="text-orange-100 text-sm mt-1">AI Support for Para-Athletes</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {[["login","Log In"],["signup","Sign Up"]].map(([t,l]) => (
              <button key={t} onClick={() => { setTab(t); setStep(1); setError(""); }}
                className={`flex-1 py-3.5 text-sm font-bold transition-colors ${tab===t ? "text-orange-600 border-b-2 border-orange-500" : "text-gray-400 hover:text-gray-600"}`}>
                {l}
              </button>
            ))}
          </div>

          <div className="px-8 py-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}

            {tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <Field label="Email" type="email" value={form.email} onChange={v => set("email",v)} placeholder="you@email.com" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} required value={form.password}
                      onChange={e => set("password",e.target.value)} placeholder="Your password"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors mt-2">
                  {loading ? "Logging in…" : "Log In"}
                </button>
                <p className="text-center text-sm text-gray-500">Don't have an account? <button type="button" onClick={() => setTab("signup")} className="text-orange-500 font-bold">Sign Up</button></p>
              </form>
            ) : (
              <form onSubmit={step === 1 ? (e => { e.preventDefault(); if(form.name && form.email && form.password) setStep(2); }) : handleSignup} className="space-y-4">
                {step === 1 ? (
                  <>
                    <div className="flex gap-2 mb-2">
                      {[1,2].map(n => <div key={n} className={`flex-1 h-1.5 rounded-full ${n<=step?"bg-orange-500":"bg-gray-200"}`}/>)}
                    </div>
                    <p className="text-xs text-gray-400 mb-1">Step 1 of 2 — Account Details</p>
                    <Field label="Full Name" value={form.name} onChange={v => set("name",v)} placeholder="Arjun Singh" />
                    <Field label="Email" type="email" value={form.email} onChange={v => set("email",v)} placeholder="you@email.com" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <input type={showPw ? "text" : "password"} required minLength={6} value={form.password}
                          onChange={e => set("password",e.target.value)} placeholder="Min 6 characters"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3.5 text-gray-400">{showPw ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors">
                      Continue →
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex gap-2 mb-2">
                      {[1,2].map(n => <div key={n} className={`flex-1 h-1.5 rounded-full ${n<=step?"bg-orange-500":"bg-gray-200"}`}/>)}
                    </div>
                    <p className="text-xs text-gray-400 mb-1">Step 2 of 2 — Athlete Profile</p>
                    <SelectField label="Sport" value={form.sport} onChange={v => set("sport",v)} options={SPORTS} />
                    <SelectField label="Impairment Category" value={form.impairment_category} onChange={v => set("impairment_category",v)} options={IMPAIRMENTS} />
                    <div className="grid grid-cols-3 gap-3">
                      <SelectField label="Gender" value={form.gender} onChange={v => set("gender",v)} options={GENDERS} />
                      <Field label="Age" type="number" value={form.age} onChange={v => set("age",v)} placeholder="25" />
                      <SelectField label="Diet" value={form.dietary_preference} onChange={v => set("dietary_preference",v)} options={["Vegetarian","Non-Vegetarian","Vegan"]} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Weight (kg)" type="number" value={form.weight_kg} onChange={v => set("weight_kg",v)} placeholder="70" />
                      <Field label="Height (cm)" type="number" value={form.height_cm} onChange={v => set("height_cm",v)} placeholder="175" />
                    </div>
                    <Field label="Training hrs/week" type="number" value={form.training_hours_per_week} onChange={v => set("training_hours_per_week",v)} placeholder="10" />
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors">← Back</button>
                      <button type="submit" disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors">
                        {loading ? "Creating…" : "Create Account"}
                      </button>
                    </div>
                  </>
                )}
                <p className="text-center text-sm text-gray-500">Already have an account? <button type="button" onClick={() => { setTab("login"); setStep(1); }} className="text-orange-500 font-bold">Log In</button></p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} required value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select required value={value} onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white capitalize">
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
      </select>
    </div>
  );
}
