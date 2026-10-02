import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  CheckCircle2, 
  ShieldAlert, 
  MapPin, 
  Camera, 
  Layers, 
  Compass, 
  FileCheck,
  Eye,
  RotateCcw
} from 'lucide-react';

/**
 * DemoStoryModal — 30-45 Second Guided Walkthrough for SIH Judges (Requirement 10)
 * Step 1: Field evidence found
 * Step 2: Location identified
 * Step 3: Spatial context loaded
 * Step 4: Potential issue identified
 * Step 5: Evidence explained
 * Step 6: Priority created
 * Step 7: Human verification
 */
export default function DemoStoryModal({ 
  isOpen, 
  onClose, 
  onViewOnMap, 
  onOpenWhy, 
  onConfirmVerification 
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      number: 1,
      tag: 'STEP 1 OF 7',
      title: 'Field evidence found',
      subtitle: 'A geo-tagged photo with camera compass azimuth is recorded in the field.',
      icon: Camera,
      iconColor: 'text-teal-400',
      badge: 'GeoLens EXIF Capture',
      content: {
        heading: 'Physical Field Observation Logged',
        details: 'Surveyor recorded visible soil erosion and sediment accumulation behind Check Dam CD-04.',
        meta: 'Photo ID: OBS-2026-001 • Date: 2026-08-14 • Device: Samsung Galaxy S23 (GeoCamera)',
        image: '/static/sample_photos/field_check_dam_silt.jpg',
        keyInsight: 'Physical ground proof anchors the digital twin to reality.'
      }
    },
    {
      number: 2,
      tag: 'STEP 2 OF 7',
      title: 'Location identified',
      subtitle: 'Exact coordinates mapped to Dharampura watershed boundary & cadastral plots.',
      icon: MapPin,
      iconColor: 'text-emerald-400',
      badge: 'GPS & Cadastral Mapping',
      content: {
        heading: '15.4038°N, 75.1049°E',
        details: 'Mapped inside Dharampura Upper Ridge Catchment (Zone 1A), altitude 612.4m.',
        meta: 'Survey Number: Plot 142/A • Micro-basin: Ridge-to-Valley Unit 1A',
        image: null,
        keyInsight: 'Automated reverse-geocoding pairs field photo to official watershed bounds.'
      }
    },
    {
      number: 3,
      tag: 'STEP 3 OF 7',
      title: 'Spatial context loaded',
      subtitle: 'Proximity to drainage streams, water bodies, and civil structures calculated.',
      icon: Compass,
      iconColor: 'text-sky-400',
      badge: 'CartoDEM & Hydrology',
      content: {
        heading: 'Multi-Layer Spatial Convergence',
        details: 'Within 180 m of Order-2 stream channel • Check Dam CD-04 within 45 m • Slope 8.5%.',
        meta: 'Stream Order: 2 • Runoff Coefficient: 0.48 • Gravelly Loam Soil',
        image: null,
        keyInsight: 'Spatial ripple exploration checks nearby water bodies and downstream impact.'
      }
    },
    {
      number: 4,
      tag: 'STEP 4 OF 7',
      title: 'Potential issue identified',
      subtitle: 'Multispectral analysis detects exposed soil and 68% weir storage loss.',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
      badge: 'Multi-Temporal Detection',
      content: {
        heading: '🔴 High Priority Flag Generated',
        details: '14% drop in vegetation canopy since 2021 baseline combined with runoff velocity scouring.',
        meta: 'Satellite: Sentinel-2 MSI 10m • NDVI Variance: -0.14 • Silt Depth: 1.1m',
        image: null,
        keyInsight: 'Convergence of satellite drop + physical silt proof triggers priority flag.'
      }
    },
    {
      number: 5,
      tag: 'STEP 5 OF 7',
      title: 'Evidence explained',
      subtitle: 'Clear, transparent explanation generated without black-box GIS jargon.',
      icon: Sparkles,
      iconColor: 'text-yellow-300',
      badge: 'The "WHY?" Feature',
      content: {
        heading: 'Why is this flagged?',
        details: '“Field observation is close to a drainage channel, and the surrounding slope shows increased exposed soil compared with the earlier baseline.”',
        meta: 'Evidence Strength: MEDIUM • Confidence: 89% (5 converged layers)',
        image: null,
        keyInsight: 'Answers WHAT, WHERE, WHY and WHAT NEXT in simple plain English.'
      }
    },
    {
      number: 6,
      tag: 'STEP 6 OF 7',
      title: 'Priority created & Decision Story',
      subtitle: 'Structured decision pipeline: Observation → Context → Evidence → Priority → Next Step.',
      icon: Layers,
      iconColor: 'text-indigo-400',
      badge: 'Signature Decision Story',
      content: {
        heading: 'Actionable Governance Record',
        details: 'Observation: Siltation → Context: Stream order 2 → Priority: High → Next Step: Desilting equipment dispatch.',
        meta: 'Action Sanction: Mechanical desilting & boulder apron extension by 2.5m',
        image: null,
        keyInsight: 'Transforms raw field data into an actionable government decision dossier.'
      }
    },
    {
      number: 7,
      tag: 'STEP 7 OF 7',
      title: 'Human verification',
      subtitle: 'AI flags the anomaly; a certified watershed engineer verifies and signs off.',
      icon: FileCheck,
      iconColor: 'text-emerald-400',
      badge: 'Human-in-the-Loop',
      content: {
        heading: 'Officer Verification & Sign-off',
        details: 'R. K. Sharma (AEE Watershed) reviews photographic proof and issues approval.',
        meta: 'Audit Trail: Immutable timestamped record with officer digital confirmation',
        image: null,
        keyInsight: 'Government-ready accountability—AI never makes unsupervised spending decisions.'
      }
    }
  ];

  if (!isOpen) return null;

  const current = steps[currentStep];
  const Icon = current.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn text-slate-100">
      <div className="bg-slate-950 border border-sky-500/50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        
        {/* Top Guided Tour Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm sm:text-base">
                  DEMO STORY MODE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
                  30-45 SEC TOUR
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Experience the JalDrishti innovation step-by-step
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 7-Step Progress Dots */}
        <div className="bg-slate-900/60 px-5 py-2.5 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1">
            {steps.map((st, i) => (
              <button
                key={st.number}
                type="button"
                onClick={() => setCurrentStep(i)}
                className={`flex-1 h-1.5 rounded-full transition-all cursor-pointer ${
                  i === currentStep
                    ? 'bg-sky-400 shadow-sm shadow-sky-400/50 ring-1 ring-sky-300'
                    : i < currentStep
                    ? 'bg-emerald-500'
                    : 'bg-slate-800'
                }`}
                title={`Go to Step ${st.number}: ${st.title}`}
              />
            ))}
          </div>
          <span className="text-[11px] font-mono text-sky-300 font-bold ml-2 shrink-0">
            {currentStep + 1} / {steps.length}
          </span>
        </div>

        {/* Step Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
              {current.tag} • {current.badge}
            </span>
            <span className="text-slate-400 text-[11px] font-mono">
              Step {current.number} of 7
            </span>
          </div>

          <div className="flex items-start gap-3.5">
            <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 ${current.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {current.title}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed font-normal">
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* Detailed Step Content Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="font-extrabold text-sm text-white flex items-center justify-between">
              <span>{current.content.heading}</span>
            </div>

            <p className="text-slate-200 text-xs leading-relaxed">
              {current.content.details}
            </p>

            {current.content.image && (
              <div className="rounded-lg overflow-hidden border border-slate-800 h-36 bg-slate-950 mt-2">
                <img
                  src={current.content.image}
                  alt={current.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 font-mono text-[11px] text-slate-400">
              {current.content.meta}
            </div>

            <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-500/30 text-sky-200 font-medium text-[11px] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
              <span>Key Innovation: {current.content.keyInsight}</span>
            </div>
          </div>
        </div>

        {/* Step Navigation Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-slate-400 hover:text-white font-semibold cursor-pointer"
          >
            SKIP TOUR
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>BACK</span>
              </button>
            )}

            {isLast ? (
              <button
                type="button"
                onClick={() => {
                  if (onConfirmVerification) onConfirmVerification('ZONE-1A');
                  onClose();
                }}
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRM & FINISH</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95"
              >
                <span>NEXT →</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
