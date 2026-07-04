import React, { useState } from "react";
import { Compass, Clock, ShieldAlert, Leaf, AlertTriangle, Truck, Car, Navigation, ShieldCheck, Zap } from "lucide-react";
import { RouteOption, UserRole } from "../types";
import { MOCK_ROUTES, EVACUATION_ROUTE } from "../data/mockData";

interface RoutePlannerProps {
  onSelectRoute: (route: RouteOption | null) => void;
  selectedRoute: RouteOption | null;
  userRole: UserRole;
}

export default function RoutePlanner({
  onSelectRoute,
  selectedRoute,
  userRole
}: RoutePlannerProps) {
  const [origin, setOrigin] = useState("Downtown Core");
  const [destination, setDestination] = useState("Uptown Tech Sector");
  const [vehicle, setVehicle] = useState<"car" | "bike" | "truck" | "emergency">("car");
  const [departureTime, setDepartureTime] = useState("09:00");
  const [activeTab, setActiveTab] = useState<"standard" | "evac">("standard");

  const routeKey = `${origin} ➔ ${destination}`;
  const availableRoutes = MOCK_ROUTES[routeKey] || MOCK_ROUTES["Downtown Core ➔ Uptown Tech Sector"];

  const getVehicleMultiplier = (type: string) => {
    switch (type) {
      case "bike": return { duration: 1.6, fuel: 0.1, carbon: 0.0 };
      case "truck": return { duration: 1.2, fuel: 2.4, carbon: 2.2 };
      case "emergency": return { duration: 0.75, fuel: 1.1, carbon: 1.2 };
      default: return { duration: 1.0, fuel: 1.0, carbon: 1.0 };
    }
  };

  const getAdaptedRoutes = React.useMemo(() => {
    const mult = getVehicleMultiplier(vehicle);
    return availableRoutes.map(route => ({
      ...route,
      duration: Math.round(route.duration * mult.duration),
      fuelEstimate: parseFloat((route.fuelEstimate * mult.fuel).toFixed(1)),
      carbonEmission: parseFloat((route.carbonEmission * mult.carbon).toFixed(1))
    }));
  }, [availableRoutes, vehicle]);

  const selectOption = (opt: RouteOption) => {
    onSelectRoute(opt);
  };

  const getRouteBadgeColor = (type: string) => {
    switch (type) {
      case "fastest": return "bg-blue-950 text-blue-400 border-blue-500/20";
      case "safest": return "bg-emerald-950 text-emerald-400 border-emerald-500/20";
      case "eco": return "bg-teal-950 text-teal-400 border-teal-500/20";
      case "lowest_fuel": return "bg-amber-950 text-amber-400 border-amber-500/20";
      default: return "bg-rose-950 text-rose-400 border-rose-500/20";
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "bike": return "🚴 Active Cycling";
      case "truck": return "🚚 Freight Truck";
      case "emergency": return "🚒 First Responder";
      default: return "🚗 Standard Car";
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6" id="smart-route-planner">
      {/* Search inputs */}
      <div className="border border-slate-900 bg-slate-950 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex gap-2 border-b border-slate-900 pb-3 mb-4">
          <button
            onClick={() => {
              setActiveTab("standard");
              onSelectRoute(null);
            }}
            className={`flex-1 text-xs font-mono py-2 rounded-lg border uppercase font-semibold ${
              activeTab === "standard"
                ? "bg-blue-950/40 border-blue-500 text-blue-400"
                : "border-slate-800 bg-slate-950/20 text-slate-500"
            }`}
          >
            Smart Routing
          </button>
          <button
            onClick={() => {
              setActiveTab("evac");
              onSelectRoute(EVACUATION_ROUTE);
            }}
            className={`flex-1 text-xs font-mono py-2 rounded-lg border uppercase font-semibold ${
              activeTab === "evac"
                ? "bg-rose-950/40 border-rose-500 text-rose-400"
                : "border-slate-800 bg-slate-950/20 text-slate-500"
            }`}
          >
            Evacuation Exit
          </button>
        </div>

        {activeTab === "standard" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Origin District</label>
              <select
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  onSelectRoute(null);
                }}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500/40"
              >
                <option value="Downtown Core">Downtown Core</option>
                <option value="Industrial District">Industrial District</option>
                <option value="Riverfront Zone">Riverfront Zone</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Destination District</label>
              <select
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  onSelectRoute(null);
                }}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500/40"
              >
                <option value="Uptown Tech Sector">Uptown Tech Sector</option>
                <option value="Downtown Core">Downtown Core</option>
                <option value="Southside Heights">Southside Heights</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Departure</label>
                <input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Vehicle Category</label>
                <select
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500/40"
                >
                  <option value="car">Car (Fuel / EV)</option>
                  <option value="bike">Active Cycling</option>
                  <option value="truck">Heavy Truck (RAPIDS Opt)</option>
                  <option value="emergency">First Responder (Sirens)</option>
                </select>
              </div>
            </div>
            
            <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded-xl text-center">
              <span className="text-[10px] font-mono text-blue-400">
                [Computing multi-criteria cost paths on NVIDIA GPUs...]
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-rose-950/10 border border-rose-500/20 rounded-xl text-xs text-slate-400 leading-normal space-y-2">
              <p className="font-bold text-rose-400">🚨 CIVIL EMERGENCY SHIELD ACTIVE</p>
              <p>Evacuation Protocol ALPHA has been triggered. Flood basins and major bottleneck corridors are bypassed. Standard route parameters are overriden by military/DoT escort pathways.</p>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Evacuation Point</label>
              <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl text-xs text-slate-200 font-bold">
                Riverfront Zone Flooding Basins
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">Assigned Haven Zone</label>
              <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl text-xs text-slate-200 font-bold">
                Uptown Tech High Haven Sector
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Routes Cards */}
      <div className="lg:col-span-2 space-y-4">
        {activeTab === "standard" ? (
          <>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono px-1">
              Recommended Alternatives ({vehicle.toUpperCase()} - {departureTime})
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {getAdaptedRoutes.map((route, i) => {
                const isSelected = selectedRoute?.type === route.type;
                return (
                  <button
                    key={i}
                    onClick={() => selectOption(route)}
                    id={`route-select-${route.type}`}
                    className={`text-left p-5 border rounded-2xl bg-slate-950 transition-all flex flex-col justify-between h-52 relative group cursor-pointer ${
                      isSelected
                        ? "border-blue-500 shadow-xl shadow-blue-500/10"
                        : "border-slate-900 hover:border-slate-800"
                    }`}
                  >
                    <div className="w-full">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold border ${getRouteBadgeColor(route.type)}`}>
                          {route.type}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold font-mono">
                          <Clock className="h-3.5 w-3.5 text-blue-400" />
                          <span>{route.duration} mins</span>
                        </div>
                      </div>

                      <h4 className="text-xs font-extrabold text-slate-200 mt-1">{route.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">{route.distance} km total path distance</p>
                    </div>

                    <div className="border-t border-slate-900/60 pt-3 mt-4 w-full grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                      <div>
                        <span className="block text-slate-500 text-[8.5px] uppercase">Safety</span>
                        <span className="font-bold text-emerald-400">{route.safetyScore}/100</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[8.5px] uppercase">CO2</span>
                        <span className="font-bold text-teal-400">{route.carbonEmission} kg</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-[8.5px] uppercase">Fuel</span>
                        <span className="font-bold text-amber-400">{route.fuelEstimate} L</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="border border-rose-500/30 bg-slate-950 rounded-2xl p-6 h-52 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold border border-rose-500 bg-rose-950 text-rose-400 animate-pulse">
                  EVACUATION PATHWAY ALPHA
                </span>
                <h4 className="text-sm font-extrabold text-slate-200 mt-3">{EVACUATION_ROUTE.name}</h4>
                <p className="text-xs text-slate-500 mt-1">Calculated via military transit priority grids. Guaranteed safe from river surges.</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-mono text-rose-400 font-bold">
                <Clock className="h-4 w-4 animate-bounce" />
                <span>{EVACUATION_ROUTE.duration} mins</span>
              </div>
            </div>

            <div className="border-t border-slate-900 pt-4 grid grid-cols-4 gap-4 text-center text-xs font-mono">
              <div>
                <span className="block text-slate-500 text-[9px] uppercase">Safety rating</span>
                <span className="font-bold text-emerald-400">99/100</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[9px] uppercase">Flood Prob</span>
                <span className="font-bold text-emerald-400">0% (Bypassed)</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[9px] uppercase">Accident Prob</span>
                <span className="font-bold text-emerald-400">1.0%</span>
              </div>
              <div>
                <span className="block text-slate-500 text-[9px] uppercase">Total Distance</span>
                <span className="font-bold text-slate-200">{EVACUATION_ROUTE.distance} km</span>
              </div>
            </div>
          </div>
        )}

        {/* Route Planner selected detail HUD element */}
        {selectedRoute && (
          <div className="p-4 border border-blue-500/30 bg-blue-950/10 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                <Navigation className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-200 uppercase font-mono">ACTIVE NAVIGATION STREAM</h5>
                <p className="text-[11px] text-slate-400">Highlighted on map vector grid. Tracking GPS updates and citizen hazard nodes live.</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-wider bg-slate-950/80 border border-slate-900 px-3 py-1.5 rounded-lg">
              {getVehicleIcon(vehicle)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
