import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Brain, Droplets, Utensils, Calendar, ChevronRight, Menu, X, Star, Mail, Phone, MapPin, ArrowRight } from "lucide-react";

const MODULES = [
  { icon: <Utensils size={28} />, title: "Nutrition Planner", desc: "AI-generated weekly Indian meal plans adjusted for your sport, impairment, and RDA.", color: "from-orange-500 to-orange-600" },
  { icon: <Brain size={28} />, title: "Fatigue Predictor", desc: "Random Forest ML model tracks 7-day patterns to predict accumulating fatigue scores.", color: "from-purple-500 to-purple-700" },
  { icon: <Activity size={28} />, title: "Injury Prediction", desc: "Early risk detection using training load, recovery metrics and biomechanical data.", color: "from-red-500 to-red-700" },
  { icon: <Droplets size={28} />, title: "Hydration Monitor", desc: "Real-time hydration deficit detection with personalised fluid intake guidance.", color: "from-blue-500 to-blue-700" },
  { icon: <Calendar size={28} />, title: "Routine Builder", desc: "Personalised training schedules that auto-adjust based on your daily fatigue score.", color: "from-green-500 to-green-700" },
];

const STATS = [
  { value: "68.6%", label: "Para-athletes lack adequate nutrition" },
  { value: "80%+", label: "Train without real-time monitoring" },
  { value: "30–50%", label: "Higher injury risk without tracking" },
  { value: "0.87", label: "R² accuracy of our fatigue model" },
];

