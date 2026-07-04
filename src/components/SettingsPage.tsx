import React from "react";
import { User, Bell, Shield, Globe, Layers, Key, Check } from "lucide-react";
import { UserProfile, UserRole } from "../types";

interface SettingsPageProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onRoleChange: (r: UserRole) => void;
}

export default function SettingsPage({
  profile,
  onUpdateProfile,
  onRoleChange
}: SettingsPageProps) {

  const handleUpdateName = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProfile({ ...profile, name: e.target.value });
  };

  const handleUpdateEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateProfile({ ...profile, email: e.target.value });
  };

  const handleToggleNotifications = () => {
    onUpdateProfile({ ...profile, notificationsEnabled: !profile.notificationsEnabled });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateProfile({ ...profile, language: e.target.value });
  };

  const handleThemeChange = (theme: "light" | "dark") => {
    onUpdateProfile({ ...profile, theme });
  };

  const isDark = profile.theme === "dark";

  return (
    <div className="grid lg:grid-cols-3 gap-4" id="settings-portal">
      
      {/* Account Profile Box */}
      <div className={`border rounded-2xl p-4 shadow-xs space-y-4 transition-all ${
        isDark ? "border-slate-800 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-850"
      }`}>
        <div className={`flex items-center gap-2 border-b pb-3 mb-4 ${
          isDark ? "border-slate-800" : "border-slate-100"
        }`}>
          <User className="h-4 w-4 text-blue-500" />
          <h3 className={`font-extrabold text-[10px] uppercase tracking-widest font-mono ${
            isDark ? "text-slate-350" : "text-slate-700"
          }`}>User Profile Details</h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-emerald-600 text-white font-black text-xs rounded-xl flex items-center justify-center uppercase shadow-sm">
            {profile.name.substring(0, 2)}
          </div>
          <div>
            <h4 className={`text-xs font-bold ${isDark ? "text-slate-100" : "text-slate-850"}`}>{profile.name}</h4>
            <span className="text-[9px] font-mono text-emerald-600 uppercase tracking-wider font-bold">
              {profile.role} Operator
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="space-y-1">
            <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={handleUpdateName}
              className={`w-full rounded-xl p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all border ${
                isDark ? "bg-slate-900 border-slate-850 text-slate-200" : "bg-white border-slate-250 text-slate-800"
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={handleUpdateEmail}
              className={`w-full rounded-xl p-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all border ${
                isDark ? "bg-slate-900 border-slate-850 text-slate-200" : "bg-white border-slate-250 text-slate-800"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Role selection & Theme config */}
      <div className={`lg:col-span-2 border rounded-2xl p-4 shadow-xs space-y-4 transition-all ${
        isDark ? "border-slate-800 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-850"
      }`}>
        
        {/* Core role simulator selection */}
        <div>
          <div className={`flex items-center gap-2 border-b pb-3 mb-4 ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}>
            <Layers className="h-4 w-4 text-blue-500" />
            <h3 className={`font-extrabold text-[10px] uppercase tracking-widest font-mono ${
              isDark ? "text-slate-350" : "text-slate-700"
            }`}>Simulate Operator Personas</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: "citizen", label: "Citizen / Commuter", desc: "Report potholes, view active routes" },
              { id: "delivery", label: "Delivery Operator", desc: "Evaluate fuel, plan transport metrics" },
              { id: "emergency", label: "Emergency Services", desc: "Route evacuation, view road blockades" },
              { id: "admin", label: "DoT Administrator", desc: "Manage RAPIDS, verify citizen reports" }
            ].map(roleItem => {
              const isActive = profile.role === roleItem.id;
              return (
                <button
                  key={roleItem.id}
                  onClick={() => onRoleChange(roleItem.id as UserRole)}
                  className={`text-left p-2.5 rounded-xl border transition-all h-24 flex flex-col justify-between cursor-pointer ${
                    isActive
                      ? isDark
                        ? "border-blue-500 bg-blue-950/20 text-blue-400 shadow-sm"
                        : "border-blue-500 bg-blue-50 text-blue-700 shadow-xs"
                      : isDark
                      ? "border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      : "border-slate-200 text-slate-600 hover:text-slate-850 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-extrabold leading-tight">{roleItem.label}</span>
                    {isActive && <Check className="h-3 w-3 text-emerald-500" />}
                  </div>
                  <p className="text-[8.5px] text-slate-500 leading-normal mt-1.5">{roleItem.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* System Settings (Theme & language & push reports) */}
        <div className={`grid md:grid-cols-2 gap-4 pt-4 border-t ${
          isDark ? "border-slate-850" : "border-slate-100"
        }`}>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-4 w-4 text-blue-500" />
              <h4 className={`text-[10px] font-extrabold font-mono uppercase tracking-widest ${
                isDark ? "text-slate-350" : "text-slate-700"
              }`}>System Localization</h4>
            </div>

            <div>
              <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Language</label>
              <select
                value={profile.language}
                onChange={handleLanguageChange}
                className={`w-full rounded-xl p-2 text-xs focus:outline-none transition-all border ${
                  isDark ? "bg-slate-900 border-slate-850 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                }`}
              >
                <option value="English">English (United States)</option>
                <option value="Spanish">Spanish (Latin America)</option>
                <option value="Portuguese">Portuguese (Brazil)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-500 uppercase">Visual Theme Preference</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {["light", "dark"].map(themeOption => (
                  <button
                    key={themeOption}
                    onClick={() => handleThemeChange(themeOption as any)}
                    className={`py-1.5 border rounded-xl uppercase font-mono transition-all text-[10px] font-bold cursor-pointer ${
                      profile.theme === themeOption
                        ? isDark
                          ? "border-blue-500 bg-blue-950/20 text-blue-400 font-bold"
                          : "border-blue-500 bg-blue-50 text-blue-700 font-bold"
                        : isDark
                        ? "border-slate-850 bg-slate-900/10 text-slate-500 hover:text-slate-350"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-850"
                    }`}
                  >
                    {themeOption}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="h-4 w-4 text-blue-500" />
              <h4 className={`text-[10px] font-extrabold font-mono uppercase tracking-widest ${
                isDark ? "text-slate-350" : "text-slate-700"
              }`}>Communication Alerts</h4>
            </div>

            <div className={`space-y-3 p-3 border rounded-xl ${
              isDark ? "bg-slate-900/20 border-slate-850" : "bg-slate-50 border-slate-150"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`block text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Push Notifications</span>
                  <span className="text-[8.5px] text-slate-500 leading-tight block mt-0.5">Broadcast active road closures and flood alarms</span>
                </div>
                <button
                  onClick={handleToggleNotifications}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    profile.notificationsEnabled ? "bg-blue-600" : "bg-slate-400 dark:bg-slate-800"
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
                    profile.notificationsEnabled ? "translate-x-4" : ""
                  }`} />
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
