import React from 'react';
import { 
  MapPin, 
  Camera, 
  Map, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

/**
 * UserJourneyBar — Clear 6-Step Visual Journey Indicator for first-time field workers.
 * Highlights current step and allows 1-click navigation through the workflow.
 */
export default function UserJourneyBar({ activeTab, setActiveTab, activeLocationMode }) {
  const isDemo = activeLocationMode === 'demo';

  const steps = [
    {
      id: 'step1',
      tab: 'map',
      number: 1,
      label: isDemo ? '🗺️ Open Demo Study Area' : '📍 Find My Location',
      shortLabel: isDemo ? '1 Demo Area' : '1 Location',
      icon: MapPin,
      iconColor: isDemo ? 'text-amber-400' : 'text-emerald-400',
      isCurrent: activeTab === 'map' && activeLocationMode === 'live_gps'
    },
    {
      id: 'step2',
      tab: 'geolens',
      number: 2,
      label: isDemo ? '📷 Try Demo Field Photo' : '📷 Add Field Photo',
      shortLabel: '2 Photo',
      icon: Camera,
      iconColor: 'text-amber-400',
      isCurrent: activeTab === 'geolens'
    },
    {
      id: 'step3',
      tab: 'map',
      number: 3,
      label: isDemo ? '🗺️ Explore Demo Map' : '🗺️ See What is Nearby',
      shortLabel: isDemo ? '3 Demo Map' : '3 Nearby',
      icon: Map,
      iconColor: 'text-teal-400',
      isCurrent: activeTab === 'map' && activeLocationMode !== 'live_gps'
    },
    {
      id: 'step4',
      tab: 'change',
      number: 4,
      label: isDemo ? '🔎 Understand Demo Problem' : '🔎 Understand the Problem',
      shortLabel: '4 Problem',
      icon: Search,
      iconColor: 'text-indigo-400',
      isCurrent: activeTab === 'change' || activeTab === 'interventions'
    },
    {
      id: 'step5',
      tab: 'priority',
      number: 5,
      label: isDemo ? '⚠️ Check Demo Priority' : '⚠️ Check Priority',
      shortLabel: '5 Priority',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
      isCurrent: activeTab === 'priority'
    },
    {
      id: 'step6',
      tab: 'verification',
      number: 6,
      label: isDemo ? '✓ Review Demo Result' : '✓ Review & Confirm',
      shortLabel: '6 Review',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      isCurrent: activeTab === 'verification'
    }
  ];

  return (
    <div className="bg-slate-900/95 border-b border-slate-800/80 px-3 sm:px-6 py-2 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 font-mono">
          <Sparkles className="w-3 h-3 text-sky-400" />
          <span>Field Workflow:</span>
        </div>

        <nav aria-label="Field User Journey" className="flex items-center gap-1 sm:gap-2 min-w-full md:min-w-0 justify-between md:justify-start">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === steps.length - 1;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => setActiveTab(step.tab)}
                  className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    step.isCurrent
                      ? 'bg-sky-500/20 text-white border border-sky-400/60 shadow-md shadow-sky-500/10 ring-1 ring-sky-400/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                  title={`Go to Step ${step.number}: ${step.label}`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                    step.isCurrent
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {step.number}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${step.isCurrent ? step.iconColor : 'text-slate-400'}`} />
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </button>

                {!isLast && (
                  <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
