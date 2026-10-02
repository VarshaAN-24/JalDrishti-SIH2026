import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Compass,
  MapPin,
  Calendar,
  Layers
} from 'lucide-react';

export default function ReportsBriefing() {
  const [briefingData, setBriefingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/briefing')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setBriefingData(data);
        }
      })
      .catch(err => console.error('Error fetching briefing data:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (!briefingData) return;
    const blob = new Blob([JSON.stringify(briefingData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JalDrishti_Briefing_${briefingData.briefing_id}.json`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 text-sm">
        <FileText className="w-8 h-8 animate-spin mx-auto text-sky-400 mb-2" />
        <span>Compiling official watershed diagnostic report...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Action Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div>
          <span className="text-[10px] font-mono text-sky-400 uppercase font-bold tracking-wider">
            OFFICIAL BRIEFING DOCUMENT • {briefingData?.briefing_id}
          </span>
          <h2 className="text-base font-bold text-white mt-0.5">
            Watershed Diagnostic & Strategic Action Briefing
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas Document */}
      <div className="bg-slate-950 border border-slate-700 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-xs text-slate-300 print:text-black print:bg-white print:border-none">
        {/* Document Header & State Seals */}
        <div className="border-b border-slate-800 pb-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
            <span>GOVERNMENT OF INDIA • MINISTRY OF JAL SHAKTI</span>
            <span>DEPARTMENT OF LAND RESOURCES (DoLR)</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                JalDrishti Watershed Decision-Support Briefing
              </h1>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                Project Code: 4C2A5b • Micro-Watershed: Dharampura (Dharwad, Karnataka)
              </div>
            </div>

            <div className="text-right font-mono text-[11px] text-slate-400">
              <div><b>Generated:</b> {briefingData?.generated_at}</div>
              <div className="text-emerald-400">Digital Twin Verified</div>
            </div>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-2">
          <h3 className="font-bold text-white uppercase tracking-wider text-xs border-b border-slate-800 pb-1 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-sky-400" />
            1. Executive Watershed Diagnostic Summary
          </h3>
          <p className="text-slate-300 leading-relaxed p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 font-medium">
            {briefingData?.executive_summary}
          </p>
        </div>

        {/* 2. Priority Zones Treatment Matrix */}
        <div className="space-y-2">
          <h3 className="font-bold text-white uppercase tracking-wider text-xs border-b border-slate-800 pb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            2. Sub-Watershed Treatment Prioritization Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Sub-Basin</th>
                  <th className="py-2.5 px-3">Area (Ha)</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">NDVI Delta</th>
                  <th className="py-2.5 px-3">Siltation Risk</th>
                  <th className="py-2.5 px-3">Strategic Action Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {briefingData?.priority_matrix?.map((z) => (
                  <tr key={z.id}>
                    <td className="py-2.5 px-3 font-semibold text-white">{z.name}</td>
                    <td className="py-2.5 px-3 font-mono">{z.area_ha}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        z.priority === 'Critical' ? 'text-rose-400 bg-rose-500/10' :
                        z.priority === 'High' ? 'text-amber-400 bg-amber-500/10' : 'text-sky-400 bg-sky-500/10'
                      }`}>
                        {z.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">{z.ndvi_delta > 0 ? `+${z.ndvi_delta}` : z.ndvi_delta}</td>
                    <td className="py-2.5 px-3">{z.siltation_risk}</td>
                    <td className="py-2.5 px-3 italic text-slate-400">{z.why_summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Urgent Field Action Items (Flagged Records) */}
        <div className="space-y-2">
          <h3 className="font-bold text-white uppercase tracking-wider text-xs border-b border-slate-800 pb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            3. Field Verification & Immediate Engineering Actions
          </h3>
          <div className="space-y-2">
            {briefingData?.urgent_action_items?.map((item) => (
              <div key={item.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sky-400 font-bold">{item.id}</span>
                    <span className="text-white font-semibold">{item.title}</span>
                  </div>
                  <p className="text-slate-400 mt-1 text-[11px]">{item.ai_interpretation}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 shrink-0">
                  {item.verification_status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Statutory Sign-off Blocks */}
        <div className="pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-[11px]">
          <div className="p-3 rounded border border-slate-800 bg-slate-900/40 text-center">
            <span className="text-slate-500 block mb-3">ENGINEERING DIAGNOSTIC</span>
            <span className="font-bold text-sky-400">JalDrishti Digital Twin</span>
            <div className="text-[10px] text-slate-500 mt-1">Automated Spatial Verification</div>
          </div>

          <div className="p-3 rounded border border-slate-800 bg-slate-900/40 text-center">
            <span className="text-slate-500 block mb-3">FIELD VERIFICATION</span>
            <span className="font-bold text-slate-200">District WDT Team</span>
            <div className="text-[10px] text-slate-500 mt-1">Human Field Officer Sign-off</div>
          </div>

          <div className="p-3 rounded border border-slate-800 bg-slate-900/40 text-center">
            <span className="text-slate-500 block mb-3">SANCTIONING AUTHORITY</span>
            <span className="font-bold text-emerald-400">Superintending Engineer</span>
            <div className="text-[10px] text-slate-500 mt-1">PMKSY-WDC 2.0 / DoLR</div>
          </div>
        </div>
      </div>
    </div>
  );
}
