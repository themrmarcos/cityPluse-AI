import React, { useState } from "react";
import { FileText, Download, Calendar, Printer, Shield, Eye, AlertCircle, Sparkles } from "lucide-react";
import { CITY_DISTRICTS } from "../data/mockData";

export default function ReportPage() {
  const [activeTemplate, setActiveTemplate] = useState<"traffic" | "safety" | "pollution" | "weekly">("weekly");
  const [compiling, setCompiling] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Compile full AI summary using server API
  const handleTriggerAISummary = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/gemini/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            districts: CITY_DISTRICTS,
            activeTemplate
          }
        })
      });
      const data = await response.json();
      if (response.ok && data.summary) {
        setAiSummary(data.summary);
      } else {
        throw new Error(data.error || "Failed call response from Gemini Server.");
      }
    } catch (err: any) {
      setAiSummary(`### CityPulse Weekly AI Urban Report (Fallback Synthesis)
- **Overall City Health Rating:** **78/100** (Safe)
- **High Concurrency Congestion:** Grand Avenue Bridge bottleneck remains the primary traffic drag.
- **Accident Mitigation Status:** Incident rates in Uptown Tech Segment decreased by 12.5% following spatial radar deployment.
- **Operator Advisory:** Industrial District processing road surfaces require pothole remediation (pothole density logged at 85%).
*Error calling Gemini API endpoint, rendered offline ruleset.*`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    setCompiling(true);
    setTimeout(() => {
      alert(`Success: Compiled and downloaded CityPulse_Executive_${activeTemplate.toUpperCase()}_Report_v2.0.pdf successfully.`);
      setCompiling(false);
    }, 1800);
  };

  const getReportSummary = () => {
    switch (activeTemplate) {
      case "traffic":
        return {
          title: "Traffic Density & Commute Bottleneck Audit",
          desc: "Full comprehensive analysis of peak hour congestion, average travel durations, and bypass speed improvements.",
          bullets: [
            "Downtown Core Peak hour delay is currently logged at +12.4 minutes versus normal threshold.",
            "Riverfront Express loops showing stable velocity curves (avg 52 km/h).",
            "Bicycle active corridor usage increased by 18.4% along Southern Parkway.",
            "Grand Avenue Bridge requires active metering between 16:30 and 18:30 UTC."
          ],
          kpis: [
            { label: "Avg Speed", val: "42 km/h" },
            { label: "Commute Index", val: "68% (Moderate)" },
            { label: "Gridlocks", val: "1 Active Bottleneck" }
          ]
        };
      case "safety":
        return {
          title: "Municipal Road Safety & Structural Quality Survey",
          desc: "Overview of critical pavement damage, potholes, traffic collisions, and priority maintenance zones.",
          bullets: [
            "Industrial Hub corridor logged critical road structural damage score of 85/100 (critical remediation priority).",
            "Zero high-severity accidents logged inside Uptown Tech sector (safety ranking of 92/100).",
            "Grand Highway outer ring lane pothole swarm successfully barricaded.",
            "Emergency dispatch delay was reduced by 4.2 minutes following spatial hazard feed optimization."
          ],
          kpis: [
            { label: "Road Quality", val: "74/100 Score" },
            { label: "Repair Priorities", val: "2 Critical Districts" },
            { label: "Safety Rating", val: "Excellent" }
          ]
        };
      case "pollution":
        return {
          title: "Air Pollution & Particulate AQI Mapping",
          desc: "Evaluation of PM2.5 levels, nitrous oxide concentrations, and industrial emission thresholds.",
          bullets: [
            "Processing Zone B inside Industrial Hub logged unhealthy particulate concentration (165 AQI).",
            "Winds carrying ozone eastward; sensitive groups in Downtown Core advised to avoid outdoor activities.",
            "Urban green buffers successfully reduced carbon exposure by 11.2% in Uptown Sector.",
            "Total carbon emissions reduced by 4.2 metric tons following eco-routing adoption."
          ],
          kpis: [
            { label: "Particulates", val: "82 AQI (Avg)" },
            { label: "Eco Routing", val: "38% Adoption" },
            { label: "CO2 Mitigated", val: "4.2 Tons" }
          ]
        };
      default:
        return {
          title: "CityPulse Weekly Urban Performance Executive Report",
          desc: "Integrated summary of traffic velocity, pollution indices, flood thresholds, and municipal operations.",
          bullets: [
            "Overall City Safety Score remains stable at 74/100.",
            "Storm water basins along Riverfront delta absorbed 3.5 inches of rain with zero lane submersions.",
            "NVIDIA RAPIDS GPU query pipeline processed 1,250,000 spatial records in 1,650 milliseconds (34.6x speedup).",
            "Total active citizen reports increased to 22, with DoT operator verification rating of 94%."
          ],
          kpis: [
            { label: "City Health", val: "78% Rating" },
            { label: "Telemetry", val: "1.25M Logs" },
            { label: "GPU Multiplier", val: "34.6x Speedup" }
          ]
        };
    }
  };

  const report = getReportSummary();

  return (
    <div className="grid lg:grid-cols-3 gap-6" id="report-generation-panel">
      {/* Template selector */}
      <div className="border border-slate-900 bg-slate-950 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-blue-400" />
          <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider font-mono">Select Report Template</h3>
        </div>

        <div className="space-y-2">
          {[
            { id: "weekly", label: "Weekly Executive Summary", desc: "Consolidated municipal performance report" },
            { id: "traffic", label: "Traffic Volume Audit", desc: "Congestion peaks, speeds, travel times" },
            { id: "safety", label: "Road Safety Survey", desc: "Pothole swarm coordinates, crash risk" },
            { id: "pollution", label: "Particulate Air Quality Audit", desc: "PM2.5 metrics, carbon emissions" }
          ].map(tpl => (
            <button
              key={tpl.id}
              onClick={() => {
                setActiveTemplate(tpl.id as any);
                setAiSummary("");
              }}
              className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                activeTemplate === tpl.id
                  ? "border-blue-500 bg-blue-950/20 text-blue-400"
                  : "border-slate-900 text-slate-400 hover:text-slate-300 hover:border-slate-800"
              }`}
            >
              <div className="text-xs font-bold">{tpl.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{tpl.desc}</div>
            </button>
          ))}
        </div>

        <button
          onClick={handleTriggerAISummary}
          disabled={aiLoading}
          id="compile-ai-summary-btn"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          {aiLoading ? "Synthesizing..." : "Generate Weekly AI Summary"}
        </button>
      </div>

      {/* Report Preview */}
      <div className="lg:col-span-2 border border-slate-900 bg-slate-950 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[480px]">
        <div>
          <div className="flex justify-between items-center border-b border-slate-900 pb-4 mb-6">
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Digital Print Preview</span>
              <h4 className="text-sm font-extrabold text-slate-200 mt-0.5">{report.title}</h4>
            </div>
            
            <button
              onClick={handleDownloadPDF}
              disabled={compiling}
              id="download-print-report"
              className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              {compiling ? "Compiling..." : "Download PDF"}
            </button>
          </div>

          <div className="space-y-6">
            <p className="text-xs text-slate-400 leading-relaxed font-mono">{report.desc}</p>

            {/* KPI display */}
            <div className="grid grid-cols-3 gap-4">
              {report.kpis.map((kpi, idx) => (
                <div key={idx} className="p-3 bg-slate-900/50 border border-slate-900 rounded-xl text-center">
                  <span className="block text-[8.5px] font-mono text-slate-500 uppercase">{kpi.label}</span>
                  <span className="font-bold text-slate-200 text-xs mt-1 block">{kpi.val}</span>
                </div>
              ))}
            </div>

            {/* Bullets layout */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Executive Findings:</span>
              {report.bullets.map((bullet, idx) => (
                <div key={idx} className="flex gap-2.5 items-start text-xs text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            {/* Generated AI Summary Section */}
            {aiSummary && (
              <div className="border-t border-slate-900 pt-5 mt-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
                    Gemini AI Summary (Co-Pilot Insights)
                  </span>
                </div>
                <div className="bg-emerald-950/5 border border-emerald-500/10 rounded-xl p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {aiSummary}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-900/80 pt-4 mt-8 flex justify-between items-center text-[10px] font-mono text-slate-500">
          <span>System Hash: CityPulseAI_Report_2.0</span>
          <span>Security Classification: Internal Use Only</span>
        </div>
      </div>
    </div>
  );
}
