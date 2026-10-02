import React from 'react';
import { 
  Layers, 
  X, 
  ArrowDown, 
  MapPin, 
  CheckCircle2, 
  Camera, 
  Compass, 
  ShieldAlert, 
  FileCheck,
  Sparkles,
  Map
} from 'lucide-react';

/**
 * DecisionStoryModal — Signature Decision Story for JalDrishti (Requirement 8)
 * Shows the unified visual story from Observation -> Context -> Evidence -> Priority -> Next Step.
 */
export default function DecisionStoryModal({ 
  item, 
  isOpen, 
  onClose, 
  onViewOnMap, 
  onVerify 
}) {
  if (!isOpen || !item) return null;

  const isErosion = item.id === 'ZONE-1A' || item.title?.toLowerCase().includes('erosion') || item.title?.toLowerCase().includes('dam');
  const isWater = item.id === 'ZONE-1C' || item.title?.toLowerCase().includes('water') || item.title?.toLowerCase().includes('pond');

  const story = {
    title: item.title || (isErosion ? 'Soil Erosion Near Check Dam 04' : isWater ? 'Water Body Condition (Dharampura East)' : 'Contour Trench Verification'),
    zone: item.sub_watershed || item.id || 'ZONE-1A',
    steps: [
      {
        stage: 'OBSERVATION',
        icon: '📷',
        headline: isErosion ? 'Possible soil erosion detected' : isWater ? 'Surface water retention deficit detected' : 'Contour trenches completed in field',
        detail: isErosion 
          ? 'Physical silt buildup of 1.1m (68% weir loss) observed behind check dam structure.'
          : isWater
          ? 'Visible water column surface reduced by 8% despite monsoon inflow decile.'
          : 'Ridge earthworks excavated to slow down sheet erosion on 6.2% gradient.',
        tag: 'Physical Field Photo Proof'
      },
      {
        stage: 'CONTEXT',
        icon: '🗺️',
        headline: isErosion ? 'Near drainage and check dam' : isWater ? 'Kalyana drainage basin confluence' : 'East ridge contour diversion path',
        detail: isErosion
          ? 'Located 180 m from Order-2 stream channel; check dam CD-04 at 45 m; slope 8.5%.'
          : isWater
          ? 'Near community tank WB-02; downstream agricultural fields depend on seepage recharge.'
          : 'Slope 6.2%; gravelly loam soil with high sheet runoff potential.',
        tag: 'Spatial GIS Convergence'
      },
      {
        stage: 'EVIDENCE',
        icon: '🛰️',
        headline: 'Field observation + spatial context',
        detail: isErosion
          ? 'Multi-year Sentinel-2 NDVI dropped by 14% concurrently with bare soil scour lines.'
          : isWater
          ? 'Normalized Difference Water Index (NDWI) signature dropped below expected retention baseline.'
          : 'Berm stabilization verified on multi-temporal passes with grass buffer bands.',
        tag: 'Multi-Temporal Sensing'
      },
      {
        stage: 'PRIORITY',
        icon: '⚠️',
        headline: isErosion ? 'High Priority — Requires review' : isWater ? 'Review — Potential foundation bypass' : 'Verify — Handover sign-off required',
        detail: isErosion
          ? 'Severe siltation hazard: risk of weir bypass and flank washout during heavy flash rains.'
          : isWater
          ? 'Potential piping or sub-surface leak near right masonry wing wall.'
          : 'Physical compliance check needed to approve contractor completion ledger.',
        tag: 'Deterministic Priority Matrix'
      },
      {
        stage: 'NEXT STEP',
        icon: '👤',
        headline: isErosion ? 'Field verification & desilting' : isWater ? 'Saline dye tracer test' : 'Field inspection with GeoLens',
        detail: isErosion
          ? 'Mobilize mechanical excavator for desilting; extend boulder apron by 2.5m.'
          : isWater
          ? 'Execute dye injection to verify whether water is leaking beneath foundation.'
          : 'Surveyor to capture geo-tagged berm photos and confirm vegetation cover.',
        tag: 'Actionable Governance'
      }
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn text-slate-100">
      <div className="bg-slate-950 border border-indigo-500/50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                SIGNATURE INNOVATION
              </span>
              <span className="text-xs font-mono text-sky-400 font-bold">
                DECISION STORY
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-white mt-1">
              {story.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              How JalDrishti connects field observation to executive watershed action
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Step Story Stepper */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1 text-xs">
          {story.steps.map((st, i) => (
            <div key={st.stage} className="relative">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lg shrink-0">
                  {st.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">
                      {st.stage}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                      {st.tag}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-white mt-0.5">
                    “{st.headline}”
                  </h4>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {st.detail}
                  </p>
                </div>
              </div>

              {i < story.steps.length - 1 && (
                <div className="flex justify-center -my-1.5 relative z-10">
                  <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onViewOnMap) onViewOnMap(item);
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
              if (onVerify) onVerify(item);
              onClose();
            }}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verify & Take Action</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
