import { Incident, CityMetrics, RouteOption, NVIDIAStats, TrafficForecast } from "../types";

export const CITY_DISTRICTS = [
  { name: "Downtown Core", x: 45, y: 50, radius: 15, safety: 72, traffic: 85, aqi: 120, flood: 15, damage: 30 },
  { name: "Riverfront Zone", x: 30, y: 35, radius: 12, safety: 65, traffic: 40, aqi: 65, flood: 80, damage: 25 },
  { name: "Industrial District", x: 70, y: 75, radius: 18, safety: 48, traffic: 70, aqi: 165, flood: 30, damage: 85 },
  { name: "Uptown Tech Sector", x: 50, y: 20, radius: 14, safety: 92, traffic: 50, aqi: 42, flood: 10, damage: 15 },
  { name: "Southside Heights", x: 25, y: 70, radius: 16, safety: 80, traffic: 55, aqi: 55, flood: 20, damage: 40 }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "inc-1",
    type: "traffic",
    title: "Major Congestion on Grand Avenue Bridge",
    location: "Grand Avenue Bridge (Downtown - Riverfront Corridor)",
    lat: 38.5,
    lng: 42.5,
    severity: "high",
    active: true,
    timestamp: "10 mins ago",
    description: "Gridlock due to multi-vehicle bottleneck. Commuters advised to detour through North River Pass.",
    reportedBy: "Traffic Camera Server #84",
    reportsCount: 14,
    verified: true
  },
  {
    id: "inc-2",
    type: "flood",
    title: "Flash Flooding Lane Submersion",
    location: "River Boulevard near Water Treatment Facility",
    lat: 28.0,
    lng: 34.0,
    severity: "high",
    active: true,
    timestamp: "25 mins ago",
    description: "Heavy localized storm runoff has flooded 2 of 3 lanes. Water level has exceeded 1.2 feet.",
    reportedBy: "Citizen Report (GPS Verified)",
    reportsCount: 9,
    verified: true
  },
  {
    id: "inc-3",
    type: "accident",
    title: "Truck Collision with Power Pole",
    location: "Intersection of Road 4 & Southside Industrial Express",
    lat: 68.0,
    lng: 71.0,
    severity: "medium",
    active: true,
    timestamp: "40 mins ago",
    description: "A delivery box truck collided with a utility pole. Lanes blocked. Emergency services on scene.",
    reportedBy: "Emergency Dispatch API",
    reportsCount: 3,
    verified: true
  },
  {
    id: "inc-4",
    type: "road_damage",
    title: "Severe Pothole Swarm Hazard",
    location: "Central Avenue Outer Ring Lane",
    lat: 48.0,
    lng: 60.0,
    severity: "medium",
    active: true,
    timestamp: "1 hour ago",
    description: "Multiple severe potholes causing drivers to veer suddenly. Road maintenance dispatched.",
    reportedBy: "Citizen Report #1024",
    reportsCount: 22,
    verified: false
  },
  {
    id: "inc-5",
    type: "closure",
    title: "Planned Construction Lane Closure",
    location: "High Street Exit 14 Ramp",
    lat: 52.0,
    lng: 23.0,
    severity: "low",
    active: true,
    timestamp: "3 hours ago",
    description: "scheduled resurfacing work. Exit ramp reduced to single lane until 18:00 UTC.",
    reportedBy: "DoT Administrator",
    reportsCount: 1,
    verified: true
  },
  {
    id: "inc-6",
    type: "pollution",
    title: "Spike in Particulate Matter (PM2.5)",
    location: "Industrial Hub - Processing Zone B",
    lat: 75.0,
    lng: 78.0,
    severity: "high",
    active: true,
    timestamp: "15 mins ago",
    description: "Stationary air sensor logged carbon monoxide levels of 185 AQI. Sensitive groups should wear respirators.",
    reportedBy: "CityPulse IoT Air Grid",
    reportsCount: 2,
    verified: true
  }
];

export const INITIAL_METRICS: CityMetrics = {
  safetyScore: 74,
  trafficIndex: 68,
  airQualityIndex: 82, // Moderate
  floodRisk: 35,
  accidentRisk: 42,
  avgTravelTime: 24.5
};

export const MOCK_RAPIDS_STATS: NVIDIAStats[] = [
  { stage: "cuDF Ingestion", cpuTimeMs: 4200, gpuTimeMs: 140, speedup: 30.0, recordsProcessed: 1250000 },
  { stage: "Spark RAPIDS Filter", cpuTimeMs: 8500, gpuTimeMs: 340, speedup: 25.0, recordsProcessed: 1250000 },
  { stage: "cuML KMeans Accidents", cpuTimeMs: 15400, gpuTimeMs: 440, speedup: 35.0, recordsProcessed: 480000 },
  { stage: "cuGraph Route Resolver", cpuTimeMs: 6800, gpuTimeMs: 170, speedup: 40.0, recordsProcessed: 96000 },
  { stage: "Vertex AI Predictor", cpuTimeMs: 11200, gpuTimeMs: 560, speedup: 20.0, recordsProcessed: 1250000 }
];

