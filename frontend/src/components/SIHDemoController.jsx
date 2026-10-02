import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw,
  ShieldAlert,
  MapPin,
  Camera,
  Compass,
  FileCheck
} from 'lucide-react';

/**
 * SIHDemoController — Guided 60–90 Second SIH Walkthrough Runner
 * Strictly matches Requirement 13:
 * START DEMO
 * ↓
 * OPEN OPERATIONS CENTER
 * ↓
 * SHOW: 3 ITEMS NEED ATTENTION
 * ↓
 * CLICK: SOIL EROSION
 * ↓
 * SHOW: WHY IS THIS FLAGGED?
 * ↓
 * CLICK: MAP
 * ↓
 * SHOW: CONTEXT SNAPSHOT
 * ↓
 * CLICK: VIEW EVIDENCE
 * ↓
 * SHOW: FIELD EVIDENCE
 * ↓
 * CLICK: VERIFY
 * ↓
 * SELECT: CONFIRMED
 * ↓
 * UPDATE: CASE STATUS
 * ↓
 * SHOW: VERIFICATION COMPLETE
 */
export default function SIHDemoController({
  isOpen,
  currentStep,
  onStepChange,
  onClose,
  onTriggerAction
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSteps = [
    {
      step: 0,
      title: 'OPERATIONS CENTER',
      subtitle: 'Landing in the executive watershed operations center.',
      actionLabel: 'Focus Attention Queue',
      narration: 'JalDrishti monitors the watershed digital twin in real-time. Notice the Attention Queue on the right.',
      target: 'queue'
    },
    {
      step: 1,
      title: '3 ITEMS NEED ATTENTION',
      subtitle: 'Prioritized operational queue with 3 critical field cases.',
      actionLabel: 'Select EVD-004',
      narration: 'The system highlights 3 active cases requiring human attention, starting with EVD-004 Soil Erosion at Check Dam CD-04.',
      target: 'case_card'
    },
    {
      step: 2,
      title: 'SELECT EVD-004',
      subtitle: 'Opening Case File for EVD-004 (Soil Erosion).',
      actionLabel: 'Open Case Drawer',
      narration: 'Selecting EVD-004 slides open the official operational case file and ground proof.',
      target: 'drawer'
    },
    {
      step: 3,
      title: 'WHY?',
      subtitle: 'Explainable prioritization: Evidence Contributors & Plain-English Reason.',
      actionLabel: 'Review Why Panel',
      narration: 'JalDrishti explains WHY: Field evidence detected + Nearby drainage + Nearby intervention. Evidence Strength: HIGH.',
      target: 'why'
    },
    {
      step: 4,
      title: 'VIEW MAP',
      subtitle: 'Centering on Check Dam CD-04 with pulsing highlight & 250m exploration radius.',
      actionLabel: 'View On Map',
      narration: 'Navigating to the map centers on CD-04, highlights the selected marker with a pulse, and reveals nearby features.',
      target: 'map'
    },
    {
      step: 5,
      title: 'SPATIAL CONTEXT',
      subtitle: 'Context Snapshot: Water Body, Drainage, Intervention convergence.',
      actionLabel: 'Inspect Snapshot',
      narration: 'Context Snapshot connects Case EVD-004 to Pond PB-02 (220m), Drainage D-04 (180m), and Check Dam CD-04 (adjacent).',
      target: 'snapshot'
    },
    {
      step: 6,
      title: 'VIEW EVIDENCE',
      subtitle: 'Ground proof photograph & camera EXIF telemetry.',
      actionLabel: 'Open Field Evidence',
      narration: 'Reviewing the ground proof photo: 1.1m sediment depth and weir scouring with compass heading 142° SE.',
      target: 'evidence'
    },
    {
      step: 7,
      title: 'VERIFY',
      subtitle: 'Human-in-the-loop statutory verification dialogue.',
      actionLabel: 'Launch Verification',
      narration: 'The system flags the anomaly; a certified watershed engineer verifies and signs off under official norms.',
      target: 'verify_modal'
    },
    {
      step: 8,
      title: 'CONFIRMED',
      subtitle: 'Selecting CONFIRMED & saving officer inspection remarks.',
      actionLabel: 'Save Verification',
      narration: 'Officer confirms ground truth. Status shifts from PENDING VERIFICATION to CONFIRMED.',
      target: 'save_verify'
    },
    {
      step: 9,
      title: 'UPDATE: CASE STATUS',
      subtitle: 'Badge turns green, Attention Queue & Activity log updated.',
      actionLabel: 'Review Live Updates',
      narration: 'Attention Queue updates badge to green. Activity feed logs: "EVD-004 confirmed by field verification."',
      target: 'status_update'
    },
    {
      step: 10,
      title: 'VERIFICATION COMPLETE',
      subtitle: 'From Field Evidence to Watershed Action.',
      actionLabel: 'Finish Walkthrough',
      narration: 'WHERE? → MAP. WHAT? → EVIDENCE. WHY? → EXPLANATION. WHAT NEXT? → ACTION. IS IT TRUE? → HUMAN VERIFICATION.',
      target: 'complete'
    }
  ];

  // Auto-advance timer (6.5s per step, total ~65-75s)
  useEffect(() => {
    let timer = null;
    if (isPlaying && isOpen) {
      timer = setTimeout(() => {
        if (currentStep < demoSteps.length - 1) {
          handleGoToStep(currentStep + 1);
        } else {
          setIsPlaying(false);
        }
      }, 7000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, isOpen, currentStep]);

  if (!isOpen) return null;

  const current = demoSteps[currentStep] || demoSteps[0];
  const isFirst = currentStep === 0;
  const isLast = currentStep === demoSteps.length - 1;

  const handleGoToStep = (newStep) => {
    onStepChange(newStep);
    if (onTriggerAction) {
      onTriggerAction(demoSteps[newStep]);
    }
  };

  const handleNext = () => {
    if (!isLast) {
      handleGoToStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      handleGoToStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    handleGoToStep(0);
    setIsPlaying(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[460px] z-[1200] animate-slideInUp font-sans select-none">
      <div className="bg-slate-950/98 border border-sky-500/60 rounded-2xl shadow-2xl shadow-sky-950/80 backdrop-blur-md overflow-hidden flex flex-col text-slate-100">
        
        {/* Top Mini Header */}
        <div className="p-3 bg-gradient-to-r from-sky-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping"></span>
            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-sky-300">
              PRIMARY SIH DEMO SEQUENCE
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
              STEP {currentStep + 1} OF {demoSteps.length}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              title="Exit Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-900 h-1">
          <div 
            className="bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-2 text-xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-white font-mono flex items-center gap-1.5">
                <span>{current.title}</span>
              </h3>
              <p className="text-[11px] text-sky-300 font-medium mt-0.5">
                {current.subtitle}
              </p>
            </div>
            
            {isLast && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-extrabold text-[10px]">
                ✓ COMPLETE
              </span>
            )}
          </div>

          {/* Narration Box */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 italic leading-relaxed">
            "{current.narration}"
          </div>

          {/* Key Insight Tag */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
            <span className="flex items-center gap-1 text-teal-300">
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span>JalDrishti Operational Workflow</span>
            </span>
            <span>~60–90s demo</span>
          </div>
        </div>

        {/* Action & Navigation Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            {/* Auto Play / Pause Toggle */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-2.5 py-1.5 rounded-lg border font-bold flex items-center gap-1 transition-all cursor-pointer text-[11px] ${
                isPlaying 
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isPlaying ? 'Pause Auto-Play' : 'Auto-Play Walkthrough'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            {/* Restart */}
            <button
              type="button"
              onClick={handleRestart}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              title="Restart Tour"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isFirst}
              onClick={handlePrev}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed font-bold cursor-pointer text-[11px]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-1 cursor-pointer transition-colors shadow text-[11px]"
            >
              <span>{isLast ? 'Done' : 'Next Step'}</span>
              {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
