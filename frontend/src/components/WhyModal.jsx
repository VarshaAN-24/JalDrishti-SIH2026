import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  X, 
  ArrowDown, 
  Camera, 
  MapPin, 
  Compass, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  Info,
  Map,
  Eye,
  FileCheck,
  TrendingDown,
  Droplets,
  Building
} from 'lucide-react';

export default function WhyModal({ 
  zoneId, 
  onClose,
  onNavigateToMap,
  onOpenEvidenceChain,
  onOpenVerification
}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Normalize zoneId: can be a string or an object with an id
  const targetId = typeof zoneId === 'object' && zoneId !== null ? (zoneId.id || zoneId.zoneId) : zoneId;

  useEffect(() => {
    if (!targetId) return;
    setIsLoading(true);
    fetch(`/api/priority-zones/${targetId}/why`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setData(res);
        }
      })
      .catch(err => {
        console.error('Error fetching WHY data:', err);
      })
      .finally(() => setIsLoading(false));
  }, [targetId]);

  if (!targetId) return null;

  const zone = data?.zone || (typeof zoneId === 'object' ? zoneId : { id: targetId });
  const groundTruth = data?.ground_truth_evidence || {};

  // Custom findings for the 3 main priority zones
  const is1A = targetId === 'ZONE-1A';
  const is1C = targetId === 'ZONE-1C';
  const is1D = targetId === 'ZONE-1D';

  const zoneName = is1A 
    ? 'Soil Erosion Near Check Dam 04 (Zone 1A)' 
    : is1C 
    ? 'Water Body Condition (Dharampura East, Zone 1C)' 
    : is1D 
    ? 'Contour Trench Verification Pending (Zone 1D)'
    : (zone.name || `Catchment ${targetId}`);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Semi-transparent Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer animate-fadeIn"
      />

      {/* Right-Side Drawer Panel (Requirement 2) */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-950/98 border-l border-slate-700 shadow-2xl flex flex-col animate-slideInRight overflow-hidden text-slate-100">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/50 font-mono">
                EVIDENCE DRAWER
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {targetId}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Evidence strength: MEDIUM
              </span>
            </div>
            
            {/* Title per Feature 1 */}
            <h2 className="text-base sm:text-xl font-black text-white mt-1.5 flex items-center gap-2 font-mono">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <span>WHY THIS CASE NEEDS ATTENTION</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 font-medium truncate font-mono">
              {zoneName}
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

        {/* Drawer Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 space-y-2 font-mono">
              <ShieldAlert className="w-8 h-8 animate-spin mx-auto text-amber-400" />
              <p>Gathering spatial context and physical evidence...</p>
            </div>
          ) : (
            <>
              {/* Evidence Contributors Checklist (Feature 1) */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/40 space-y-2.5">
                <span className="text-[10px] font-mono font-black uppercase tracking-wider text-rose-400 block">
                  EVIDENCE CONTRIBUTORS CHECKLIST
                </span>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-300 text-[11px] flex items-center gap-1.5">
                      <span className="text-emerald-400">✓</span> Field evidence:
                    </span>
                    <span className="text-emerald-400 font-bold text-[11px]">
                      {is1A ? 'Geo-coded photo (1.1m sediment bed)' : is1C ? 'Weir flank scouring photo' : 'Contour excavation photo'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-300 text-[11px] flex items-center gap-1.5">
                      <span className="text-emerald-400">✓</span> Nearby drainage:
                    </span>
                    <span className="text-sky-300 font-bold text-[11px]">
                      {is1A ? 'Order-2 stream D-04 (180m)' : 'Kalyana drainage reach (120m)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-300 text-[11px] flex items-center gap-1.5">
                      <span className="text-emerald-400">✓</span> Nearby water body:
                    </span>
                    <span className="text-sky-400 font-bold text-[11px]">
                      {is1A ? 'Pond PB-02 (220m upstream)' : 'Irrigation tank WB-02 (260m)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-300 text-[11px] flex items-center gap-1.5">
                      <span className="text-emerald-400">✓</span> Nearby intervention:
                    </span>
                    <span className="text-emerald-300 font-bold text-[11px]">
                      {is1A ? 'Check Dam CD-04 (Adjacent)' : is1C ? 'Weir Structure CD-03' : 'Contour Trench CT-03'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-300 text-[11px] flex items-center gap-1.5">
                      <span className="text-emerald-400">✓</span> Historical observation:
                    </span>
                    <span className="text-amber-300 font-bold text-[11px]">
                      {is1A ? '-14.2% canopy drop (2021→2026)' : '8% surface water drop'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-slate-300 text-[11px] flex items-center gap-1.5">
                      <span className="text-emerald-400">✓</span> Priority-zone context:
                    </span>
                    <span className="text-rose-400 font-bold text-[11px]">
                      {is1A ? 'Zone 1A (High Priority)' : is1C ? 'Zone 1C (Review)' : 'Zone 1D (Verify)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Requirement 1: THREE SIGNATURE SECTIONS */}
              {/* 1. WHAT WE KNOW */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <h3 className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider font-mono">
                    WHAT WE KNOW
                  </h3>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed font-medium">
                  {is1A 
                    ? 'Field observation is located near a 2nd-order drainage channel (D-04) and Check Dam CD-04 with visible silt accumulation (1.1m) and 14.2% vegetative canopy reduction.'
                    : is1C
                    ? 'Field observation is located near Kalyana stream drainage and weir structure CD-03 with water extent reduction detected.'
                    : is1D
                    ? 'Field observation is located along the East Ridge contour trench intervention CT-03 within the upper catchment zone.'
                    : 'Field observation is located near a drainage feature and an intervention.'}
                </p>
              </div>

              {/* 2. WHAT WE DON'T KNOW */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider font-mono">
                    WHAT WE DON'T KNOW
                  </h3>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed font-medium italic">
                  “Final current condition requires field verification before capital desilting budget can be sanctioned. The system provides decision support; it does not make automated engineering decisions.”
                </p>
              </div>

              {/* 3. NEXT REQUIRED ACTION */}
              <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-500/40 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                  <h3 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider font-mono">
                    NEXT REQUIRED ACTION
                  </h3>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed font-medium">
                  {is1A
                    ? 'Field verification required: Physical site audit by Assistant Executive Engineer; sanction mechanical desiltation & boulder apron extension.'
                    : 'Field verification required: Conduct physical ground inspection and structural integrity logging.'}
                </p>
              </div>

              {/* Step-by-Step 7-Stage Evidence Chain (Feature 2) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>The 7-Stage Evidence Chain:</span>
                </h3>

                <div className="space-y-2">
                  {[
                    {
                      icon: '📷',
                      label: 'PHOTO',
                      value: is1A ? 'Check dam CD-04 silt depth 1.1m (68% capacity loss)' : is1C ? 'Water bypassing weir flank via piping' : 'Continuous contour trench excavation completed',
                      tag: 'Physical Photo Proof'
                    },
                    {
                      icon: '📍',
                      label: 'LOCATION',
                      value: is1A ? 'Latitude 15.4038°N, Longitude 75.1049°E (Zone 1A Ridge)' : is1C ? 'Latitude 15.3478°N, Longitude 75.0882°E (Zone 1C)' : 'Latitude 15.3584°N, Longitude 75.1418°E (Zone 1D)',
                      tag: 'WGS-84 Coordinates'
                    },
                    {
                      icon: '🗺️',
                      label: 'SPATIAL CONTEXT',
                      value: is1A ? 'Order-2 stream D-04 • Pond PB-02 (220m) • Check Dam CD-04' : is1C ? 'Kalyana valley basin • Near irrigation tank WB-02' : 'Ridge-to-valley micro-catchment • 6.2% slope',
                      tag: 'GIS Topology'
                    },
                    {
                      icon: '🕒',
                      label: 'CHANGE',
                      value: is1A ? '-14.2% photosynthetic canopy reduction (2021 → 2026)' : is1C ? 'Surface water retention dropped by 8% in dry spell' : '+18% soil moisture retention recorded after rain',
                      tag: 'Multi-Temporal'
                    },
                    {
                      icon: '⚠️',
                      label: 'PRIORITY',
                      value: is1A ? 'High Priority — Erosion hazard threatens downstream storage' : is1C ? 'Review — Potential foundation bypass' : 'Verify — Pending completion audit',
                      tag: 'Decision Matrix'
                    },
                    {
                      icon: '🛠️',
                      label: 'ACTION',
                      value: is1A ? 'Sanction mechanical desilting and 120m loose boulder checks' : is1C ? 'Conduct saline tracer dye test' : 'Upload geo-tagged berm photos',
                      tag: 'Intervention Plan'
                    },
                    {
                      icon: '👤',
                      label: 'VERIFY',
                      value: 'Awaiting certified field officer review and statutory sign-off',
                      tag: 'Human-in-the-Loop'
                    }
                  ].map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-3">
                        <span className="text-lg shrink-0 mt-0.5">{step.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="font-bold text-sky-400 uppercase">{step.label}</span>
                            <span className="text-slate-500">{step.tag}</span>
                          </div>
                          <p className="text-slate-200 font-medium text-xs mt-0.5">
                            {step.value}
                          </p>
                        </div>
                      </div>

                      {idx < 5 && (
                        <div className="flex justify-center -my-1 relative z-10">
                          <ArrowDown className="w-3 h-3 text-slate-600" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Action Recommendation */}
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                  Recommended Action:
                </span>
                <p className="text-xs text-slate-200">
                  {is1A 
                    ? 'Deploy excavator for basin desilting and extend boulder apron by 2.5m.' 
                    : is1C 
                    ? 'Conduct saline tracer dye test to locate sub-surface foundation piping.' 
                    : 'Field surveyor to upload geo-tagged berm photos via GeoLens.'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => {
              if (onNavigateToMap) {
                onNavigateToMap(targetId);
              }
              onClose();
            }}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
          >
            <Map className="w-4 h-4" />
            <span>View on Map</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onOpenVerification) {
                onOpenVerification(targetId);
              }
              onClose();
            }}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verify</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
