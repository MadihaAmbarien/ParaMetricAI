import React, { useState } from "react";
import { ShieldAlert, Info, CheckCircle2, Trash2 } from "lucide-react";

const PARTS_CONFIG = [
  // FRONT PARTS
  { id: "neck_f", label: "Neck", area: "Neck", x: 100, y: 45, view: "front" },
  { id: "shoulder_l", label: "Left Shoulder", area: "Shoulder", x: 65, y: 70, view: "front" },
  { id: "shoulder_r", label: "Right Shoulder", area: "Shoulder", x: 135, y: 70, view: "front" },
  { id: "elbow_l", label: "Left Elbow", area: "Elbow", x: 50, y: 120, view: "front" },
  { id: "elbow_r", label: "Right Elbow", area: "Elbow", x: 150, y: 120, view: "front" },
  { id: "wrist_l", label: "Left Wrist", area: "Wrist", x: 35, y: 165, view: "front" },
  { id: "wrist_r", label: "Right Wrist", area: "Wrist", x: 165, y: 165, view: "front" },
  { id: "hand_l", label: "Left Hand", area: "Hand", x: 25, y: 195, view: "front" },
  { id: "hand_r", label: "Right Hand", area: "Hand", x: 175, y: 195, view: "front" },
  { id: "hip_l", label: "Left Hip", area: "Hip", x: 80, y: 175, view: "front" },
  { id: "hip_r", label: "Right Hip", area: "Hip", x: 120, y: 175, view: "front" },
  { id: "knee_l", label: "Left Knee", area: "Knee", x: 75, y: 250, view: "front" },
  { id: "knee_r", label: "Right Knee", area: "Knee", x: 125, y: 250, view: "front" },
  { id: "ankle_l", label: "Left Ankle", area: "Ankle", x: 75, y: 320, view: "front" },
  { id: "ankle_r", label: "Right Ankle", area: "Ankle", x: 125, y: 320, view: "front" },
  { id: "foot_l", label: "Left Foot", area: "Foot", x: 70, y: 350, view: "front" },
  { id: "foot_r", label: "Right Foot", area: "Foot", x: 130, y: 350, view: "front" },

  // BACK PARTS
  { id: "neck_b", label: "Neck (Back)", area: "Neck", x: 100, y: 45, view: "back" },
  { id: "back_upper", label: "Upper Back", area: "Back", x: 100, y: 90, view: "back" },
  { id: "back_lower", label: "Lower Back", area: "Back", x: 100, y: 140, view: "back" },
  { id: "shoulder_l_b", label: "Left Shoulder", area: "Shoulder", x: 65, y: 70, view: "back" },
  { id: "shoulder_r_b", label: "Right Shoulder", area: "Shoulder", x: 135, y: 70, view: "back" },
  { id: "elbow_l_b", label: "Left Elbow", area: "Elbow", x: 50, y: 120, view: "back" },
  { id: "elbow_r_b", label: "Right Elbow", area: "Elbow", x: 150, y: 120, view: "back" },
  { id: "wrist_l_b", label: "Left Wrist", area: "Wrist", x: 35, y: 165, view: "back" },
  { id: "wrist_r_b", label: "Right Wrist", area: "Wrist", x: 165, y: 165, view: "back" },
  { id: "hip_l_b", label: "Left Hip", area: "Hip", x: 80, y: 175, view: "back" },
  { id: "hip_r_b", label: "Right Hip", area: "Hip", x: 120, y: 175, view: "back" },
  { id: "knee_l_b", label: "Left Knee", area: "Knee", x: 75, y: 250, view: "back" },
  { id: "knee_r_b", label: "Right Knee", area: "Knee", x: 125, y: 250, view: "back" },
  { id: "ankle_l_b", label: "Left Ankle", area: "Ankle", x: 75, y: 320, view: "back" },
  { id: "ankle_r_b", label: "Right Ankle", area: "Ankle", x: 125, y: 320, view: "back" },
];

