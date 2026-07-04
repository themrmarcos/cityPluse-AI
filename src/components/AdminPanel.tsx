import React from "react";
import { Incident } from "../types";
import GCPAdminConsole from "./GCPAdminConsole";

interface AdminPanelProps {
  incidents: Incident[];
  onVerifyIncident: (id: string) => void;
  onResolveIncident: (id: string) => void;
  onDeleteIncident: (id: string) => void;
  onAddIncident: (newIncident: Omit<Incident, "id" | "reportsCount" | "verified" | "timestamp">) => void;
}

export default function AdminPanel({
  incidents,
  onVerifyIncident,
  onResolveIncident,
  onDeleteIncident,
  onAddIncident
}: AdminPanelProps) {
  return (
    <GCPAdminConsole
      incidents={incidents}
      onVerifyIncident={onVerifyIncident}
      onResolveIncident={onResolveIncident}
      onDeleteIncident={onDeleteIncident}
      onAddIncident={onAddIncident}
    />
  );
}
