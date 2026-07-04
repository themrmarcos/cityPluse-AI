import React, { useState, useEffect, useRef } from "react";
import {
  Cpu, Server, Play, ShieldAlert, CheckCircle, Trash2, Plus, RefreshCw, Layers,
  Search, Terminal, Bell, HelpCircle, FileText, Download, ExternalLink, SlidersHorizontal,
  Eye, ChevronRight, BarChart3, TrendingUp, AlertTriangle, Info, MapPin, Sparkles,
  Settings, Database, CloudRain, Shield, Activity, ListFilter, Sliders, CheckCircle2,
  Lock, ArrowUpRight, Zap
} from "lucide-react";
import { Incident, IncidentType } from "../types";
import { CITY_DISTRICTS } from "../data/mockData";
import GPUPerformanceDashboard from "./GPUPerformanceDashboard";

interface GCPAdminConsoleProps {
  incidents: Incident[];
  onVerifyIncident: (id: string) => void;
  onResolveIncident: (id: string) => void;
  onDeleteIncident: (id: string) => void;
  onAddIncident: (newIncident: Omit<Incident, "id" | "reportsCount" | "verified" | "timestamp">) => void;
}

export default function GCPAdminConsole({
  incidents,
  onVerifyIncident,
  onResolveIncident,
  onDeleteIncident,
  onAddIncident
}: GCPAdminConsoleProps) {
  // GCP State management
  const [activeSection, setActiveSection] = useState<"overview" | "compute" | "analytics" | "operations" | "reports" | "billing">("overview");
  const [selectedProject, setSelectedProject] = useState<string>("citypulse-telemetry-prod");
  const [selectedRegion, setSelectedRegion] = useState<string>("All Districts");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("Last 24 Hours");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Incident Filtering
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [hazardFilter, setHazardFilter] = useState<string>("all");
  const [selectedIncidentDetail, setSelectedIncidentDetail] = useState<Incident | null>(null);

  // Trace Details terminal simulation
  const [isShowingTrace, setIsShowingTrace] = useState<boolean>(false);
  const [activeTracePayload, setActiveTracePayload] = useState<string>("");

  // Resource creation side drawer
  const [showCreateDrawer, setShowCreateDrawer] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    type: "traffic" as IncidentType,
    severity: "medium" as "low" | "medium" | "high",
    location: "",
    lat: 45.5,
    lng: 50.2,
    hostInstance: "instance-h100-01"
  });

  // Report Generator settings
  const [reportDistrict, setReportDistrict] = useState<string>("All Districts");
  const [reportGranularity, setReportGranularity] = useState<"executive" | "technical" | "full-audit">("executive");
  const [isCompilingReport, setIsCompilingReport] = useState<boolean>(false);
  const [reportCompileProgress, setReportCompileProgress] = useState<number>(0);
  const [compiledReportData, setCompiledReportData] = useState<any>(null);
  const [aiReportSummary, setAiReportSummary] = useState<string>("");
  const [aiReportLoading, setAiReportLoading] = useState<boolean>(false);

  // Command Shell Terminal simulation
  const [showCloudShell, setShowCloudShell] = useState<boolean>(false);
  const [shellLogs, setShellLogs] = useState<string[]>([
    "Welcome to Cloud Shell! Your personal gcloud SDK is pre-configured.",
    "Active Account: master.govindkumarjha@gmail.com",
    "Current Project: citypulse-telemetry-prod",
    "gcloud config set project citypulse-telemetry-prod --quiet"
  ]);
  const [shellInput, setShellInput] = useState<string>("");
  const shellEndRef = useRef<HTMLDivElement>(null);

  // Notification Toast simulation
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; type: "info" | "warn" | "success" }>>([
    { id: 1, message: "gcloud compute instance-h100-01 is operating at high warp occupancy (96.8%)", type: "info" },
    { id: 2, message: "BigQuery GIS tables auto-repartitioned successfully", type: "success" }
  ]);
  const [showNotificationMenu, setShowNotificationMenu] = useState<boolean>(false);

  useEffect(() => {
    if (shellEndRef.current) {
      shellEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [shellLogs, showCloudShell]);

  // Handle Shell Submit Command
  const handleShellCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shellInput.trim()) return;

    const input = shellInput.trim();
    const newLogs = [...shellLogs, `$ ${input}`];

    if (input.toLowerCase().startsWith("gcloud info") || input.toLowerCase() === "gcloud") {
      newLogs.push("Google Cloud SDK [420.0.0]", "Active Project: [citypulse-telemetry-prod]", "Region: [us-central1]", "Zone: [us-central1-a]");
    } else if (input.toLowerCase().startsWith("gcloud compute instances list")) {
      newLogs.push(
        "NAME              ZONE           MACHINE_TYPE       PREEMPTIBLE  STATUS",
        "instance-h100-01  us-central1-a  a2-ultragpu-1g     true         RUNNING",
        "instance-a100-02  us-central1-b  a2-highgpu-2g      false        RUNNING",
        "instance-l4-03    us-central1-c  g2-standard-4      false        RUNNING",
        "instance-orin-04  us-west1-b     edge-orin-64gb     false        RUNNING"
      );
    } else if (input.toLowerCase().startsWith("bq query")) {
      newLogs.push(
        "Waiting on bq-job-9a8c1f... Success.",
        "Total processed: 1.25M rows in 0.44s",
        "Result: Detected 14 active GIS anomalies in industrial-hub zone."
      );
    } else if (input.toLowerCase() === "clear") {
      setShellLogs([]);
      setShellInput("");
      return;
    } else if (input.toLowerCase() === "help") {
      newLogs.push(
        "Available Console Emulation Commands:",
        "  gcloud compute instances list  - List active virtual machine instances",
        "  bq query                       - Query BigQuery GIS cluster database logs",
        "  gcloud info                    - Display current configuration parameters",
        "  clear                          - Clear the terminal console output screen"
      );
    } else {
      newLogs.push(`sh: command not found: ${input}. Type 'help' for available console utility instructions.`);
    }

    setShellLogs(newLogs);
    setShellInput("");
  };

  // Submit manual creation
  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    onAddIncident({
      title: createForm.title || `Operations Broadcast: Cloud Alert`,
      description: createForm.description || `Injected via GCP Operations Console console resource creator. Host: ${createForm.hostInstance}`,
      type: createForm.type,
      severity: createForm.severity,
      location: createForm.location || "US-Central Grid",
      lat: Number(createForm.lat),
      lng: Number(createForm.lng),
      reportedBy: `GCP Administrator: ${createForm.hostInstance}`,
      active: true
    });

    setNotifications(prev => [
      {
        id: Date.now(),
        message: `Instance Trigger: Broadcast alert '${createForm.title}' successfully deployed to Google Cloud Monitoring stack`,
        type: "success"
      },
      ...prev
    ]);

    setShowCreateDrawer(false);
    setCreateForm({
      title: "",
      description: "",
      type: "traffic",
      severity: "medium",
      location: "",
      lat: 45.5,
      lng: 50.2,
      hostInstance: "instance-h100-01"
    });
  };

  // Trigger Cloud Report Compiler
  const triggerGCPReportCompile = () => {
    setIsCompilingReport(true);
    setReportCompileProgress(0);
    setCompiledReportData(null);
    setAiReportSummary("");

    const interval = setInterval(() => {
      setReportCompileProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompilingReport(false);
          
          // Filter incidents for report
          const targetIncs = incidents.filter(inc => 
            (reportDistrict === "All Districts" || inc.location.toLowerCase().includes(reportDistrict.toLowerCase()) || reportDistrict === "Downtown Core")
          );

          setCompiledReportData({
            region: reportDistrict,
            granularity: reportGranularity,
            timestamp: new Date().toLocaleString(),
            scopeId: `GCP-OPS-AUDIT-${Math.floor(Math.random() * 90000) + 10000}`,
            telemetrySummary: {
              activeAlerts: targetIncs.filter(i => i.active).length,
              verifiedAlerts: targetIncs.filter(i => i.verified).length,
              totalLogged: targetIncs.length,
              gpuEfficiencyScore: reportDistrict === "Industrial Hub" ? "68% (Moderate)" : "94% (Excellent)",
              carbonOffsetGrams: targetIncs.length * 345
            }
          });

          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  // Compile AI Summary via Server Route
  const compileReportAISummary = async () => {
    setAiReportLoading(true);
    setAiReportSummary("");

    try {
      const response = await fetch("/api/gemini/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            selectedRegion: reportDistrict,
            reportGranularity,
            incidentsCount: incidents.length,
            activeAlertsCount: incidents.filter(i => i.active).length,
            timeframe: selectedTimeframe,
            infrastructureState: {
              gpuComputeNode: "instance-h100-01",
              warpOccupancy: "96.8%",
              rmmHeapAllocation: "Unified Memory Pool Enabled"
            }
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.summary) {
        setAiReportSummary(data.summary);
      } else {
        throw new Error(data.error || "GCP API service error");
      }
    } catch (err: any) {
      setAiReportSummary(`### GCP Operations Diagnostic Summary (Backup Synthesis)
- **Operations Status Overview:** Managed regional cluster logs are **stable**. Regional telemetry coverage rating is at **94.2%**.
- **Identified Network Anomalies:** Peak spatial database queries reflect typical daily density variations in **${reportDistrict}**.
- **Actionable Remediation Checklist:** Recommended allocation of secondary backup HBM buffers to stabilize memory pools during heavy concurrency bursts.`);
    } finally {
      setAiReportLoading(false);
    }
  };

  const downloadCompiledCSV = () => {
    if (!compiledReportData) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + `Report ID,${compiledReportData.scopeId}\n`
      + `Region,${compiledReportData.region}\n`
      + `Granularity,${compiledReportData.granularity}\n`
      + `Generated Timestamp,${compiledReportData.timestamp}\n`
      + `Active Cloud Alarms,${compiledReportData.telemetrySummary.activeAlerts}\n`
      + `Verified Incidents,${compiledReportData.telemetrySummary.verifiedAlerts}\n`
      + `Cumulative Logs,${compiledReportData.telemetrySummary.totalLogged}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `gcp_console_report_${compiledReportData.scopeId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Incident Data
  const filteredIncidents = incidents.filter(inc => {
    // Search filter
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Region/District filter
    const matchesRegion = selectedRegion === "All Districts" || 
                          inc.location.toLowerCase().includes(selectedRegion.toLowerCase()) ||
                          (selectedRegion === "Downtown Core" && !inc.location.toLowerCase().includes("industrial") && !inc.location.toLowerCase().includes("uptown"));

    // Severity filter
    const matchesSeverity = severityFilter === "all" || inc.severity === severityFilter;

    // Status filter
    const matchesStatus = statusFilter === "all" || 
                          (statusFilter === "active" && inc.active) || 
                          (statusFilter === "resolved" && !inc.active);

    // Hazard type filter
    const matchesHazard = hazardFilter === "all" || inc.type === hazardFilter;

    return matchesSearch && matchesRegion && matchesSeverity && matchesStatus && matchesHazard;
  });

  return (
    <div className="min-h-screen bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl text-slate-100 flex flex-col font-sans" id="gcp-admin-console">
      
      {/* 1. authentic GCP Blue Top Utility Header */}
      <header className="bg-[#1a73e8] text-white h-12 flex items-center justify-between px-4 select-none shadow-md shrink-0 relative z-30">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-white/15 rounded-lg border border-white/10 flex items-center justify-center">
            <Layers className="h-4.5 w-4.5 text-white animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight font-mono">Google Cloud</span>
            <span className="text-[11px] font-medium bg-white/20 text-white/90 px-1.5 py-0.5 rounded border border-white/10 font-mono">CityPulse Console</span>
          </div>

          {/* Project Selector */}
          <div className="hidden md:flex items-center gap-1 bg-white/10 border border-white/20 px-2.5 py-1 rounded-md text-xs font-mono ml-4">
            <Database className="h-3.5 w-3.5 text-blue-100" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none focus:ring-0 font-bold cursor-pointer text-[11px] pr-2"
            >
              <option value="citypulse-telemetry-prod" className="bg-slate-900 text-slate-100">citypulse-telemetry-prod</option>
              <option value="rapid-gpu-cluster-04" className="bg-slate-900 text-slate-100">rapid-gpu-cluster-04</option>
              <option value="backup-recovery-nodes" className="bg-slate-900 text-slate-100">backup-recovery-nodes</option>
            </select>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-xl mx-8 relative">
          <Search className="absolute left-3.5 h-3.5 w-3.5 text-white/70" />
          <input
            type="text"
            placeholder="Search resources, incidents, services, and operations (Ctrl+/)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/15 hover:bg-white/15 rounded-md py-1.5 pl-10 pr-4 text-xs text-white placeholder:text-white/60 focus:outline-none focus:bg-white/20 focus:border-white/30 transition-all font-mono"
          />
        </div>

        {/* Top-Right Utility Toolbar */}
        <div className="flex items-center gap-3">
          {/* Cloud Shell Command Launcher */}
          <button
            onClick={() => setShowCloudShell(!showCloudShell)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              showCloudShell 
                ? "bg-white text-[#1a73e8] border-white" 
                : "bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/20 text-white"
            }`}
            title="Activate Cloud Shell"
          >
            <Terminal className="h-3.5 w-3.5" />
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="p-1.5 bg-white/10 border border-white/10 hover:bg-white/15 hover:border-white/20 rounded-lg text-white relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-3.5 w-3.5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#1a73e8] animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-4 text-xs z-50 animate-fade-in font-mono text-slate-300">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2 mb-2">
                  <span className="font-extrabold uppercase text-[10px] text-slate-400">Cloud Operations Log ({notifications.length})</span>
                  <button 
                    onClick={() => setNotifications([])}
                    className="text-[9px] text-blue-400 hover:text-blue-300 uppercase cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="text-center py-4 text-slate-600 text-[10px]">No active notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-2 bg-slate-900/50 border border-slate-900 rounded-lg text-[9.5px]">
                        <div className="flex gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${n.type === "success" ? "bg-emerald-500" : "bg-amber-400"}`} />
                          <p className="leading-normal">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Help Center */}
          <div className="hidden sm:flex items-center text-xs text-white/85 font-mono gap-1 cursor-help" title="Console Documentation">
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="text-[10px]">Support</span>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/20">
            <div className="w-6.5 h-6.5 rounded-full bg-amber-600 border border-white/30 font-black text-[10px] flex items-center justify-center uppercase text-white shadow-inner">
              GK
            </div>
            <span className="hidden sm:inline text-[11px] font-mono font-bold text-white/90">Govind Jha</span>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace Layout Grid */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        
        {/* Left Navigation Console Sidebar */}
        <aside className="w-full md:w-56 bg-slate-950 border-r border-slate-850 flex flex-col justify-between shrink-0 font-mono text-[11px] select-none p-3.5">
          <div className="space-y-6">
            <div>
              <span className="text-[9px] font-extrabold text-slate-600 block uppercase tracking-wider mb-2.5">PINNED SERVICES</span>
              <nav className="space-y-1">
                {[
                  { id: "overview", label: "Cloud Home Dashboard", icon: <Layers className="h-4 w-4" /> },
                  { id: "compute", label: "Compute Engine (GPU)", icon: <Cpu className="h-4 w-4" /> },
                  { id: "analytics", label: "BigQuery GIS Analytics", icon: <Database className="h-4 w-4" /> },
                  { id: "operations", label: "Operations (Monitoring)", icon: <ShieldAlert className="h-4 w-4" /> },
                  { id: "reports", label: "Cloud Logging (Reports)", icon: <FileText className="h-4 w-4" /> }
                ].map(item => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id as any);
                        setIsShowingTrace(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all font-bold cursor-pointer ${
                        isActive
                          ? "bg-blue-600 text-white font-black shadow-md shadow-blue-600/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <span className="text-[9px] font-extrabold text-slate-600 block uppercase tracking-wider mb-2.5">SYSTEM FILTERS</span>
              <div className="space-y-3">
                {/* District Filter */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 uppercase font-black">Region / Zone</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-[10px] text-slate-300 focus:outline-none focus:border-blue-500/50 cursor-pointer font-bold"
                  >
                    <option value="All Districts">All Districts (Global)</option>
                    <option value="Downtown Core">Downtown Core (us-central1-a)</option>
                    <option value="Industrial Hub">Industrial Hub (us-east4-b)</option>
                    <option value="Uptown Tech">Uptown Tech (us-west2-c)</option>
                    <option value="Riverfront Delta">Riverfront Delta (us-east1-a)</option>
                  </select>
                </div>

                {/* Time Range Filter */}
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 uppercase font-black">Query Period</label>
                  <div className="flex bg-slate-900 p-0.5 rounded border border-slate-800">
                    {["Last 1H", "Last 24H", "Last 7D"].map(tf => (
                      <button
                        key={tf}
                        onClick={() => setSelectedTimeframe(tf === "Last 1H" ? "Last Hour" : tf === "Last 24H" ? "Last 24 Hours" : "Last 7 Days")}
                        className={`flex-1 py-1 text-[9px] font-black rounded text-center cursor-pointer transition-all ${
                          selectedTimeframe.includes(tf.replace("Last ", "").replace("H", "").replace("D", ""))
                            ? "bg-slate-800 text-slate-100"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-4 text-slate-600 text-[9px] space-y-1 text-center">
            <p>IAM Admin Mode Active</p>
            <p className="text-blue-500">Project: {selectedProject}</p>
          </div>
        </aside>

        {/* Core Screen Arena */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 min-w-0 bg-[#0c101d]">

          {/* Quick Warning Header Box */}
          <div className="mb-5 flex flex-col md:flex-row justify-between items-start md:items-center p-3 border border-slate-800 bg-slate-950/40 rounded-xl gap-4 font-mono text-[10.5px]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-slate-400">
                Region <span className="text-slate-200 font-extrabold">{selectedRegion}</span> status is stable. Telemetry nodes processing live streaming GIS queues.
              </p>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-[10px]">
              <Sliders className="h-3.5 w-3.5 text-blue-500" />
              <span>Filter matches: {filteredIncidents.length} active logs</span>
            </div>
          </div>

          {/* SECTION 1: CLOUD HOME OVERVIEW */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              
              {/* GCP Widget Grid */}
              <div className="grid md:grid-cols-3 gap-5">
                
                {/* Widget 1: Project Info */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                    <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-widest">Project Info</span>
                    <span className="text-[9px] font-mono text-blue-400 flex items-center gap-0.5 hover:underline cursor-pointer">
                      GCP Settings <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="font-mono text-xs space-y-2 text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Project Name:</span>
                      <span className="font-bold text-slate-200">CityPulse Realtime GIS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Project ID:</span>
                      <span className="font-bold text-blue-400">{selectedProject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Project Number:</span>
                      <span className="font-bold text-slate-300">384974731757</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-900 pt-2">
                      <span className="text-slate-500 uppercase">API Ingress Status:</span>
                      <span className="text-emerald-400 font-extrabold uppercase animate-pulse">● ACTIVE (100%)</span>
                    </div>
                  </div>
                </div>

                {/* Widget 2: Compute Engine Status */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                    <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-widest">Compute Resources</span>
                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5 hover:underline cursor-pointer" onClick={() => setActiveSection("compute")}>
                      View Clusters <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="font-mono text-xs space-y-2 text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Active CUDA Nodes:</span>
                      <span className="font-bold text-emerald-400">4 Instances Running</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Primary GPU:</span>
                      <span className="font-bold text-slate-200">NVIDIA H100 (80GB SXM5)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Warp Occupancy:</span>
                      <span className="font-bold text-blue-400">96.8% Optimized</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-900 pt-2 text-cyan-400">
                      <span className="uppercase font-semibold text-slate-500">RAPIDS Throughput:</span>
                      <span className="font-extrabold">2.27M Rec/sec peak</span>
                    </div>
                  </div>
                </div>

                {/* Widget 3: Billing Account Summary */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                    <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-widest">Billing & Estimations</span>
                    <span className="text-[9px] font-mono text-amber-500 flex items-center gap-0.5 hover:underline cursor-pointer">
                      Logs <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="font-mono text-xs space-y-2 text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Billing Account:</span>
                      <span className="font-bold text-slate-200">My Billing (GCP-FREE)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Compute Instance costs:</span>
                      <span className="font-bold text-amber-400">$4.76 / hr active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">RMM Savings factor:</span>
                      <span className="font-bold text-emerald-400">-72.4% CPU Energy</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-900 pt-2 text-slate-500">
                      <span className="uppercase">Credit usage:</span>
                      <span className="text-slate-400 font-bold">$12.42 total billing tier</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* API and Ingress Custom SVG Traffic Chart */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-900 pb-3 mb-4">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-blue-500" />
                      Google Cloud API Traffic Gateway (GIS Ingress)
                    </h3>
                    <p className="text-[9.5px] text-slate-500 font-mono">Telemetry ingestion query volume comparing regular Spark ETL vs NVIDIA RAPIDS</p>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-1 bg-slate-800 inline-block" />
                      <span>Standard CPU Ingress</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-1 bg-emerald-500 inline-block animate-pulse" />
                      <span className="text-emerald-400 font-bold">NVIDIA RAPIDS Ingress</span>
                    </div>
                  </div>
                </div>

                <div className="w-full relative min-h-[180px] flex flex-col justify-center">
                  <svg viewBox="0 0 600 180" className="w-full h-full overflow-visible select-none font-mono">
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                      const y = 15 + ratio * 130;
                      const val = Math.round(150 - ratio * 150);
                      return (
                        <g key={idx}>
                          <line x1="45" y1={y} x2="580" y2={y} className="stroke-slate-900/60" strokeWidth="1" strokeDasharray="3 3" />
                          <text x="35" y={y + 3.5} className="fill-slate-500 text-[8.5px] text-right" textAnchor="end">{val}k/s</text>
                        </g>
                      );
                    })}

                    {/* GPU line path coordinates (spline math) */}
                    {(() => {
                      const xS = [50, 140, 230, 320, 410, 500, 570];
                      const yGpu = [120, 95, 60, 45, 25, 15, 10];
                      const yCpu = [140, 138, 135, 137, 136, 138, 137];

                      let dGpu = `M ${xS[0]} ${yGpu[0]} `;
                      let dCpu = `M ${xS[0]} ${yCpu[0]} `;

                      for (let i = 1; i < xS.length; i++) {
                        dGpu += `L ${xS[i]} ${yGpu[i]} `;
                        dCpu += `L ${xS[i]} ${yCpu[i]} `;
                      }

                      return (
                        <g>
                          {/* Standard CPU line */}
                          <path d={dCpu} fill="none" className="stroke-slate-800" strokeWidth="2" />
                          
                          {/* RAPIDS Ingress curve with glowing shadow */}
                          <path d={dGpu} fill="none" className="stroke-emerald-500" strokeWidth="2.5" />

                          {/* Data points for GPU */}
                          {xS.map((x, idx) => (
                            <g key={idx}>
                              <circle cx={x} cy={yGpu[idx]} r="4.5" className="fill-slate-950 stroke-emerald-500 stroke-2 cursor-pointer hover:r-6 hover:fill-emerald-400 transition-all" />
                              <text x={x} y={yGpu[idx] - 10} className="fill-emerald-400 text-[8.5px] font-bold" textAnchor="middle">
                                {idx === 5 ? "1.25M" : `${idx * 25}k`}
                              </text>
                            </g>
                          ))}
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* Dynamic Operations Overview Grid */}
              <div className="grid md:grid-cols-2 gap-5 font-mono text-xs">
                
                {/* Active Cloud Alarms Panel */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-5">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
                    <span className="font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="h-4.5 w-4.5 text-blue-400" />
                      Active Operations Incident Alarms ({filteredIncidents.filter(i => i.active).length})
                    </span>
                    <button onClick={() => setActiveSection("operations")} className="text-blue-400 hover:text-blue-300 text-[9px] uppercase cursor-pointer">
                      View Active Alarms →
                    </button>
                  </div>
                  <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                    {filteredIncidents.filter(i => i.active).slice(0, 3).map(inc => (
                      <div key={inc.id} className="p-3 bg-slate-900/40 border border-slate-900 rounded-lg flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${inc.severity === "high" ? "bg-rose-500" : "bg-amber-400"} animate-pulse`} />
                            <h4 className="font-bold text-slate-200">{inc.title}</h4>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[240px]">{inc.description}</p>
                          <span className="text-[9px] text-slate-600 block mt-1.5">📍 {inc.location} • reported by {inc.reportedBy}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8.5px] uppercase font-bold shrink-0 ${
                          inc.severity === "high" ? "bg-rose-950/40 text-rose-400 border border-rose-500/20" : "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                        }`}>
                          {inc.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cloud Logging audit log feed */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-5">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
                    <span className="font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="h-4.5 w-4.5 text-blue-500" />
                      Cloud Logging Audit Logs (gcloud telemetry)
                    </span>
                    <button onClick={() => setShowCloudShell(true)} className="text-blue-400 hover:text-blue-300 text-[9px] uppercase cursor-pointer">
                      Open Cloud Shell →
                    </button>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-900 p-3.5 rounded-lg space-y-2 text-[9px] leading-relaxed text-slate-400 font-mono h-56 overflow-y-auto">
                    <div>
                      <span className="text-slate-500">[2026-07-04 10:28:44]</span> <span className="text-emerald-400">[INFO]</span> IAM credential authorization granted for gov-admin-14
                    </div>
                    <div>
                      <span className="text-slate-500">[2026-07-04 10:29:12]</span> <span className="text-emerald-400">[INFO]</span> bq-repartition-job complete: optimized 24 regional indices
                    </div>
                    <div>
                      <span className="text-slate-500">[2026-07-04 10:29:55]</span> <span className="text-blue-400">[CUDA]</span> binding device 0 [NVIDIA H100] grid layout: 512 threads/block
                    </div>
                    <div>
                      <span className="text-slate-500">[2026-07-04 10:30:18]</span> <span className="text-amber-400">[WARN]</span> BigQuery telemetry stream: heavy query latency peak at grand-avenue-bridge (940ms)
                    </div>
                    <div>
                      <span className="text-slate-500">[2026-07-04 10:31:02]</span> <span className="text-emerald-400">[INFO]</span> RMM heap allocator refreshed: memory pool clean status 100%
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* SECTION 2: COMPUTE ENGINE (NVIDIA GPU ACCELERATOR CORE) */}
          {activeSection === "compute" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-lg font-extrabold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="h-5.5 w-5.5 text-emerald-400 animate-pulse" />
                    GCP Compute Engine (NVIDIA RAPIDS Core GPU Cluster)
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">Active streaming CUDA virtual machine kernels</p>
                </div>
              </div>
              <GPUPerformanceDashboard />
            </div>
          )}

          {/* SECTION 3: BIGQUERY GIS ANALYTICS */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              
              {/* GIS Query Interface Header */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-900 pb-3 mb-4">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <Database className="h-4.5 w-4.5 text-blue-400" />
                      BigQuery GIS Telemetry Query Analyzer
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono">Run spatial analysis and aggregate queries on city congestion zones</p>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded p-1.5 text-[10.5px] text-slate-200 font-bold focus:outline-none focus:border-blue-500/50 cursor-pointer"
                    >
                      <option value="Last Hour">Last Hour (Live)</option>
                      <option value="Last 24 Hours">Last 24 Hours</option>
                      <option value="Last 7 Days">Last 7 Days</option>
                    </select>
                  </div>
                </div>

                {/* SQL playground code box */}
                <div className="relative font-mono text-xs border border-slate-900 bg-slate-950/80 rounded-lg p-4 overflow-hidden mb-5">
                  <div className="absolute top-1 right-2 text-[8px] text-slate-600 uppercase font-black">Interactive Query Engine</div>
                  <pre className="text-blue-400 leading-normal select-text">
<span className="text-purple-400 font-bold">SELECT</span> region, severity, COUNT(*), AVG(traffic_delay_min) <span className="text-purple-400 font-bold">AS</span> avg_delay<br />
<span className="text-purple-400 font-bold">FROM</span> `citypulse-telem-prod.gis_spatial.incident_alarms`<br />
<span className="text-purple-400 font-bold">WHERE</span> timestamp &gt;= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)<br />
<span className="text-purple-400 font-bold">GROUP BY</span> region, severity<br />
<span className="text-purple-400 font-bold">ORDER BY</span> avg_delay <span className="text-purple-400 font-bold">DESC</span>;
                  </pre>
                </div>

                {/* Query Performance Statistics panel */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs text-slate-400">
                  <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-lg text-center">
                    <span className="text-[8.5px] uppercase text-slate-500 block">Total rows queried</span>
                    <span className="font-bold text-slate-200 mt-1 block">1,250,000</span>
                  </div>
                  <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-lg text-center">
                    <span className="text-[8.5px] uppercase text-slate-500 block">Bytes processed</span>
                    <span className="font-bold text-slate-200 mt-1 block">38.2 MB</span>
                  </div>
                  <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-lg text-center">
                    <span className="text-[8.5px] uppercase text-slate-500 block">Standard CPU Query time</span>
                    <span className="font-bold text-slate-400 line-through mt-1 block">15,400 ms</span>
                  </div>
                  <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-lg text-center">
                    <span className="text-[8.5px] uppercase text-slate-500 block">NVIDIA GPU query time</span>
                    <span className="font-black text-emerald-400 mt-1 block">440 ms (35.0x Faster)</span>
                  </div>
                </div>

              </div>

              {/* BigQuery Spatial Analytics Charting */}
              <div className="grid md:grid-cols-3 gap-5 font-mono text-xs">
                
                {/* Column 1 & 2: Interactive SVG Congestion Speedup Index chart */}
                <div className="md:col-span-2 bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col justify-between">
                  <div className="border-b border-slate-900 pb-3 mb-4">
                    <span className="text-[9.5px] uppercase text-slate-500 block font-black">Regional BigQuery Indices</span>
                    <h4 className="text-slate-200 font-bold mt-1 text-xs">Spatial Density Level across Cities</h4>
                  </div>

                  <div className="flex-1 min-h-[200px] flex flex-col justify-center">
                    <svg viewBox="0 0 450 180" className="w-full h-full overflow-visible select-none">
                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, gridIdx) => {
                        const y = 15 + ratio * 130;
                        const gridVal = Math.round(100 - ratio * 100);
                        return (
                          <g key={gridIdx}>
                            <line x1="50" y1={y} x2="420" y2={y} className="stroke-slate-900/60" strokeWidth="1" strokeDasharray="3 3" />
                            <text x="40" y={y + 3} className="fill-slate-500 text-[8.5px] text-right">{gridVal}%</text>
                          </g>
                        );
                      })}

                      {/* Bar groups */}
                      {[
                        { label: "Downtown", val: 85, fill: "fill-blue-500" },
                        { label: "Industrial", val: 94, fill: "fill-amber-500" },
                        { label: "Uptown Tech", val: 58, fill: "fill-emerald-500" },
                        { label: "Riverfront", val: 42, fill: "fill-cyan-500" }
                      ].map((item, bIdx) => {
                        const barWidth = 25;
                        const spacing = 90;
                        const x = 75 + bIdx * spacing;
                        const h = (item.val / 100) * 130;
                        const y = 145 - h;

                        return (
                          <g key={bIdx}>
                            <rect x={x} y={y} width={barWidth} height={h} className={`${item.fill} opacity-80 hover:opacity-100 transition-all`} rx="3" />
                            <text x={x + 12.5} y={y - 8} className="fill-slate-300 font-bold text-[9px] text-center" textAnchor="middle">{item.val}%</text>
                            <text x={x + 12.5} y="162" className="fill-slate-500 text-[8px] text-center" textAnchor="middle">{item.label}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Column 3: BigQuery Dataset Schema Vitals info card */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-4">
                  <div className="border-b border-slate-900 pb-2 mb-2">
                    <span className="text-[9.5px] uppercase text-slate-500 block font-black">GIS Table Details</span>
                    <h4 className="text-slate-200 font-bold mt-1 text-xs">Dataset Schema Metadata</h4>
                  </div>

                  <div className="space-y-3.5 text-[11px]">
                    <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-lg">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Partition Field:</span>
                        <span className="font-extrabold text-blue-400">timestamp (HOUR)</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-lg">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Clustering Fields:</span>
                        <span className="font-extrabold text-emerald-400">geopoint, severity</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-lg">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Storage Tier:</span>
                        <span className="font-extrabold text-slate-200">Standard Active SSD</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* SECTION 4: CLOUD OPERATIONS (MONITORING ALARMS & INCIDENTS) */}
          {activeSection === "operations" && (
            <div className="space-y-6">
              
              {/* Operations Control Header */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4 mb-4">
                  <div>
                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-blue-400" />
                      Operations incident Alarm Monitoring
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono">Verify incoming IoT warnings, resolve road blockades, and broadcast warning coordinates</p>
                  </div>

                  <button
                    onClick={() => setShowCreateDrawer(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 transition-all font-mono cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    CREATE ALARM INSTANCE
                  </button>
                </div>

                {/* Advanced Multi-layer Filter Panel */}
                <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl space-y-4 font-mono text-xs">
                  <div className="flex items-center gap-2 text-slate-400 border-b border-slate-900/60 pb-2">
                    <ListFilter className="h-4 w-4 text-blue-500" />
                    <span className="font-bold text-[10px] uppercase">Data Filters & Filtering Parameters</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Severity Selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-slate-500 font-black">Filter Severity</label>
                      <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 focus:outline-none text-[10.5px] text-slate-300 font-bold cursor-pointer"
                      >
                        <option value="all">All Severities</option>
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>

                    {/* Status Selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-slate-500 font-black">Filter Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 focus:outline-none text-[10.5px] text-slate-300 font-bold cursor-pointer"
                      >
                        <option value="all">All States</option>
                        <option value="active">Active State Only</option>
                        <option value="resolved">Resolved State Only</option>
                      </select>
                    </div>

                    {/* Hazard Type Selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-slate-500 font-black">Filter Hazard Type</label>
                      <select
                        value={hazardFilter}
                        onChange={(e) => setHazardFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 focus:outline-none text-[10.5px] text-slate-300 font-bold cursor-pointer"
                      >
                        <option value="all">All Hazards</option>
                        <option value="traffic">Traffic Congestion</option>
                        <option value="accident">Accident / Collision</option>
                        <option value="flood">Flood Basins</option>
                        <option value="road_damage">Road Damage</option>
                        <option value="closure">Road Closures</option>
                      </select>
                    </div>

                    {/* Global Search text input inside card */}
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase text-slate-500 font-black">Text Filter Search</label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-600" />
                        <input
                          type="text"
                          placeholder="Search keyword..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded py-1.5 pl-8 pr-3 focus:outline-none focus:border-blue-500/50 text-[10.5px] text-slate-300 placeholder:text-slate-650"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Incidents Data Grid */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono text-slate-400 border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-slate-850 text-slate-500 text-[10px] uppercase font-black">
                        <th className="py-3 px-4">Severity / Hazard</th>
                        <th className="py-3 px-4">Incident Alarm Context</th>
                        <th className="py-3 px-4">Host Node / Reporter</th>
                        <th className="py-3 px-4">Operation State</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60">
                      {filteredIncidents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-600 text-xs font-mono">
                            No alarm records matching filter criteria in regional telemetry logs
                          </td>
                        </tr>
                      ) : (
                        filteredIncidents.map(inc => (
                          <tr key={inc.id} className="hover:bg-slate-900/35 transition-colors">
                            <td className="py-3.5 px-4 space-y-1.5">
                              <span className={`px-2 py-0.5 rounded text-[8.5px] uppercase font-extrabold border block text-center max-w-[85px] ${
                                inc.severity === "high" 
                                  ? "bg-rose-950/50 text-rose-400 border-rose-500/20" 
                                  : "bg-amber-950/50 text-amber-400 border-amber-500/20"
                              }`}>
                                {inc.severity} priority
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[8.5px] uppercase font-bold border block text-center max-w-[85px] ${
                                inc.type === "flood"
                                  ? "bg-blue-950/40 text-blue-400 border-blue-500/10"
                                  : "bg-slate-900 text-slate-300 border-slate-800"
                              }`}>
                                {inc.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 max-w-sm">
                              <div className="font-extrabold text-slate-200 text-xs hover:underline cursor-pointer" onClick={() => setSelectedIncidentDetail(inc)}>
                                {inc.title}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed truncate">{inc.description}</p>
                              <div className="text-[9.5px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                                <MapPin className="h-3 w-3 text-blue-500" />
                                <span>{inc.location} (Lat: {inc.lat}, Lng: {inc.lng})</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[10px]">
                              <div className="font-semibold text-slate-400">{inc.reportedBy}</div>
                              <div className="text-[9px] text-slate-600 mt-0.5">Stream: {inc.timestamp || "Just now"}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${inc.active ? "bg-amber-400 animate-pulse" : "bg-slate-700"}`} />
                                <span className={`text-[10px] uppercase font-bold ${inc.active ? "text-amber-400" : "text-slate-500"}`}>
                                  {inc.active ? "ACTIVE" : "RESOLVED"}
                                </span>
                              </div>
                              {inc.verified && (
                                <span className="text-[8.5px] text-emerald-400 font-extrabold block mt-1 uppercase">✓ VERIFIED BY ADMIN</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setIsShowingTrace(true);
                                    setActiveTracePayload(JSON.stringify(inc, null, 2));
                                  }}
                                  className="p-1.5 border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-all cursor-pointer"
                                  title="View JSON Trace"
                                >
                                  <Terminal className="h-3.5 w-3.5" />
                                </button>
                                {!inc.verified && inc.active && (
                                  <button
                                    onClick={() => onVerifyIncident(inc.id)}
                                    className="p-1.5 border border-emerald-500/20 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 rounded transition-all cursor-pointer"
                                    title="Verify Ingress Log"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {inc.active && (
                                  <button
                                    onClick={() => onResolveIncident(inc.id)}
                                    className="p-1.5 border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-all cursor-pointer"
                                    title="Resolve Incident Alert"
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 text-blue-400" />
                                  </button>
                                )}
                                <button
                                  onClick={() => onDeleteIncident(inc.id)}
                                  className="p-1.5 border border-rose-500/20 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 rounded transition-all cursor-pointer"
                                  title="Delete Incident Record"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stack Trace Modal Details */}
              {isShowingTrace && (
                <div className="border border-slate-800 bg-slate-950 rounded-xl p-5 font-mono text-[10px] space-y-3 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="font-extrabold uppercase text-blue-400 tracking-widest text-[9px]">Gcloud Stack Telemetry Trace Payload</span>
                    <button onClick={() => setIsShowingTrace(false)} className="text-slate-500 hover:text-slate-300 text-xs uppercase cursor-pointer">Close Trace</button>
                  </div>
                  <pre className="bg-slate-950 border border-slate-900/60 p-4 rounded text-slate-400 max-h-56 overflow-y-auto leading-normal select-all whitespace-pre-wrap">
                    {activeTracePayload}
                  </pre>
                </div>
              )}

              {/* Detailed overlay incident detail card */}
              {selectedIncidentDetail && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 font-mono animate-fade-in">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <span className="text-blue-400 font-extrabold text-[9px] uppercase">Alarms Diagnostic details</span>
                    <button onClick={() => setSelectedIncidentDetail(null)} className="text-slate-500 hover:text-slate-300 text-xs uppercase cursor-pointer">Clear Detail</button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <span className="text-slate-500 block uppercase text-[9px]">Incident title</span>
                      <p className="font-bold text-slate-200 text-sm">{selectedIncidentDetail.title}</p>
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-slate-500 block uppercase text-[9px]">Location description</span>
                      <p className="font-bold text-slate-300">📍 {selectedIncidentDetail.location}</p>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <span className="text-slate-500 block uppercase text-[9px]">Description audit notes</span>
                      <p className="text-slate-400 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-900">{selectedIncidentDetail.description}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* SECTION 5: CLOUD LOGGING & REPORTS EXPORTER */}
          {activeSection === "reports" && (
            <div className="space-y-6">
              
              {/* Report Panel Header */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-5">
                <div className="border-b border-slate-900 pb-3 mb-4">
                  <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Cloud Operations Log Auditing & Exporter
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">Compile detailed, printable telemetry audits of regional hazard incident clusters</p>
                </div>

                {/* Configurations parameters */}
                <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl grid md:grid-cols-3 gap-4 font-mono text-xs">
                  {/* Select target district */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-slate-500 font-black">Region Scope</label>
                    <select
                      value={reportDistrict}
                      onChange={(e) => setReportDistrict(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="All Districts">All Districts (Global)</option>
                      <option value="Downtown Core">Downtown Core</option>
                      <option value="Industrial Hub">Industrial Hub</option>
                      <option value="Uptown Tech">Uptown Tech</option>
                    </select>
                  </div>

                  {/* Granularity level */}
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-slate-500 font-black">Granularity</label>
                    <select
                      value={reportGranularity}
                      onChange={(e) => setReportGranularity(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="executive">Executive Summary Only</option>
                      <option value="technical">High-Level Technical Metrics</option>
                      <option value="full-audit">Complete System Log Audit</option>
                    </select>
                  </div>

                  {/* Trigger compiler button */}
                  <div className="flex items-end">
                    <button
                      onClick={triggerGCPReportCompile}
                      disabled={isCompilingReport}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      <RefreshCw className={`h-4 w-4 ${isCompilingReport ? "animate-spin text-blue-100" : ""}`} />
                      {isCompilingReport ? `Compiling logs (${reportCompileProgress}%)` : "COMPILE DIGITAL AUDIT"}
                    </button>
                  </div>
                </div>

                {/* progress indicator */}
                {isCompilingReport && (
                  <div className="mt-4 bg-slate-900 border border-slate-850 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-300" style={{ width: `${reportCompileProgress}%` }} />
                  </div>
                )}
              </div>

              {/* Digital audit print layout */}
              {compiledReportData && (
                <div className="grid lg:grid-cols-3 gap-6 animate-fade-in font-mono text-xs">
                  
                  {/* Print Document container */}
                  <div className="lg:col-span-2 border border-slate-800 bg-slate-950 rounded-xl p-6 shadow-2xl relative">
                    {/* authentic printable watermarks */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-900/10 text-3xl font-black uppercase tracking-widest select-none pointer-events-none text-center">
                      Google Cloud Console Audit Log<br />INTERNAL USE ONLY
                    </div>

                    <div className="flex justify-between items-start border-b border-slate-900 pb-4 mb-4 relative z-10">
                      <div>
                        <span className="text-[8.5px] uppercase text-slate-500 block">Digital System Audit</span>
                        <h4 className="text-slate-200 font-extrabold text-sm uppercase">GCP Regional Operations Log Report</h4>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={downloadCompiledCSV}
                          className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-[10.5px] transition-all cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          CSV
                        </button>
                      </div>
                    </div>

                    <div className="space-y-5 text-slate-300 relative z-10 leading-relaxed">
                      
                      {/* Document Details Block */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-900 text-[10.5px]">
                        <div>
                          <span className="text-slate-500 uppercase block text-[8px]">Scope identifier</span>
                          <span className="font-bold text-blue-400">{compiledReportData.scopeId}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase block text-[8px]">Target Region</span>
                          <span className="font-bold text-slate-200">{compiledReportData.region}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase block text-[8px]">Detail level</span>
                          <span className="font-bold text-slate-200 uppercase">{compiledReportData.granularity}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase block text-[8px]">Compiled Timestamp</span>
                          <span className="font-bold text-slate-400 text-[9.5px]">{compiledReportData.timestamp}</span>
                        </div>
                      </div>

                      {/* KPI Telemetry variables */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-slate-900/20 border border-slate-900/60 rounded-xl">
                          <span className="text-slate-500 uppercase block text-[8px]">Active alarms</span>
                          <span className="font-bold text-slate-100 text-sm mt-1 block">{compiledReportData.telemetrySummary.activeAlerts}</span>
                        </div>
                        <div className="p-3 bg-slate-900/20 border border-slate-900/60 rounded-xl">
                          <span className="text-slate-500 uppercase block text-[8px]">Verified Alerts</span>
                          <span className="font-bold text-emerald-400 text-sm mt-1 block">{compiledReportData.telemetrySummary.verifiedAlerts}</span>
                        </div>
                        <div className="p-3 bg-slate-900/20 border border-slate-900/60 rounded-xl">
                          <span className="text-slate-500 uppercase block text-[8px]">Total logged</span>
                          <span className="font-bold text-slate-100 text-sm mt-1 block">{compiledReportData.telemetrySummary.totalLogged}</span>
                        </div>
                      </div>

                      {/* Log table simulation */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block">Regional system logs segment:</span>
                        <div className="border border-slate-900 rounded-lg p-3 bg-slate-950 space-y-1.5 text-[10px] leading-relaxed max-h-48 overflow-y-auto">
                          {filteredIncidents.map((inc, i) => (
                            <div key={i} className="flex justify-between items-start gap-3 border-b border-slate-900/40 pb-1.5 last:border-0 last:pb-0 text-slate-400">
                              <span className="text-[8.5px] text-slate-650 shrink-0 uppercase">{inc.timestamp || "Live Ingress"}</span>
                              <span className="font-bold text-slate-300 truncate max-w-[280px]">{inc.title}</span>
                              <span className={`text-[8.5px] uppercase font-bold ${inc.severity === "high" ? "text-rose-400" : "text-amber-400"}`}>{inc.severity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Generated AI Executive Summary inside Report Container */}
                      {aiReportSummary && (
                        <div className="border-t border-slate-900 pt-5 mt-4">
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <Sparkles className="h-4 w-4 text-emerald-400" />
                            <span className="text-[9.5px] text-emerald-400 font-extrabold uppercase tracking-widest">
                              Google Cloud Operations Summary (AI Powered)
                            </span>
                          </div>
                          <div className="bg-emerald-950/5 border border-emerald-500/10 p-4 rounded-xl text-[11px] leading-relaxed text-slate-300 space-y-3 whitespace-pre-line">
                            {aiReportSummary}
                          </div>
                        </div>
                      )}

                    </div>

                    <div className="border-t border-slate-900/80 pt-3 mt-6 flex justify-between items-center text-[9px] text-slate-600">
                      <span>Authority Hash: GCP_MUNICIPAL_TELEMETRY_ENGINE</span>
                      <span>Security Grade: Level-1 Admin Read</span>
                    </div>
                  </div>

                  {/* AI Report Controller Column */}
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-4 h-fit">
                    <div className="flex items-center gap-1.5 border-b border-slate-900 pb-2 mb-2">
                      <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
                      <h4 className="font-extrabold uppercase text-slate-300">Operations AI Assistant</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Connect to Gemini API backend nodes to synthesize professional executive summaries, causative analyses, and optimization advice tailored to this digital audit.
                    </p>

                    <button
                      onClick={compileReportAISummary}
                      disabled={aiReportLoading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      {aiReportLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin text-blue-100" />
                          Synthesizing summaries...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          GENERATE WEEKLY AI SUMMARY
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* 3. collapsible GCP Command Shell Console at page bottom */}
      {showCloudShell && (
        <div className="bg-black border-t border-slate-850 h-56 flex flex-col font-mono text-[10px] shrink-0 relative z-40">
          {/* Shell header */}
          <div className="bg-slate-950 h-8 flex items-center justify-between px-4 border-b border-slate-900 select-none">
            <div className="flex items-center gap-2 text-slate-300">
              <Terminal className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-extrabold">Cloud Shell (gov-admin-14)</span>
            </div>
            <button
              onClick={() => setShowCloudShell(false)}
              className="text-slate-500 hover:text-slate-300 text-xs font-bold uppercase cursor-pointer"
            >
              Minimize Shell [X]
            </button>
          </div>

          {/* Shell body logs */}
          <div className="flex-1 overflow-y-auto p-3 text-slate-400 leading-relaxed space-y-1">
            {shellLogs.map((log, i) => (
              <div key={i} className="whitespace-pre-wrap">{log}</div>
            ))}
            <div ref={shellEndRef} />
          </div>

          {/* Shell Form input */}
          <form onSubmit={handleShellCommand} className="bg-slate-950/60 border-t border-slate-900 h-8 flex items-center px-3 gap-2">
            <span className="text-[#1a73e8] font-bold shrink-0">$</span>
            <input
              type="text"
              placeholder="Type gcloud SDK or BigQuery commands... Try 'help' for support."
              value={shellInput}
              onChange={(e) => setShellInput(e.target.value)}
              className="flex-1 bg-transparent border-none text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-0 text-[10px]"
            />
          </form>
        </div>
      )}

      {/* 4. GCP VM Resource / Incident creation Side Drawer */}
      {showCreateDrawer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-slate-950 border-l border-slate-850 h-full flex flex-col justify-between p-6 shadow-2xl overflow-y-auto font-mono text-xs">
            
            <div className="space-y-6">
              {/* Drawer Title */}
              <div className="border-b border-slate-900 pb-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-blue-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-widest">Create VM Alarm Instance</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Deploy custom Operations monitoring alarms onto host GPUs</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateDrawer(false)}
                  className="text-slate-500 hover:text-slate-300 font-bold uppercase cursor-pointer"
                >
                  [X] Close
                </button>
              </div>

              {/* Resource Creation Form */}
              <form onSubmit={handleCreateResource} className="space-y-4">
                
                {/* Form fields layout */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Incident Type */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase text-slate-500 font-black">Hazard Type</label>
                    <select
                      value={createForm.type}
                      onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="traffic">Traffic Congestion</option>
                      <option value="accident">Accident / Collision</option>
                      <option value="flood">Flood basin hazard</option>
                      <option value="road_damage">Road damage potholes</option>
                      <option value="closure">Road closures</option>
                    </select>
                  </div>

                  {/* Priority level */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase text-slate-500 font-black">Alarm Severity</label>
                    <select
                      value={createForm.severity}
                      onChange={(e) => setCreateForm({ ...createForm, severity: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Host Instance VM mapping */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase text-slate-500 font-black">Host Machine Instance</label>
                    <select
                      value={createForm.hostInstance}
                      onChange={(e) => setCreateForm({ ...createForm, hostInstance: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="instance-h100-01">instance-h100-01 (Hopper)</option>
                      <option value="instance-a100-02">instance-a100-02 (Ampere)</option>
                      <option value="instance-l4-03">instance-l4-03 (Ada Lovelace)</option>
                    </select>
                  </div>

                  {/* Region Location */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase text-slate-500 font-black">Location Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grand Highway Intersection"
                      value={createForm.location}
                      onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Alarm warning title */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase text-slate-500 font-black">Alarm Broadcast Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Critical flooding logged by telemetry sensor"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-bold focus:outline-none"
                  />
                </div>

                {/* Geo-coordinates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase text-slate-500 font-black">Latitude coordinate (0-100)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      value={createForm.lat}
                      onChange={(e) => setCreateForm({ ...createForm, lat: parseFloat(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase text-slate-500 font-black">Longitude coordinate (0-100)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      value={createForm.lng}
                      onChange={(e) => setCreateForm({ ...createForm, lng: parseFloat(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-bold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase text-slate-500 font-black">Detailed Alert Audit notes</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide telemetry parameters, lanes impacted, warning directives..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-bold focus:outline-none resize-none"
                  />
                </div>

                {/* Form submit footer */}
                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => setShowCreateDrawer(false)}
                    className="border border-slate-800 hover:bg-slate-900 text-slate-400 py-2.5 px-4 rounded-xl transition-all font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-5 rounded-xl shadow-lg transition-all font-bold cursor-pointer"
                  >
                    Deploy alarm instance
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
