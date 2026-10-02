import React, { useState } from 'react';
import { 
  History, 
  TrendingUp, 
  Droplets, 
  Layers, 
  Calendar, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  ChevronRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Area, 
  AreaChart 
} from 'recharts';

export default function ChangeAnalysis() {
  const [activeSite, setActiveSite] = useState('cd01');
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100%

  // Sites data for comparison
  const comparisonSites = {
    cd01: {
      name: 'Check Dam CD-01 Basin (Upper Ridge - Zone 1A)',
      beforeYear: '2021 (Pre-Intervention)',
      afterYear: '2026 (Digital Twin State)',
      beforeImg: '/static/sample_photos/cd01_2021.jpg',
      afterImg: '/static/sample_photos/cd01_2026.jpg',
      beforeSummary: 'Degraded gully incision with 3.2m scour depth. Zero surface water retention; flash floods scoured adjacent agricultural fields.',
      afterSummary: 'Masonry structure impounded 4,500 m³ water. Significant vegetative expansion in downstream buffer, with recent silt accumulation requiring desilting.',
      metrics: {
        ndviDelta: '+0.21 (+100% gain)',
        soilMoisture: '+34% volumetric',
        waterRetentionDays: '135 days (vs 8 days baseline)',
        cropAreaHa: '+24 Hectares'
      },
      ndviTrend: [
        { year: '2021', ndvi: 0.21, waterSpreadHa: 0.2, rainfallMm: 680 },
        { year: '2022', ndvi: 0.24, waterSpreadHa: 0.8, rainfallMm: 710 },
        { year: '2023', ndvi: 0.35, waterSpreadHa: 2.1, rainfallMm: 740 },
        { year: '2024', ndvi: 0.42, waterSpreadHa: 3.4, rainfallMm: 820 },
        { year: '2025', ndvi: 0.40, waterSpreadHa: 3.1, rainfallMm: 690 },
        { year: '2026', ndvi: 0.42, waterSpreadHa: 3.2, rainfallMm: 760 },
      ]
    },
    fp02: {
      name: 'Community Farm Pond FP-08 (Zone 1B)',
      beforeYear: '2021 (Dryland Fallow)',
      afterYear: '2026 (Micro-Irrigated)',
      beforeImg: '/static/sample_photos/fp02_2021.jpg',
      afterImg: '/static/sample_photos/fp02_2026.jpg',
      beforeSummary: 'Single rainfed crop subject to mid-monsoon dry spell failure. High topsoil runoff into road ditch.',
      afterSummary: 'Polylined farm pond provides 2 life-saving supplemental irrigations for chickpea and groundnut.',
      metrics: {
        ndviDelta: '+0.36 (+140% gain)',
        soilMoisture: '+48% volumetric',
        waterRetentionDays: '210 days',
        cropAreaHa: '+15 Hectares'
      },
      ndviTrend: [
        { year: '2021', ndvi: 0.25, waterSpreadHa: 0.0, rainfallMm: 680 },
        { year: '2022', ndvi: 0.26, waterSpreadHa: 0.0, rainfallMm: 710 },
        { year: '2023', ndvi: 0.48, waterSpreadHa: 0.18, rainfallMm: 740 },
        { year: '2024', ndvi: 0.58, waterSpreadHa: 0.22, rainfallMm: 820 },
        { year: '2025', ndvi: 0.55, waterSpreadHa: 0.19, rainfallMm: 690 },
        { year: '2026', ndvi: 0.62, waterSpreadHa: 0.24, rainfallMm: 760 },
      ]
    },
    cct04: {
      name: 'Contour Trenches CCT-12 (Bhimtal Ridge - Zone 1D)',
      beforeYear: '2021 (Barren Ridge)',
      afterYear: '2026 (Vegetative Cover)',
      beforeImg: '/static/sample_photos/cct04_2021.jpg',
      afterImg: '/static/sample_photos/cct04_2026.jpg',
      beforeSummary: 'Denuded hill slopes with continuous sheet erosion and loss of fertile topsoil down into reservoir.',
      afterSummary: 'Continuous contour trenches and vetiver grass have arrested 95% of slope sediment.',
      metrics: {
        ndviDelta: '+0.28 (+155% gain)',
        soilMoisture: '+40% volumetric',
        waterRetentionDays: 'Perennial Soil Moisture',
        cropAreaHa: '+38 Hectares'
      },
      ndviTrend: [
        { year: '2021', ndvi: 0.18, waterSpreadHa: 0.1, rainfallMm: 680 },
        { year: '2022', ndvi: 0.22, waterSpreadHa: 0.3, rainfallMm: 710 },
        { year: '2023', ndvi: 0.36, waterSpreadHa: 0.6, rainfallMm: 740 },
        { year: '2024', ndvi: 0.46, waterSpreadHa: 0.8, rainfallMm: 820 },
        { year: '2025', ndvi: 0.44, waterSpreadHa: 0.7, rainfallMm: 690 },
        { year: '2026', ndvi: 0.48, waterSpreadHa: 0.9, rainfallMm: 760 },
      ]
    }
  };

  const current = comparisonSites[activeSite];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-navy-950 border border-slate-700/80 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <History className="w-3.5 h-3.5" />
              Before & After Comparison
            </div>
            <h1 className="text-2xl font-black text-white">
              Before & After
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              See how the area changed over time. Compare what the land looked like before and after water and soil works were built.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              DEMO DATA • SIMULATED DATA
            </span>
            {/* Site Selector Buttons */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveSite('cd01')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  activeSite === 'cd01' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Check Dam CD-01
              </button>
              <button
                onClick={() => setActiveSite('fp02')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  activeSite === 'fp02' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Farm Pond FP-08
              </button>
              <button
                onClick={() => setActiveSite('cct04')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  activeSite === 'cct04' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Contour Trenches CCT-12
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split-Screen Before / After Comparison */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        {/* Simple Direction Indicator: BEFORE ↓ AFTER (Requirement #9) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              {current.name}
            </h2>
            <span className="text-xs text-slate-400">
              Drag the slider below to see how this location transformed over time.
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
              BEFORE
            </span>
            <span className="text-slate-500 text-base">↓</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              AFTER
            </span>
          </div>
        </div>

        {/* Interactive Comparison Slider Container with Clip Path */}
        <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 select-none shadow-2xl">
          {/* Base "After" Image (Underneath) */}
          <img
            src={current.afterImg}
            alt="After Intervention"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Top "Before" Image (Clipped by slider position) */}
          <img
            src={current.beforeImg}
            alt="Before Intervention"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          />

          {/* Split Vertical Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_12px_rgba(255,255,255,0.9)]"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
              ↔
            </div>
          </div>

          {/* Floating HUD Labels */}
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded bg-slate-950/90 backdrop-blur-sm border border-slate-800 text-xs font-mono text-amber-300 font-bold">
            BEFORE (2021)
          </div>
          <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded bg-slate-950/90 backdrop-blur-sm border border-slate-800 text-xs font-mono text-emerald-300 font-bold">
            AFTER (2026)
          </div>
        </div>

        {/* Range Slider Scrubber Control */}
        <div className="space-y-1.5 px-2 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="text-amber-400 font-semibold">◀ Move to reveal BEFORE</span>
            <span className="text-slate-500">{sliderPosition}% Slider Position</span>
            <span className="text-emerald-400 font-semibold">Move to reveal AFTER ▶</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
        </div>

        {/* Simple Explanations (Requirement #9) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
              <span>🌱</span>
              <span>Vegetation increased</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Green vegetation and farm biomass grew significantly following water retention.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/40 space-y-1">
            <div className="flex items-center gap-2 text-sky-300 font-bold text-xs">
              <span>💧</span>
              <span>Water level changed</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Surface water storage increased and shallow groundwater aquifers recharged.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-1">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <span>⚠️</span>
              <span>Area needs further checking</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Desilting recommended before monsoon to maintain full water storage capacity.
            </p>
          </div>
        </div>

        {/* Plain Narrative Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 space-y-1">
            <span className="font-bold text-amber-400 uppercase tracking-wider block">
              Before Work was Done (2021):
            </span>
            <p className="text-slate-300 leading-relaxed">
              {current.beforeSummary}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-1">
            <span className="font-bold text-emerald-400 uppercase tracking-wider block">
              After Work was Completed (2026):
            </span>
            <p className="text-slate-300 leading-relaxed">
              {current.afterSummary}
            </p>
          </div>
        </div>

        {/* Quantitative Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">NDVI Photosynthetic Gain</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">{current.metrics.ndviDelta}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Soil Moisture Volume</span>
            <span className="text-base font-extrabold text-sky-400 font-mono">{current.metrics.soilMoisture}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Water Retention Duration</span>
            <span className="text-base font-extrabold text-teal-400 font-mono">{current.metrics.waterRetentionDays}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Rabi Crop Expansion</span>
            <span className="text-base font-extrabold text-amber-400 font-mono">{current.metrics.cropAreaHa}</span>
          </div>
        </div>
      </div>

      {/* Multi-Year Temporal Graphs (NDVI & Water Spread 2021-2026) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NDVI Trend Graph */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Multi-Year NDVI Vegetation Trajectory (2021 - 2026)
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              Sentinel-2 Band 8/4
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={current.ndviTrend}>
                <defs>
                  <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" domain={[0, 0.7]} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="ndvi" name="Mean NDVI Index" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#ndviGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            * Consistent post-monsoon NDVI rise demonstrates effective moisture retention and increased biomass.
          </p>
        </div>

        {/* Water Spread & Rainfall Correlation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-400" />
              Surface Water Persistence & Annual Rainfall
            </h3>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
              NDWI Water Spread (Ha)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={current.ndviTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="waterSpreadHa" name="Water Spread (Hectares)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            * Water persistence increased from 8 days post-monsoon to over 4.5 months following check dam & farm pond commissioning.
          </p>
        </div>
      </div>
    </div>
  );
}

function mapContainerWidth() {
  return typeof window !== 'undefined' ? Math.min(window.innerWidth - 64, 1100) : 800;
}
