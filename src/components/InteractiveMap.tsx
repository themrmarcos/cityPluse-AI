import React, { useState, useEffect, useRef } from "react";
import {
  Layers,
  MapPin,
  AlertTriangle,
  CloudRain,
  ShieldAlert,
  Zap,
  Radio,
  Info,
  X,
  Map as MapIcon,
  Plus,
  RotateCw,
  Compass,
  Maximize2,
  Minimize2,
  Navigation,
  HelpCircle,
  Eye,
  Check
} from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { Incident, IncidentType, UserRole } from "../types";
import { CITY_DISTRICTS } from "../data/mockData";

// API Key detection and binding
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY" && API_KEY.trim() !== "";

// Coordinate projection helper (SF Bounding Box to 0-100 Mock Grid)
const toGPS = (x: number, y: number) => {
  const lat = 37.81 - (y / 100) * 0.11;
  const lng = -122.51 + (x / 100) * 0.15;
  return { lat, lng };
};

const fromGPS = (lat: number, lng: number) => {
  const y = ((37.81 - lat) / 0.11) * 100;
  const x = ((lng - (-122.51)) / 0.15) * 100;
  return { x, y };
};

// Camera Locations for 3D preset flying
const CAMERA_PRESETS = [
  { name: "Downtown Core", center: { lat: 37.755, lng: -122.4425 }, zoom: 14.2, tilt: 60, heading: 45 },
  { name: "Riverfront Delta", center: { lat: 37.7715, lng: -122.465 }, zoom: 14.5, tilt: 55, heading: 125 },
  { name: "Industrial Zone", center: { lat: 37.7275, lng: -122.405 }, zoom: 13.8, tilt: 58, heading: -60 },
  { name: "Uptown Tech Hub", center: { lat: 37.788, lng: -122.435 }, zoom: 14.5, tilt: 50, heading: 15 },
  { name: "Southside Heights", center: { lat: 37.733, lng: -122.4725 }, zoom: 13.8, tilt: 55, heading: 240 }
];

// Map theme styles
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0d1321" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1d2d44" }, { weight: 1.5 }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#90e0ef" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1d2d44" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#151c2e" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1d2d44" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#a2d2ff" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#030712" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4b5563" }] }
];

const lightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#0f172a" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f1f5f9" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e2e8f0" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#bae6fd" }] }
];

// Helper components for Google Maps
function CameraAnimator({ center, zoom, tilt, heading }: { center: google.maps.LatLngLiteral; zoom: number; tilt: number; heading: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    map.setZoom(zoom);
    map.setTilt(tilt);
    map.setHeading(heading);
  }, [map, center, zoom, tilt, heading]);
  return null;
}

function CameraOrbit({ active }: { active: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !active) return;
    let heading = map.getHeading() || 0;
    let animFrame: number;
    const tick = () => {
      heading = (heading + 0.12) % 360;
      map.setHeading(heading);
      animFrame = requestAnimationFrame(tick);
    };
    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [map, active]);
  return null;
}

function TrafficLayerComponent({ active }: { active: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const layer = new google.maps.TrafficLayer();
    if (active) {
      layer.setMap(map);
    } else {
      layer.setMap(null);
    }
    return () => layer.setMap(null);
  }, [map, active]);
  return null;
}

interface InteractiveMapProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  selectedIncident: Incident | null;
  activeLayers: Record<string, boolean>;
  onToggleLayer: (layer: string) => void;
  userRole: UserRole;
  onAddIncident: (newIncident: Omit<Incident, "id" | "reportsCount" | "verified" | "timestamp">) => void;
  theme?: "light" | "dark";
}

