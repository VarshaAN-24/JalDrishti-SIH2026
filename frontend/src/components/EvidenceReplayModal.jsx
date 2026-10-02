import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  Maximize2
} from 'lucide-react';

export default function EvidenceReplayModal({ 
  interventionId, 
  onClose,
  onNavigateToMap
}) {
  const [data, setData] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const autoplayTimerRef = useRef(null);

  useEffect(() => {
    if (!interventionId) return;
    setIsLoading(true);
    fetch(`/api/interventions/${interventionId}/replay`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setData(res);
          setActiveStep(0);
        }
      })
      .catch(err => console.error('Error fetching replay data:', err))
      .finally(() => setIsLoading(false));
  }, [interventionId]);

  // Autoplay functionality for "Play Replay" (Requirement #4)
  useEffect(() => {
    if (isPlaying) {
      autoplayTimerRef.current = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= (data?.replay_stages?.length || 5) - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2400);
    } else {
      clearInterval(autoplayTimerRef.current);
    }

    return () => clearInterval(autoplayTimerRef.current);
  }, [isPlaying, data]);

  if (!interventionId) return null;

  const stages = data?.replay_stages || [];
  const currentStage = stages[activeStep] || {};
  const intervention = data?.intervention || {};

  const togglePlay = () => {
    if (activeStep >= stages.length - 1) {
      setActiveStep(0);
    }
    setIsPlaying(prev => !prev);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono">
                SIGNATURE FEATURE • EVIDENCE REPLAY
              </span>
              <span className="text-xs font-mono text-sky-400 font-bold">
                {intervention.id}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white mt-1">
              {intervention.name || 'Watershed Chronological Evidence Replay'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              5-Stage Timeline: 2019 Baseline $\rightarrow$ 2021 Intervention Planned $\rightarrow$ 2022 Intervention Recorded $\rightarrow$ 2024 Environmental Change $\rightarrow$ 2026 Current Field Evidence
            </p>
          </div>

          <button
            onClick={() => {
              setIsPlaying(false);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <Clock className="w-8 h-8 animate-spin mx-auto text-teal-400 mb-2" />
            <span>Loading historical timeline & satellite snapshots...</span>
          </div>
        ) : (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {/* Play Replay Action Bar (Requirement #4) */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                    isPlaying 
                      ? 'bg-amber-600 hover:bg-amber-500 text-white ring-4 ring-amber-500/20' 
                      : 'bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white ring-4 ring-teal-500/20'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-white" />
                      <span>Pause Replay</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Play Replay</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveStep(0);
                  }}
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
                  title="Reset to 2019 Baseline"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
                  {isPlaying ? '⚡ Autoplaying chronological progression...' : 'Click Play Replay to animate timeline'}
                </span>
              </div>

              <div className="font-mono text-sky-400 text-xs font-bold bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                STEP {activeStep + 1} OF {stages.length}
              </div>
            </div>

            {/* 5-Step Horizontal Timeline Scrubber (Requirement #4) */}
            <div className="relative">
              <div className="absolute top-1/2 -translate-y-1/2 left-8 right-8 h-0.5 bg-slate-800 z-0"></div>

              <div className="grid grid-cols-5 gap-2 relative z-10">
                {stages.map((stage, idx) => {
                  const isCurrent = idx === activeStep;
                  const isPast = idx < activeStep;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsPlaying(false);
                        setActiveStep(idx);
                      }}
                      className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                        isCurrent
                          ? 'bg-sky-500/20 border border-sky-400/50 scale-105 shadow-lg'
                          : 'hover:bg-slate-900 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCurrent ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40 ring-4 ring-sky-500/20' :
                        isPast ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className="font-mono text-xs font-bold text-white mt-2">
                        {stage.year}
                      </span>
                      <span className="text-[10px] text-slate-400 line-clamp-1 max-w-[80px]">
                        {stage.milestone}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Stage Display Card (Requirement #4: Date, Image, Observation, Source, Status) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
              {/* Image snapshot frame (7 Cols) */}
              <div className="md:col-span-7 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 relative h-64 sm:h-80 shadow-md">
                <img
                  src={currentStage.image}
                  alt={currentStage.title}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-mono text-teal-400 border border-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{currentStage.date} • {currentStage.milestone.toUpperCase()}</span>
                </div>
              </div>

              {/* Stage Narrative, Observation, Source, Status (5 Cols) */}
              <div className="md:col-span-5 flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
                      MILESTONE: {currentStage.milestone}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      STATUS: {currentStage.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {currentStage.title}
                  </h3>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">OBSERVATION:</span>
                    <p className="text-slate-200 leading-relaxed text-xs">
                      {currentStage.observation}
                    </p>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">SOURCE:</span>
                    <p className="text-slate-400 text-[11px] font-mono">
                      {currentStage.source}
                    </p>
                  </div>
                </div>

                {/* Scrubber Navigation Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveStep(prev => Math.max(0, prev - 1));
                    }}
                    disabled={activeStep === 0}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 disabled:opacity-40 flex items-center gap-1 font-medium transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <span className="text-xs text-slate-500 font-mono">
                    {activeStep + 1} / {stages.length}
                  </span>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveStep(prev => Math.min(stages.length - 1, prev + 1));
                    }}
                    disabled={activeStep === stages.length - 1}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs text-white disabled:opacity-40 flex items-center gap-1 font-bold transition-all"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>* Evidence Replay demonstrates chronological accountability for SIH evaluators.</span>
          <button
            onClick={() => {
              setIsPlaying(false);
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Close Replay
          </button>
        </div>
      </div>
    </div>
  );
}
