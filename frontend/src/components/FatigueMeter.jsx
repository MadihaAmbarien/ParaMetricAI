export default function FatigueMeter({ score = 0, size = 220 }) {
  const r = 80;
  const cx = size / 2;
  const cy = size / 2 + 20;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const valueAngle = startAngle + (score / 100) * totalAngle;

  function polar(angle, radius) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arc(r2, a1, a2) {
    const s = polar(a1, r2), e = polar(a2, r2);
    const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r2} ${r2} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const needle = polar(valueAngle, r - 12);

  const zones = [
    { color: "#22c55e", from: startAngle, to: startAngle + totalAngle * 0.35 },
    { color: "#eab308", from: startAngle + totalAngle * 0.35, to: startAngle + totalAngle * 0.65 },
    { color: "#f97316", from: startAngle + totalAngle * 0.65, to: startAngle + totalAngle * 0.82 },
    { color: "#ef4444", from: startAngle + totalAngle * 0.82, to: endAngle },
  ];

  const label = score < 35 ? { text: "Low Fatigue", color: "#22c55e" }
    : score < 65 ? { text: "Moderate", color: "#eab308" }
    : score < 82 ? { text: "High Fatigue", color: "#f97316" }
    : { text: "Critical", color: "#ef4444" };

  const ticks = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="drop-shadow-2xl">
      {/* Outer glow ring */}
      <circle cx={cx} cy={cy} r={r + 18} fill="none" stroke={label.color} strokeWidth="1" opacity="0.15" />
      <circle cx={cx} cy={cy} r={r + 12} fill="none" stroke={label.color} strokeWidth="1.5" opacity="0.2" />

      {/* Background track */}
      <path d={arc(r, startAngle, endAngle)} fill="none" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" />

      {/* Coloured zone arcs */}
      {zones.map((z, i) => (
        <path key={i} d={arc(r, z.from, z.to)} fill="none" stroke={z.color} strokeWidth="18" strokeLinecap="butt" opacity="0.25" />
      ))}

      {/* Value arc */}
      <path d={arc(r, startAngle, valueAngle)} fill="none" stroke={label.color} strokeWidth="18" strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${label.color})` }} />

      {/* Inner fill */}
      <circle cx={cx} cy={cy} r={r - 12} fill="#0f172a" opacity="0.9" />

      {/* Tick marks */}
      {ticks.map(t => {
        const ta = startAngle + (t / 100) * totalAngle;
        const o = polar(ta, r + 24);
        const i2 = polar(ta, r + 30);
        return <line key={t} x1={o.x} y1={o.y} x2={i2.x} y2={i2.y} stroke="#64748b" strokeWidth="1.5" />;
      })}

      {/* Needle */}
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="white" strokeWidth="2.5" strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))" }} />
      <circle cx={cx} cy={cy} r={6} fill={label.color} style={{ filter: `drop-shadow(0 0 6px ${label.color})` }} />
      <circle cx={cx} cy={cy} r={3} fill="white" />

      {/* Score */}
      <text x={cx} y={cy - 12} textAnchor="middle" fill={label.color} fontSize="34" fontWeight="900"
        style={{ filter: `drop-shadow(0 0 8px ${label.color})` }}>{score}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#94a3b8" fontSize="10">/ 100</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill={label.color} fontSize="10" fontWeight="700">{label.text.toUpperCase()}</text>
    </svg>
  );
}
