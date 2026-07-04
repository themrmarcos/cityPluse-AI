import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  CloudRain,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Clock,
  Shield,
  Users,
  Wrench,
  Info
} from "lucide-react";
import { CityMetrics, Incident } from "../types";

interface ForecastPoint {
  time: string;
  trafficCongestion: number;
  floodRisk: number;
  accidentRisk: number;
}

interface Hotspot {
  location: string;
  metric: string;
  severity: string;
  riskScore: number;
  peakTime: string;
  explanation: string;
}

interface Recommendation {
  recipient: string;
  text: string;
}

interface ForecastResult {
  summary: string;
  forecastPoints: ForecastPoint[];
  hotspots: Hotspot[];
  recommendations: Recommendation[];
}

interface PredictiveAnalyticsProps {
  selectedDistrict: string;
  currentMetrics: CityMetrics;
  incidents: Incident[];
  theme: "light" | "dark";
}

// Generate realistic simulated forecast data in case of fallback or local testing
const getFallbackForecast = (district: string, metrics: CityMetrics): ForecastResult => {
  const times = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "00:00", "02:00", "04:00", "06:00"];
  
  // Create variations depending on current metrics
  const forecastPoints = times.map((t, idx) => {
    // Add typical peak hour curves (e.g. rush hours at idx 0 (8am), idx 5 (6pm))
    const isRushHour = t === "08:00" || t === "16:00" || t === "18:00";
    const isLateNight = t === "00:00" || t === "02:00" || t === "04:00";
    
    let trafficBase = metrics.trafficIndex;
    let floodBase = metrics.floodRisk;
    let accidentBase = metrics.accidentRisk;

    if (isRushHour) {
      trafficBase = Math.min(95, trafficBase + 20);
      accidentBase = Math.min(90, accidentBase + 15);
    } else if (isLateNight) {
      trafficBase = Math.max(10, trafficBase - 35);
      accidentBase = Math.max(15, accidentBase - 20);
    } else {
      trafficBase = Math.min(85, trafficBase + (idx % 2 === 0 ? 5 : -5));
    }

    // Add flood variation based on district and time
    floodBase = Math.min(100, Math.max(5, floodBase + (isLateNight ? 8 : -4) + (idx % 3 === 0 ? 5 : -2)));

    return {
      time: t,
      trafficCongestion: Math.round(trafficBase),
      floodRisk: Math.round(floodBase),
      accidentRisk: Math.round(accidentBase)
    };
  });

  const hotspots: Hotspot[] = [
    {
      location: district === "All Districts" ? "Grand Avenue Bridge Interchange" : `${district} Main Corridor`,
      metric: "Traffic",
      severity: metrics.trafficIndex > 75 ? "high" : "medium",
      riskScore: Math.round(metrics.trafficIndex + 8),
      peakTime: "16:00 - 18:30",
      explanation: "Funnel effect bottleneck compounding heavy commuter outbound egress."
    },
    {
      location: "Riverfront Delta Low Basin",
      metric: "Flood",
      severity: metrics.floodRisk > 60 ? "high" : "medium",
      riskScore: Math.round(metrics.floodRisk + 12),
      peakTime: "22:00 - 02:00",
      explanation: "Tidal storm surge backflow predicted to exceed standard local drainage runoffs."
    },
    {
      location: "East Industrial Expressway Junction",
      metric: "Accident",
      severity: "medium",
      riskScore: Math.round(metrics.accidentRisk + 5),
      peakTime: "08:00 - 10:00",
      explanation: "Intersection lane merging overlap coupled with low-angle morning sun glare."
    }
  ];

  const recommendations: Recommendation[] = [
    {
      recipient: "Citizens",
      text: `Reroute Grand Corridor trips between 16:00-18:30 via alternative arterial passes to avoid an estimated 25-minute delay cycle.`
    },
    {
      recipient: "DoT Operators",
      text: "Pre-stage mobile pump rigs near Riverfront Zone drainage gates and configure adaptive signal priority timings along downtown escape lanes."
    },
    {
      recipient: "Emergency Services",
      text: "Position secondary response units near major expressway mergers during the morning rush hour window to minimize incident clearance delay."
    }
  ];

  return {
    summary: `Atmospheric models and traffic logs predict a highly congested evening peak in [${district}]. Flood risk rises late tonight near drainage channels, while accident probability reaches maximum levels during early morning visibility reductions.`,
    forecastPoints,
    hotspots,
    recommendations
  };
};

