import React from 'react';
import { 
  Home, 
  Map, 
  Camera, 
  History, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Settings, 
  Radio, 
  Smartphone, 
  Play, 
  Sparkles,
  Info,
  ChevronRight,
  Database,
  Sliders,
  User,
  ShieldCheck
} from 'lucide-react';
import { ROLES } from '../services/auth';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  pendingCount = 5,
  attentionCount = 3,
  activeLocationMode = 'live_gps',
  onSwitchToDemoMode,
  onSwitchToLiveMode,
  isFieldModeActive,
  setIsFieldModeActive,
  onStartDemoTour,
  onOpenDigitalTwinStatus,
  onOpenScenarioPlanner,
  currentUser = null
}) {
  const isFieldWorker = currentUser?.role === ROLES.FIELD_WORKER;
  const isSupervisor = currentUser?.role === ROLES.SUPERVISOR;
  const isOfficer = !currentUser || currentUser?.role === ROLES.WATERSHED_OFFICER;

  const navItems = [
    { 
      id: 'overview', 
      number: '01', 
      label: 'OPERATIONS', 
      icon: Home, 
      badge: null,
      roleTag: isSupervisor ? 'Primary' : null,
      tagColor: 'sky'
    },
    { 
      id: 'map', 
      number: '02', 
      label: 'EXPLORE MAP', 
      icon: Map, 
      badge: null,
      roleTag: isFieldWorker ? 'Field' : null,
      tagColor: 'emerald'
    },
    { 
      id: 'geolens', 
      number: '03', 
      label: 'FIELD EVIDENCE', 
      icon: Camera, 
      badge: null,
      roleTag: isFieldWorker ? 'Primary' : null,
      tagColor: 'emerald'
    },
    { 
      id: 'change', 
      number: '04', 
      label: 'CHANGE REPLAY', 
      icon: History, 
      badge: null,
      roleTag: isOfficer ? null : 'Officer',
      tagColor: 'amber'
    },
    { 
      id: 'interventions', 
      number: '05', 
      label: 'INTERVENTIONS', 
      icon: Layers, 
      badge: null,
      roleTag: isOfficer ? null : 'Officer',
      tagColor: 'amber'
    },
    { 
      id: 'priority', 
      number: '06', 
      label: 'ATTENTION', 
      icon: ShieldAlert, 
      badge: attentionCount, 
      badgeColor: 'rose',
      roleTag: isSupervisor ? 'Triage' : null,
      tagColor: 'sky'
    },
    { 
      id: 'verification', 
      number: '07', 
      label: 'VERIFICATION', 
      icon: CheckCircle2, 
      badge: pendingCount, 
      badgeColor: 'amber',
      roleTag: isSupervisor ? 'Review' : null,
      tagColor: 'sky'
    }
  ];

  return (
    <aside className="w-56 sm:w-60 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none z-30 font-sans">
      
      {/* Top Application Header / Brand */}
      <div>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 via-teal-600 to-indigo-700 flex items-center justify-center shadow-md shadow-sky-500/20 ring-1 ring-sky-400/40">
              <span className="text-sm font-black text-white font-mono">JD</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white tracking-wide font-mono">
                  JalDrishti
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold">
                  v2.6
                </span>
              </div>
              <p className="text-[10px] text-teal-400 font-mono font-medium">
                Digital Twin • Action System
              </p>
            </div>
          </div>
        </div>

        {/* Current Role Banner in Sidebar */}
        {currentUser && (
          <div className="px-3 pt-3">
            <div className={`p-2.5 rounded-xl border font-mono text-[10px] space-y-1 ${
              currentUser.role === ROLES.FIELD_WORKER
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : currentUser.role === ROLES.SUPERVISOR
                ? 'bg-sky-950/40 border-sky-500/30 text-sky-300'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400">
                  ACTIVE ROLE
                </span>
                <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${
                  currentUser.role === ROLES.FIELD_WORKER
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : currentUser.role === ROLES.SUPERVISOR
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {currentUser.roleLabel}
                </span>
              </div>
              <div className="text-white font-bold text-xs truncate">
                {currentUser.name}
              </div>
              <div className="text-[9px] text-slate-400 truncate">
                {currentUser.roleTitle}
              </div>
            </div>
          </div>
        )}

        {/* Mode & Field Mode Toggles */}
        <div className="p-3 border-b border-slate-800/80 space-y-2">
          {/* Field Mode Button (Requirement 9) */}
          <button
            type="button"
            onClick={() => setIsFieldModeActive(!isFieldModeActive)}
            className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-between transition-all cursor-pointer shadow-sm ${
              isFieldModeActive 
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-teal-950/50 border border-teal-400 ring-2 ring-teal-400/30'
                : isFieldWorker
                ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-750 hover:border-teal-500/50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Smartphone className={`w-4 h-4 ${isFieldModeActive ? 'text-yellow-300 animate-pulse' : isFieldWorker ? 'text-emerald-400' : 'text-teal-400'}`} />
              <span>📱 FIELD MODE</span>
            </span>
            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-extrabold ${
              isFieldModeActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {isFieldModeActive ? 'ACTIVE' : 'OFF'}
            </span>
          </button>

          {/* Requirement 2: Clean unambiguous LOCATION MODE display */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              LOCATION MODE
            </div>
            {activeLocationMode === 'live_gps' ? (
              <div>
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>LIVE GPS</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Device location active
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>DEMO AREA</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Dharampura Study Area
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Navigation Items (Requirement 3) */}
        <nav className="p-2 space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
            <span>OPERATIONAL MODULES</span>
            {isFieldWorker && (
              <span className="text-[8px] text-emerald-400 font-bold">FIELD VIEW</span>
            )}
            {isSupervisor && (
              <span className="text-[8px] text-sky-400 font-bold">SUPV VIEW</span>
            )}
            {isOfficer && (
              <span className="text-[8px] text-amber-400 font-bold">FULL ACCESS</span>
            )}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !isFieldModeActive && activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (isFieldModeActive) setIsFieldModeActive(false);
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-sky-600/20 text-sky-300 border border-sky-500/50 shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`font-mono text-[10px] ${isActive ? 'text-sky-400 font-bold' : 'text-slate-400'}`}>
                    {item.number}
                  </span>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Subtle role highlight label if applicable */}
                  {item.roleTag && !item.badge && (
                    <span className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded border ${
                      item.tagColor === 'emerald'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : item.tagColor === 'sky'
                        ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {item.roleTag}
                    </span>
                  )}

                  {item.badge !== null && item.badge !== undefined && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                      item.badgeColor === 'rose'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* 45-Second Demo Walkthrough Button */}
        <div className="p-2.5 pt-1">
          <button
            type="button"
            onClick={onStartDemoTour}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-900/60 to-slate-900 hover:from-sky-900 hover:to-slate-850 text-sky-300 hover:text-white border border-sky-500/40 text-xs font-mono font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm group"
          >
            <span className="flex items-center gap-2">
              <Play className="w-3.5 h-3.5 fill-current text-sky-400 group-hover:text-white" />
              <span>SIH Demo Flow</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Sidebar Information & Settings */}
      <div className="p-3 border-t border-slate-800 space-y-2 text-xs">
        {/* Requirement 11: Small System Status Block */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 font-mono text-[10px]">
          <div className="flex items-center justify-between font-bold text-slate-400 border-b border-slate-800 pb-1">
            <span>SYSTEM STATUS</span>
            <span className="text-emerald-400">ONLINE</span>
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Map Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Evidence Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Verification Ready</span>
            </div>
          </div>
          {activeLocationMode === 'demo' ? (
            <div className="pt-1 border-t border-slate-800 text-amber-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>DEMO DATA ACTIVE</span>
            </div>
          ) : (
            <div className="pt-1 border-t border-slate-800 text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>LIVE GPS ACTIVE</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenDigitalTwinStatus}
          className="w-full py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-[11px] font-mono flex items-center justify-between border border-slate-800 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span>Telemetry & Logs</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </button>
      </div>

    </aside>
  );
}
