import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  TrendingDown, 
  TrendingUp, 
  Droplets, 
  Layers, 
  ChevronRight, 
  Sparkles,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function PriorityZonesView({ 
  zones, 
  onOpenWhyModal, 
  onNavigateToMap 
}) {
  const [filterPriority, setFilterPriority] = useState('ALL');

  const zoneList = zones || [];

  const filtered = zoneList.filter(z => {
    if (filterPriority === 'ALL') return true;
    return z.priority === filterPriority;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-navy-950 border border-slate-700/80 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-400/30 text-rose-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              Areas Needing Attention
            </div>
            <h1 className="text-2xl font-black text-white">
              Areas Needing Attention
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Areas flagged for field attention based on vegetation changes, nearby water streams, soil erosion risks, and ground photos.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Field Triage Diagnostics</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-xl border border-slate-800 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilterPriority('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            filterPriority === 'ALL' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Areas ({zoneList.length})
        </button>
        <button
          onClick={() => setFilterPriority('Critical')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            filterPriority === 'Critical' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Critical (2)
        </button>
        <button
          onClick={() => setFilterPriority('High')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            filterPriority === 'High' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          High (2)
        </button>
        <button
          onClick={() => setFilterPriority('Moderate')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            filterPriority === 'Moderate' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Moderate (1)
        </button>
        <button
          onClick={() => setFilterPriority('Stable')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            filterPriority === 'Stable' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Stable (1)
        </button>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((z) => {
          const isCritical = z.priority === 'Critical';
          const isHigh = z.priority === 'High';
          const isModerate = z.priority === 'Moderate';
          const isStable = z.priority === 'Stable';

          return (
            <div
              key={z.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between transition-all hover:-translate-y-1"
            >
              <div>
                {/* Card Top */}
                <div className="p-4 bg-slate-950/70 border-b border-slate-800/80 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-400">
                        {z.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isCritical ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' :
                        isHigh ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        isModerate ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {z.priority} Priority
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-1">
                      {z.name}
                    </h3>
                  </div>

                  {/* WHY Button (Highlight Feature #8) */}
                  <button
                    onClick={() => onOpenWhyModal(z.id)}
                    className="px-2.5 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1 transition-all active:scale-95 whitespace-nowrap"
                    title="Why is this area important?"
                  >
                    <span>Why?</span>
                  </button>
                </div>

                {/* Simple Reasons: Why this area is important (Requirement #8) */}
                <div className="p-4 space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800/80 pb-1">
                      Why this area was flagged:
                    </span>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <span>🌱</span>
                        <span>{z.ndvi_delta < 0 ? 'Vegetation has decreased' : 'Vegetation stable / recovering'}</span>
                        <span className={`ml-auto font-mono text-[10px] font-bold ${z.ndvi_delta < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {z.ndvi_delta > 0 ? `+${z.ndvi_delta}` : z.ndvi_delta}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💧</span>
                        <span>Water stream is nearby</span>
                        <span className="ml-auto font-mono text-[10px] text-sky-400">180m</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🏞️</span>
                        <span>Signs of soil erosion risk</span>
                        <span className="ml-auto font-mono text-[10px] text-amber-400">{z.slope}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📸</span>
                        <span>Field photos need review</span>
                        <span className="ml-auto font-mono text-[10px] text-teal-400">{z.field_obs_count || 1} photo(s)</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-[11px] italic">
                    "{z.why_summary}"
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">
                  {z.interventions_count} Interventions • {z.field_obs_count} Photos
                </span>
                <div className="flex items-center gap-2">
                  {onNavigateToMap && (
                    <button
                      onClick={() => onNavigateToMap(z)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 font-medium text-[11px]"
                      title="View on Hero Map"
                    >
                      <MapPin className="w-3 h-3 text-sky-400" />
                      Map
                    </button>
                  )}
                  <button
                    onClick={() => onOpenWhyModal(z.id)}
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-bold group"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
