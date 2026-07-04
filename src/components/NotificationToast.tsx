import React, { useState, useEffect } from "react";
import { Bell, AlertTriangle, CloudRain, ShieldCheck, X } from "lucide-react";

export interface AlertNotification {
  id: string;
  type: "traffic" | "flood" | "closure" | "accident" | "pollution";
  title: string;
  message: string;
  timestamp: string;
}

const STREAM_NOTIFICATIONS: AlertNotification[] = [
  {
    id: "not-1",
    type: "flood",
    title: "Flood Basin Overflow Threat",
    message: "Delta water sensors crossed warning stage. River Boulevard lanes 1-2 flooded.",
    timestamp: "Just now"
  },
  {
    id: "not-2",
    type: "traffic",
    title: "Heavy Commute Gridlock",
    message: "14-vehicle bottleneck detected on Grand Avenue Bridge. Detours advised.",
    timestamp: "2 mins ago"
  },
  {
    id: "not-3",
    type: "closure",
    title: "Road Closure Emergency",
    message: "High Street Exit 14 Ramp completely barricaded due to water mains breach.",
    timestamp: "5 mins ago"
  },
  {
    id: "not-4",
    type: "pollution",
    title: "PM2.5 Pollution Spike",
    message: "Industrial processing sector logged unhealthy air. AQI exceeded 165.",
    timestamp: "10 mins ago"
  }
];

export default function NotificationToast() {
  const [activeAlert, setActiveAlert] = useState<AlertNotification | null>(null);
  const [alertIndex, setAlertIndex] = useState(0);

  useEffect(() => {
    // Show first alert after a brief delay
    const initialTimeout = setTimeout(() => {
      setActiveAlert(STREAM_NOTIFICATIONS[0]);
    }, 4000);

    // Periodically cycle and pop up alerts to simulate live IoT telemetry feeds
    const interval = setInterval(() => {
      setAlertIndex(prev => {
        const nextIdx = (prev + 1) % STREAM_NOTIFICATIONS.length;
        setActiveAlert(STREAM_NOTIFICATIONS[nextIdx]);
        return nextIdx;
      });
    }, 22000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!activeAlert) return null;

  const getAlertColors = (type: string) => {
    switch (type) {
      case "flood": return "border-blue-500 bg-slate-950 text-blue-400";
      case "pollution": return "border-purple-500 bg-slate-950 text-purple-400";
      case "closure": return "border-rose-500 bg-slate-950 text-rose-400";
      default: return "border-amber-500 bg-slate-950 text-amber-400";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "flood": return <CloudRain className="h-4.5 w-4.5 animate-bounce" />;
      case "closure": return <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />;
      default: return <Bell className="h-4.5 w-4.5 animate-pulse" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-950 border rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-slide-in flex gap-3.5 items-start justify-between border-slate-900 shadow-black/80">
      <div className="flex gap-3">
        <div className={`p-2 bg-slate-900 border rounded-xl flex items-center justify-center ${getAlertColors(activeAlert.type)}`}>
          {getAlertIcon(activeAlert.type)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">{activeAlert.type} alert</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="text-[9px] font-mono text-slate-500">{activeAlert.timestamp}</span>
          </div>
          <h4 className="text-xs font-bold text-slate-200 mt-1">{activeAlert.title}</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-normal">{activeAlert.message}</p>
        </div>
      </div>

      <button
        onClick={() => setActiveAlert(null)}
        className="p-1 text-slate-500 hover:text-slate-300 border border-slate-900 bg-slate-950/80 rounded"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
