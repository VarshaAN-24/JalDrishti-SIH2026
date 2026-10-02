import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  X, 
  ShieldCheck, 
  Satellite, 
  Database, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export default function DigitalTwinStatusModal({ 
  isOpen, 
  onClose 
}) {
  const [statusData, setStatusData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch('/api/digital-twin/status')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setStatusData(data);
        }
      })
      .catch(err => console.error('Error fetching digital twin status:', err))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const dataSources = statusData?.data_sources || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-ping"></span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                DIGITAL TWIN ● ACTIVE
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1">
              Geospatial Data Architecture & Digital Twin Provenance
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive transparency matrix detailing data sources, demonstration datasets, and official integration hooks.
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Official Integration Notice (MANDATORY REQUIREMENT) */}
          <div className="p-4 rounded-xl bg-amber-950/25 border border-amber-800/50 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Official Geospatial Data Integration Notice</span>
            </div>
            <p className="text-amber-200/90 leading-relaxed text-[11px]">
              This prototype currently operates on calibrated demonstration watershed datasets (Dharampura Micro-Watershed 4C2A5b). 
              The architecture is structured with plug-and-play OGC WMS/WFS and REST hooks for seamless live connection to 
              <b> ISRO Bhuvan</b> and <b>SRISHTI-DRISHTI</b> portals upon official API authorization.
            </p>
          </div>

          {/* Data Sources Grid */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              Connected Spatial Layers & Readiness State
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dataSources.map((ds, idx) => {
                const isAvailable = ds.status.includes('Available');
                const isPending = ds.status.includes('Pending');

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {ds.category}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                          isAvailable ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                          'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}>
                          {isAvailable ? 'AVAILABLE (DEMO)' : 'PENDING INTEGRATION'}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm mt-1">
                        {ds.name}
                      </h4>

                      <div className="text-[11px] text-slate-400 mt-1">
                        <b>Provenance:</b> {ds.type}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span>{ds.resolution}</span>
                      <span className="text-sky-400">{ds.update_freq}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Architecture Pillars */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] block">
              Digital Twin Verification Protocol:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <b className="text-sky-400 block mb-0.5">1. Remote Sensing Pass</b>
                <span>Periodic multi-temporal Sentinel-2 spectral indices (NDVI/NDWI) detect landscape vegetation and surface water changes.</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <b className="text-teal-400 block mb-0.5">2. Ground Truth Evidence</b>
                <span>GeoLens captures high-resolution photographs with EXIF GPS coordinates, linking micro-observations to stream networks.</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <b className="text-emerald-400 block mb-0.5">3. Human Sign-Off</b>
                <span>Officers review AI/GIS alerts and authenticate conditions through a 5-stage verification audit loop.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>* JalDrishti v2.6 Prototype • Dharampura Watershed Digital Twin</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
          >
            Close Status Hub
          </button>
        </div>
      </div>
    </div>
  );
}