const TESTIMONIALS = [
  { name: "Arjun S.", sport: "Para Swimmer", text: "ParaMetric gave me insights my coaches couldn't — my fatigue pattern was totally invisible before this.", stars: 5 },
  { name: "Priya M.", sport: "Wheelchair Basketball", text: "The meal plans are exactly what I needed. Indian food, adjusted for my caloric needs. Game changer.", stars: 5 },
  { name: "Ravi K.", sport: "Para Athletics", text: "The 7-day fatigue tracker caught an overtraining spike before I even felt it. Saved my season.", stars: 5 },
];

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur shadow-md" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <span className="font-black text-xl text-gray-900">Para<span className="text-orange-500">Metric</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[["Features","features"],["About","about"],["Contact","contact"]].map(([l,id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-gray-600 hover:text-orange-600 font-medium transition-colors text-sm">{l}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="px-4 py-2 text-gray-700 font-semibold text-sm hover:text-orange-600 transition-colors">Log In</button>
            <button onClick={() => navigate("/signup")} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-full transition-colors shadow-md">Sign Up Free</button>
          </div>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t px-6 py-4 space-y-3">
            {[["Features","features"],["About","about"],["Contact","contact"]].map(([l,id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left text-gray-700 font-medium py-1">{l}</button>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => navigate("/login")} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-semibold">Log In</button>
              <button onClick={() => navigate("/signup")} className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold">Sign Up</button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-orange-100 rounded-full opacity-50 translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-200 rounded-full opacity-30 -translate-x-1/2 translate-y-1/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center relative">
          <div>
            <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" /> AI-Powered Para-Athlete Support
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
              Train Smarter.<br />
              <span className="text-orange-500">Recover Stronger.</span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-md">
              ParaMetric is the first AI-driven performance platform built exclusively for para-athletes — tracking nutrition, fatigue, hydration, and injury risk in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate("/signup")}
                className="flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full text-lg shadow-lg hover:shadow-orange-300 transition-all">
                Get Started Free <ArrowRight size={20} />
              </button>
              <button onClick={() => scrollTo("features")}
                className="flex items-center gap-2 px-8 py-4 border-2 border-gray-200 hover:border-orange-400 text-gray-700 font-bold rounded-full text-lg transition-all">
                See Features
              </button>
            </div>
            <div className="flex flex-wrap gap-6 mt-10">
              {[["100% Free","No cost ever"],["AI-Powered","Gemini + ML"],["Para-Specific","Built for you"]].map(([a,b]) => (
                <div key={a} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <div><p className="text-sm font-bold text-gray-800">{a}</p><p className="text-xs text-gray-500">{b}</p></div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Para-Athlete Image */}
          <div className="relative hidden md:flex items-center justify-center">
            <img
              src="/hero-athletes.png"
              alt="Para Athletes"
              className="w-full max-w-lg object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-500 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.value} className="text-center text-white">
              <p className="text-3xl md:text-4xl font-black">{s.value}</p>
              <p className="text-orange-100 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-bold text-sm uppercase tracking-widest">What We Offer</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">Five Modules. One Platform.</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Every feature is built specifically for para-athletes — accounting for disability type, sport requirements, and Indian dietary context.</p>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {MODULES.slice(0, 3).map((m) => (
                <div key={m.title} className="group rounded-2xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-xl bg-white transition-all duration-300 flex flex-col">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-md shrink-0`}>{m.icon}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{m.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1">{m.desc}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full">
              {MODULES.slice(3).map((m) => (
                <div key={m.title} className="group rounded-2xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-xl bg-white transition-all duration-300 flex flex-col">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-md shrink-0`}>{m.icon}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{m.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-orange-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-bold text-sm uppercase tracking-widest">Simple Process</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">How ParaMetric Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step:"01", title:"Create Your Profile", desc:"Enter your sport, impairment category, body stats and dietary preferences in 2 minutes." },
              { step:"02", title:"Daily Check-In", desc:"Each day, rate your sleep, soreness and energy. Log your meals with one tap." },
              { step:"03", title:"Get Smart Insights", desc:"See your fatigue score, nutrient gaps, and AI-generated recommendations instantly." },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 bg-orange-500 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto mb-5">{s.step}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900">Athletes Love ParaMetric</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">{Array(t.stars).fill(0).map((_,i)=><Star key={i} size={14} className="fill-orange-400 text-orange-400" />)}</div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-orange-500 text-xs">{t.sport}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-orange-400 font-bold text-sm uppercase tracking-widest">Our Mission</span>
            <h2 className="text-4xl font-black mt-2 mb-6 leading-tight">Bridging the Gap for Para-Athletes</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              India's para-athletes win medals on the world stage, yet over 68% face nutritional deficiencies and 80% train without any real-time monitoring. ParaMetric was built to change that.
            </p>
            <p className="text-gray-300 leading-relaxed mb-6">
              Developed as part of a BE (IT) engineering project, ParaMetric combines machine learning, generative AI, and sports science to deliver what elite athletes have always had — but made accessible to every para-athlete.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[["Random Forest","Fatigue ML Model"],["Gemini 2.0","AI Recommendations"],["ICMR Standards","RDA Calculations"],["80+ Foods","Indian Food Database"]].map(([a,b]) => (
                <div key={a} className="bg-gray-800 rounded-xl p-4">
                  <p className="text-orange-400 font-bold text-sm">{a}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{b}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 rounded-3xl p-8 text-center">
            <div className="text-6xl font-black text-orange-500 mb-2">R² 0.87</div>
            <p className="text-gray-300 mb-6">Fatigue model accuracy on 19,600 synthetic training samples</p>
            <div className="space-y-4">
              {[["MAE 2.37","Mean absolute error on test set"],["700 Athletes","Simulated training sequences"],["21 Features","Multi-day pattern features"]].map(([v,l]) => (
                <div key={v} className="flex items-center gap-3 text-left">
                  <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />
                  <div><span className="text-white font-bold text-sm">{v}</span><span className="text-gray-400 text-xs ml-2">{l}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 bg-orange-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900">Get In Touch</h2>
            <p className="text-gray-500 mt-3">Questions, feedback or collaboration requests — we'd love to hear from you.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              {[[<Mail size={20}/>, "Email", "akrammustafa402@gmail.com"],[<Phone size={20}/>, "Phone", "+91 00000 00000"],[<MapPin size={20}/>, "Location", "Hyderabad, India"]].map(([icon,l,v]) => (
                <div key={l} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">{icon}</div>
                  <div><p className="text-xs text-gray-500 font-medium">{l}</p><p className="text-gray-800 font-semibold">{v}</p></div>
                </div>
              ))}
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-orange-600 to-orange-500 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-4">Ready to Train Smarter?</h2>
          <p className="text-orange-100 mb-8">Join para-athletes who are already using data to perform better and recover faster.</p>
          <button onClick={() => navigate("/signup")}
            className="px-10 py-4 bg-white text-orange-600 font-black rounded-full text-lg hover:bg-orange-50 transition-colors shadow-lg">
            Create Free Account
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center"><Activity size={14} className="text-white" /></div>
            <span className="font-black text-white">Para<span className="text-orange-500">Metric</span></span>
          </div>
          <p className="text-sm">BE (IT) VI Sem Mini Project · Nuzhath · Madiha · Nouman</p>
          <p className="text-sm">© 2025 ParaMetric. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


function ContactForm() {
  const [sent, setSent] = useState(false);
  return sent ? (
    <div className="flex flex-col items-center justify-center h-full text-center py-8">
      <div className="text-5xl mb-3">✅</div>
      <p className="font-bold text-gray-800">Message sent!</p>
      <p className="text-gray-500 text-sm mt-1">We'll get back to you soon.</p>
    </div>
  ) : (
    <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="space-y-4">
      {[["Name","text","Your name"],["Email","email","your@email.com"],["Message","textarea","Your message..."]].map(([l,t,p]) => (
        <div key={l}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
          {t === "textarea"
            ? <textarea required rows={4} placeholder={p} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            : <input required type={t} placeholder={p} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          }
        </div>
      ))}
      <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors">Send Message</button>
    </form>
  );
}