export const MOCK_TRAFFIC_FORECAST: TrafficForecast[] = [
  { hour: "08:00", volume: 85, predictedVolume: 87 },
  { hour: "10:00", volume: 60, predictedVolume: 58 },
  { hour: "12:00", volume: 72, predictedVolume: 74 },
  { hour: "14:00", volume: 65, predictedVolume: 62 },
  { hour: "16:00", volume: 92, predictedVolume: 90 },
  { hour: "18:00", volume: 88, predictedVolume: 85 },
  { hour: "20:00", volume: 48, predictedVolume: 50 },
  { hour: "22:00", volume: 30, predictedVolume: 32 }
];

export const MOCK_CHART_DATA = {
  traffic: [
    { name: "Mon", value: 65, predicted: 68 },
    { name: "Tue", value: 72, predicted: 70 },
    { name: "Wed", value: 85, predicted: 82 },
    { name: "Thu", value: 78, predicted: 80 },
    { name: "Fri", value: 92, predicted: 89 },
    { name: "Sat", value: 55, predicted: 58 },
    { name: "Sun", value: 42, predicted: 45 }
  ],
  accidents: [
    { name: "Jan", count: 18, benchmark: 22 },
    { name: "Feb", count: 12, benchmark: 20 },
    { name: "Mar", count: 15, benchmark: 19 },
    { name: "Apr", count: 9, benchmark: 18 },
    { name: "May", count: 14, benchmark: 17 },
    { name: "Jun", count: 8, benchmark: 15 }
  ],
  pollution: [
    { name: "00:00", AQI: 45, Co: 1.2 },
    { name: "04:00", AQI: 52, Co: 1.4 },
    { name: "08:00", AQI: 95, Co: 2.8 },
    { name: "12:00", AQI: 88, Co: 2.5 },
    { name: "16:00", AQI: 110, Co: 3.1 },
    { name: "20:00", AQI: 78, Co: 1.9 }
  ],
  weather: [
    { name: "09:00", temp: 21, rain: 10, risk: 15 },
    { name: "12:00", temp: 24, rain: 35, risk: 40 },
    { name: "15:00", temp: 22, rain: 80, risk: 85 },
    { name: "18:00", temp: 19, rain: 60, risk: 65 },
    { name: "21:00", temp: 17, rain: 20, risk: 25 }
  ],
  roadQuality: [
    { name: "Downtown Core", score: 82, maintenancePriority: "Low" },
    { name: "Riverfront Zone", score: 75, maintenancePriority: "Medium" },
    { name: "Industrial Hub", score: 45, maintenancePriority: "Critical" },
    { name: "Uptown Tech", score: 95, maintenancePriority: "None" },
    { name: "Southside Heights", score: 78, maintenancePriority: "Medium" }
  ]
};

