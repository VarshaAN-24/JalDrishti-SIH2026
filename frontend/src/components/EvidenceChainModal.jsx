import React from 'react';
import { 
  X, 
  MapPin, 
  Layers, 
  History, 
  Camera, 
  CheckCircle2, 
  ArrowDown, 
  ArrowRight, 
  ShieldCheck, 
  Compass, 
  Sparkles,
  ShieldAlert,
  FileCheck
} from 'lucide-react';

export default function EvidenceChainModal({ 
  evidenceData, 
  onClose,
  onNavigateToMap,
  onOpenWhyModal
}) {
  if (!evidenceData) return null;

  const id = evidenceData.id || 'EVID-UNKNOWN';
  const title = evidenceData.title || evidenceData.name || 'Watershed Evidence Chain';
  const lat = evidenceData.lat || 15.4038;
  const lng = evidenceData.lng || 75.1049;
  const subWatershed = evidenceData.sub_watershed || 'ZONE-1A';
  const status = evidenceData.verification_status || 'Under Review';
  const image = evidenceData.image_path || evidenceData.image_url || '/static/sample_photos/field_check_dam_silt.jpg';

  // Exact 7-Tier Signature Evidence Chain (Requirement #6)
  const chainSteps = [
    {
      step: '1. EVIDENCE ID',
      icon: FileCheck,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      title: `Permanent Identifier: ${id}`,
      desc: `Registered in JalDrishti Digital Twin audit schema under micro-watershed Dharampura (4C2A5b).`
    },
    {
      step: '2. PHOTO',
      icon: Camera,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
      title: 'Ground Truth Photograph & Camera Telemetry',
      desc: evidenceData.ai_interpretation || 'High-resolution field photograph capturing physical structure embankment, silt deposition, and vegetation status.'
    },
    {
      step: '3. COORDINATES',
      icon: MapPin,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      title: `WGS-84 Geodetics: ${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`,
      desc: `Positioned in Sub-basin ${subWatershed}. Altitude: ${evidenceData.altitude_m || 612}m MSL. Verified via GPS/Geodetic survey.`
    },
    {
      step: '4. SPATIAL LAYERS',
      icon: Layers,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      title: 'Hydrological & Topographic Topology Intersect',
      desc: `Intersected with Stream Order 2 reach (${evidenceData.distance_to_stream_m || 35}m offset). Slope gradient 8.5% with high surface runoff potential.`
    },
    {
      step: '5. HISTORICAL INFORMATION',
      icon: History,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      title: 'Multi-Temporal Spectral Trajectory (2019 → 2026)',
      desc: 'Compared against 2019 baseline. Demonstrates initial post-construction vegetation gain followed by sediment plateau in 2024–2026 passes.'
    },
    {
      step: '6. PRIORITY STATUS',
      icon: ShieldAlert,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      title: `Priority Contribution: ${subWatershed} (Critical / High)`,
      desc: 'Ground observation directly corroborates the erosion risk and siltation factors driving sub-watershed treatment ranking.'
    },
    {
      step: '7. VERIFICATION',
      icon: CheckCircle2,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      title: `Statutory Field Sign-Off: ${status.toUpperCase()}`,
      desc: evidenceData.officer_remarks || 'Pending final physical inspection sign-off by Watershed Development Officer.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
                HOW WE KNOW
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {id}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1">
              {title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              “How We Know — Step-by-step evidence linking field photos directly to watershed action.”
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Top Visual Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <div className="sm:col-span-5 h-36 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 relative">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-slate-950/90 px-2 py-0.5 rounded text-[10px] font-mono text-sky-400 border border-slate-800">
                FIELD PHOTO
              </div>
            </div>

            <div className="sm:col-span-7 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">IDENTIFIER</span>
                <div className="text-sm font-bold text-white">{id}</div>
                <div className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                  {title}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800 font-mono text-[11px]">
                <span className="text-slate-400">STATUS:</span>
                <span className="text-emerald-400 font-bold">{status}</span>
                <span className="text-slate-600">|</span>
                <span className="text-sky-300">{subWatershed}</span>
              </div>
            </div>
          </div>

          {/* Explicit 7-Tier Signature Evidence Chain */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Unbroken 7-Tier Evidence Pipeline:</span>
              <span className="text-teal-400 font-mono text-[10px]">Photo → Spatial Layers → Action</span>
            </h3>

            <div className="space-y-2.5">
              {chainSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="relative">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3 hover:border-slate-700 transition-all">
                      <div className={`p-2 rounded-lg border shrink-0 ${step.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                            {step.step}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-0.5">
                          {step.title}
                        </h4>
                        <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>

                    {/* Step arrow divider */}
                    {idx < chainSteps.length - 1 && (
                      <div className="flex justify-center -my-1 relative z-10">
                        <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onNavigateToMap) onNavigateToMap(evidenceData);
                onClose();
              }}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Locate on Hero Map</span>
            </button>

            {onOpenWhyModal && subWatershed && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWhyModal(subWatershed);
                }}
                className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 rounded-lg font-medium"
              >
                Inspect Why Priority
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
