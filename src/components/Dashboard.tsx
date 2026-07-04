import React, { useState } from "react";
import { Shield, Zap, TrendingUp, CloudRain, AlertTriangle, Clock, Download, Filter, FileSpreadsheet, FileText, ChevronDown, Sparkles, X, RefreshCw } from "lucide-react";
import { CityMetrics, UserRole, Incident } from "../types";
import { MOCK_CHART_DATA, CITY_DISTRICTS } from "../data/mockData";
import PredictiveAnalytics from "./PredictiveAnalytics";

interface DashboardProps {
  metrics: CityMetrics;
  userRole: UserRole;
  onDistrictSelect: (districtName: string) => void;
  selectedDistrict: string;
  theme?: "light" | "dark";
  incidents?: Incident[];
}

export default function Dashboard({
  metrics,
  userRole,
  onDistrictSelect,
  selectedDistrict,
  theme = "light",
  incidents = []
}: DashboardProps) {
  const [filterDate, setFilterDate] = useState("Today");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  // Gemini individual card explainer states
  const [explainingMetric, setExplainingMetric] = useState<{
    name: string;
    value: string;
    trend: string;
  } | null>(null);
  const [explanationText, setExplanationText] = useState<string>("");
  const [explainingLoading, setExplainingLoading] = useState<boolean>(false);
  const [explainingError, setExplainingError] = useState<string | null>(null);

  const handleExplainMetric = async (name: string, value: string, trend: string) => {
    setExplainingMetric({ name, value, trend });
    setExplainingLoading(true);
    setExplainingError(null);
    setExplanationText("");

    try {
      const response = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metricName: name,
          metricValue: value,
          metricTrend: trend,
          district: selectedDistrict,
          context: {
            safetyScore: currentMetrics.safetyScore,
            trafficIndex: currentMetrics.trafficIndex,
            airQualityIndex: currentMetrics.airQualityIndex,
            floodRisk: currentMetrics.floodRisk,
            accidentRisk: currentMetrics.accidentRisk,
            avgTravelTime: currentMetrics.avgTravelTime,
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.explanation) {
        setExplanationText(data.explanation);
      } else {
        throw new Error(data.error || "Failed to generate explanation from Gemini API.");
      }
    } catch (err: any) {
      setExplainingError(err.message || "Something went wrong while communicating with Gemini.");
    } finally {
      setExplainingLoading(false);
    }
  };

  // Filter metrics based on selected district if any
  const currentMetrics = React.useMemo(() => {
    if (selectedDistrict === "All Districts") return metrics;
    const districtObj = CITY_DISTRICTS.find(d => d.name === selectedDistrict);
    if (!districtObj) return metrics;

    return {
      safetyScore: districtObj.safety,
      trafficIndex: districtObj.traffic,
      airQualityIndex: districtObj.aqi,
      floodRisk: districtObj.flood,
      accidentRisk: Math.round((districtObj.traffic + districtObj.damage) / 2.5),
      avgTravelTime: Math.round(15 + (districtObj.traffic / 5))
    };
  }, [selectedDistrict, metrics]);

  // Export CSV Data Handler
  const handleExportCSV = () => {
    setExporting("CSV");
    setTimeout(() => {
      const headers = "District,Road Safety Score,Traffic Index,AQI,Flood Risk,Road Damage Score\n";
      const rows = CITY_DISTRICTS.map(
        d => `"${d.name}",${d.safety},${d.traffic},${d.aqi},${d.flood},${d.damage}`
      ).join("\n");
      
      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `CityPulse_Urban_Report_${selectedDistrict.replace(" ", "_")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExporting(null);
    }, 1200);
  };

  // Export PDF Report Mockup
  const handleExportPDF = () => {
    setExporting("PDF");
    setTimeout(() => {
      alert(`Success: System compiled and downloaded full Looker Spatial Analytics Report for [${selectedDistrict}] as a secure digital PDF asset.`);
      setExporting(null);
    }, 1500);
  };

  const getMetricColor = (val: number, type: "safety" | "risk" | "aqi") => {
    const isDark = theme === "dark";
    if (type === "safety") {
      if (val >= 80) return isDark ? "text-emerald-400 border-emerald-500/20 bg-emerald-950/20" : "text-emerald-700 border-emerald-100 bg-emerald-50/50";
      if (val >= 60) return isDark ? "text-amber-400 border-amber-500/20 bg-amber-950/20" : "text-amber-700 border-amber-100 bg-amber-50/50";
      return isDark ? "text-rose-400 border-rose-500/20 bg-rose-950/20" : "text-rose-700 border-rose-100 bg-rose-50/50";
    }
    if (type === "risk") {
      if (val < 40) return isDark ? "text-emerald-400 border-emerald-500/20 bg-emerald-950/20" : "text-emerald-700 border-emerald-100 bg-emerald-50/50";
      if (val < 70) return isDark ? "text-amber-400 border-amber-500/20 bg-amber-950/20" : "text-amber-700 border-amber-100 bg-amber-50/50";
      return isDark ? "text-rose-400 border-rose-500/20 bg-rose-950/20" : "text-rose-700 border-rose-100 bg-rose-50/50";
    }
    // AQI
    if (val < 50) return isDark ? "text-emerald-400 border-emerald-500/20 bg-emerald-950/20" : "text-emerald-700 border-emerald-100 bg-emerald-50/50";
    if (val < 100) return isDark ? "text-amber-400 border-amber-500/20 bg-amber-950/20" : "text-amber-700 border-amber-100 bg-amber-50/50";
    return isDark ? "text-rose-400 border-rose-500/20 bg-rose-950/20" : "text-rose-700 border-rose-100 bg-rose-50/50";
  };

  return (
    <div className="space-y-4">
      {/* Filters & Export Control Deck */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-2xl ${
        theme === "dark" ? "border-slate-800 bg-slate-900/20" : "border-slate-200 bg-white shadow-xs"
      }`}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Filter className="h-4 w-4 text-blue-500" />
            <span>FILTERS:</span>
          </div>

          {/* District selector */}
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={(e) => onDistrictSelect(e.target.value)}
              className={`appearance-none rounded-xl px-3 py-1.5 pr-10 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer transition-all border ${
                theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <option value="All Districts">All Districts (City Wide)</option>
              {CITY_DISTRICTS.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>

          {/* Time Filter */}
          <div className="relative">
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className={`appearance-none rounded-xl px-3 py-1.5 pr-10 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer transition-all border ${
                theme === "dark" ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              <option value="Today">Today (Real-time)</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Current Month">Current Month</option>
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={!!exporting}
            id="export-csv-btn"
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer border ${
              theme === "dark" ? "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-xs"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            {exporting === "CSV" ? "Compiling..." : "Export CSV"}
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={!!exporting}
            id="export-pdf-btn"
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer border ${
              theme === "dark" ? "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-xs"
            }`}
          >
            <FileText className="h-4 w-4 text-red-500" />
            {exporting === "PDF" ? "Compiling..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* KPI Looker Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: "City Safety Score",
            val: `${currentMetrics.safetyScore}/100`,
            icon: <Shield className="h-4 w-4" />,
            trend: "+2.1% improvement",
            status: getMetricColor(currentMetrics.safetyScore, "safety")
          },
          {
            label: "Traffic Congestion",
            val: `${currentMetrics.trafficIndex}%`,
            icon: <Zap className="h-4 w-4" />,
            trend: "-4% vs baseline",
            status: getMetricColor(currentMetrics.trafficIndex, "risk")
          },
          {
            label: "Air Quality (AQI)",
            val: `${currentMetrics.airQualityIndex}`,
            icon: <TrendingUp className="h-4 w-4" />,
            trend: currentMetrics.airQualityIndex > 100 ? "Unhealthy spikes" : "Optimal particulate",
            status: getMetricColor(currentMetrics.airQualityIndex, "aqi")
          },
          {
            label: "Flood Risk Level",
            val: `${currentMetrics.floodRisk}%`,
            icon: <CloudRain className="h-4 w-4" />,
            trend: currentMetrics.floodRisk > 50 ? "Delta overflow alert" : "Safe storm basins",
            status: getMetricColor(currentMetrics.floodRisk, "risk")
          },
          {
            label: "Accident Risk Score",
            val: `${currentMetrics.accidentRisk}%`,
            icon: <AlertTriangle className="h-4 w-4" />,
            trend: "Predictive model live",
            status: getMetricColor(currentMetrics.accidentRisk, "risk")
          },
          {
            label: "Avg Travel Duration",
            val: `${currentMetrics.avgTravelTime} min`,
            icon: <Clock className="h-4 w-4" />,
            trend: "Commuter optimized",
            status: theme === "dark" ? "text-blue-400 border-blue-500/20 bg-blue-950/20" : "text-blue-700 border-blue-100 bg-blue-50/50"
          }
        ].map((card, idx) => (
          <div
            key={idx}
            className={`p-3 border rounded-2xl flex flex-col justify-between min-h-[145px] h-auto shadow-xs transition-all ${card.status}`}
          >
            <div className="flex justify-between items-start">
              <span className={`text-[9px] font-mono uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>{card.label}</span>
              <div className={`p-1 border rounded-lg ${theme === "dark" ? "bg-slate-950/50 border-slate-800" : "bg-white/85 border-slate-200"}`}>
                {card.icon}
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-end mt-1">
              <p className={`text-base md:text-lg font-black tracking-tight ${theme === "dark" ? "text-slate-100" : "text-slate-850"}`}>{card.val}</p>
              <p className={`text-[9px] font-mono mt-0.5 leading-none ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>{card.trend}</p>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExplainMetric(card.label, card.val, card.trend);
                }}
                id={`explain-ai-btn-${idx}`}
                className={`mt-2 flex items-center justify-center gap-1 w-full py-1 px-2 rounded-xl text-[9px] font-bold font-mono border transition-all cursor-pointer uppercase tracking-wider ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-500 border-blue-500 text-white shadow-xs"
                    : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 font-bold"
                }`}
              >
                <Sparkles className="h-2.5 w-2.5" />
                Explain with AI
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Custom SVG-Based Looker Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        
        {/* Chart 1: Traffic & Accident Volume Trends (Combined Bar/Line Chart) */}
        <div className={`border rounded-2xl p-4 shadow-xs flex flex-col h-[280px] ${
          theme === "dark" ? "border-slate-850 bg-slate-900/50" : "border-slate-200 bg-white"
        }`}>
          <div className={`flex justify-between items-center border-b pb-2 mb-3 ${
            theme === "dark" ? "border-slate-850" : "border-slate-100"
          }`}>
            <div>
              <h4 className={`text-[10px] font-extrabold uppercase tracking-widest font-mono ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Weekly Traffic & Crash Analysis</h4>
              <p className="text-[9px] text-slate-500">Real-time volume comparison versus target baselines</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExplainMetric("Weekly Traffic & Crash Analysis", "Dynamic Traffic Volume vs Baselines", "Comparing weekend/weekday cycles")}
                className={`flex items-center gap-1 text-[9px] font-bold font-mono px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-500 border-blue-500 text-white"
                    : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 font-bold"
                }`}
              >
                <Sparkles className="h-2.5 w-2.5 animate-pulse" />
                Explain with AI
              </button>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                theme === "dark" ? "bg-blue-950 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-700 border-blue-200"
              }`}>GPU Predicted</span>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-3 h-40 px-2 relative">
            {/* Grid overlay lines */}
            <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none opacity-5">
              {[0, 1, 2, 3].map(i => <div key={i} className="border-b border-white w-full" />)}
            </div>

            {MOCK_CHART_DATA.traffic.map((day, i) => {
              const maxVal = 100;
              const barHeight = `${(day.value / maxVal) * 80}%`;
              const predHeight = `${(day.predicted / maxVal) * 80}%`;
              const isHovered = hoveredBar === i;

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div className="w-full flex items-end justify-center gap-1.5 h-full relative">
                    {/* Actual Traffic Volume (Blue Bar) */}
                    <div
                      style={{ height: barHeight }}
                      className={`w-3.5 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all ${
                        isHovered ? "brightness-115 scale-x-105" : ""
                      }`}
                    />
                    {/* Predicted Baseline (Emerald Bar) */}
                    <div
                      style={{ height: predHeight }}
                      className={`w-2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t opacity-80 transition-all ${
                        isHovered ? "brightness-110 scale-x-105" : ""
                      }`}
                    />
                  </div>

                  {/* Tooltip detail element */}
                  {isHovered && (
                    <div className={`absolute bottom-12 border text-[9px] font-mono p-1.5 rounded-lg shadow-md z-20 w-28 text-center leading-normal ${
                      theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"
                    }`}>
                      <p className="font-bold text-white">{day.name}</p>
                      <p className="text-blue-400">Actual: {day.value}%</p>
                      <p className="text-emerald-400">Predicted: {day.predicted}%</p>
                    </div>
                  )}

                  <span className="text-[9px] font-mono text-slate-500 mt-1.5">{day.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Air Quality Index & Carbon Exposure Area Curve */}
        <div className={`border rounded-2xl p-4 shadow-xs flex flex-col h-[280px] ${
          theme === "dark" ? "border-slate-850 bg-slate-900/50" : "border-slate-200 bg-white"
        }`}>
          <div className={`flex justify-between items-center border-b pb-2 mb-3 ${
            theme === "dark" ? "border-slate-850" : "border-slate-100"
          }`}>
            <div>
              <h4 className={`text-[10px] font-extrabold uppercase tracking-widest font-mono ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Air Quality Grid Assessment (PM2.5)</h4>
              <p className="text-[9px] text-slate-500">Hourly particulate mapping for AQI sensor grids</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExplainMetric("Air Quality Grid Assessment", "Grid Particulate Assessment PM2.5", "Hourly particulate trends mapping")}
                className={`flex items-center gap-1 text-[9px] font-bold font-mono px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-500 border-blue-500 text-white"
                    : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 font-bold"
                }`}
              >
                <Sparkles className="h-2.5 w-2.5 animate-pulse" />
                Explain with AI
              </button>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                theme === "dark" ? "bg-purple-950 text-purple-400 border-purple-500/20" : "bg-purple-50 text-purple-700 border-purple-200"
              }`}>IoT Grid Feed</span>
            </div>
          </div>

          <div className="flex-1 relative flex flex-col justify-end">
            <svg viewBox="0 0 100 40" className="w-full h-32 overflow-visible">
              <defs>
                <linearGradient id="aqi-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Area path representing values */}
              <path
                d="M 0,38 L 0,30 Q 15,22 25,32 T 50,15 T 75,10 T 100,28 L 100,38 Z"
                fill="url(#aqi-grad)"
              />
              {/* Curve outline stroke */}
              <path
                d="M 0,30 Q 15,22 25,32 T 50,15 T 75,10 T 100,28"
                fill="none"
                stroke="#c084fc"
                strokeWidth="1.2"
              />

              {/* Data circle points */}
              {[
                { x: 0, y: 30, val: 45, label: "00:00" },
                { x: 20, y: 26, val: 52, label: "04:00" },
                { x: 40, y: 29, val: 95, label: "08:00" },
                { x: 60, y: 15, val: 88, label: "12:00" },
                { x: 80, y: 10, val: 110, label: "16:00" },
                { x: 100, y: 28, val: 78, label: "20:00" }
              ].map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint === idx ? "2.2" : "1.2"}
                    className="fill-purple-500 stroke-white stroke-[0.4] cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {hoveredPoint === idx && (
                    <g transform={`translate(${pt.x - 10}, ${pt.y - 12})`}>
                      <rect width="20" height="9" rx="2" fill={theme === "dark" ? "#090d16" : "#ffffff"} stroke="#c084fc" strokeWidth="0.3" />
                      <text x="10" y="6" textAnchor="middle" fill="#c084fc" fontSize="4" className="font-mono">
                        {pt.val} AQI
                      </text>
                    </g>
                  )}
                </g>
              ))}
            </svg>

            {/* X Axis labels */}
            <div className={`flex justify-between px-2 text-[9px] font-mono text-slate-500 mt-2 border-t pt-1.5 ${
              theme === "dark" ? "border-slate-850" : "border-slate-100"
            }`}>
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
            </div>
          </div>
        </div>

      </div>

      <PredictiveAnalytics
        selectedDistrict={selectedDistrict}
        currentMetrics={currentMetrics}
        incidents={incidents}
        theme={theme}
      />

      {/* Secondary Administration Looker Panels */}
      <div className={`border rounded-2xl p-4 shadow-xs ${
        theme === "dark" ? "border-slate-850 bg-slate-900/50" : "border-slate-200 bg-white"
      }`}>
        <div className={`flex justify-between items-center border-b pb-2 mb-3 ${
          theme === "dark" ? "border-slate-850" : "border-slate-100"
        }`}>
          <div>
            <h4 className={`text-[10px] font-extrabold uppercase tracking-widest font-mono ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Infrastructure structural & priorities</h4>
            <p className="text-[9px] text-slate-500 font-medium">Calculated priority scoring based on pothole feedback and regional congestion indexes</p>
          </div>
          <span className="text-[9px] font-mono text-emerald-500 font-bold">All Metrics Validated</span>
        </div>

        <div className="space-y-3">
          {MOCK_CHART_DATA.roadQuality.map((road, i) => {
            const progressWidth = `${road.score}%`;
            return (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className={theme === "dark" ? "text-slate-300" : "text-slate-700"}>{road.name} Structural Quality</span>
                  <div className="flex gap-4 font-mono text-[10px]">
                    <span className="text-slate-500">Score: {road.score}/100</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase ${
                      road.maintenancePriority === "Critical"
                        ? "bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-500/20"
                        : road.maintenancePriority === "Medium"
                        ? "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-500/20"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/20"
                    }`}>
                      {road.maintenancePriority} priority
                    </span>
                  </div>
                </div>
                {/* Visual horizontal gauge bar */}
                <div className={`w-full h-2 rounded-full overflow-hidden border ${
                  theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200/60"
                }`}>
                  <div
                    style={{ width: progressWidth }}
                    className={`h-full rounded-full bg-gradient-to-r ${
                      road.score >= 80
                        ? "from-emerald-500 to-emerald-400"
                        : road.score >= 60
                        ? "from-amber-500 to-amber-400"
                        : "from-rose-500 to-rose-400"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explain with AI Modal Dialog Overlay */}
      {explainingMetric && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="explain-ai-modal">
          <div className={`w-full max-w-lg border rounded-2xl p-6 shadow-2xl relative flex flex-col ${
            theme === "dark" ? "border-slate-800 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-800"
          }`}>
            <button
              onClick={() => setExplainingMetric(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg border border-transparent hover:border-slate-800 hover:bg-slate-950/20 text-slate-400 hover:text-slate-200 cursor-pointer transition-all"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-dashed border-slate-800/80">
              <div className="p-1.5 bg-blue-600/15 border border-blue-500/30 text-blue-400 rounded-xl">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight font-mono uppercase text-blue-400">CityPulse AI Explainer</h3>
                <p className="text-[10px] text-slate-500">Live Synthesis on current spatial trends</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border mb-4 font-mono text-xs ${
              theme === "dark" ? "bg-slate-950/50 border-slate-800/80" : "bg-slate-50 border-slate-200/60"
            }`}>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Metric name</span>
                  <span className="font-bold text-slate-200">{explainingMetric.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Target Value</span>
                  <span className="font-bold text-slate-200">{explainingMetric.value}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Current Trend</span>
                  <span className="font-bold text-blue-400">{explainingMetric.trend}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Region focus</span>
                  <span className="font-bold text-emerald-400">{selectedDistrict}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
              {explainingLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />
                  <span className="text-xs font-mono text-slate-400 animate-pulse">Running advanced spatial analysis via Gemini...</span>
                </div>
              ) : explainingError ? (
                <div className="border border-red-500/20 bg-red-950/20 text-red-400 p-3.5 rounded-xl text-xs flex gap-2 items-start font-mono">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-bold">Model Context Error</p>
                    <p className="mt-1">{explainingError}</p>
                  </div>
                </div>
              ) : (
                <div className="text-xs leading-relaxed space-y-3 whitespace-pre-line text-slate-300">
                  {explanationText}
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800/80 flex justify-end">
              <button
                onClick={() => setExplainingMetric(null)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
              >
                Close Explainer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
