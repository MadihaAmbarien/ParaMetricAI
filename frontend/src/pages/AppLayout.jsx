import { useEffect, useState } from "react";
import { useNavigate, Outlet, NavLink } from "react-router-dom";
import { Activity, Utensils, Brain, LayoutDashboard, LogOut, ChevronDown, User, ShieldAlert } from "lucide-react";

export default function AppLayout() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("profile_id")) navigate("/login");
    setName(localStorage.getItem("profile_name") || "Athlete");
  }, [navigate]);

  function logout() {
    localStorage.removeItem("profile_id");
    localStorage.removeItem("profile_name");
    navigate("/");
  }

  const nav = [
    { to: "/app", label: "Dashboard", icon: <LayoutDashboard size={17} />, end: true },
    { to: "/app/routine", label: "Routine", icon: <Activity size={17} /> },
    { to: "/app/nutrition", label: "Nutrition", icon: <Utensils size={17} /> },
    { to: "/app/fatigue", label: "Fatigue", icon: <Brain size={17} /> },
    { to: "/app/injury", label: "Injury Risk", icon: <ShieldAlert size={17} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center">
              <Activity size={15} className="text-white" />
            </div>
            <span className="font-black text-lg text-gray-900 hidden sm:block">Para<span className="text-orange-500">Metric</span></span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {nav.map(({ to, label, icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all
                  ${isActive ? "bg-orange-500 text-white shadow-sm" : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"}`
                }>
                {icon} <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </div>

          {/* User menu */}
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-700 hidden sm:block max-w-[100px] truncate">{name}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-44 z-50">
                <div className="px-4 py-2 border-b border-gray-50">
                  <p className="text-xs text-gray-400">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-700 truncate">{name}</p>
                </div>
                <button onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-4 py-6" onClick={() => showMenu && setShowMenu(false)}>
        <Outlet />
      </main>
    </div>
  );
}
