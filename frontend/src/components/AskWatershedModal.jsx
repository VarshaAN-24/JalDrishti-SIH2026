import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Search, 
  ArrowRight, 
  MapPin, 
  Filter, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Compass,
  CornerDownLeft
} from 'lucide-react';

export default function AskWatershedModal({ 
  isOpen, 
  onClose, 
  onApplyFilterToMap 
}) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [queryResult, setQueryResult] = useState(null);

  if (!isOpen) return null;

  // Predefined Intelligent Queries (Feature 10)
  const simpleQuestions = [
    { text: "Show high-priority erosion cases near water bodies.", icon: "⚠️", tag: "Erosion & Water" },
    { text: "Show pending verification cases.", icon: "📋", tag: "Pending Cases" },
    { text: "Show interventions requiring inspection.", icon: "🛠️", tag: "Inspection Needed" },
    { text: "Show areas with vegetation change.", icon: "🌱", tag: "Vegetation & Canopy" },
    { text: "Show field evidence near drainage.", icon: "〰️", tag: "Drainage Proximity" }
  ];

  const advancedQuestions = [
    "Show water bodies near me",
    "Show interventions with limited vegetation improvement",
    "Find areas near drainage without interventions",
    "Show all evidence around Check Dam CD-01"
  ];

  const handleRunQuery = async (queryText) => {
    const q = queryText || query;
    if (!q.trim()) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/ask-watershed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setQueryResult(data.result);
        // Automatically update the map as required by Requirement #15
        if (onApplyFilterToMap) {
          onApplyFilterToMap(data.result);
        }
      }
    } catch (err) {
      console.error('Ask the Watershed error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToMap = () => {
    if (queryResult && onApplyFilterToMap) {
      onApplyFilterToMap(queryResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Command Search Header */}
        <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                RULE-BASED SPATIAL QUERY
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                FAST GIS FILTER
              </span>
            </div>
            <h2 className="text-xl font-black text-white">
              Ask the Watershed
            </h2>
            <p className="text-xs text-slate-400">
              Query the watershed digital twin with rule-based geospatial filters to instantly highlight matching features on the map.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Command Search Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Main Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
              placeholder="Ask anything in simple English (e.g. Show areas with soil erosion)..."
              className="w-full bg-slate-900 border-2 border-slate-700 hover:border-sky-500/80 focus:border-sky-500 rounded-xl pl-11 pr-24 py-3 text-sm text-white placeholder-slate-500 focus:outline-none shadow-inner"
            />
            <button
              onClick={() => handleRunQuery()}
              disabled={isProcessing}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isProcessing ? 'Thinking...' : 'Search'}</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clickable Example Questions (Requirement #11) */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Try Clickable Questions:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {simpleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(q.text);
                    handleRunQuery(q.text);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/60 text-xs text-slate-200 hover:text-white transition-all text-left flex items-center justify-between group shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{q.icon}</span>
                    <span className="truncate group-hover:text-sky-300 font-medium">
                      "{q.text}"
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                </button>
              ))}
            </div>

            {/* Advanced queries dropdown for engineering review */}
            <details className="pt-1 text-[11px] text-slate-400 group">
              <summary className="cursor-pointer hover:text-slate-300 font-mono select-none flex items-center gap-1 text-[10px] uppercase">
                <span>Advanced Analytical Queries</span>
                <span className="text-slate-600">▾</span>
              </summary>
              <div className="space-y-1.5 pt-2">
                {advancedQuestions.map((advText, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(advText);
                      handleRunQuery(advText);
                    }}
                    className="w-full text-left p-2 rounded bg-slate-950/80 hover:bg-slate-900 border border-slate-850 text-slate-300 hover:text-white flex items-center justify-between"
                  >
                    <span className="truncate">“{advText}”</span>
                    <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  </button>
                ))}
              </div>
            </details>
          </div>

          {/* Query Result with Highlights & Concise Explanation (Requirement #5) */}
          {queryResult && (
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-mono text-sky-400 uppercase font-bold">
                  MATCHED INTENT: {queryResult.matched_intent}
                </span>

                <div className="flex items-center gap-1.5 font-mono text-[11px] text-teal-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span>
                    {queryResult.matched_interventions?.length || 0} Interventions • {queryResult.matched_observations?.length || 0} Observations
                  </span>
                </div>
              </div>

              {/* Concise Explanation of what was found (Requirement #5) */}
              <div className="p-3.5 bg-sky-950/25 border border-sky-900/40 rounded-xl text-slate-200 leading-relaxed font-medium">
                <span className="text-sky-400 font-bold block mb-1 text-[11px] uppercase tracking-wider">
                  Analytical Finding:
                </span>
                {queryResult.narrative}
              </div>

              {/* Highlighted Layers & Filter Criteria */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
                <span className="text-slate-500 uppercase">Target Map Layers:</span>
                {queryResult.highlight_layers?.map((layer, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-sky-300 border border-slate-800">
                    {layer}
                  </span>
                ))}
              </div>

              {/* Action Button: Apply to Map (Requirement #5) */}
              <button
                onClick={handleApplyToMap}
                className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Compass className="w-4 h-4" />
                <span>Apply Filter & Highlight Matching Areas on Hero Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
