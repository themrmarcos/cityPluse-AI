export type UserRole = "citizen" | "delivery" | "emergency" | "admin";

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  notificationsEnabled: boolean;
  theme: "light" | "dark";
  language: string;
}

export type IncidentType =
  | "traffic"
  | "accident"
  | "road_damage"
  | "flood"
  | "construction"
  | "pollution"
  | "weather"
  | "closure";

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  location: string;
  lat: number; // For visualization, coordinates scaled 0-100 on our interactive map canvas
  lng: number;
  severity: "low" | "medium" | "high";
  active: boolean;
  timestamp: string;
  description: string;
  reportedBy: string;
  reportsCount: number;
  verified: boolean;
}

export interface RouteOption {
  type: "fastest" | "safest" | "eco" | "lowest_fuel" | "emergency";
  name: string;
  duration: number; // in minutes
  distance: number; // in km
  safetyScore: number; // 0-100
  fuelEstimate: number; // in liters
  pollutionExposure: "low" | "medium" | "high";
  accidentProbability: number; // 0-100
  floodProbability: number; // 0-100
  carbonEmission: number; // kg of CO2
  points: { x: number; y: number }[]; // Coordinates for rendering the route line
}

export interface CityMetrics {
  safetyScore: number;
  trafficIndex: number; // 0-100
  airQualityIndex: number; // AQI value
  floodRisk: number; // 0-100
  accidentRisk: number; // 0-100
  avgTravelTime: number; // in minutes
}

export interface NVIDIAStats {
  stage: string;
  cpuTimeMs: number;
  gpuTimeMs: number;
  speedup: number;
  recordsProcessed: number;
}

export interface TrafficForecast {
  hour: string;
  volume: number;
  predictedVolume: number;
}

export interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}
