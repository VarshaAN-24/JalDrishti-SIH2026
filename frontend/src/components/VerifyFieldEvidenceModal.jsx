import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  FileCheck, 
  Clock, 
  MapPin, 
  Sparkles,
  UserCheck
} from 'lucide-react';

/**
 * VerifyFieldEvidenceModal — Official SIH Verification Dialogue
 * Matches Section 6:
 * Header: VERIFY FIELD EVIDENCE
 * Case: EVD-004
 * Observation: Soil Erosion
 * Current Status: PENDING VERIFICATION
 * Question: What is the verification result?
 * Options: [CONFIRMED] [NEEDS REINSPECTION]
 * Optional note: Verification note...
 * Buttons: [Cancel] [Save Verification]
 */
export default function VerifyFieldEvidenceModal({
  isOpen,
  caseItem,
  onClose,
  onSaveVerification
}) {
  const [selectedResult, setSelectedResult] = useState('CONFIRMED'); // 'CONFIRMED' | 'NEEDS REINSPECTION'
  const [verificationNote, setVerificationNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (caseItem) {
      // Set sensible default note based on initial selection
      setSelectedResult('CONFIRMED');
      setVerificationNote('Field evidence confirmed. Silt deposition and embankment scour verified on ground. Treatment prioritized under WDC-PMKSY 2.0 guidelines.');
    }
  }, [caseItem, isOpen]);

  if (!isOpen || !caseItem) return null;

  const caseId = caseItem.caseNumber || caseItem.caseId || (caseItem.id ? `EVD-${caseItem.id.replace('ZONE-', '00')}` : 'EVD-004');
  const cleanCaseId = caseId.replace('CASE ', '');
  const observation = caseItem.observation || caseItem.title || 'Soil Erosion';
  const currentStatus = caseItem.status || caseItem.caseStatus || 'PENDING VERIFICATION';

  const handleSelectResult = (result) => {
    setSelectedResult(result);
    if (result === 'CONFIRMED') {
      setVerificationNote('Field evidence confirmed. Silt deposition and embankment scour verified on ground. Treatment prioritized under WDC-PMKSY 2.0 guidelines.');
    } else {
      setVerificationNote('Field condition inconclusive or secondary runoff scouring detected. Requires physical engineering reinspection with leveling staff.');
    }
  };

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSaveVerification({
        caseItem,
        result: selectedResult,
        note: verificationNote.trim()
      });
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn text-slate-100 font-sans select-none">
      <div className="bg-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scaleUp">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border-b border-slate-800 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>OFFICIAL VERIFICATION</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                DEMO MODE
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-white mt-1.5 font-mono">
              VERIFY FIELD EVIDENCE
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Case Information Summary */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">CASE:</span>
              <span className="font-mono font-black text-sky-400 text-xs">{cleanCaseId}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">OBSERVATION:</span>
              <span className="font-mono font-bold text-white text-xs">{observation}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">LOCATION:</span>
              <span className="font-mono text-slate-300 text-xs">{caseItem.subtitle || 'Check Dam CD-04'}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-850">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">CURRENT STATUS:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {currentStatus}
              </span>
            </div>
          </div>

          {/* Verification Question & Result Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 block font-mono">
              What is the verification result?
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Option 1: CONFIRMED */}
              <button
                type="button"
                onClick={() => handleSelectResult('CONFIRMED')}
                className={`p-3 rounded-xl border text-xs font-mono font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedResult === 'CONFIRMED'
                    ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`w-4 h-4 ${selectedResult === 'CONFIRMED' ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="text-sm font-black">CONFIRMED</span>
                </div>
                <span className="text-[10px] font-normal opacity-80">Ground truth verified</span>
              </button>

              {/* Option 2: NEEDS REINSPECTION */}
              <button
                type="button"
                onClick={() => handleSelectResult('NEEDS REINSPECTION')}
                className={`p-3 rounded-xl border text-xs font-mono font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedResult === 'NEEDS REINSPECTION'
                    ? 'bg-purple-600/30 border-purple-400 text-purple-200 ring-2 ring-purple-500/40 shadow-lg shadow-purple-950/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className={`w-4 h-4 ${selectedResult === 'NEEDS REINSPECTION' ? 'text-purple-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-black">NEEDS REINSPECTION</span>
                </div>
                <span className="text-[10px] font-normal opacity-80">Second survey needed</span>
              </button>
            </div>
          </div>

          {/* Optional Verification Note */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 font-mono">
                Optional note:
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Inspection Log</span>
            </div>
            
            <textarea
              rows={3}
              value={verificationNote}
              onChange={(e) => setVerificationNote(e.target.value)}
              placeholder="Verification note..."
              className="w-full bg-slate-900 border border-slate-750 focus:border-emerald-500 rounded-xl p-3 text-white text-xs outline-none transition-all placeholder:text-slate-500 font-sans"
            />
          </div>

          {/* Transparent Governance Note */}
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[10px] text-slate-400 font-mono flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Audited sign-off by Watershed Development Officer. Updates Attention Queue & Activity Log.</span>
          </div>

        </div>

        {/* Modal Footer Buttons: [Cancel] [Save Verification] */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs font-mono">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold transition-all cursor-pointer text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className={`py-2.5 px-4 rounded-xl font-black text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              selectedResult === 'CONFIRMED'
                ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-98 shadow-emerald-900/40'
                : 'bg-purple-600 hover:bg-purple-500 active:scale-98 shadow-purple-900/40'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Verification</span>
          </button>
        </div>

      </div>
    </div>
  );
}
