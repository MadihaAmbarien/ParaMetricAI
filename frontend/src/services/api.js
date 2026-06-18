const BASE = "";

function headers() {
  const pid = localStorage.getItem("profile_id");
  return { "Content-Type": "application/json", ...(pid ? { "x-profile-id": pid } : {}) };
}

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { headers: headers(), ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  signup: (d) => req("/api/auth/signup", { method: "POST", body: JSON.stringify(d) }),
  login: (d) => req("/api/auth/login", { method: "POST", body: JSON.stringify(d) }),

  getRDA: () => req("/api/nutrition/rda"),
  getWeeklyPlan: () => req("/api/nutrition/meals/weekly"),
  generateWeeklyPlan: () => req("/api/nutrition/meals/weekly", { method: "POST" }),
  swapMeal: (d) => req("/api/nutrition/meals/swap", { method: "POST", body: JSON.stringify(d) }),
  getSwapOptions: (cat) => req(`/api/nutrition/meals/swap-options?category=${encodeURIComponent(cat)}`),
  searchFoods: (q) => req(`/api/nutrition/meals/foods?q=${encodeURIComponent(q)}`),
  logDaily: (d) => req("/api/nutrition/log", { method: "POST", body: JSON.stringify(d) }),
  getDailyNutrients: (date) => req(`/api/nutrition/daily/${date}`),
  getCompliance: () => req("/api/nutrition/compliance/weekly"),

  checkin: (d) => req("/api/fatigue/checkin", { method: "POST", body: JSON.stringify(d) }),
  getToday: () => req("/api/fatigue/today"),
  getHistory: (days = 14) => req(`/api/fatigue/history?days=${days}`),

  // Routine planner
  getOnboarding: () => req("/api/routine/onboard"),
  saveOnboarding: (d) => req("/api/routine/onboard", { method: "POST", body: JSON.stringify(d) }),
  generatePlan: () => req("/api/routine/generate", { method: "POST" }),
  getPlan: () => req("/api/routine/plan"),
  rateSession: (d) => req("/api/routine/rate", { method: "POST", body: JSON.stringify(d) }),
  getRatings: () => req("/api/routine/ratings"),
  getProgress: () => req("/api/routine/progress"),

  getInjuryStatus: () => req("/api/injury/status"),
  getInjuryAnalytics: () => req("/api/injury/analytics"),
};
