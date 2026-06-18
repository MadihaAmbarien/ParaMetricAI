import { useEffect, useState } from "react";
import { api } from "../services/api";
import { 
  Dumbbell, 
  Calendar, 
  Zap, 
  RefreshCw, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Smile, 
  Frown, 
  Meh, 
  Sliders, 
  Info,
  Layers,
  Heart,
  Timer,
  X,
  Sun,
  Moon,
  Coffee,
  BookOpen,
  Clock,
  Utensils
} from "lucide-react";


export default function RoutinePage() {
  const [onboarding, setOnboarding] = useState({
    sport: "",
    training_days_per_week: 4,
    experience_level: "Beginner",
    available_equipment: [],
    physical_limitations: [],
    injury_history: []
  });
  
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [plan, setPlan] = useState(null);
  const [ratings, setRatings] = useState({});
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingOnboard, setSubmittingOnboard] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(null); // day_index if submitting
  const [activeDayIndex, setActiveDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1); // 0 = Mon
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [checkedExercises, setCheckedExercises] = useState({});

  
  // Custom states for onboarding input tag helpers
  const [equipInput, setEquipInput] = useState("");
  const [limitInput, setLimitInput] = useState("");
  const [injuryInput, setInjuryInput] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const obStatus = await api.getOnboarding();
      if (obStatus.exists) {
        setHasOnboarded(true);
        setOnboarding({
          sport: obStatus.sport || "",
          training_days_per_week: obStatus.training_days_per_week || 4,
          experience_level: obStatus.experience_level || "Beginner",
          available_equipment: obStatus.available_equipment || [],
          physical_limitations: obStatus.physical_limitations || [],
          injury_history: obStatus.injury_history || []
        });
        
        // Load plan
        const planRes = await api.getPlan();
        if (planRes.exists) {
          setPlan(planRes);
          setRatings(planRes.ratings || {});
        } else {
          // Generate initially if onboarded but no plan
          const newPlan = await api.generatePlan();
          const refreshed = await api.getPlan();
          setPlan(refreshed);
          setRatings(refreshed.ratings || {});
        }

        // Load progression suggestion
        const progRes = await api.getProgress();
        setSuggestion(progRes.suggestion);
      } else {
        setHasOnboarded(false);
      }
    } catch (err) {
      console.error("Error loading Routine Planner data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setSelectedBlock(null);
  }, [activeDayIndex]);

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!onboarding.sport) {
      alert("Please specify your sport.");
      return;
    }
    setSubmittingOnboard(true);
    try {
      await api.saveOnboarding(onboarding);
      await api.generatePlan();
      setHasOnboarded(true);
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to save onboarding.");
    } finally {
      setSubmittingOnboard(false);
    }
  };

  const addEquipment = () => {
    if (equipInput.trim() && !onboarding.available_equipment.includes(equipInput.trim())) {
      setOnboarding(prev => ({
        ...prev,
        available_equipment: [...prev.available_equipment, equipInput.trim()]
      }));
      setEquipInput("");
    }
  };

  const removeEquipment = (item) => {
    setOnboarding(prev => ({
      ...prev,
      available_equipment: prev.available_equipment.filter(x => x !== item)
    }));
  };

  const addLimitation = () => {
    if (limitInput.trim() && !onboarding.physical_limitations.includes(limitInput.trim())) {
      setOnboarding(prev => ({
        ...prev,
        physical_limitations: [...prev.physical_limitations, limitInput.trim()]
      }));
      setLimitInput("");
    }
  };

  const removeLimitation = (item) => {
    setOnboarding(prev => ({
      ...prev,
      physical_limitations: prev.physical_limitations.filter(x => x !== item)
    }));
  };

  const addInjuryHistory = () => {
    if (injuryInput.trim() && !onboarding.injury_history.includes(injuryInput.trim())) {
      setOnboarding(prev => ({
        ...prev,
        injury_history: [...prev.injury_history, injuryInput.trim()]
      }));
      setInjuryInput("");
    }
  };

  const removeInjuryHistory = (item) => {
    setOnboarding(prev => ({
      ...prev,
      injury_history: prev.injury_history.filter(x => x !== item)
    }));
  };

  const handleRateSession = async (dayIndex, ratingValue) => {
    if (!plan) return;
    setSubmittingRating(dayIndex);
    try {
      const todayDate = new Date();
      // Calculate date of the selected session day based on plan.week_start
      const weekStartDate = new Date(plan.week_start);
      weekStartDate.setDate(weekStartDate.getDate() + dayIndex);
      const sessionDateStr = weekStartDate.toISOString().split("T")[0];

      await api.rateSession({
        plan_id: plan.plan_id,
        day_index: dayIndex,
        session_date: sessionDateStr,
        rating: ratingValue,
        completed: true,
        notes: `Rated ${ratingValue} via Quick Feedback`
      });

      // Update local state
      setRatings(prev => ({ ...prev, [dayIndex]: ratingValue }));

      // Reload progression text since ratings changed
      const progRes = await api.getProgress();
      setSuggestion(progRes.suggestion);
    } catch (err) {
      alert("Failed to rate session: " + err.message);
    } finally {
      setSubmittingRating(null);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm("Are you sure you want to regenerate this week's plan? This will start a new progression week.")) return;
    setLoading(true);
    try {
      await api.generatePlan();
      await loadData();
    } catch (err) {
      alert("Failed to regenerate plan: " + err.message);
      setLoading(false);
    }
  };

  const getIntensityBadge = (intensity) => {
    switch (intensity.toLowerCase()) {
      case "light":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Light</span>;
      case "moderate":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Moderate</span>;
      case "heavy":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Heavy</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-50 text-gray-700 border border-gray-200">{intensity}</span>;
    }
  };

  const getSessionIcon = (type) => {
    switch (type.toLowerCase()) {
      case "skill":
        return <Award className="w-5 h-5 text-indigo-500" />;
      case "strength":
        return <Dumbbell className="w-5 h-5 text-orange-500" />;
      case "conditioning":
        return <Zap className="w-5 h-5 text-amber-500" />;
      case "recovery":
      case "mobility":
        return <Heart className="w-5 h-5 text-emerald-500" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-semibold">Loading Routine Planner...</p>
      </div>
    );
  }

  // 1. ONBOARDING SCREEN
  if (!hasOnboarded) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md">
              <Sliders size={32} />
            </div>
            <h1 className="text-3xl font-black text-gray-900">Athlete Routine Planner</h1>
            <p className="text-gray-500">Let's customise your training routine to fit your sport, experience level, and accessibility needs.</p>
          </div>

          <form onSubmit={handleOnboardSubmit} className="space-y-6">
            {/* Sport input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">Sport / Discipline</label>
              <input 
                type="text" 
                placeholder="e.g. Wheelchair Racing, Para Swimming, Boccia" 
                value={onboarding.sport}
                onChange={e => setOnboarding(p => ({ ...p, sport: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                required
              />
            </div>

            {/* Experience level & Days per week */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">Experience Level</label>
                <select 
                  value={onboarding.experience_level}
                  onChange={e => setOnboarding(p => ({ ...p, experience_level: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">Training Days per Week</label>
                <input 
                  type="number" 
                  min="2" 
                  max="7" 
                  value={onboarding.training_days_per_week}
                  onChange={e => setOnboarding(p => ({ ...p, training_days_per_week: parseInt(e.target.value) || 4 }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                />
              </div>
            </div>

            {/* Available Equipment */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">Available Equipment</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. Resistance Bands, Handcycle, Dumbbells" 
                  value={equipInput}
                  onChange={e => setEquipInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEquipment(); } }}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                />
                <button 
                  type="button" 
                  onClick={addEquipment}
                  className="px-5 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {onboarding.available_equipment.map(item => (
                  <span key={item} className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-xs font-bold">
                    {item}
                    <button type="button" onClick={() => removeEquipment(item)} className="hover:text-red-500 font-extrabold text-sm">×</button>
                  </span>
                ))}
                {onboarding.available_equipment.length === 0 && (
                  <span className="text-xs text-gray-400 italic">None specified (Bodyweight exercises will be prioritised).</span>
                )}
              </div>
            </div>

            {/* Disability constraints */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">Disability-specific Constraints / Limitations</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. Wheelchair user, Limited grip strength, Lower limb amputation" 
                  value={limitInput}
                  onChange={e => setLimitInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLimitation(); } }}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                />
                <button 
                  type="button" 
                  onClick={addLimitation}
                  className="px-5 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {onboarding.physical_limitations.map(item => (
                  <span key={item} className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full text-xs font-bold">
                    {item}
                    <button type="button" onClick={() => removeLimitation(item)} className="hover:text-red-500 font-extrabold text-sm">×</button>
                  </span>
                ))}
                {onboarding.physical_limitations.length === 0 && (
                  <span className="text-xs text-gray-400 italic">No limitations specified.</span>
                )}
              </div>
            </div>

            {/* Prior Injury History */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">Prior Injury History (for preventative rules)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. Shoulder impingement, Knee ligament tear, Back strain" 
                  value={injuryInput}
                  onChange={e => setInjuryInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addInjuryHistory(); } }}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                />
                <button 
                  type="button" 
                  onClick={addInjuryHistory}
                  className="px-5 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {onboarding.injury_history?.map(item => (
                  <span key={item} className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-bold">
                    {item}
                    <button type="button" onClick={() => removeInjuryHistory(item)} className="hover:text-amber-500 font-extrabold text-sm">×</button>
                  </span>
                ))}
                {(!onboarding.injury_history || onboarding.injury_history.length === 0) && (
                  <span className="text-xs text-gray-400 italic">No historical injuries logged.</span>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submittingOnboard}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 text-white font-black py-4 rounded-2xl transition-all text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-950/25"
            >
              {submittingOnboard ? "Generating Weekly Plan..." : "Generate Training Routine"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. PLAN DASHBOARD
  const currentDayPlan = plan?.plan?.[activeDayIndex] || null;
  const currentDayRating = ratings[activeDayIndex] || null;

  const toggleExercise = (key) => {
    setCheckedExercises(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const parseWorkoutPlan = (planText) => {
    if (!planText) return { exercises: [], adaptations: "" };
    
    let mainText = planText;
    let adaptations = "";
    
    if (planText.includes("⚠️ Coach Adaptations:")) {
      const parts = planText.split("⚠️ Coach Adaptations:");
      mainText = parts[0].trim();
      adaptations = parts[1].trim();
    }
    
    // Split exercises by commas not inside parentheses
    const exerciseStrings = mainText.split(/,(?![^(]*\))/).map(e => e.trim()).filter(Boolean);
    
    const exercises = exerciseStrings.map(ex => {
      const match = ex.match(/^([^(]+)(?:\(([^)]+)\))?/);
      if (match) {
        return {
          name: match[1].trim(),
          prescription: match[2] ? match[2].trim() : ""
        };
      }
      return { name: ex, prescription: "" };
    });
    
    return { exercises, adaptations };
  };

  const getBlockConfig = (type, isTraining, isRecovery) => {
    if (isTraining) {
      return {
        icon: <Dumbbell className="w-4 h-4 text-orange-600" />,
        colorClass: "bg-orange-50/40 border-orange-100/80 text-orange-950",
        accentColor: "border-orange-500",
        tag: "Training",
        tagColor: "bg-orange-100 text-orange-800"
      };
    }
    if (isRecovery) {
      return {
        icon: <Heart className="w-4 h-4 text-emerald-600" />,
        colorClass: "bg-emerald-50/40 border-emerald-100/80 text-emerald-950",
        accentColor: "border-emerald-500",
        tag: "Recovery",
        tagColor: "bg-emerald-100 text-emerald-800"
      };
    }
    
    switch (type) {
      case "wakeup":
        return {
          icon: <Sun className="w-4 h-4 text-amber-600" />,
          colorClass: "bg-amber-50/30 border-amber-100/50 text-amber-950",
          accentColor: "border-amber-400",
          tag: "Morning",
          tagColor: "bg-amber-100/60 text-amber-800"
        };
      case "breakfast":
      case "lunch":
      case "dinner":
        return {
          icon: <Utensils className="w-4 h-4 text-sky-600" />,
          colorClass: "bg-sky-50/30 border-sky-100/50 text-sky-950",
          accentColor: "border-sky-400",
          tag: "Nutrition",
          tagColor: "bg-sky-100/60 text-sky-800"
        };
      case "personal_activities":
        return {
          icon: <BookOpen className="w-4 h-4 text-indigo-600" />,
          colorClass: "bg-indigo-50/30 border-indigo-100/50 text-indigo-950",
          accentColor: "border-indigo-400",
          tag: "Lifestyle",
          tagColor: "bg-indigo-100/60 text-indigo-800"
        };
      case "midmorning_snack":
        return {
          icon: <Coffee className="w-4 h-4 text-pink-600" />,
          colorClass: "bg-pink-50/30 border-pink-100/50 text-pink-950",
          accentColor: "border-pink-400",
          tag: "Fuel",
          tagColor: "bg-pink-100/60 text-pink-800"
        };
      case "sleep_prep":
      case "sleep":
        return {
          icon: <Moon className="w-4 h-4 text-violet-600" />,
          colorClass: "bg-violet-50/30 border-violet-100/50 text-violet-950",
          accentColor: "border-violet-400",
          tag: "Rest",
          tagColor: "bg-violet-100/60 text-violet-800"
        };
      default:
        return {
          icon: <Calendar className="w-4 h-4 text-gray-600" />,
          colorClass: "bg-gray-50 border-gray-150 text-gray-950",
          accentColor: "border-gray-400",
          tag: "Event",
          tagColor: "bg-gray-100 text-gray-800"
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Daily Routine Planner</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your training schedule, recovery, and lifestyle routine</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setHasOnboarded(false)}
            className="flex items-center gap-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-bold bg-white"
          >
            Update Onboarding
          </button>
          <button 
            onClick={handleRegenerate}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors text-sm font-bold shadow-md shadow-gray-950/10"
          >
            <RefreshCw size={14} /> Regenerate Plan
          </button>
        </div>
      </div>

      {/* Progression Suggestion Card */}
      {suggestion && (
        <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 text-white rounded-3xl p-5 border border-indigo-800/50 shadow-xl flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-500/25 rounded-2xl flex items-center justify-center text-indigo-300 shrink-0 border border-indigo-500/30">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-300 mb-1">Weekly Progression Engine</h3>
            <p className="text-gray-200 text-sm leading-relaxed">{suggestion}</p>
          </div>
        </div>
      )}

      {/* Fatigue check-in notification */}
      {plan?.fatigue_notification && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-pulse">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-bold">Auto-Adjustment Active</p>
            <p className="text-xs text-amber-800 leading-normal mt-0.5">{plan.fatigue_notification}</p>
          </div>
        </div>
      )}

      {/* Week planner bar */}
      <div className="grid grid-cols-7 gap-2">
        {plan?.plan?.map((day, idx) => {
          const isSelected = idx === activeDayIndex;
          const isRest = day.type === "rest" || day.label?.toLowerCase().includes("recovery");
          const rating = ratings[idx];
          const isToday = new Date().getDay() === (idx === 6 ? 0 : idx + 1);
          
          return (
            <button
              key={day.day}
              onClick={() => setActiveDayIndex(idx)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                isSelected 
                  ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105" 
                  : "bg-white border-gray-100 hover:border-orange-200 text-gray-700 shadow-sm"
              }`}
            >
              <span className={`text-[10px] uppercase font-black ${isSelected ? 'text-orange-100' : 'text-gray-400'}`}>
                {day.day.substring(0, 3)}
              </span>
              <span className="text-base font-black mt-0.5">{idx + 1}</span>
              
              {/* Type indicator or status */}
              <div className="mt-2 flex items-center justify-center">
                {rating ? (
                  <CheckCircle2 size={14} className={isSelected ? "text-white" : "text-emerald-500"} />
                ) : isRest ? (
                  <span className={`text-[9px] font-bold px-1 rounded ${isSelected ? "bg-orange-600 text-white" : "bg-emerald-50 text-emerald-700"}`}>Rest</span>
                ) : (
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    day.intensity === "heavy" 
                      ? "bg-rose-500" 
                      : day.intensity === "moderate" 
                      ? "bg-amber-500" 
                      : "bg-emerald-500"
                  }`} />
                )}
              </div>
              
              {isToday && (
                <span className={`text-[8px] font-bold mt-1 px-1 rounded uppercase tracking-wider ${isSelected ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700'}`}>
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Routine Planner */}
      {currentDayPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline Planner (Left column, takes 2/3 of grid) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Clock className="text-orange-500" size={20} />
                <span>Daily Schedule — {currentDayPlan.day}</span>
              </h2>
              <p className="text-gray-500 text-xs mt-0.5 capitalize">{currentDayPlan.label} • Week {plan.week_number}</p>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pt-2">
              {currentDayPlan.routine && currentDayPlan.routine.length > 0 ? (
                <div className="space-y-0 relative">
                  {currentDayPlan.routine.map((block, idx) => {
                    const config = getBlockConfig(block.type, block.is_training, block.is_recovery);
                    
                    return (
                      <div key={idx} className="relative pl-12 md:pl-28 group">
                        {/* Left Time Label (Desktop only) */}
                        <div className="hidden md:block absolute left-0 top-1.5 w-20 text-right text-xs font-black text-gray-400 uppercase tracking-wide group-hover:text-orange-500 transition-colors">
                          {block.time}
                        </div>
                        
                        {/* Vertical line and dot */}
                        <div className="absolute left-6 md:left-24 top-2 bottom-0 flex flex-col items-center">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 bg-white z-10 flex items-center justify-center transition-all group-hover:scale-125 ${
                            block.is_training ? "border-orange-500 ring-4 ring-orange-100" :
                            block.is_recovery ? "border-emerald-500 ring-4 ring-emerald-100" :
                            "border-gray-300 ring-4 ring-gray-100"
                          }`} />
                          
                          {/* Connecting vertical line (skip on the last element) */}
                          {idx !== currentDayPlan.routine.length - 1 && (
                            <div className="w-0.5 flex-1 bg-gray-200 -mt-1 group-hover:bg-orange-200 transition-colors" />
                          )}
                        </div>

                        {/* Event Card */}
                        <div className="pb-6">
                          <div 
                            onClick={() => {
                              if (block.workout) {
                                setSelectedBlock(block);
                              }
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                              block.workout ? "cursor-pointer hover:shadow-md hover:scale-[1.01]" : ""
                            } ${
                              block.is_training 
                                ? "bg-gradient-to-br from-orange-50/70 to-orange-50/20 border-orange-100 hover:border-orange-300" 
                                : block.is_recovery 
                                ? "bg-gradient-to-br from-emerald-50/70 to-emerald-50/20 border-emerald-100 hover:border-emerald-300"
                                : "bg-white border-gray-100 hover:border-gray-300"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="md:hidden text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                                  {block.time}
                                </span>
                                <h3 className="font-extrabold text-gray-950 text-base leading-tight">
                                  {block.activity}
                                </h3>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${config.tagColor}`}>
                                  {config.tag}
                                </span>
                                {block.duration_min && (
                                  <span className="text-[10px] font-bold bg-white/80 border border-gray-200/60 px-2 py-0.5 rounded-full flex items-center gap-0.5 text-gray-600">
                                    <Timer size={10} /> {block.duration_min}m
                                  </span>
                                )}
                                {block.intensity && (
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    block.intensity.toLowerCase() === "heavy" ? "bg-rose-100 text-rose-800 border border-rose-200" :
                                    block.intensity.toLowerCase() === "moderate" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                                    "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  }`}>
                                    {block.intensity}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-500 leading-relaxed">
                              {block.description}
                            </p>
                            
                            {block.workout && (
                              <div className="mt-3 flex items-center gap-1.5 text-xs font-extrabold text-orange-600 group-hover:text-orange-700 transition-colors">
                                <Dumbbell size={13} className="animate-pulse" />
                                <span>Click to view workout details & exercises</span>
                                <ChevronRight size={13} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 italic">
                  No routine blocks generated for today.
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar: Context info & summary stats (Takes 1/3 of grid) */}
          <div className="space-y-6">
            {/* Quick Completion / Day Rating Panel */}
            {!currentDayPlan.label?.toLowerCase().includes("recovery") && currentDayPlan.type !== "rest" && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-4">
                <h3 className="font-black text-gray-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-orange-500" />
                  <span>Session Completion</span>
                </h3>
                
                {currentDayRating ? (
                  <div className="flex items-center justify-between bg-orange-50/50 rounded-xl p-3 border border-orange-100/50">
                    <div className="flex items-center gap-2">
                      {currentDayRating === "easy" && <Smile className="text-emerald-500" />}
                      {currentDayRating === "okay" && <Meh className="text-amber-500" />}
                      {currentDayRating === "hard" && <Frown className="text-rose-500" />}
                      <div>
                        <p className="text-[10px] text-gray-400">Difficulty rated</p>
                        <p className="text-xs font-black text-gray-800 uppercase tracking-wide">{currentDayRating}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setRatings(prev => {
                        const copy = { ...prev };
                        delete copy[activeDayIndex];
                        return copy;
                      })}
                      className="text-[10px] font-bold text-gray-500 hover:text-red-500 px-2 py-1 rounded-lg border border-gray-200 bg-white hover:bg-red-50 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 mb-3">Completed today's session? Log your feedback directly below:</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleRateSession(activeDayIndex, "easy")}
                        disabled={submittingRating !== null}
                        className="flex flex-col items-center gap-1 py-2 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/30 text-gray-700 hover:text-emerald-800 font-extrabold text-[10px] transition-all"
                      >
                        <Smile className="text-emerald-500" size={16} />
                        Easy
                      </button>
                      <button
                        onClick={() => handleRateSession(activeDayIndex, "okay")}
                        disabled={submittingRating !== null}
                        className="flex flex-col items-center gap-1 py-2 bg-white border border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50/30 text-gray-700 hover:text-amber-800 font-extrabold text-[10px] transition-all"
                      >
                        <Meh className="text-amber-500" size={16} />
                        Okay
                      </button>
                      <button
                        onClick={() => handleRateSession(activeDayIndex, "hard")}
                        disabled={submittingRating !== null}
                        className="flex flex-col items-center gap-1 py-2 bg-white border border-gray-200 rounded-xl hover:border-rose-500 hover:bg-rose-50/30 text-gray-700 hover:text-rose-800 font-extrabold text-[10px] transition-all"
                      >
                        <Frown className="text-rose-500" size={16} />
                        Hard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Preferences */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-4">
              <h3 className="font-black text-gray-900 text-sm">Routine Preferences</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400 font-semibold">Sport</span>
                  <span className="text-gray-800 font-extrabold">{onboarding.sport}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400 font-semibold">Experience Level</span>
                  <span className="text-gray-800 font-extrabold">{onboarding.experience_level}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400 font-semibold">Weekly Target</span>
                  <span className="text-gray-800 font-extrabold">{onboarding.training_days_per_week} Sessions</span>
                </div>
              </div>
            </div>

            {/* Equipment list */}
            {onboarding.available_equipment.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-3">
                <h3 className="font-black text-gray-900 text-sm">Active Equipment List</h3>
                <div className="flex flex-wrap gap-1.5">
                  {onboarding.available_equipment.map(item => (
                    <span key={item} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Physical limitations info */}
            {onboarding.physical_limitations.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-3">
                <h3 className="font-black text-gray-900 text-sm">Tailoring constraints</h3>
                <div className="flex flex-wrap gap-1.5">
                  {onboarding.physical_limitations.map(item => (
                    <span key={item} className="px-2.5 py-1 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs font-bold">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prior Injury History info */}
            {onboarding.injury_history && onboarding.injury_history.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-3">
                <h3 className="font-black text-gray-900 text-sm">Prior Injury History</h3>
                <div className="flex flex-wrap gap-1.5">
                  {onboarding.injury_history.map(item => (
                    <span key={item} className="px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-lg text-xs font-bold">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-Over / Bottom Sheet Drawer */}
      {selectedBlock && (() => {
        const { exercises, adaptations } = parseWorkoutPlan(selectedBlock.workout?.main_plan);
        const isTrainingBlock = selectedBlock.is_training;
        
        return (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop overlay */}
            <div 
              onClick={() => setSelectedBlock(null)}
              className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm transition-opacity"
            />
            
            {/* Slide-over panel */}
            <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    isTrainingBlock ? "bg-orange-50 border-orange-100 text-orange-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                  }`}>
                    {isTrainingBlock ? <Dumbbell size={18} /> : <Heart size={18} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                      {selectedBlock.time} • {isTrainingBlock ? "Training block" : "Recovery block"}
                    </p>
                    <h3 className="text-lg font-black text-gray-955">{selectedBlock.activity}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBlock(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  {selectedBlock.duration_min && (
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black">Duration</p>
                      <p className="text-sm font-extrabold text-gray-700 flex items-center gap-1 mt-0.5">
                        <Timer size={14} className="text-gray-400" /> {selectedBlock.duration_min} mins
                      </p>
                    </div>
                  )}
                  {selectedBlock.intensity && (
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black">Intensity</p>
                      <p className="text-sm font-extrabold text-gray-700 mt-0.5 capitalize">
                        {selectedBlock.intensity}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-wide">Focus & Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedBlock.description}</p>
                </div>

                {/* Warmup */}
                {selectedBlock.workout?.warmup && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wide">1. Warm-up Activation</h4>
                    <div className="bg-orange-50/20 border border-orange-100/30 rounded-2xl p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedBlock.workout.warmup}</p>
                    </div>
                  </div>
                )}

                {/* Main Plan Exercises */}
                {exercises.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wide">2. Main Workout Routine</h4>
                    <p className="text-[10px] text-gray-400 italic">Check off each exercise as you perform them:</p>
                    <div className="space-y-2">
                      {exercises.map((ex, index) => {
                        const checkKey = `${activeDayIndex}-${index}`;
                        const isChecked = !!checkedExercises[checkKey];
                        return (
                          <div 
                            key={index}
                            onClick={() => toggleExercise(checkKey)}
                            className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              isChecked 
                                ? "bg-emerald-50/40 border-emerald-100/50 text-gray-400 line-through" 
                                : "bg-white border-gray-100 hover:border-gray-200 text-gray-800"
                            }`}
                          >
                            <button 
                              className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                isChecked 
                                  ? "bg-emerald-500 border-emerald-500 text-white" 
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {isChecked && <CheckCircle2 size={12} className="stroke-[3]" />}
                            </button>
                            <div className="flex-1">
                              <p className={`text-sm font-extrabold ${isChecked ? "text-gray-400" : "text-gray-900"}`}>{ex.name}</p>
                              {ex.prescription && (
                                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 ${
                                  isChecked ? "bg-gray-100 text-gray-400" : "bg-orange-50 text-orange-700 border border-orange-100/50"
                                }`}>
                                  {ex.prescription}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Coach Adaptations */}
                {adaptations && (
                  <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 flex gap-3">
                    <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                    <div>
                      <h5 className="text-xs font-extrabold text-amber-800 uppercase tracking-wide">Coach Adaptations</h5>
                      <p className="text-xs text-amber-700 leading-normal mt-1">{adaptations}</p>
                    </div>
                  </div>
                )}

                {/* Cooldown */}
                {selectedBlock.workout?.cooldown && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wide">3. Cool-down & Recovery</h4>
                    <div className="bg-blue-50/20 border border-blue-100/30 rounded-2xl p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedBlock.workout.cooldown}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Footer with Session Rating */}
              {isTrainingBlock && (
                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-3">Rate session difficulty</p>
                  {currentDayRating ? (
                    <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-orange-100/80">
                      <div className="flex items-center gap-2">
                        {currentDayRating === "easy" && <Smile className="text-emerald-500" />}
                        {currentDayRating === "okay" && <Meh className="text-amber-500" />}
                        {currentDayRating === "hard" && <Frown className="text-rose-500" />}
                        <div>
                          <p className="text-[10px] text-gray-400">Difficulty rated</p>
                          <p className="text-xs font-black text-gray-800 uppercase tracking-wide">{currentDayRating}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setRatings(prev => {
                          const copy = { ...prev };
                          delete copy[activeDayIndex];
                          return copy;
                        })}
                        className="text-xs font-bold text-gray-500 hover:text-red-500 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-red-50 transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleRateSession(activeDayIndex, "easy")}
                        disabled={submittingRating !== null}
                        className="flex flex-col items-center gap-1 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/30 text-gray-700 hover:text-emerald-800 font-extrabold text-xs transition-all"
                      >
                        <Smile className="text-emerald-500" size={20} />
                        Easy
                      </button>
                      <button
                        onClick={() => handleRateSession(activeDayIndex, "okay")}
                        disabled={submittingRating !== null}
                        className="flex flex-col items-center gap-1 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-amber-500 hover:bg-amber-50/30 text-gray-700 hover:text-amber-800 font-extrabold text-xs transition-all"
                      >
                        <Meh className="text-amber-500" size={20} />
                        Okay
                      </button>
                      <button
                        onClick={() => handleRateSession(activeDayIndex, "hard")}
                        disabled={submittingRating !== null}
                        className="flex flex-col items-center gap-1 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-rose-500 hover:bg-rose-50/30 text-gray-700 hover:text-rose-800 font-extrabold text-xs transition-all"
                      >
                        <Frown className="text-rose-500" size={20} />
                        Hard
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

