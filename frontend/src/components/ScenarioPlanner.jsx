import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  MapPin, 
  Droplets, 
  TrendingUp, 
  ShieldAlert, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  Compass,
  ArrowRight,
  Info,
  Layers,
  Activity
} from 'lucide-react';

export default function ScenarioPlanner({ 
  initialCoords, 
  onNavigateToMap 
}) {
  const [lat, setLat] = useState(initialCoords?.lat || 15.3720);
  const [lng, setLng] = useState(initialCoords?.lng || 75.1820);
  const [interventionType, setInterventionType] = useState('Check Dam');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [scenarioResult, setScenarioResult] = useState(null);

  // Preset location candidates for instant demo
  const presetLocations = [
    { label: 'East Foothills Ravine (Unchecked Runoff)', lat: 15.3720, lng: 75.1820, type: 'Check Dam' },
    { label: 'Upper Ridge Gully (Severe Scour)', lat: 15.4050, lng: 75.0920, type: 'Continuous Contour Trenches (CCT)' },
    { label: 'Dharampura Lowland Farmland', lat: 15.3900, lng: 75.1450, type: 'Farm Pond' },
    { label: 'Kalyana Stream Bend (High Recharge Potential)', lat: 15.3520, lng: 75.0910, type: 'Percolation Tank' }
  ];

  const handleSelectPreset = (p) => {
    setLat(p.lat);
    setLng(p.lng);
    setInterventionType(p.type);
    setScenarioResult(null);
  };

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/scenario/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: Number(lat),
          lng: Number(lng),
          intervention_type: interventionType
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setScenarioResult(data);
      }
    } catch (err) {
      console.error('Error running scenario evaluation:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-navy-950 border border-slate-700/80 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Try a Future Plan
            </div>
            <h1 className="text-2xl font-black text-white">
              Try a Future Plan
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Simulate proposed water and soil structures (check dams, farm ponds, contour trenches) at any location to see water storage benefits before building.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-400" />
            <span>PRE-FEASIBILITY AID ONLY</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters (Left) + Evaluated Model & Advisories (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 text-xs">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Compass className="w-4 h-4 text-teal-400" />
              1. Candidate Location & Structure
            </h2>

            {/* Presets */}
            <div>
              <span className="text-slate-400 font-semibold block mb-2">
                Quick Candidate Site Presets (Investigatory):
              </span>
              <div className="space-y-1.5">
                {presetLocations.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(p)}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all"
                  >
                    <div className="font-semibold text-white">{p.label}</div>
                    <div className="text-[11px] text-teal-400 font-mono mt-0.5">
                      Proposed: {p.type} • {p.lat}°N, {p.lng}°E
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Coordinates */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 font-mono">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold text-[10px]">LATITUDE (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-semibold text-[10px]">LONGITUDE (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>
            </div>

            {/* Structure Selector */}
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">
                Proposed Intervention Type:
              </label>
              <select
                value={interventionType}
                onChange={(e) => setInterventionType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold focus:outline-none focus:border-teal-500 text-xs"
              >
                <option value="Check Dam">Masonry Check Dam (Nala Bund)</option>
                <option value="Farm Pond">Excavated Farm Pond (Krishi Honda)</option>
                <option value="Percolation Tank">Percolation Tank / Infiltration Pond</option>
                <option value="Continuous Contour Trenches (CCT)">Continuous Contour Trenches (Ridge-to-Valley)</option>
              </select>
            </div>

            <button
              onClick={handleRunEvaluation}
              disabled={isEvaluating}
              className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Upstream Drainage & Feasibility...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Evaluate Potential Opportunity for Investigation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Hydrological Model & Statutory Advisories (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-400" />
                2. Hydrological Modeling & Feasibility Assessment
              </h2>

              {scenarioResult && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    PRELIMINARY SUITABILITY: {scenarioResult.hydrological_model?.suitability_score_pct}%
                  </span>
                  {onNavigateToMap && (
                    <button
                      onClick={() => onNavigateToMap({
                        id: 'SCENARIO-CANDIDATE',
                        name: `Candidate: ${interventionType}`,
                        lat: Number(lat),
                        lng: Number(lng),
                        type: 'scenario'
                      })}
                      className="px-2 py-0.5 bg-sky-950 hover:bg-sky-900 border border-sky-500/40 text-sky-300 rounded text-[11px] font-medium flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3 text-sky-400" />
                      Locate Candidate on Map
                    </button>
                  )}
                </div>
              )}
            </div>

            {!scenarioResult ? (
              <div className="p-12 text-center bg-slate-950/50 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-2">
                <SlidersHorizontal className="w-6 h-6 text-teal-400 mx-auto" />
                <p className="font-medium text-slate-300">
                  Select a candidate location or preset on the left, then click <b>"Evaluate Potential Opportunity"</b>.
                </p>
                <p className="text-[11px] text-slate-500">
                  Calculates modeled runoff retention, recharge radius, and engineering feasibility checklist to support DPR preparation.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn text-xs">
                {/* Quantitative Hydraulic Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">ESTIMATED STORAGE</span>
                    <span className="text-base font-extrabold text-sky-400">
                      {scenarioResult.hydrological_model?.estimated_storage_m3?.toLocaleString()} m³
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">ANNUAL CAPTURE</span>
                    <span className="text-base font-extrabold text-teal-400">
                      {scenarioResult.hydrological_model?.annual_runoff_capture_m3?.toLocaleString()} m³
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">RECHARGE RADIUS</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      {scenarioResult.hydrological_model?.recharge_radius_m} meters
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase block">COST BENCHMARK</span>
                    <span className="text-base font-extrabold text-amber-400">
                      ₹{scenarioResult.hydrological_model?.cost_estimate_lakhs} L
                    </span>
                  </div>
                </div>

                {/* Spatial Context & Evidence Breakdown */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                  <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800">
                    <Layers className="w-3.5 h-3.5" />
                    Spatial Evidence & Drainage Context:
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>TARGET SUB-WATERSHED:</span>
                    <span className="text-white font-bold">{scenarioResult.sub_watershed?.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>NEAREST STREAM REACH:</span>
                    <span className="text-sky-300">
                      {scenarioResult.nearest_stream?.name} (Order {scenarioResult.nearest_stream?.stream_order} at {scenarioResult.nearest_stream?.distance_m}m)
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>TOPOGRAPHIC SLOPE & RUNOFF:</span>
                    <span className="text-amber-300">
                      Slope {scenarioResult.hydrological_model?.slope_pct}% | Runoff Coeff C={scenarioResult.hydrological_model?.runoff_coefficient}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>SURROUNDING VEGETATION CONDITION:</span>
                    <span className="text-emerald-400">
                      Moderate canopy (NDVI 0.42) • Low ground cover in channel bed
                    </span>
                  </div>
                </div>

                {/* Engineering Considerations Checklist */}
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <span className="font-bold text-white uppercase tracking-wider block text-[11px]">
                    Candidate Site Pre-Feasibility Checklist (DPR Investigation):
                  </span>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    {scenarioResult.engineering_considerations?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mandatory Disclaimer Badge */}
                <div className="p-3.5 bg-amber-950/25 border border-amber-800/50 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{scenarioResult.disclaimer_badge || 'SCENARIO PLANNING ASSISTANCE — NOT A STATUTORY ENGINEERING SANCTION'}</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    {scenarioResult.regulatory_disclaimer || 'This counterfactual model is an analytical heuristic to identify candidate watershed opportunities. Official construction sanctions require site visits by Executive Engineers, geotechnical foundation boring, cadastral land ownership clearance, and Gram Sabha resolution.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
