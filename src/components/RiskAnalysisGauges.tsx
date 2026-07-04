import React from "react";
import { AlertTriangle, ShieldCheck, Droplet, Wind, RefreshCw } from "lucide-react";
import { CityMetrics } from "../types";

interface RiskAnalysisGaugesProps {
  metrics: CityMetrics;
}

export default function RiskAnalysisGauges({ metrics, theme = "light" }: RiskAnalysisGaugesProps & { theme?: "light" | "dark" }) {
  
  const getGaugeColor = (score: number, invert = false) => {
    // If invert is true, higher score is WORSE (like flood risk)
    // If invert is false, higher score is BETTER (like safety score)
    const normalized = invert ? 100 - score : score;
    if (normalized >= 75) return "stroke-emerald-500 text-emerald-600";
    if (normalized >= 50) return "stroke-amber-500 text-amber-600";
    return "stroke-rose-500 text-rose-600";
  };

  const renderGauge = (label: string, score: number, icon: React.ReactNode, invert = false) => {
    const radius = 24;
    const strokeWidth = 3.5;
    const circumference = 2 * Math.PI * radius;
    // We render a 3/4 gauge (from bottom-left to bottom-right)
    // Offset represents standard circular stroke-dasharray properties
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const gaugeColor = getGaugeColor(score, invert);

    return (
      <div className={`flex flex-col items-center justify-center p-3 border rounded-2xl relative text-center shadow-xs ${
        theme === "dark" ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50/50"
      }`}>
        {/* Main circular track */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              className={`${theme === "dark" ? "stroke-slate-800" : "stroke-slate-200"} fill-none`}
              strokeWidth={strokeWidth}
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              className={`fill-none transition-all duration-1000 ${gaugeColor.split(" ")[0]}`}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Central score layout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-lg font-black ${theme === "dark" ? "text-slate-100" : "text-slate-800"}`}>{score}%</span>
            <div className={`p-1 border rounded mt-0.5 ${
              theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
            } ${gaugeColor.split(" ")[1]}`}>
              {icon}
            </div>
          </div>
        </div>

        <h4 className={`text-[10px] font-extrabold mt-2.5 font-mono uppercase tracking-wider ${
          theme === "dark" ? "text-slate-300" : "text-slate-700"
        }`}>{label}</h4>
        <span className="text-[9px] font-mono text-slate-500 mt-0.5">
          {invert
            ? score > 60 ? "Critical Threat" : score > 35 ? "Elevated Alert" : "Stable Flow"
            : score > 75 ? "Excellent Safe" : score > 50 ? "Moderate Alert" : "High Hazard"
          }
        </span>
      </div>
    );
  };

  return (
    <div className={`border rounded-2xl p-4 shadow-xs ${
      theme === "dark" ? "border-slate-850 bg-slate-900/25" : "border-slate-200 bg-white"
    }`} id="risk-analysis-deck">
      <div className={`flex justify-between items-center border-b pb-2.5 mb-4 ${
        theme === "dark" ? "border-slate-850" : "border-slate-100"
      }`}>
        <div>
          <h3 className={`font-black text-xs uppercase tracking-widest font-mono ${
            theme === "dark" ? "text-slate-200" : "text-blue-900"
          }`}>Real-Time Risk Indices</h3>
          <p className="text-[10px] text-slate-500 font-medium">Vertex AI predictive scores synced with citizen reports and IoT gateways</p>
        </div>
        <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
          theme === "dark" ? "bg-blue-950 text-blue-400 border-blue-900/20" : "bg-blue-50 text-blue-700 border-blue-200"
        }`}>Grounded AI</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {renderGauge("Road Safety Score", metrics.safetyScore, <ShieldCheck className="h-3 w-3" />, false)}
        {renderGauge("Flood Severity Risk", metrics.floodRisk, <Droplet className="h-3 w-3" />, true)}
        {renderGauge("Particulate Pollution", metrics.airQualityIndex, <Wind className="h-3 w-3" />, true)}
        {renderGauge("Traffic Congestion", metrics.trafficIndex, <RefreshCw className="h-3 w-3" />, true)}
        {renderGauge("Accident Probability", metrics.accidentRisk, <AlertTriangle className="h-3 w-3" />, true)}
      </div>
    </div>
  );
}