export default function InteractiveMap({
  incidents,
  onSelectIncident,
  selectedIncident,
  activeLayers,
  onToggleLayer,
  userRole,
  onAddIncident,
  theme = "dark"
}: InteractiveMapProps) {
  const isDark = theme === "dark";

  // Map Provider and Core control states
  const [mapMode, setMapMode] = useState<"google" | "blueprint">(hasValidKey ? "google" : "blueprint");
  const [reportMode, setReportMode] = useState(false);
  const [clickCoords, setClickCoords] = useState<{ x: number; y: number } | null>(null);

  // 3D Camera Controls
  const [orbitActive, setOrbitActive] = useState(false);
  const [cameraCenter, setCameraCenter] = useState({ lat: 37.755, lng: -122.4425 });
  const [cameraZoom, setCameraZoom] = useState(12.5);
  const [cameraTilt, setCameraTilt] = useState(55);
  const [cameraHeading, setCameraHeading] = useState(45);

  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    type: "traffic" as IncidentType,
    severity: "medium" as "low" | "medium" | "high",
    location: ""
  });

  // Handle click on Blueprint Vector Map
  const handleBlueprintMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!reportMode) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setClickCoords({ x, y });

    // Automatically fill location based on closest district
    let closestDistrict = CITY_DISTRICTS[0];
    let minDist = Infinity;
    CITY_DISTRICTS.forEach(d => {
      const dist = Math.hypot(d.x - x, d.y - y);
      if (dist < minDist) {
        minDist = dist;
        closestDistrict = d;
      }
    });

    setReportForm(prev => ({
      ...prev,
      location: `${closestDistrict.name} Near SF (${x.toFixed(1)}%, ${y.toFixed(1)}%)`
    }));
  };

  // Handle click on Google Map
  const handleGoogleMapClick = (e: any) => {
    if (!reportMode) return;
    const latLng = e.detail.latLng;
    if (!latLng) return;

    const lat = latLng.lat;
    const lng = latLng.lng;
    const coords = fromGPS(lat, lng);

    setClickCoords(coords);

    let closestDistrict = CITY_DISTRICTS[0];
    let minDist = Infinity;
    CITY_DISTRICTS.forEach(d => {
      const dist = Math.hypot(d.x - coords.x, d.y - coords.y);
      if (dist < minDist) {
        minDist = dist;
        closestDistrict = d;
      }
    });

    setReportForm(prev => ({
      ...prev,
      location: `${closestDistrict.name} Near Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`
    }));
  };

  const submitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clickCoords) return;

    onAddIncident({
      title: reportForm.title || `Citizen Reported ${reportForm.type}`,
      description: reportForm.description || "Reported via citizen spatial interface.",
      type: reportForm.type,
      severity: reportForm.severity,
      location: reportForm.location,
      lat: clickCoords.y,
      lng: clickCoords.x,
      reportedBy: userRole === "admin" ? "City Operator" : "Citizen Report",
      active: true
    });

    setReportMode(false);
    setClickCoords(null);
    setReportForm({
      title: "",
      description: "",
      type: "traffic",
      severity: "medium",
      location: ""
    });
  };

  const getMarkerColor = (type: IncidentType, severity: string) => {
    if (severity === "high") {
      switch (type) {
        case "flood": return "text-blue-500 fill-blue-500/20";
        case "pollution": return "text-purple-500 fill-purple-500/20";
        default: return "text-rose-500 fill-rose-500/20";
      }
    }
    switch (type) {
      case "traffic": return "text-amber-500 fill-amber-500/20";
      case "accident": return "text-rose-400 fill-rose-400/20";
      case "road_damage": return "text-yellow-500 fill-yellow-500/20";
      case "flood": return "text-sky-400 fill-sky-400/20";
      case "construction": return "text-orange-400 fill-orange-400/20";
      case "pollution": return "text-fuchsia-400 fill-fuchsia-400/20";
      case "weather": return "text-blue-400 fill-blue-400/20";
      case "closure": return "text-red-500 fill-red-500/20";
      default: return "text-slate-400 fill-slate-400/20";
    }
  };

  const getMarkerIcon = (type: IncidentType) => {
    switch (type) {
      case "flood": return <CloudRain className="h-3 w-3" />;
      case "accident": return <ShieldAlert className="h-3 w-3" />;
      case "pollution": return <Radio className="h-3 w-3" />;
      default: return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const triggerFlyTo = (preset: typeof CAMERA_PRESETS[0]) => {
    setCameraCenter(preset.center);
    setCameraZoom(preset.zoom);
    setCameraTilt(preset.tilt);
    setCameraHeading(preset.heading);
  };

  return (
    <div
      className={`relative border rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row h-[600px] transition-colors duration-200 ${
        isDark ? "border-slate-800 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-800"
      }`}
      id="spatial-intelligence-map"
    >
      <style>{`
        @keyframes rain-fall {
          0% {
            transform: translateY(0) rotate(15deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(600px) rotate(15deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Map Control Sidebar */}
      <div
        className={`w-full lg:w-72 p-5 border-b lg:border-b-0 lg:border-r flex flex-col justify-between overflow-y-auto ${
          isDark ? "bg-slate-950 border-slate-900" : "bg-slate-50 border-slate-200"
        }`}
      >
        <div className="space-y-5">
          {/* Layer Controls Title */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-blue-500" />
              <h3 className="font-extrabold text-[10px] uppercase tracking-widest font-mono text-slate-500">
                Spatial Layers
              </h3>
            </div>

            <div className="space-y-1.5">
              {[
                { id: "traffic", label: "Traffic Volume", color: "border-emerald-500/30 text-emerald-500 bg-emerald-500/10" },
                { id: "accidents", label: "Accident Spots", color: "border-rose-500/30 text-rose-500 bg-rose-500/10" },
                { id: "road_damage", label: "Road Damage", color: "border-yellow-500/30 text-yellow-500 bg-yellow-500/10" },
                { id: "flood", label: "Flood Zones", color: "border-blue-500/30 text-blue-500 bg-blue-500/10" },
                { id: "construction", label: "Construction Barriers", color: "border-orange-500/30 text-orange-500 bg-orange-500/10" },
                { id: "pollution", label: "Pollution (AQI Grid)", color: "border-purple-500/30 text-purple-500 bg-purple-500/10" },
                { id: "weather", label: "Weather Radar", color: "border-sky-500/30 text-sky-500 bg-sky-500/10" },
                { id: "closure", label: "Road Closures", color: "border-red-500/30 text-red-500 bg-red-500/10" }
              ].map(layer => {
                const active = activeLayers[layer.id];
                return (
                  <button
                    key={layer.id}
                    onClick={() => onToggleLayer(layer.id)}
                    id={`layer-toggle-${layer.id}`}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all text-xs font-semibold cursor-pointer ${
                      active
                        ? `${layer.color} shadow-xs`
                        : isDark
                        ? "border-slate-900 text-slate-400 hover:text-slate-200 bg-slate-900/15 hover:bg-slate-900/30"
                        : "border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-current animate-pulse" : "bg-slate-400"}`} />
                      {layer.label}
                    </span>
                    <span className="text-[9px] font-mono opacity-80">
                      {active ? "ON" : "OFF"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Engine Selection */}
          <div className="pt-3 border-t border-dashed border-slate-800">
            <div className="flex items-center gap-2 mb-2.5">
              <Compass className="h-4 w-4 text-blue-500" />
              <h3 className="font-extrabold text-[10px] uppercase tracking-widest font-mono text-slate-500">
                Map Engine
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/40 rounded-xl border border-slate-900">
              <button
                onClick={() => setMapMode("blueprint")}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer text-center ${
                  mapMode === "blueprint"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Blueprint
              </button>
              <button
                onClick={() => setMapMode("google")}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer text-center ${
                  mapMode === "google"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Google 3D
              </button>
            </div>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
          <button
            onClick={() => {
              setReportMode(!reportMode);
              setClickCoords(null);
            }}
            id="report-incident-trigger"
            className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 px-3 rounded-xl border transition-all cursor-pointer ${
              reportMode
                ? "bg-rose-950/40 border-rose-500/50 text-rose-400"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/10"
            }`}
          >
            {reportMode ? (
              <>
                <X className="h-3.5 w-3.5" />
                Cancel Report Mode
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Report Spatial Incident
              </>
            )}
          </button>

          {reportMode && !clickCoords && (
            <p className="text-[9px] text-rose-500 font-mono text-center animate-pulse">
              [Click on map to register hazard coordinates]
            </p>
          )}
        </div>
      </div>

      {/* Main Map Viewer */}
      <div className={`flex-1 relative overflow-hidden flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
        
        {/* GOOGLE MAPS PANEL */}
        {mapMode === "google" && hasValidKey && (
          <div className="w-full h-full relative" id="google-maps-canvas-wrapper">
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                center={cameraCenter}
                zoom={cameraZoom}
                tilt={cameraTilt}
                heading={cameraHeading}
                mapId="DEMO_MAP_ID"
                styles={isDark ? darkMapStyle : lightMapStyle}
                internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                style={{ width: "100%", height: "100%" }}
                onClick={handleGoogleMapClick}
                disableDefaultUI={true}
              >
                {/* Custom Subcomponents for Map Operations */}
                <CameraAnimator center={cameraCenter} zoom={cameraZoom} tilt={cameraTilt} heading={cameraHeading} />
                <CameraOrbit active={orbitActive} />
                <TrafficLayerComponent active={activeLayers.traffic} />

                {/* Flood Risk Overlay Ring */}
                {activeLayers.flood && (
                  <AdvancedMarker position={toGPS(30, 35)}>
                    <div className="w-40 h-40 rounded-full bg-blue-500/20 border-2 border-dashed border-blue-500/60 animate-spin-slow flex items-center justify-center -translate-x-1/2 -translate-y-1/2" />
                  </AdvancedMarker>
                )}

                {/* Pollution Risk Overlay Ring */}
                {activeLayers.pollution && (
                  <AdvancedMarker position={toGPS(70, 75)}>
                    <div className="w-48 h-48 rounded-full bg-purple-500/15 border-2 border-dotted border-purple-500/40 animate-pulse flex items-center justify-center -translate-x-1/2 -translate-y-1/2" />
                  </AdvancedMarker>
                )}

                {/* Render Incidents on real Map */}
                {incidents
                  .filter(inc => activeLayers[inc.type])
                  .map(inc => {
                    const isSelected = selectedIncident?.id === inc.id;
                    const markerColorClass = getMarkerColor(inc.type, inc.severity).split(" ")[0];
                    return (
                      <AdvancedMarker
                        key={inc.id}
                        position={toGPS(inc.lng, inc.lat)}
                        onClick={() => onSelectIncident(inc)}
                      >
                        <div className="w-10 h-10 flex items-center justify-center relative cursor-pointer -translate-x-1/2 -translate-y-1/2">
                          <div className={`absolute w-8 h-8 rounded-full bg-current opacity-20 animate-ping border border-current ${markerColorClass}`} />
                          <div className={`relative w-7 h-7 rounded-full flex items-center justify-center border shadow-md transition-all ${
                            isSelected
                              ? "bg-blue-600 border-white text-white scale-125 z-30"
                              : isDark
                              ? "bg-slate-900 border-slate-700 " + markerColorClass
                              : "bg-white border-slate-350 " + markerColorClass
                          }`}>
                            {getMarkerIcon(inc.type)}
                          </div>
                        </div>
                      </AdvancedMarker>
                    );
                  })}

                {/* New Click Marker in Report Mode */}
                {reportMode && clickCoords && (
                  <AdvancedMarker position={toGPS(clickCoords.x, clickCoords.y)}>
                    <div className="w-10 h-10 flex items-center justify-center relative -translate-x-1/2 -translate-y-1/2">
                      <div className="absolute w-8 h-8 rounded-full bg-rose-500 opacity-30 animate-ping" />
                      <div className="relative w-7 h-7 rounded-full bg-rose-600 border border-white text-white flex items-center justify-center shadow-lg">
                        <MapPin className="h-4 w-4" />
                      </div>
                    </div>
                  </AdvancedMarker>
                )}
              </Map>
            </APIProvider>

            {/* Custom 3D Camera Controls Panel Over Map */}
            <div className="absolute top-4 right-4 bg-slate-950/90 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col gap-2 z-10 w-48 font-mono text-[10px]">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-1">
                <span className="font-extrabold text-blue-400">3D CORE CONTROLLER</span>
                <Compass className="h-3.5 w-3.5 text-blue-400" />
              </div>

              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setOrbitActive(!orbitActive);
                  }}
                  className={`w-full py-1.5 px-2 rounded-lg border text-left flex items-center justify-between cursor-pointer transition-all ${
                    orbitActive
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <span>Camera Auto-Orbit (3D)</span>
                  <RotateCw className={`h-3 w-3 ${orbitActive ? "animate-spin" : ""}`} />
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setCameraTilt(cameraTilt === 0 ? 55 : 0);
                      setOrbitActive(false);
                    }}
                    className="py-1 border border-slate-800 rounded-lg hover:text-white text-center cursor-pointer hover:bg-slate-900"
                  >
                    Tilt: {cameraTilt}°
                  </button>
                  <button
                    onClick={() => {
                      setCameraHeading((cameraHeading + 90) % 360);
                      setOrbitActive(false);
                    }}
                    className="py-1 border border-slate-800 rounded-lg hover:text-white text-center cursor-pointer hover:bg-slate-900"
                  >
                    Rot: {cameraHeading}°
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-2 space-y-1">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider block">Animate Fly-To Sector</span>
                <div className="flex flex-col gap-1">
                  {CAMERA_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setOrbitActive(false);
                        triggerFlyTo(p);
                      }}
                      className="text-left py-1 px-2 rounded hover:bg-blue-600 hover:text-white text-slate-400 transition-all cursor-pointer text-[9px] flex justify-between"
                    >
                      <span>{p.name}</span>
                      <Navigation className="h-2.5 w-2.5 opacity-60 rotate-45" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BLUEPRINT SVG VECTOR FALLBACK MAP */}
        {(mapMode === "blueprint" || !hasValidKey) && (
          <div className="w-full h-full relative flex items-center justify-center p-4">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full max-h-[500px] object-contain select-none"
              onClick={handleBlueprintMapClick}
            >
              {/* Cyber Blueprint Background lines */}
              <defs>
                <pattern id="map-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke={isDark ? "#0f172a" : "#e2e8f0"} strokeWidth="0.3" />
                </pattern>
                <radialGradient id="pollute-radial" cx="70%" cy="75%" r="35%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="flood-radial" cx="30%" cy="35%" r="25%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="100" height="100" fill="url(#map-grid)" />

              {/* Map Districts Labels for visual grounding */}
              {CITY_DISTRICTS.map((dist, idx) => (
                <g key={idx} className="opacity-40">
                  <circle cx={dist.x} cy={dist.y} r={dist.radius} fill="none" stroke={isDark ? "#1e293b" : "#cbd5e1"} strokeWidth="0.5" strokeDasharray="2" />
                  <text x={dist.x} y={dist.y - dist.radius - 2} textAnchor="middle" fill={isDark ? "#64748b" : "#475569"} fontSize="2.5" fontWeight="600" className="font-mono uppercase tracking-wider">
                    {dist.name}
                  </text>
                </g>
              ))}

              {/* Winding Blue River Delta */}
              <path
                d="M -10,35 Q 20,30 30,35 T 50,45 T 70,30 T 110,40"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="5"
                strokeOpacity="0.25"
                strokeLinecap="round"
              />
              <path
                d="M -10,35 Q 20,30 30,35 T 50,45 T 70,30 T 110,40"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeOpacity="0.4"
                strokeLinecap="round"
              />

              {/* Flood Risk Overlay (Blue Radar) */}
              {activeLayers.flood && (
                <circle cx="30" cy="35" r="22" fill="url(#flood-radial)" className="animate-pulse" />
              )}

              {/* Pollution Risk Overlay (Purple Gas Cloud) */}
              {activeLayers.pollution && (
                <circle cx="70" cy="75" r="28" fill="url(#pollute-radial)" />
              )}

              {/* Main Highway Express Loops (VECTORS) */}
              <path
                d="M 15,20 L 85,15 L 90,80 L 10,85 Z"
                fill="none"
                stroke={activeLayers.traffic ? "#eab308" : isDark ? "#334155" : "#94a3b8"}
                strokeWidth="1.2"
                strokeOpacity="0.75"
                strokeDasharray={activeLayers.traffic ? "4 2" : "none"}
                className={activeLayers.traffic ? "animate-spin-slow" : ""}
              />
              <path
                d="M 10,15 L 90,85"
                fill="none"
                stroke={activeLayers.traffic ? "#ef4444" : isDark ? "#1e293b" : "#e2e8f0"}
                strokeWidth="1.6"
                strokeOpacity="0.8"
              />

              {/* Weather Radar Layers (Cloud overlays) */}
              {activeLayers.weather && (
                <g className="opacity-30">
                  <path d="M 25,28 Q 30,22 35,28 T 45,28" fill="#38bdf8" />
                  <path d="M 68,70 Q 72,64 76,70 T 84,70" fill="#38bdf8" />
                </g>
              )}

              {/* Dynamic Active Incident Markers */}
              {incidents
                .filter(inc => activeLayers[inc.type])
                .map(inc => {
                  const isSelected = selectedIncident?.id === inc.id;
                  const markerColor = getMarkerColor(inc.type, inc.severity);
                  return (
                    <g
                      key={inc.id}
                      className="cursor-pointer transform hover:scale-125 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(inc);
                      }}
                    >
                      <circle
                        cx={inc.lng}
                        cy={inc.lat}
                        r={isSelected ? "5" : "3"}
                        className={`${markerColor} animate-ping duration-2000 opacity-60`}
                      />
                      <circle
                        cx={inc.lng}
                        cy={inc.lat}
                        r={isSelected ? "2.5" : "1.8"}
                        className={`${isSelected ? "fill-blue-500 stroke-white" : isDark ? "fill-slate-900" : "fill-white"} stroke-current stroke-[0.4]`}
                      />
                      <g transform={`translate(${inc.lng - 1.5}, ${inc.lat - 1.5})`}>
                        <foreignObject width="3" height="3">
                          <div className={`flex items-center justify-center w-full h-full ${isSelected ? "text-white" : markerColor.split(" ")[0]}`}>
                            {getMarkerIcon(inc.type)}
                          </div>
                        </foreignObject>
                      </g>
                    </g>
                  );
                })}

              {/* Report Mode Coords Marker Pin */}
              {reportMode && clickCoords && (
                <g>
                  <circle cx={clickCoords.x} cy={clickCoords.y} r="4" className="fill-rose-500/20 stroke-rose-500 stroke-[0.5] animate-ping" />
                  <circle cx={clickCoords.x} cy={clickCoords.y} r="1.5" className="fill-rose-500" />
                </g>
              )}
            </svg>

            {/* Custom overlay info for API Key in Blueprint mode */}
            {mapMode === "google" && !hasValidKey && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-6 z-20 text-center animate-fade-in">
                <div className="max-w-md space-y-4 border border-slate-800 bg-slate-900/90 rounded-2xl p-5 shadow-2xl">
                  <div className="w-12 h-12 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Zap className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-100 tracking-tight">Google Maps API Key Required</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                      Exquisite 3D visual fly-overs, custom rotators, and live transit layers require an active Google Maps key.
                    </p>
                  </div>

                  <div className="space-y-2 text-[10px] text-left font-mono bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                    <p className="text-emerald-500 font-bold border-b border-slate-800 pb-1 mb-1.5">[SETUP INSTRUCTIONS]</p>
                    <p>1. Get a standard Google Maps API key from Cloud Console.</p>
                    <p>2. Click the gear icon (⚙️ Settings, top right of AI Studio).</p>
                    <p>3. Select Secrets, add variable <code className="text-blue-400">GOOGLE_MAPS_PLATFORM_KEY</code>.</p>
                    <p>4. Input key as the secret value and press Enter.</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setMapMode("blueprint")}
                      className="flex-1 py-2 rounded-xl text-xs font-bold border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                    >
                      Use Blueprint Fallback
                    </button>
                    <a
                      href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white text-center cursor-pointer shadow-md shadow-blue-500/10"
                    >
                      Get API Key
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* WEATHER ANIMATION OVERLAY (FOG / RAIN PARTICLE GENERATOR) */}
        {activeLayers.weather && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 bg-sky-950/5">
            <div className="absolute inset-0">
              {Array.from({ length: 45 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-sky-400/35 rounded-full"
                  style={{
                    width: "1.2px",
                    height: "14px",
                    top: `${Math.random() * -20}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `rain-fall ${0.5 + Math.random() * 0.4}s linear infinite`,
                    animationDelay: `${Math.random() * 2.5}s`
                  }}
                />
              ))}
            </div>
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-sky-400/10 via-sky-300/5 to-transparent animate-pulse" />
          </div>
        )}

        {/* Dynamic Watermark HUD overlay */}
        <div className="absolute top-4 left-4 bg-slate-950/85 border border-slate-900 rounded-lg p-2.5 backdrop-blur-xs pointer-events-none font-mono text-[9px] text-slate-500 flex flex-col gap-0.5 z-10 shadow-md">
          <span>LAT_MIN: 37.70° N</span>
          <span>LNG_MIN: 122.51° W</span>
          <span>SCALE_RATIO: 1:12,000</span>
          <span>ENGINE: {mapMode === "google" && hasValidKey ? "GMP_V3_VECTOR_3D" : "BLUEPRINT_CANVAS_V2"}</span>
        </div>

        {/* Selected Incident Floating Detail Card (Slide-in HUD) */}
        {selectedIncident && activeLayers[selectedIncident.type] && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 border border-blue-500/30 rounded-xl p-4 shadow-2xl backdrop-blur-md flex justify-between items-start gap-4 z-20">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                  selectedIncident.severity === "high"
                    ? "bg-rose-950 text-rose-400 border border-rose-500/20"
                    : "bg-amber-950 text-amber-400 border border-amber-500/20"
                }`}>
                  {selectedIncident.severity} severity
                </span>
                <span className="text-[10px] font-mono text-slate-500">{selectedIncident.timestamp}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">{selectedIncident.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">{selectedIncident.description}</p>
              <div className="flex gap-4 mt-2 text-[9px] font-mono text-slate-500">
                <span>📍 {selectedIncident.location}</span>
                <span>📡 {selectedIncident.reportedBy}</span>
                <span className="text-emerald-400">
                  {selectedIncident.verified ? "✓ Verified Core Incident" : "⚠ Pending Citizen Validation"}
                </span>
              </div>
            </div>
            <button
              onClick={() => onSelectIncident(null as any)}
              className="p-1 text-slate-500 hover:text-slate-300 border border-slate-850 rounded bg-slate-950/50 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Citizen Report Form Panel */}
      {reportMode && clickCoords && (
        <div className="absolute right-4 top-4 bottom-4 w-80 bg-slate-900/95 border border-rose-500/30 rounded-xl p-5 shadow-2xl backdrop-blur-md flex flex-col overflow-y-auto z-20 animate-fade-in">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
            <h4 className="text-sm font-bold text-slate-200">Submit Spatial Report</h4>
            <button
              onClick={() => {
                setClickCoords(null);
                setReportMode(false);
              }}
              className="p-1 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={submitReport} className="space-y-3.5 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Incident Type</label>
                <select
                  value={reportForm.type}
                  onChange={(e) => setReportForm({ ...reportForm, type: e.target.value as IncidentType })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50"
                >
                  <option value="traffic">Traffic Bottleneck</option>
                  <option value="accident">Accident collision</option>
                  <option value="road_damage">Road Structural pothole</option>
                  <option value="flood">Flash flood overlay</option>
                  <option value="construction">Construction barrier</option>
                  <option value="pollution">Air Pollution AQI spike</option>
                  <option value="closure">Road closure barrier</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Report Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Major collision blocking right lane"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Severity</label>
                <div className="grid grid-cols-3 gap-2">
                  {["low", "medium", "high"].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setReportForm({ ...reportForm, severity: level as any })}
                      className={`text-[10px] font-mono py-1.5 border rounded-lg uppercase cursor-pointer ${
                        reportForm.severity === level
                          ? "bg-rose-950/40 border-rose-500 text-rose-400 font-bold"
                          : "border-slate-800 bg-slate-950 text-slate-500"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the incident details, active lanes blocked, water level, or speed limit hazards..."
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Assigned Coordinates</label>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-[10px] font-mono text-slate-400">
                  X: {clickCoords.x.toFixed(1)}% | Y: {clickCoords.y.toFixed(1)}%
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold py-3 rounded-lg shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
            >
              Verify & Broadcast Incident
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