export default function BodyDiagram({ painReports = [], onChange }) {
  const [activeTab, setActiveTab] = useState("front"); // 'front' or 'back'
  const [selectedPart, setSelectedPart] = useState(null); // part config object
  const [severity, setSeverity] = useState("Mild");
  const [notes, setNotes] = useState("");

  // Find existing report for a specific body part ID
  const getReportForId = (partId) => {
    return painReports.find((r) => r.id === partId);
  };

  const getReportForArea = (areaName) => {
    return painReports.find((r) => r.body_part.toLowerCase() === areaName.toLowerCase());
  };

  const handlePartClick = (part) => {
    setSelectedPart(part);
    const existing = getReportForId(part.id);
    if (existing) {
      setSeverity(existing.severity);
      setNotes(existing.notes || "");
    } else {
      setSeverity("Mild");
      setNotes("");
    }
  };

  const saveReport = () => {
    if (!selectedPart) return;

    const filtered = painReports.filter((r) => r.id !== selectedPart.id);
    const updated = [
      ...filtered,
      {
        id: selectedPart.id,
        body_part: selectedPart.area,
        label: selectedPart.label,
        severity,
        notes,
      },
    ];

    onChange(updated);
    setSelectedPart(null);
  };

  const removeReport = () => {
    if (!selectedPart) return;
    const filtered = painReports.filter((r) => r.id !== selectedPart.id);
    onChange(filtered);
    setSelectedPart(null);
  };

  const getSeverityColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case "severe":
        return "bg-red-500 shadow-red-500/50";
      case "moderate":
        return "bg-amber-500 shadow-amber-500/50";
      case "mild":
        return "bg-emerald-500 shadow-emerald-500/50";
      default:
        return "bg-gray-400";
    }
  };

  // Silhouette outline path coordinates
  const silhouettePath = `
    M 100 20 
    C 92 20, 88 24, 88 32
    C 88 38, 92 42, 100 42
    C 108 42, 112 38, 112 32
    C 112 24, 108 20, 100 20 Z
    M 95 43 L 105 43 L 107 48 L 93 48 Z
    M 93 49 C 80 50, 68 58, 62 68
    C 58 75, 54 90, 52 110
    C 50 120, 48 135, 42 148
    C 38 155, 34 165, 30 180
    L 24 205 L 29 207 L 35 185
    C 38 175, 41 162, 45 152
    L 48 128 L 52 165
    C 55 185, 58 200, 62 215
    L 65 235 L 61 280
    L 59 315 L 63 345
    L 58 355 L 75 358 L 85 353
    L 90 280 L 93 210
    L 100 210 L 107 210 L 110 280
    L 115 353 L 125 358 L 142 355
    L 137 345 L 141 315 L 139 280
    L 135 235 L 138 165
    C 142 200, 145 185, 148 165
    L 152 128 L 155 152
    C 159 162, 162 175, 165 185
    L 171 207 L 176 205 L 170 180
    C 166 165, 162 155, 158 148
    C 152 135, 150 120, 148 110
    C 146 90, 142 75, 138 68
    C 132 58, 120 50, 107 49 Z
  `;

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex justify-between items-center bg-white/5 p-1 rounded-2xl border border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab("front")}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === "front"
              ? "bg-orange-500 text-white shadow"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          FRONT VIEW
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("back")}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === "back"
              ? "bg-orange-500 text-white shadow"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          BACK VIEW
        </button>
      </div>

      <div className="relative bg-white/5 rounded-3xl p-4 border border-white/10 flex flex-col items-center justify-center min-h-[400px]">
        {/* Silhouette SVG */}
        <svg
          viewBox="0 0 200 400"
          className="w-full max-w-[260px] h-[380px] select-none transition-all duration-300"
        >
          {/* Main Body Path */}
          <path
            d={silhouettePath}
            fill="#1f2937"
            stroke="#374151"
            strokeWidth="2"
            className="transition-colors duration-300"
          />

          {/* Render interactive Hotspots for this view */}
          {PARTS_CONFIG.filter((p) => p.view === activeTab).map((part) => {
            const report = getReportForId(part.id);
            const isSelected = selectedPart?.id === part.id;
            const hasPain = !!report;

            return (
              <g key={part.id} className="cursor-pointer" onClick={() => handlePartClick(part)}>
                {/* Hotspot Outer Glow ring if active/has pain */}
                <circle
                  cx={part.x}
                  cy={part.y}
                  r={isSelected ? 16 : hasPain ? 12 : 8}
                  className={`transition-all duration-300 fill-transparent stroke-2 ${
                    isSelected
                      ? "stroke-orange-500 animate-pulse"
                      : hasPain
                      ? report.severity === "Severe"
                        ? "stroke-red-500"
                        : report.severity === "Moderate"
                        ? "stroke-amber-500"
                        : "stroke-emerald-500"
                      : "stroke-transparent hover:stroke-gray-500"
                  }`}
                />

                {/* Hotspot Inner Dot */}
                <circle
                  cx={part.x}
                  cy={part.y}
                  r={isSelected ? 7 : hasPain ? 6 : 4}
                  className={`transition-all duration-300 ${
                    isSelected
                      ? "fill-orange-500"
                      : hasPain
                      ? report.severity === "Severe"
                        ? "fill-red-500"
                        : report.severity === "Moderate"
                        ? "fill-amber-500"
                        : "fill-emerald-500"
                      : "fill-gray-500 hover:fill-gray-300"
                  }`}
                />
              </g>
            );
          })}
        </svg>

        {/* Selected Part Overlay Setup */}
        {selectedPart && (
          <div className="absolute inset-0 bg-gray-950/90 rounded-3xl p-5 flex flex-col justify-between z-10 animate-fade-in border border-white/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-orange-400 font-extrabold uppercase tracking-widest">
                    Log Discomfort
                  </span>
                  <h4 className="text-base font-black text-white">{selectedPart.label}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPart(null)}
                  className="text-gray-400 hover:text-white text-xs font-bold px-2.5 py-1 bg-white/5 rounded-lg border border-white/10"
                >
                  Cancel
                </button>
              </div>

              {/* Severity buttons */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-bold block">Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Mild", "Moderate", "Severe"].map((level) => {
                    const color =
                      level === "Severe"
                        ? "border-red-500 text-red-400 bg-red-950/20"
                        : level === "Moderate"
                        ? "border-amber-500 text-amber-400 bg-amber-950/20"
                        : "border-emerald-500 text-emerald-400 bg-emerald-950/20";
                    const active = severity === level;

                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSeverity(level)}
                        className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                          active
                            ? color
                            : "border-white/10 text-gray-400 hover:text-gray-200 bg-white/5"
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Notes */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-bold block">Optional notes</label>
                <input
                  type="text"
                  placeholder="e.g. twinge on impact, stiff in morning"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
              {getReportForId(selectedPart.id) && (
                <button
                  type="button"
                  onClick={removeReport}
                  className="px-3 py-3 rounded-xl border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-red-400 flex items-center justify-center transition-colors"
                  title="Remove Pain Report"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={saveReport}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-black rounded-xl shadow-lg transition-all"
              >
                Save Report
              </button>
            </div>
          </div>
        )}

        {/* Floating Help Banner */}
        {!selectedPart && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/5 border border-white/10 p-3 rounded-2xl flex items-start gap-2 backdrop-blur">
            <Info size={14} className="text-orange-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-400 leading-normal">
              Tap any point to log discomfort. Green indicates Mild, Amber is Moderate, and Red is Severe pain.
            </p>
          </div>
        )}
      </div>

      {/* Logged Pain reports list */}
      {painReports.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 space-y-2">
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldAlert size={14} className="text-orange-400" />
            <p className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Pain Logs ({painReports.length})
            </p>
          </div>
          <div className="space-y-1.5">
            {painReports.map((rep) => (
              <div
                key={rep.id}
                className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${getSeverityColor(rep.severity)}`} />
                  <div>
                    <span className="font-extrabold text-white">{rep.label}</span>
                    <span className="text-gray-400 ml-1">({rep.severity})</span>
                    {rep.notes && (
                      <p className="text-[10px] text-gray-500 italic mt-0.5">"{rep.notes}"</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onChange(painReports.filter((r) => r.id !== rep.id));
                  }}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
