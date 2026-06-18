export default function NutrientBar({ label, current, target, unit, color = "bg-orange-500" }) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const status = pct >= 90 ? "text-green-600" : pct >= 60 ? "text-yellow-600" : "text-red-500";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-xs font-bold ${status}`}>
          {current.toFixed(1)}{unit} / {target.toFixed(1)}{unit}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-end">
        <span className={`text-xs font-bold ${status}`}>{pct}%</span>
      </div>
    </div>
  );
}
