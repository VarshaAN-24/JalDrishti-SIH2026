import React, { useState } from 'react';
import { 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  FileCheck, 
  ShieldAlert, 
  Camera, 
  UserCheck, 
  ArrowRight 
} from 'lucide-react';

/**
 * QuickVerifyModal — Human-in-the-Loop Verification Dialogue (Requirement 9)
 * Workflow: FLAGGED -> UNDER REVIEW -> CONFIRMED or NEEDS REINSPECTION
 * Buttons: [ CONFIRM ], [ NEEDS REINSPECTION ]
 */
export default function QuickVerifyModal({ 
  item, 
  isOpen, 
  onClose, 
  onStatusUpdated 
}) {
  const [officerNotes, setOfficerNotes] = useState('Ground condition inspected. Silt depth and structural integrity verified in accordance with WDC-PMKSY 2.0 norms.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleAction = async (status) => {
    setIsSubmitting(true);
    try {
      if (onStatusUpdated) {
        await onStatusUpdated(item.id, status, officerNotes);
      }
      onClose();
    } catch (err) {
      console.error('Error updating verification status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStatus = item.status || item.verification_status || 'Under Review';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn text-slate-100">
      <div className="bg-slate-950 border border-emerald-500/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">
                  HUMAN VERIFICATION
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  OFFICER SIGN-OFF
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official review & sign-off for {item.title || item.name || item.id}
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

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Lifecycle Stepper (Requirement 9) */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Verification Lifecycle:
            </span>

            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
              <div className="p-1.5 rounded bg-slate-950 text-slate-400 border border-slate-850">
                FLAGGED
              </div>
              <div className="p-1.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                UNDER REVIEW
              </div>
              <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                CONFIRMED
              </div>
              <div className="p-1.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                REINSPECT
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Feature:</span>
              <span className="font-bold text-white font-mono">{item.id || 'ZONE-1A'}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Current Status:</span>
              <span className="font-bold text-amber-400 font-mono">{currentStatus}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Reviewing Officer:</span>
              <span className="font-bold text-sky-300">R. K. Sharma (AEE Watershed)</span>
            </div>
          </div>

          {/* Officer Remarks Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 block">
              Officer Inspection Remarks:
            </label>
            <textarea
              rows={3}
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs outline-none focus:border-emerald-500 transition-all font-sans"
            />
          </div>
        </div>

        {/* Two Prominent Action Buttons per Requirement 9: [ CONFIRM ] and [ NEEDS REINSPECTION ] */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleAction('Confirmed')}
            className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>CONFIRM</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleAction('Needs Reinspection')}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-purple-300 hover:text-white border border-purple-500/40 font-bold rounded-xl shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>NEEDS REINSPECTION</span>
          </button>
        </div>

      </div>
    </div>
  );
}
