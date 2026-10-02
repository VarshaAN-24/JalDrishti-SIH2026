import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Activity
} from 'lucide-react';

export default function InterventionsLedger({ 
  interventions, 
  onOpenEvidenceReplay, 
  onNavigateToMap,
  onOpenVerification,
  onOpenEvidenceChain
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const items = interventions || [];

  // Filter logic
  const filtered = items.filter(it => {
    const matchesSearch = 
      it.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.sub_watershed?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || it.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || it.verification_status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-navy-950 border border-slate-700/80 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              Water & Soil Works
            </div>
            <h1 className="text-2xl font-black text-white">
              Water & Soil Works
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Check dams, farm ponds, contour trenches, and soil conservation structures in the watershed. Trace condition, storage capacity, and before-and-after history.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-all ${viewMode === 'table' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, name, village, sub-watershed..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Structure Types ({items.length})</option>
            <option value="Check Dam">Check Dam</option>
            <option value="Farm Pond">Farm Pond</option>
            <option value="Percolation Tank">Percolation Tank</option>
            <option value="Continuous Contour Trenches (CCT)">Continuous Contour Trenches</option>
            <option value="Gabion Structure">Gabion Structure</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Under Review">Under Review</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Flagged">Flagged</option>
            <option value="Needs Reinspection">Needs Reinspection</option>
          </select>
        </div>
      </div>

      {/* Grid View with BEFORE -> INTERVENTION -> AFTER Cards */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const isConfirmed = item.verification_status === 'Confirmed';
            const isFlagged = item.verification_status === 'Flagged';
            const isReview = item.verification_status === 'Under Review' || item.verification_status === 'Pending Review';

            return (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 rounded-xl overflow-hidden shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header Stamp */}
                  <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          {item.id}
                        </span>
                        <span className="text-[11px] text-amber-300 font-mono font-semibold">
                          {item.sub_watershed}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1.5 line-clamp-1">
                        {item.name}
                      </h3>
                      <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {item.village} | Stream Order {item.stream_order}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                      isConfirmed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                      isFlagged ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' :
                      isReview ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                      'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    }`}>
                      {item.verification_status}
                    </span>
                  </div>

                  {/* Quantitative Specs */}
                  <div className="p-4 space-y-3.5 text-xs">
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-slate-500 block text-[10px]">SANCTION COST</span>
                        <span className="text-emerald-400 font-bold">₹{item.cost_lakhs} Lakhs</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">STORAGE CAP.</span>
                        <span className="text-sky-300 font-bold">{item.storage_capacity_m3?.toLocaleString()} m³</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">SANCTIONED</span>
                        <span className="text-slate-300">{item.sanction_date}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">COMPLETED</span>
                        <span className="text-slate-300">{item.completion_date}</span>
                      </div>
                    </div>

                    {/* Requirement 6: Traceability 5-Stage View */}
                    <div className="space-y-1.5 border border-slate-800 rounded-lg p-2.5 bg-slate-950/60">
                      <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400 flex items-center justify-between pb-1 border-b border-slate-800/80">
                        <span className="font-mono text-sky-400">TRACEABILITY VIEW</span>
                        <span className="text-[9px] font-mono text-slate-400">Monitoring Evidence</span>
                      </div>

                      {/* Stage 1: BEFORE EVIDENCE */}
                      <div className="p-1.5 rounded bg-rose-950/20 border border-rose-900/30">
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-rose-400">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            1. BEFORE EVIDENCE
                          </span>
                          <span className="text-[9px] text-slate-400">2019 BASELINE</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                          {item.before_condition || 'Baseline erosion and seasonal gully scouring prior to intervention.'}
                        </p>
                      </div>

                      <div className="flex justify-center text-slate-600 text-[10px] -my-1 font-mono">↓</div>

                      {/* Stage 2: INTERVENTION */}
                      <div className="p-1.5 rounded bg-indigo-950/20 border border-indigo-900/30">
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-indigo-400">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                            2. INTERVENTION
                          </span>
                          <span className="text-[9px] text-indigo-300">{item.completion_date?.split('-')[0] || '2021'}</span>
                        </div>
                        <p className="text-[11px] text-slate-200 mt-0.5 font-medium">
                          {item.type} ({item.name}) across Stream Order {item.stream_order}
                        </p>
                      </div>

                      <div className="flex justify-center text-slate-600 text-[10px] -my-1 font-mono">↓</div>

                      {/* Stage 3: AFTER OBSERVATION */}
                      <div className="p-1.5 rounded bg-emerald-950/20 border border-emerald-900/30">
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-emerald-400">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            3. AFTER OBSERVATION
                          </span>
                          <span className="text-[9px] text-emerald-300">OBSERVED CHANGE</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                          {item.after_condition || 'Observed vegetative recovery and local sediment retention downstream.'}
                        </p>
                      </div>

                      <div className="flex justify-center text-slate-600 text-[10px] -my-1 font-mono">↓</div>

                      {/* Stage 4: CURRENT STATUS */}
                      <div className="p-1.5 rounded bg-amber-950/20 border border-amber-900/30 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          <span>4. CURRENT STATUS:</span>
                        </div>
                        <span className="font-mono text-[10px] font-black text-amber-200">
                          {item.verification_status || 'MONITORED'}
                        </span>
                      </div>

                      <div className="flex justify-center text-slate-600 text-[10px] -my-1 font-mono">↓</div>

                      {/* Stage 5: FIELD VERIFICATION */}
                      <div className="p-1.5 rounded bg-teal-950/20 border border-teal-900/30 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-teal-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                          <span>5. FIELD VERIFICATION:</span>
                        </div>
                        <span className="font-mono text-[10px] text-teal-200">
                          {isConfirmed ? 'Officer Sign-Off Complete' : 'Ground Audit Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Monitoring Evidence Note (No causal overclaim) */}
                    <div className="p-2 rounded bg-sky-950/20 border border-sky-900/30">
                      <span className="text-[9px] text-sky-400 uppercase font-mono font-bold block mb-0.5 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-sky-400" />
                        MONITORING EVIDENCE (OBSERVED CHANGE):
                      </span>
                      <p className="text-[10.5px] text-slate-300 leading-normal">
                        {item.satellite_evidence || 'Sentinel-2 multispectral comparison indicates vegetative canopy response; ground truth audit tracks structural condition.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar with Evidence Chain & Replay */}
                <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (onNavigateToMap) onNavigateToMap(item);
                      }}
                      className="px-2.5 py-1.5 rounded text-xs text-sky-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 font-medium"
                      title="View on Hero Map"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Locate
                    </button>

                    {onOpenEvidenceChain && (
                      <button
                        onClick={() => onOpenEvidenceChain(item)}
                        className="px-2 py-1.5 rounded text-xs text-indigo-300 hover:text-white hover:bg-indigo-950/50 border border-indigo-500/30 transition-colors flex items-center gap-1 font-medium"
                        title="View Full 6-Tier Evidence Chain"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        Evidence Chain
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenEvidenceReplay(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    Evidence Replay
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto shadow-lg text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Structure Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Sub-Watershed</th>
                <th className="py-3 px-4">Cost (Lakhs)</th>
                <th className="py-3 px-4">Completion</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-sky-400">{item.id}</td>
                  <td className="py-3 px-4 font-semibold text-white">{item.name}</td>
                  <td className="py-3 px-4">{item.type}</td>
                  <td className="py-3 px-4 font-mono text-amber-300">{item.sub_watershed}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400">₹{item.cost_lakhs}</td>
                  <td className="py-3 px-4 font-mono">{item.completion_date}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-slate-950 border-slate-700">
                      {item.verification_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {onOpenEvidenceChain && (
                      <button
                        onClick={() => onOpenEvidenceChain(item)}
                        className="px-2 py-1 bg-indigo-900/40 hover:bg-indigo-800 text-indigo-300 rounded text-[11px] font-medium border border-indigo-500/40"
                      >
                        Chain
                      </button>
                    )}
                    <button
                      onClick={() => onOpenEvidenceReplay(item.id)}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-[11px] font-bold"
                    >
                      Replay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
