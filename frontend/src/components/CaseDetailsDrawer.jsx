import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Camera, 
  Compass, 
  History, 
  ShieldAlert, 
  CheckCircle2, 
  Map, 
  Clock, 
  AlertTriangle, 
  Droplets, 
  Layers, 
  ChevronRight, 
  ArrowDown,
  FileCheck,
  UserCheck,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';

/**
 * CaseDetailsDrawer — Right-Side Case & Field Evidence Drawer
 * Satisfies Requirements 2, 3, 8, 9, 10
 */
export default function CaseDetailsDrawer({ 
  caseItem, 
  onClose, 
  onViewOnMap, 
  onVerify, 
  onNeedsReinspection
}) {
  // Interactive Evidence Chain Step state (Requirement 9)
  // Options: 'photo' | 'location' | 'context' | 'change' | 'priority' | 'action' | 'verify'
  const [activeChainStep, setActiveChainStep] = useState('photo');

  if (!caseItem) return null;

  const caseNumber = caseItem.caseNumber || caseItem.caseId?.replace('CASE ', '') || 'EVD-004';
  const caseId = `CASE ${caseNumber}`;
  const title = caseItem.title || 'SOIL EROSION';
  const subtitle = caseItem.subtitle || 'Check Dam CD-04';
  const observation = caseItem.observation || caseItem.title || 'Soil Erosion';
  const date = caseItem.date || 'Today, 14:22 IST';
  const status = caseItem.status || caseItem.caseStatus || 'PENDING VERIFICATION';
  
  const isConfirmed = status === 'CONFIRMED' || status === 'Verified';
  const isReinspection = status === 'NEEDS REINSPECTION';
  const isPending = status === 'PENDING VERIFICATION' || status === 'UNDER REVIEW';

  const lat = caseItem.lat || 15.4038;
  const lng = caseItem.lng || 75.1049;

  // Spatial Context
  const nearbyDrainage = caseItem.distanceToDrainage || 'D-04 (Order-2 Stream Channel, 180m)';
  const nearbyWaterBody = caseItem.distanceToWater || 'Pond PB-02 (220m)';
  const nearbyIntervention = caseItem.distanceToIntervention || 'Check Dam CD-04 (Adjacent)';
  const priorityZone = caseItem.priorityZone || 'Zone 1A (High Priority)';

  // Interactive Evidence Chain Steps definition (Requirement 2)
  const chainSteps = [
    { key: 'photo', label: 'PHOTO', icon: Camera },
    { key: 'location', label: 'LOCATION', icon: MapPin },
    { key: 'context', label: 'SPATIAL CONTEXT', icon: Compass },
    { key: 'change', label: 'CHANGE', icon: History },
    { key: 'priority', label: 'PRIORITY', icon: ShieldAlert },
    { key: 'action', label: 'ACTION', icon: Sparkles },
    { key: 'verify', label: 'VERIFY', icon: CheckCircle2 }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans select-none">
      {/* Semi-transparent Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity cursor-pointer animate-fadeIn"
      />

      {/* Right-Side Operational Case Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-950/98 border-l border-slate-750 shadow-2xl flex flex-col animate-slideInRight overflow-hidden text-slate-100">
        
        {/* ================================================== */}
        {/* SECTION 2: HEADER */}
        {/* ================================================== */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border-b border-slate-800 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/40">
                FIELD EVIDENCE
              </span>
              <span className="text-xs font-mono text-amber-400 font-extrabold">
                {caseId}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                DEMO EVIDENCE
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white mt-1.5 flex items-center gap-2 font-mono">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{title}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{subtitle}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================================================== */}
        {/* SCROLLABLE CASE CONTENT */}
        {/* ================================================== */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">

          {/* Prototype / Demo Information Disclaimer */}
          <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between text-[11px] font-mono">
            <span className="text-amber-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>DEMO EVIDENCE • Dharampura prototype study area</span>
            </span>
            <span className="text-[10px] text-amber-400/80 font-bold">
              Simulated Dataset
            </span>
          </div>

          {/* Display Grid: Evidence Image, Location, Date, Observation, Status */}
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>FIELD EVIDENCE PHOTOGRAPH</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                📷 EXIF GEOTAG LOADED
              </span>
            </div>

            {/* Thumbnail */}
            <div className="h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative shadow-inner group">
              <img
                src={caseItem.image_path || '/static/sample_photos/field_check_dam_silt.jpg'}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute top-2 left-2 bg-slate-950/85 backdrop-blur-sm text-[9px] font-mono text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                DEMO EVIDENCE
              </span>
              <span className="absolute bottom-2 left-2 bg-slate-950/85 backdrop-blur-sm text-[9px] font-mono text-sky-300 px-2 py-0.5 rounded border border-slate-800">
                EXIF GPS: {lat.toFixed(4)}°N, {lng.toFixed(4)}°E • Heading: 142° SE
              </span>
            </div>

            {/* Observation Meta Key-Values */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-850">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">OBSERVATION:</span>
                <span className="font-mono font-bold text-white text-xs mt-0.5 block">{observation}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-850">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">STATUS:</span>
                <span className={`font-mono font-black text-xs mt-0.5 inline-block px-1.5 py-0.2 rounded border ${
                  isConfirmed 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                    : isReinspection 
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {status}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-850">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">LOCATION:</span>
                <span className="font-mono text-slate-200 text-xs mt-0.5 block">{lat.toFixed(4)}°N, {lng.toFixed(4)}°E</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-850">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">DATE:</span>
                <span className="font-mono text-slate-300 text-xs mt-0.5 block">{date}</span>
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* SECTION 2: SPATIAL CONTEXT */}
          {/* ================================================== */}
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>SPATIAL CONTEXT</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (onViewOnMap) onViewOnMap(caseItem);
                }}
                className="text-[11px] font-mono text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Map className="w-3.5 h-3.5" />
                <span>[VIEW ON MAP]</span>
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-200">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span>〰</span>
                  <span>Nearby Drainage:</span>
                </span>
                <span className="font-mono text-sky-300 font-bold">{nearbyDrainage}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span>💧</span>
                  <span>Nearby Water Body:</span>
                </span>
                <span className="font-mono text-sky-400 font-bold">{nearbyWaterBody}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span>🛠</span>
                  <span>Nearby Intervention:</span>
                </span>
                <span className="font-mono text-emerald-300 font-bold">{nearbyIntervention}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span>⚠</span>
                  <span>Priority Zone:</span>
                </span>
                <span className="font-mono text-rose-400 font-bold">{priorityZone}</span>
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* SECTION 1: EXPLAINABLE “WHY?” PRIORITY (Requirement 1) */}
          {/* ================================================== */}
          <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/30 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
              <h3 className="text-xs font-mono font-extrabold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>WHY THIS CASE NEEDS ATTENTION</span>
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                caseNumber === 'EVD-004' 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                Evidence Strength: {caseNumber === 'EVD-004' ? 'High' : 'Medium'}
              </span>
            </div>

            {/* Evidence Contributors 5-Point Checklist (Requirement 1) */}
            <div className="space-y-1.5 text-xs font-medium">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                <span className="text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Field evidence detected:
                </span>
                <span className="text-emerald-400 font-mono font-bold text-[11px]">
                  Geo-coded ground proof photo
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                <span className="text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Nearby drainage/water body:
                </span>
                <span className="text-sky-300 font-mono font-bold text-[11px]">
                  {nearbyDrainage.split('(')[0]} • {nearbyWaterBody.split('(')[0]}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                <span className="text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Nearby intervention:
                </span>
                <span className="text-emerald-300 font-mono font-bold text-[11px]">
                  {nearbyIntervention.split('(')[0]}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                <span className="text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Historical observation/change:
                </span>
                <span className="text-amber-300 font-mono font-bold text-[11px]">
                  -14.2% canopy drop (2021→2026)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                <span className="text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Priority zone context:
                </span>
                <span className="text-rose-400 font-mono font-bold text-[11px]">
                  {priorityZone}
                </span>
              </div>
            </div>

            {/* WHAT WE KNOW (Requirement 1) */}
            <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/30 text-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                WHAT WE KNOW:
              </span>
              <p className="text-slate-200 text-xs leading-relaxed">
                {caseNumber === 'EVD-004'
                  ? 'Field evidence confirms 1.1m sediment depth, weir scouring, and acute channel erosion situated 180m from order-2 stream D-04 and 220m upstream of Pond PB-02.'
                  : caseNumber === 'EVD-005'
                  ? 'Water body PB-02 impoundment shows reduced retention depth and suspected seepage near the right wing-wall.'
                  : 'Contour trench unit CT-03 exhibits localized berm siltation requiring field audit to verify moisture trap retention.'}
              </p>
            </div>

            {/* WHAT WE DON'T KNOW (Requirement 1) */}
            <div className="p-3 rounded-lg bg-slate-950 border border-amber-500/30 text-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                WHAT WE DON'T KNOW:
              </span>
              <p className="text-slate-300 text-xs italic leading-relaxed">
                “Sub-surface piping extent and exact foundation stability cannot be concluded from satellite or surface imagery alone. Final engineering condition requires certified ground verification.”
              </p>
            </div>

            {/* RECOMMENDED NEXT STEP (Requirement 1) */}
            <div className="p-3 bg-sky-950/40 rounded-xl border border-sky-500/40 space-y-1">
              <span className="text-[10px] font-mono uppercase text-sky-400 font-bold block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                RECOMMENDED NEXT STEP:
              </span>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {caseNumber === 'EVD-004'
                  ? 'Physical field audit by Assistant Executive Engineer; verify silt volume and sanction mechanical de-siltation & boulder apron reinforcement.'
                  : 'Depute field team for physical hydraulic inspection and structural integrity logging.'}
              </p>
              <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/80 font-mono">
                * Decision-Support Notice: The system supports human decision-making; it never makes autonomous engineering decisions or financial commitments.
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* SECTION 8: CASE TIMELINE */}
          {/* ================================================== */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>CASE TIMELINE</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                JalDrishti Workflow
              </span>
            </div>

            {/* Step-by-Step Vertical Flow */}
            <div className="space-y-1.5 font-mono text-xs">
              {[
                { label: '📷 Evidence Captured', done: true, current: false, desc: 'Field photograph & telemetry logged' },
                { label: '📍 Location Identified', done: true, current: false, desc: 'WGS-84 coordinates matched to micro-basin' },
                { label: '🗺 Spatial Context', done: true, current: false, desc: 'Nearby stream & check dam proximity mapped' },
                { label: '⚠ Flagged', done: true, current: false, desc: 'Anomaly scored & flagged for review' },
                { 
                  label: '👤 Verification', 
                  done: isConfirmed || isReinspection, 
                  current: isPending, 
                  desc: isConfirmed ? 'Officer sign-off recorded' : isReinspection ? 'Reinspection marked by supervisor' : 'Awaiting officer ground sign-off' 
                },
                { 
                  label: isConfirmed ? '✓ Confirmed' : isReinspection ? '↻ Needs Reinspection' : '○ Confirmed / Reinspection', 
                  done: isConfirmed || isReinspection, 
                  current: isConfirmed || isReinspection, 
                  desc: isConfirmed ? 'Status confirmed & logged to digital twin' : isReinspection ? 'Ground reinspection scheduled' : 'Pending verification outcome' 
                }
              ].map((step, idx, arr) => (
                <div key={idx} className="flex flex-col">
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    step.current
                      ? 'bg-sky-950/50 border-sky-400 text-sky-200 ring-1 ring-sky-400/30'
                      : step.done
                      ? 'bg-slate-950/80 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/40 border-slate-850 text-slate-500 opacity-60'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{step.label}</span>
                      {step.current && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/40 animate-pulse font-extrabold">
                          CURRENT STAGE
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {step.done ? '✓' : '○'}
                    </span>
                  </div>

                  {idx < arr.length - 1 && (
                    <div className="flex justify-center py-0.5 text-slate-600">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ================================================== */}
          {/* SECTION 9: INTERACTIVE EVIDENCE CHAIN */}
          {/* ================================================== */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>INTERACTIVE EVIDENCE CHAIN</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                Click any step to inspect
              </span>
            </div>

            {/* Clickable Chain Bar */}
            <div className="grid grid-cols-7 gap-1 font-mono text-[9px] text-center">
              {chainSteps.map((step) => {
                const isActive = activeChainStep === step.key;
                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => {
                      if (step.key === 'verify') {
                        if (onVerify) onVerify(caseItem);
                      } else {
                        setActiveChainStep(step.key);
                      }
                    }}
                    className={`p-1.5 rounded-lg border font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-sky-600 border-sky-400 text-white shadow-md' 
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <step.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate w-full">{step.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Step Content Box */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5 font-mono">
              {activeChainStep === 'photo' && (
                <div>
                  <span className="font-bold text-cyan-300 uppercase block text-[11px]">1. PHOTO TELEMETRY:</span>
                  <p className="text-slate-300 mt-1">
                    Geo-tagged ground photograph capturing 1.1m sediment depth, weir sill scouring, and left bank soil scouring.
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 grid grid-cols-2 gap-1 border-t border-slate-850 pt-1.5">
                    <span>Camera: Samsung S23 GeoLens</span>
                    <span>Heading: 142° SE (Bearing)</span>
                    <span>Altitude: 612.4m MSL</span>
                    <span>Lighting: Overcast clear</span>
                  </div>
                </div>
              )}

              {activeChainStep === 'location' && (
                <div>
                  <span className="font-bold text-emerald-300 uppercase block text-[11px]">2. GEODETIC LOCATION:</span>
                  <p className="text-slate-300 mt-1">
                    Positioned at {lat.toFixed(5)}°N, {lng.toFixed(5)}°E in Dharampura micro-watershed unit 4C2A5b (Zone 1A).
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 grid grid-cols-2 gap-1 border-t border-slate-850 pt-1.5">
                    <span>Survey No: Cadastral 142/A</span>
                    <span>Slope: 8.5% Gravelly Loam</span>
                    <span>Catchment: Upper Ridge Unit</span>
                    <span>Datum: WGS-84</span>
                  </div>
                </div>
              )}

              {activeChainStep === 'context' && (
                <div>
                  <span className="font-bold text-sky-300 uppercase block text-[11px]">3. SPATIAL TOPOLOGY:</span>
                  <p className="text-slate-300 mt-1">
                    Confluence within 180m of Order-2 drainage stream D-04 and 220m from storage pond PB-02.
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 grid grid-cols-2 gap-1 border-t border-slate-850 pt-1.5">
                    <span>Drainage: Order-2 Stream D-04</span>
                    <span>Water Body: Pond PB-02</span>
                    <span>Civil Structure: CD-04</span>
                    <span>Hydrology: Rapid Runoff Area</span>
                  </div>
                </div>
              )}

              {activeChainStep === 'change' && (
                <div>
                  <span className="font-bold text-amber-300 uppercase block text-[11px]">4. MULTI-TEMPORAL CHANGE:</span>
                  <p className="text-slate-300 mt-1">
                    Sentinel-2 prototype multispectral comparison shows 14.2% drop in vegetative canopy cover since 2021 construction.
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 grid grid-cols-2 gap-1 border-t border-slate-850 pt-1.5">
                    <span>2019 Baseline: Severe gully</span>
                    <span>2022 Post-Works: Green bloom</span>
                    <span>2026 Audit: Silt plateau</span>
                    <span>NDVI Variance: -0.14</span>
                  </div>
                </div>
              )}

              {activeChainStep === 'priority' && (
                <div>
                  <span className="font-bold text-rose-300 uppercase block text-[11px]">5. PRIORITY ZONE RANKING:</span>
                  <p className="text-slate-300 mt-1">
                    Directly contributes to High Priority ranking of Zone 1A due to risk of downstream storage loss in Pond PB-02.
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 grid grid-cols-2 gap-1 border-t border-slate-850 pt-1.5">
                    <span>Priority Score: 84 / 100</span>
                    <span>Runoff Severity: Critical</span>
                    <span>Sediment Yield: 4.8 t/ha/yr</span>
                    <span>Tier: Top 10% Treatment</span>
                  </div>
                </div>
              )}

              {activeChainStep === 'action' && (
                <div>
                  <span className="font-bold text-purple-300 uppercase block text-[11px]">6. RECOMMENDED INTERVENTION:</span>
                  <p className="text-slate-300 mt-1">
                    Mechanical de-siltation of CD-04 basin and construction of 120m loose boulder contour checks upstream.
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 grid grid-cols-2 gap-1 border-t border-slate-850 pt-1.5">
                    <span>Action: Mechanical Desilting</span>
                    <span>Cost Est: ₹42,000</span>
                    <span>Scheme: WDC-PMKSY 2.0</span>
                    <span>Sanction: Pending Verify</span>
                  </div>
                </div>
              )}

              {activeChainStep === 'verify' && (
                <div>
                  <span className="font-bold text-emerald-300 uppercase block text-[11px]">7. HUMAN VERIFICATION:</span>
                  <p className="text-slate-300 mt-1">
                    Mandatory field sign-off required by Assistant Executive Engineer before treatment works are sanctioned.
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 grid grid-cols-2 gap-1 border-t border-slate-850 pt-1.5">
                    <span>Officer: R. K. Sharma (AEE)</span>
                    <span>Status: {status}</span>
                    <span>Role: Statutory Reviewer</span>
                    <span>Audit: Immutable Stamp</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ================================================== */}
        {/* DRAWER ACTION FOOTER */}
        {/* ================================================== */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              if (onViewOnMap) onViewOnMap(caseItem);
            }}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
          >
            <Map className="w-4 h-4" />
            <span>VIEW ON MAP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onVerify) onVerify(caseItem);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black flex items-center gap-1.5 transition-all shadow cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>VERIFY</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onNeedsReinspection) onNeedsReinspection(caseItem);
            }}
            className="px-3 py-2.5 bg-slate-800 hover:bg-purple-900/60 text-slate-300 hover:text-purple-200 border border-slate-700 hover:border-purple-500 rounded-xl font-bold transition-all cursor-pointer text-[11px]"
          >
            REINSPECT
          </button>
        </div>

      </div>
    </div>
  );
}