export const MOCK_ROUTES: Record<string, RouteOption[]> = {
  "Downtown Core ➔ Uptown Tech Sector": [
    {
      type: "fastest",
      name: "Grand Highway Pass (Express-Route)",
      duration: 18,
      distance: 12.4,
      safetyScore: 78,
      fuelEstimate: 1.2,
      pollutionExposure: "medium",
      accidentProbability: 12,
      floodProbability: 5,
      carbonEmission: 2.8,
      points: [{ x: 45, y: 50 }, { x: 48, y: 35 }, { x: 50, y: 20 }]
    },
    {
      type: "safest",
      name: "Uptown Ring Road (Max Safety Bypass)",
      duration: 24,
      distance: 16.8,
      safetyScore: 95,
      fuelEstimate: 1.5,
      pollutionExposure: "low",
      accidentProbability: 3,
      floodProbability: 2,
      carbonEmission: 3.4,
      points: [{ x: 45, y: 50 }, { x: 28, y: 45 }, { x: 32, y: 22 }, { x: 50, y: 20 }]
    },
    {
      type: "eco",
      name: "Green Boulevard Active Corridor",
      duration: 22,
      distance: 11.2,
      safetyScore: 88,
      fuelEstimate: 0.8,
      pollutionExposure: "low",
      accidentProbability: 8,
      floodProbability: 8,
      carbonEmission: 1.8,
      points: [{ x: 45, y: 50 }, { x: 40, y: 38 }, { x: 50, y: 20 }]
    },
    {
      type: "lowest_fuel",
      name: "Direct Surface Cut (Optimized Velocity)",
      duration: 20,
      distance: 9.8,
      safetyScore: 82,
      fuelEstimate: 0.7,
      pollutionExposure: "medium",
      accidentProbability: 10,
      floodProbability: 12,
      carbonEmission: 1.6,
      points: [{ x: 45, y: 50 }, { x: 52, y: 40 }, { x: 50, y: 20 }]
    }
  ],
  "Industrial District ➔ Downtown Core": [
    {
      type: "fastest",
      name: "Industrial Link Express (Lanes Clear)",
      duration: 22,
      distance: 14.5,
      safetyScore: 55,
      fuelEstimate: 1.8,
      pollutionExposure: "high",
      accidentProbability: 25,
      floodProbability: 15,
      carbonEmission: 4.1,
      points: [{ x: 70, y: 75 }, { x: 58, y: 62 }, { x: 45, y: 50 }]
    },
    {
      type: "safest",
      name: "Southside Boulevard Shielded Pass",
      duration: 28,
      distance: 18.2,
      safetyScore: 85,
      fuelEstimate: 2.1,
      pollutionExposure: "medium",
      accidentProbability: 8,
      floodProbability: 10,
      carbonEmission: 4.8,
      points: [{ x: 70, y: 75 }, { x: 52, y: 80 }, { x: 30, y: 70 }, { x: 45, y: 50 }]
    },
    {
      type: "eco",
      name: "Rail Corridor Green Link",
      duration: 26,
      distance: 13.8,
      safetyScore: 72,
      fuelEstimate: 1.3,
      pollutionExposure: "medium",
      accidentProbability: 14,
      floodProbability: 8,
      carbonEmission: 2.9,
      points: [{ x: 70, y: 75 }, { x: 62, y: 68 }, { x: 45, y: 50 }]
    },
    {
      type: "lowest_fuel",
      name: "Optimized Gradient Surface Flow",
      duration: 25,
      distance: 12.9,
      safetyScore: 68,
      fuelEstimate: 1.1,
      pollutionExposure: "high",
      accidentProbability: 18,
      floodProbability: 10,
      carbonEmission: 2.5,
      points: [{ x: 70, y: 75 }, { x: 55, y: 65 }, { x: 45, y: 50 }]
    }
  ],
  "Riverfront Zone ➔ Southside Heights": [
    {
      type: "fastest",
      name: "Bridge Canal Highway Run",
      duration: 15,
      distance: 8.5,
      safetyScore: 75,
      fuelEstimate: 0.9,
      pollutionExposure: "medium",
      accidentProbability: 8,
      floodProbability: 40,
      carbonEmission: 2.0,
      points: [{ x: 30, y: 35 }, { x: 28, y: 52 }, { x: 25, y: 70 }]
    },
    {
      type: "safest",
      name: "Outer Ring Safety Shield",
      duration: 21,
      distance: 12.4,
      safetyScore: 92,
      fuelEstimate: 1.2,
      pollutionExposure: "low",
      accidentProbability: 2,
      floodProbability: 8,
      carbonEmission: 2.7,
      points: [{ x: 30, y: 35 }, { x: 15, y: 45 }, { x: 18, y: 60 }, { x: 25, y: 70 }]
    },
    {
      type: "eco",
      name: "Forestry Buffer Parkway",
      duration: 19,
      distance: 9.2,
      safetyScore: 85,
      fuelEstimate: 0.7,
      pollutionExposure: "low",
      accidentProbability: 5,
      floodProbability: 25,
      carbonEmission: 1.5,
      points: [{ x: 30, y: 35 }, { x: 22, y: 50 }, { x: 25, y: 70 }]
    },
    {
      type: "lowest_fuel",
      name: "Direct Coastline Low-RPM Flow",
      duration: 18,
      distance: 7.9,
      safetyScore: 78,
      fuelEstimate: 0.6,
      pollutionExposure: "medium",
      accidentProbability: 11,
      floodProbability: 35,
      carbonEmission: 1.3,
      points: [{ x: 30, y: 35 }, { x: 20, y: 55 }, { x: 25, y: 70 }]
    }
  ]
};

export const EVACUATION_ROUTE: RouteOption = {
  type: "emergency",
  name: "Evacuation Protocol Route ALPHA (Priority Escort)",
  duration: 12,
  distance: 14.8,
  safetyScore: 99,
  fuelEstimate: 2.0,
  pollutionExposure: "low",
  accidentProbability: 1,
  floodProbability: 0,
  carbonEmission: 4.5,
  points: [{ x: 30, y: 35 }, { x: 45, y: 30 }, { x: 65, y: 25 }, { x: 80, y: 20 }]
};
