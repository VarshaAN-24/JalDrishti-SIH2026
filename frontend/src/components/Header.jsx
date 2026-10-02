import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  Map, 
  Camera, 
  History, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  Activity, 
  Sparkles, 
  Database, 
  Plus, 
  Smartphone,
  Menu,
  X,
  Radio,
  Sliders,
  Bell,
  LogOut,
  ChevronDown,
  User,
  Shield,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { ROLES, ROLE_CONFIGS } from '../services/auth';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onOpenAskWatershed, 
  watershedInfo,
  onOpenScenarioPlanner,
  onOpenDigitalTwinStatus,
  pendingCount = 5,
  activeLocationMode = 'live_gps',
  activeLocation = null,
  onSwitchToDemoMode,
  onSwitchToLiveMode,
  isFieldModeActive,
  setIsFieldModeActive,
  onToggleSidebarMobile,
  currentUser = null,
  onLogout,
  onSwitchRole
}) {
  const [searchInput, setSearchInput] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onOpenAskWatershed) {
      onOpenAskWatershed(searchInput);
    }
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const currentRoleConfig = currentUser ? ROLE_CONFIGS[currentUser.role] : null;

  return (
    <header className="bg-slate-950/98 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md font-sans select-none">
      
      {/* Top Operations Header Bar */}
      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
        
        {/* Left: Mobile Sidebar Toggle + Brand & Screen Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebarMobile}
            className="lg:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 via-teal-600 to-indigo-700 flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
              <Compass className="w-4 h-4 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white tracking-wide font-mono">
                  JalDrishti
                </span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="font-extrabold text-xs text-sky-300 font-mono hidden sm:inline">
                  Operations Center
                </span>
              </div>
              <p className="text-[10px] text-teal-400 font-mono hidden sm:block">
                From Field Evidence to Watershed Action
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search / Command Bar (Requirement 20: "Ask the Watershed" Command Bar) */}
        <div className="hidden md:flex flex-1 max-w-md mx-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search evidence, locations, or watershed conditions..."
              className="w-full pl-9 pr-20 py-1.5 bg-slate-900/90 border border-slate-750 focus:border-sky-500 rounded-xl text-xs text-white placeholder-slate-400 outline-none transition-all shadow-inner font-mono"
            />
            <button
              type="button"
              onClick={onOpenAskWatershed}
              className="absolute right-1 px-2 py-0.8 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-300" />
              <span>Ask AI</span>
            </button>
          </form>
        </div>

        {/* Right: Operational Actions, Mode Indicators, Field Mode Button & Role Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Requirement 7: Compact Top Bar GPS status chip inside header */}
          <div className="hidden sm:flex items-center gap-2">
            {activeLocationMode === 'live_gps' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-extrabold">GPS ACTIVE</span>
                <span className="text-slate-500">•</span>
                <span className="truncate max-w-[130px] text-slate-200">
                  {activeLocation?.locality || (activeLocation?.lat ? `${activeLocation.lat.toFixed(3)}°N, ${activeLocation.lng.toFixed(3)}°E` : '13.168°N, 77.535°E')}
                </span>
                <span className="text-emerald-400 font-semibold">
                  ±{activeLocation?.accuracy ? Math.round(activeLocation.accuracy) : 500}m
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-mono shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="font-extrabold">DEMO STUDY AREA</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-200">Gadag</span>
              </div>
            )}
          </div>

          {/* Requirement 5: Location Mode Switcher [ LIVE GPS ] [ DEMO AREA ] */}
          <div className="hidden lg:flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-750 text-[11px] font-mono shadow-inner">
            <button
              type="button"
              onClick={() => {
                if (activeLocationMode !== 'live_gps' && onSwitchToLiveMode) {
                  onSwitchToLiveMode();
                }
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeLocationMode === 'live_gps'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Use actual device GPS position"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeLocationMode === 'live_gps' ? 'bg-white animate-pulse' : 'bg-emerald-400'}`}></span>
              <span>LIVE GPS</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeLocationMode !== 'demo' && onSwitchToDemoMode) {
                  onSwitchToDemoMode();
                }
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeLocationMode === 'demo'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Explore Dharampura demo watershed dataset"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeLocationMode === 'demo' ? 'bg-white' : 'bg-amber-400'}`}></span>
              <span>DEMO AREA</span>
            </button>
          </div>

          {/* Dedicated Prominent 📱 FIELD MODE Button */}
          <button
            type="button"
            onClick={() => setIsFieldModeActive(!isFieldModeActive)}
            className={`px-3 py-1.5 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isFieldModeActive
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white ring-2 ring-teal-400/40'
                : 'bg-slate-900 hover:bg-slate-850 text-teal-300 border border-teal-500/40'
            }`}
            title="Switch to Mobile Field-Worker Mode"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">📱 FIELD MODE</span>
            <span className="sm:hidden">FIELD</span>
          </button>

          {/* Quick Action: + Add Evidence Photo */}
          <button
            type="button"
            onClick={() => setActiveTab('geolens')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white font-bold font-mono text-xs flex items-center gap-1.5 shadow-md shadow-sky-950/40 border border-sky-400/30 transition-all cursor-pointer"
            title="Log new field photo"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">+ Evidence</span>
          </button>

          {/* Telemetry Status Trigger */}
          <button
            type="button"
            onClick={onOpenDigitalTwinStatus}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-750 transition-colors cursor-pointer hidden md:flex"
            title="Digital Twin Telemetry"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {/* Profile & Role Management Menu */}
          {currentUser && (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                  isProfileMenuOpen 
                    ? 'bg-slate-800 border-sky-500 ring-2 ring-sky-500/20' 
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-750'
                }`}
                title={`Signed in as ${currentUser.name} (${currentUser.roleLabel})`}
              >
                {/* Avatar Badge */}
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${
                  currentUser.role === ROLES.FIELD_WORKER
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : currentUser.role === ROLES.SUPERVISOR
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                }`}>
                  {currentUser.avatarText || 'JD'}
                </div>

                {/* User info on larger screens */}
                <div className="hidden xl:flex flex-col text-left leading-none">
                  <span className="text-white font-bold text-[11px] truncate max-w-[110px]">
                    {currentUser.name}
                  </span>
                  <span className={`text-[9px] font-mono mt-0.5 ${
                    currentUser.role === ROLES.FIELD_WORKER
                      ? 'text-emerald-400 font-semibold'
                      : currentUser.role === ROLES.SUPERVISOR
                      ? 'text-sky-400 font-semibold'
                      : 'text-amber-400 font-semibold'
                  }`}>
                    {currentUser.roleLabel}
                  </span>
                </div>

                {/* Role Pill on medium screens */}
                <span className={`hidden md:inline-block xl:hidden text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  currentUser.role === ROLES.FIELD_WORKER
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : currentUser.role === ROLES.SUPERVISOR
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {currentUser.roleLabel}
                </span>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180 text-sky-400' : ''}`} />
              </button>

              {/* Profile Dropdown Popover */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl backdrop-blur-xl p-4 z-50 animate-fadeIn font-mono text-xs">
                  
                  {/* User Profile Card */}
                  <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${
                      currentUser.role === ROLES.FIELD_WORKER
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                        : currentUser.role === ROLES.SUPERVISOR
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    }`}>
                      {currentUser.avatarText || 'JD'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm truncate font-sans">
                          {currentUser.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {currentUser.email}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          currentUser.role === ROLES.FIELD_WORKER
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : currentUser.role === ROLES.SUPERVISOR
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {currentUser.roleLabel.toUpperCase()}
                        </span>
                        <span className="text-[9px] text-slate-400 truncate">
                          {currentUser.organization || 'Dharampura Division'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Active Capabilities Summary */}
                  <div className="py-2.5 border-b border-slate-800">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Role Scope & Capabilities:
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {currentRoleConfig?.capabilities?.slice(0, 3).map((cap, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Quick Role Switcher for SIH Jury Demonstration */}
                  <div className="py-2.5 border-b border-slate-800">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-sky-400" />
                        <span>Switch Persona (Demo)</span>
                      </span>
                      <span className="text-amber-400 text-[9px]">1-Click</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSwitchRole) onSwitchRole(ROLES.FIELD_WORKER);
                          setIsProfileMenuOpen(false);
                        }}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          currentUser.role === ROLES.FIELD_WORKER
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-[10px] font-bold">Field</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onSwitchRole) onSwitchRole(ROLES.SUPERVISOR);
                          setIsProfileMenuOpen(false);
                        }}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          currentUser.role === ROLES.SUPERVISOR
                            ? 'bg-sky-950/80 border-sky-500 text-sky-300 font-bold'
                            : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-[10px] font-bold">Supervisor</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onSwitchRole) onSwitchRole(ROLES.WATERSHED_OFFICER);
                          setIsProfileMenuOpen(false);
                        }}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          currentUser.role === ROLES.WATERSHED_OFFICER
                            ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                            : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-[10px] font-bold">Officer</div>
                      </button>
                    </div>
                  </div>

                  {/* Sign Out / Logout Action */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer group"
                    >
                      <LogOut className="w-3.5 h-3.5 group-hover:text-rose-400" />
                      <span>Sign Out / Logout</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </header>
  );
}