export default function PredictiveAnalytics({
  selectedDistrict,
  currentMetrics,
  incidents,
  theme
}: PredictiveAnalyticsProps) {
  const [activeMetric, setActiveMetric] = useState<"traffic" | "flood" | "accident">("traffic");
  const [loading, setLoading] = useState<boolean>(false);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch forecast from server using Gemini
  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gemini/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district: selectedDistrict,
          currentMetrics,
          incidents: incidents.filter(i => i.active)
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with forecasting core.");
      }

      const data = await response.json();
      if (data.summary && data.forecastPoints) {
        setForecast(data);
        setIsSimulated(false);
      } else {
        throw new Error("Invalid schema received.");
      }
    } catch (err: any) {
      console.warn("Falling back to local high-fidelity predictive modeling.", err);
      // Run fallback simulation
      const fallback = getFallbackForecast(selectedDistrict, currentMetrics);
      setForecast(fallback);
      setIsSimulated(true);
    } finally {
      setLoading(false);
    }
  };

  // Run on selected district or metrics change
  useEffect(() => {
    // Prime initial forecast
    const initial = getFallbackForecast(selectedDistrict, currentMetrics);
    setForecast(initial);
    setIsSimulated(true);
  }, [selectedDistrict, currentMetrics]);

  if (!forecast) return null;

  // Render variables for SVG graph
  const points = forecast.forecastPoints;
  const graphWidth = 500;
  const graphHeight = 150;
  const padding = 30;

  // Get active value helper
  const getVal = (pt: ForecastPoint) => {
    if (activeMetric === "traffic") return pt.trafficCongestion;
    if (activeMetric === "flood") return pt.floodRisk;
    return pt.accidentRisk;
  };

  // Convert coordinate points for SVG line path
  const svgPoints = points.map((pt, i) => {
    const val = getVal(pt);
    const x = padding + (i * (graphWidth - padding * 2)) / (points.length - 1);
    const y = graphHeight - padding - (val / 100) * (graphHeight - padding * 2);
    return { x, y, value: val, time: pt.time };
  });

  const linePath = svgPoints.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    return `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  // Area path for shaded color under the curve
  const areaPath = svgPoints.length > 0 
    ? `${linePath} L ${svgPoints[svgPoints.length - 1].x} ${graphHeight - padding} L ${svgPoints[0].x} ${graphHeight - padding} Z`
    : "";

  const metricColors = {
    traffic: {
      stroke: "#3b82f6", // Blue
      fill: "url(#traffic-gradient)",
      glow: "shadow-blue-500/20",
      bgPill: "bg-blue-500/10 text-blue-400 border-blue-500/30"
    },
    flood: {
      stroke: "#10b981", // Emerald
      fill: "url(#flood-gradient)",
      glow: "shadow-emerald-500/20",
      bgPill: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
    },
    accident: {
      stroke: "#f59e0b", // Amber
      fill: "url(#accident-gradient)",
      glow: "shadow-amber-500/20",
      bgPill: "bg-amber-500/10 text-amber-400 border-amber-500/30"
    }
  };

  const currentColor = metricColors[activeMetric];

  return (
    <div className={`border rounded-2xl p-5 shadow-lg transition-all ${
      theme === "dark" ? "border-slate-850 bg-slate-900/50" : "border-slate-200 bg-white"
    }`}>
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-5 border-dashed border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <h3 className={`text-xs font-extrabold uppercase tracking-widest font-mono ${
              theme === "dark" ? "text-slate-300" : "text-slate-700"
            }`}>
              24-Hour Predictive Risk Forecaster
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            AI-modeled spatial analytics of congestions, sudden runoff submersions, and emergency hotspots
          </p>
        </div>

        <button
          onClick={fetchForecast}
          disabled={loading}
          id="recalc-predictive-forecast"
          className={`flex items-center justify-center gap-2 text-xs font-bold font-mono px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
            loading
              ? "bg-slate-950 border-slate-800 text-slate-500 cursor-not-allowed"
              : theme === "dark"
              ? "bg-blue-600 hover:bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/10"
              : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
          }`}
        >
          {loading ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {loading ? "Calculating Models..." : "Run AI Forecast"}
        </button>
      </div>

      {/* Model status bar */}
      <div className={`p-3 rounded-xl mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px] border ${
        theme === "dark" ? "bg-slate-950/40 border-slate-850 text-slate-400" : "bg-slate-50 border-slate-200/60 text-slate-600"
      }`}>
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-normal">{forecast.summary}</p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[9px] uppercase border ${
            isSimulated 
              ? "bg-slate-800 text-slate-300 border-slate-700" 
              : "bg-emerald-950/30 text-emerald-400 border-emerald-500/20"
          }`}>
            {isSimulated ? "Simulated Baseline" : "Live Gemini Agent"}
          </span>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid lg:grid-cols-12 gap-5">
        
        {/* Left Side: 24-Hour Graph (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Metric selector pill-tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "traffic", label: "Traffic Congestion", icon: <TrendingUp className="h-3.5 w-3.5" /> },
                { id: "flood", label: "Flood Inundation", icon: <CloudRain className="h-3.5 w-3.5" /> },
                { id: "accident", label: "Accident Hotspots", icon: <AlertTriangle className="h-3.5 w-3.5" /> }
              ].map(tab => {
                const isActive = activeMetric === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMetric(tab.id as any)}
                    id={`forecast-metric-tab-${tab.id}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isActive
                        ? theme === "dark"
                          ? "bg-slate-950 text-slate-100 border-slate-800 shadow-md shadow-black/25"
                          : "bg-white text-slate-900 border-slate-200 shadow-sm"
                        : theme === "dark"
                        ? "text-slate-500 hover:text-slate-300 border-transparent hover:bg-slate-950/20"
                        : "text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <span className={isActive ? `text-[inherit]` : "text-slate-500"}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SVG Visual Graph Stage */}
            <div className={`p-4 rounded-2xl border relative overflow-hidden flex flex-col justify-end min-h-[200px] h-auto ${
              theme === "dark" ? "bg-[#05080f] border-slate-850" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span>24-Hour Temporal Run</span>
              </div>

              {/* Dynamic SVG Drawing */}
              <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible">
                <defs>
                  {/* Linear gradients for color shading under curve */}
                  <linearGradient id="traffic-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="flood-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="accident-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                {[20, 40, 60, 80, 100].map((val, idx) => {
                  const y = graphHeight - padding - (val / 100) * (graphHeight - padding * 2);
                  return (
                    <g key={idx} className="opacity-10">
                      <line x1={padding} y1={y} x2={graphWidth - padding} y2={y} stroke="white" strokeWidth="0.5" strokeDasharray="3 3" />
                      <text x={padding - 8} y={y + 1.5} fill="white" fontSize="6" textAnchor="end" className="font-mono">{val}%</text>
                    </g>
                  );
                })}

                {/* Shaded Area under path */}
                {areaPath && (
                  <path d={areaPath} fill={currentColor.fill} className="transition-all duration-300" />
                )}

                {/* Stroke line path */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke={currentColor.stroke}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                )}

                {/* Interactive circles */}
                {svgPoints.map((pt, idx) => (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="3"
                      fill={currentColor.stroke}
                      stroke={theme === "dark" ? "#05080f" : "#f8fafc"}
                      strokeWidth="1"
                      className="cursor-pointer hover:r-4.5 transition-all duration-200"
                    />
                    {/* Floating value text just above point */}
                    <text
                      x={pt.x}
                      y={pt.y - 6}
                      fill={currentColor.stroke}
                      fontSize="6.5"
                      textAnchor="middle"
                      fontWeight="bold"
                      className="font-mono"
                    >
                      {pt.value}%
                    </text>
                  </g>
                ))}
              </svg>

              {/* Horizontal axis time tags */}
              <div className="flex justify-between px-2 text-[9px] font-mono text-slate-500 mt-2 border-t border-slate-800/20 pt-2">
                {svgPoints.map((pt, idx) => (
                  <span key={idx}>{pt.time}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Identified Hotspots & Anomalies (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-3.5">
            <h4 className={`text-[10px] font-extrabold uppercase tracking-widest font-mono ${
              theme === "dark" ? "text-slate-300" : "text-slate-700"
            }`}>
              Identified Hotspots & Anomalies
            </h4>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {forecast.hotspots.map((spot, i) => {
                const isHigh = spot.severity === "high";
                const isMed = spot.severity === "medium";
                
                return (
                  <div
                    key={i}
                    className={`p-3 border rounded-xl flex flex-col justify-between gap-1 transition-all ${
                      theme === "dark" 
                        ? "bg-slate-950/40 border-slate-850 hover:bg-slate-950/60" 
                        : "bg-white border-slate-150 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isHigh ? "bg-rose-500 animate-pulse" : isMed ? "bg-amber-400" : "bg-emerald-400"
                        }`} />
                        <h5 className={`text-xs font-extrabold truncate ${
                          theme === "dark" ? "text-slate-200" : "text-slate-800"
                        }`}>
                          {spot.location}
                        </h5>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase tracking-wider border shrink-0 ${
                        isHigh
                          ? "bg-rose-950/30 text-rose-400 border-rose-500/20"
                          : isMed
                          ? "bg-amber-950/30 text-amber-400 border-amber-500/20"
                          : "bg-emerald-950/30 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {spot.severity} risk ({spot.riskScore}%)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 text-[10px] font-mono text-slate-500 mt-1">
                      <span className="font-bold text-slate-400">{spot.metric} risk</span>
                      <span>•</span>
                      <span>Peak: {spot.peakTime}</span>
                    </div>

                    <p className={`text-[10px] mt-1 leading-normal ${
                      theme === "dark" ? "text-slate-400" : "text-slate-600"
                    }`}>
                      {spot.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic AI Action Plans & Directives */}
      <div className="mt-6 pt-5 border-t border-dashed border-slate-800/80">
        <h4 className={`text-[10px] font-extrabold uppercase tracking-widest font-mono mb-4 ${
          theme === "dark" ? "text-slate-300" : "text-slate-700"
        }`}>
          Adaptive AI Tactical Action Directives
        </h4>

        <div className="grid md:grid-cols-3 gap-4">
          {forecast.recommendations.map((rec, i) => {
            const isCitizen = rec.recipient === "Citizens";
            const isDot = rec.recipient === "DoT Operators" || rec.recipient === "DoT Admin";
            
            return (
              <div
                key={i}
                className={`p-3.5 border rounded-2xl flex flex-col gap-2 ${
                  theme === "dark" ? "bg-slate-950/20 border-slate-850" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 border rounded-lg ${
                    isCitizen
                      ? "bg-blue-600/10 border-blue-500/20 text-blue-400"
                      : isDot
                      ? "bg-emerald-600/10 border-emerald-500/20 text-emerald-400"
                      : "bg-amber-600/10 border-amber-500/20 text-amber-400"
                  }`}>
                    {isCitizen ? (
                      <Users className="h-3.5 w-3.5" />
                    ) : isDot ? (
                      <Wrench className="h-3.5 w-3.5" />
                    ) : (
                      <Shield className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <h5 className={`text-xs font-bold font-mono uppercase tracking-wider ${
                    theme === "dark" ? "text-slate-200" : "text-slate-800"
                  }`}>
                    {rec.recipient} Plan
                  </h5>
                </div>

                <p className={`text-[11px] leading-relaxed ${
                  theme === "dark" ? "text-slate-400" : "text-slate-600"
                }`}>
                  {rec.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
