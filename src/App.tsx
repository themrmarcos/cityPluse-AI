import React, { useState } from "react";
import {
  Layers, MapPin, AlertTriangle, CloudRain, Shield, Zap, TrendingUp, Activity,
  Server, Cpu, FileText, ArrowRight, Menu, LogOut, Settings, Info, User, Lock, Mail, Compass, Star, RefreshCw
} from "lucide-react";
import { UserProfile, UserRole, Incident, RouteOption, CityMetrics } from "./types";
import { INITIAL_INCIDENTS, INITIAL_METRICS } from "./data/mockData";

// Extracted Sub-Components
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import InteractiveMap from "./components/InteractiveMap";
import RoutePlanner from "./components/RoutePlanner";
import AIAssistant from "./components/AIAssistant";
import RiskAnalysisGauges from "./components/RiskAnalysisGauges";
import AdminPanel from "./components/AdminPanel";
import ReportPage from "./components/ReportPage";
import SettingsPage from "./components/SettingsPage";
import NotificationToast from "./components/NotificationToast";

type PageType = "landing" | "login" | "portal";

export default function App() {
  const [page, setPage] = useState<PageType>("landing");
  const [authMethod, setAuthMethod] = useState<"google" | "email" | null>(null);
  
  // Simulated user credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<UserProfile>({
    name: "Alex Mercer",
    email: "alex.mercer@cybercity.gov",
    role: "citizen",
    notificationsEnabled: true,
    theme: "dark",
    language: "English"
  });

  const [activeTab, setActiveTab] = useState<"dashboard" | "map" | "planner" | "ai" | "admin" | "reports" | "settings">("dashboard");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");

  // Shared incidents telemetry list
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Active Map GIS layers
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    traffic: true,
    accidents: true,
    road_damage: true,
    flood: true,
    construction: false,
    pollution: false,
    weather: false,
    closure: true
  });

  // Selected route pathway
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);

  const handleToggleLayer = (layerId: string) => {
    setActiveLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  const handleRoleChange = (role: UserRole) => {
    setProfile(prev => ({ ...prev, role }));
  };

  const handleStartPlatform = () => {
    setPage("login");
  };

  // Login simulation handlers
  const handleGoogleSignIn = () => {
    setLoadingSim("google");
    setTimeout(() => {
      setProfile(prev => ({
        ...prev,
        name: "Govind Kumar Jha",
        email: "master.govindkumarjha@gmail.com",
        role: "admin" // Automatically default to admin for robust testing of all panels
      }));
      setPage("portal");
      setLoadingSim(null);
    }, 1200);
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSim("email");
    setTimeout(() => {
      setProfile(prev => ({
        ...prev,
        name: email.split("@")[0] || "Operator Alpha",
        email: email || "operator@citypulse.gov",
        role: "citizen"
      }));
      setPage("portal");
      setLoadingSim(null);
    }, 1200);
  };

  const [loadingSim, setLoadingSim] = useState<"google" | "email" | null>(null);

  // Administrative telemetry updates
  const handleVerifyIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, verified: true, reportsCount: inc.reportsCount + 1 } : inc));
  };

  const handleResolveIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, active: false } : inc));
  };

  const handleDeleteIncident = (id: string) => {
    setIncidents(prev => prev.filter(inc => inc.id !== id));
  };

  const handleAddIncident = (newInc: Omit<Incident, "id" | "reportsCount" | "verified" | "timestamp">) => {
    const fresh: Incident = {
      ...newInc,
      id: `inc-${Date.now()}`,
      reportsCount: 1,
      verified: profile.role === "admin",
      timestamp: "Just now"
    };
    setIncidents(prev => [fresh, ...prev]);
    // Auto toggle that layer to ON so it immediately renders
    setActiveLayers(prev => ({ ...prev, [newInc.type]: true }));
    // View on map
    setSelectedIncident(fresh);
    setActiveTab("map");
  };

  const handleLogout = () => {
    setPage("landing");
    setActiveTab("dashboard");
    onSelectRoute(null);
  };

  // Synchronize selecting route with showing route layer on Map
  const onSelectRoute = (route: RouteOption | null) => {
    setSelectedRoute(route);
    if (route) {
      // Auto focus and visual guide on Map tab
      setActiveTab("map");
    }
  };

  const activeIncidents = incidents.filter(inc => inc.active);

  return (
    <div className={`min-h-screen font-sans ${profile.theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* 1. LANDING PAGE VIEW */}
      {page === "landing" && (
        <LandingPage onStart={handleStartPlatform} />
      )}

      {/* 2. AUTHENTICATION SCREENS */}
      {page === "login" && (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
          {/* Animated Background rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-blue-500/10 rounded-full animate-ping duration-4000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-emerald-500/10 rounded-full animate-pulse" />
          
          <div className="relative z-10 max-w-md w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex p-3 bg-blue-600/10 border border-blue-500/30 rounded-2xl mb-4">
                <Layers className="h-6 w-6 text-blue-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">CityPulse AI Portal</h2>
              <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">Urban Operations Authorization</p>
            </div>

            {loadingSim ? (
              <div className="py-12 text-center space-y-4">
                <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-400">Authenticating credentials via secure IAM node...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Google Sign In option */}
                <button
                  onClick={handleGoogleSignIn}
                  id="google-sign-in-btn"
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs py-3.5 px-4 rounded-xl shadow-lg transition-all hover:scale-102 cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.465 0-6.285-2.82-6.285-6.285a6.29 6.29 0 016.285-6.285c1.55 0 2.96.561 4.062 1.493l3.056-3.055A10.457 10.457 0 0012.24 2C6.58 2 2 6.58 2 12.24s4.58 10.24 10.24 10.24c5.79 0 10.155-3.99 10.155-10.155 0-.61-.05-1.19-.155-1.74H12.24z"
                    />
                  </svg>
                  Sign In with Google
                </button>

                <div className="flex items-center gap-3 text-slate-600 my-4">
                  <div className="h-px bg-slate-800 flex-1" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">or use email</span>
                  <div className="h-px bg-slate-800 flex-1" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                      <input
                        type="email"
                        required
                        placeholder="operator@citypulse.gov"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Secure PIN / Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="email-sign-in-submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-3.5 px-4 rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    Authenticate email
                  </button>
                </form>

                <button
                  onClick={() => setPage("landing")}
                  className="w-full text-center text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest pt-2"
                >
                  ← Back to landing
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MAIN DASHBOARD PORTAL GRID */}
      {page === "portal" && (
        <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-200 ${
          profile.theme === "dark" ? "bg-[#090d16] text-slate-100" : "bg-slate-50 text-slate-800"
        }`}>
          
          {/* Navigation Sidebar */}
          <aside className={`w-full md:w-60 border-b md:border-b-0 md:border-r flex flex-col justify-between p-4 md:min-h-screen transition-all ${
            profile.theme === "dark" 
              ? "border-slate-800 bg-slate-950 text-slate-100" 
              : "border-slate-200 bg-white text-slate-850 shadow-sm"
          }`}>
            <div className="space-y-6">
              {/* Brand Logo */}
              <div className={`flex items-center gap-3 border-b pb-4 ${
                profile.theme === "dark" ? "border-slate-800" : "border-slate-100"
              }`}>
                <div className={`p-2 border rounded-xl ${
                  profile.theme === "dark" ? "bg-blue-950/40 border-blue-500/20" : "bg-blue-50 border-blue-200"
                }`}>
                  <Layers className="h-4.5 w-4.5 text-blue-500" />
                </div>
                <div>
                  <h1 className={`text-sm font-black tracking-tight ${
                    profile.theme === "dark" ? "text-slate-100" : "text-slate-900"
                  }`}>
                    CityPulse AI
                  </h1>
                  <span className="text-[8.5px] font-mono tracking-widest text-emerald-500 uppercase font-bold">
                    {profile.role} Operator
                  </span>
                </div>
              </div>

              {/* Navigation List items */}
              <nav className="space-y-1 text-xs font-semibold">
                {[
                  { id: "dashboard", label: "Looker Dashboard", icon: <TrendingUp className="h-4 w-4" /> },
                  { id: "map", label: "Interactive GIS Map", icon: <MapPin className="h-4 w-4" /> },
                  { id: "planner", label: "Smart Route Planner", icon: <Compass className="h-4.5 w-4.5" /> },
                  { id: "ai", label: "Gemini AI Co-Pilot", icon: <Cpu className="h-4 w-4" /> },
                  { id: "admin", label: "NVIDIA RAPIDS & DoT", icon: <Server className="h-4 w-4" /> },
                  { id: "reports", label: "Executive Reports", icon: <FileText className="h-4 w-4" /> },
                  { id: "settings", label: "User Preferences", icon: <Settings className="h-4 w-4" /> }
                ].map(navItem => {
                  const isActive = activeTab === navItem.id;
                  return (
                    <button
                      key={navItem.id}
                      onClick={() => setActiveTab(navItem.id as any)}
                      id={`sidebar-nav-${navItem.id}`}
                      className={`w-full flex items-center gap-3.5 p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/15"
                          : profile.theme === "dark"
                          ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                      }`}
                    >
                      {navItem.icon}
                      <span>{navItem.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Profile summary & Logout block */}
            <div className={`border-t pt-4 mt-6 space-y-3 ${
              profile.theme === "dark" ? "border-slate-800" : "border-slate-100"
            }`}>
              <div className={`flex items-center gap-3 p-2 border rounded-xl ${
                profile.theme === "dark" ? "bg-slate-900/20 border-slate-800" : "bg-slate-50 border-slate-150"
              }`}>
                <div className={`w-8 h-8 font-black text-xs rounded-lg flex items-center justify-center uppercase border ${
                  profile.theme === "dark" ? "bg-blue-950/40 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-700"
                }`}>
                  {profile.name.substring(0, 2)}
                </div>
                <div>
                  <h4 className={`text-[11px] font-bold leading-tight ${
                    profile.theme === "dark" ? "text-slate-300" : "text-slate-800"
                  }`}>{profile.name}</h4>
                  <span className="text-[9.5px] font-mono text-slate-500 truncate block max-w-[120px]">{profile.email}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                id="portal-logout-btn"
                className={`w-full flex items-center justify-center gap-2 border text-xs py-2 rounded-xl transition-all cursor-pointer ${
                  profile.theme === "dark" 
                    ? "border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200" 
                    : "border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-850"
                }`}
              >
                <LogOut className="h-4 w-4 text-rose-500" />
                Sign Out Portal
              </button>
            </div>
          </aside>

          {/* Core Content Arena */}
          <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
            
            {/* Telemetry quick warning strip */}
            <div className={`mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-3 rounded-2xl border transition-all ${
              profile.theme === "dark" ? "bg-slate-900/20 border-slate-800" : "bg-white border-slate-200 shadow-xs"
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <p className={`text-xs font-mono ${
                  profile.theme === "dark" ? "text-slate-300" : "text-slate-600"
                }`}>
                  [SYSTEM_STATUS: OK] • Active telemetry nodes logging {activeIncidents.length} verified city hazards.
                </p>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                <span>LOCAL TIME: 2026-07-04 UTC</span>
                <span>ZONE: WEST-CIVIL-DELTA</span>
              </div>
            </div>

            {/* Section tabs render routes */}
            <div className="space-y-6">
              
              {/* ACTIVE TAB: LOOKER DASHBOARD */}
              {activeTab === "dashboard" && (
                <div className="space-y-4">
                  <RiskAnalysisGauges metrics={INITIAL_METRICS} theme={profile.theme} />
                  <Dashboard
                    metrics={INITIAL_METRICS}
                    userRole={profile.role}
                    onDistrictSelect={setSelectedDistrict}
                    selectedDistrict={selectedDistrict}
                    theme={profile.theme}
                    incidents={incidents}
                  />
                </div>
              )}

              {/* ACTIVE TAB: INTERACTIVE GIS MAP */}
              {activeTab === "map" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">Interactive GIS Core Blueprint Map</h2>
                    <p className="text-xs text-slate-500">Enable spatial layers to display real-time flood basins, road damage, potholes, and construction points.</p>
                  </div>
                  <InteractiveMap
                    incidents={incidents}
                    onSelectIncident={setSelectedIncident}
                    selectedIncident={selectedIncident}
                    activeLayers={activeLayers}
                    onToggleLayer={handleToggleLayer}
                    userRole={profile.role}
                    onAddIncident={handleAddIncident}
                    theme={profile.theme}
                  />
                </div>
              )}

              {/* ACTIVE TAB: ROUTE PLANNER */}
              {activeTab === "planner" && (
                <RoutePlanner
                  onSelectRoute={onSelectRoute}
                  selectedRoute={selectedRoute}
                  userRole={profile.role}
                />
              )}

              {/* ACTIVE TAB: AI ASSISTANT */}
              {activeTab === "ai" && (
                <AIAssistant
                  currentMetrics={INITIAL_METRICS}
                  activeIncidents={activeIncidents}
                />
              )}

              {/* ACTIVE TAB: ADMIN PANEL */}
              {activeTab === "admin" && (
                <AdminPanel
                  incidents={incidents}
                  onVerifyIncident={handleVerifyIncident}
                  onResolveIncident={handleResolveIncident}
                  onDeleteIncident={handleDeleteIncident}
                  onAddIncident={handleAddIncident}
                />
              )}

              {/* ACTIVE TAB: REPORT PAGE */}
              {activeTab === "reports" && (
                <ReportPage />
              )}

              {/* ACTIVE TAB: SETTINGS PAGE */}
              {activeTab === "settings" && (
                <SettingsPage
                  profile={profile}
                  onUpdateProfile={setProfile}
                  onRoleChange={handleRoleChange}
                />
              )}

            </div>
          </main>

          {/* Periodic real-time IoT alert stream */}
          <NotificationToast />

        </div>
      )}

    </div>
  );
}
