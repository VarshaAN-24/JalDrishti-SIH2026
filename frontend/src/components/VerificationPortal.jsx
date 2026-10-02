import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  RotateCcw, 
  UserCheck, 
  MapPin, 
  FileText, 
  Sparkles,
  Send,
  History,
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

export default function VerificationPortal({ 
  observations, 
  onVerificationUpdated,
  onNavigateToMap,
  onOpenEvidenceChain,
  currentUser = null
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [newStatus, setNewStatus] = useState('Confirmed');
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [officerName, setOfficerName] = useState(() => 
    currentUser ? `${currentUser.name} (${currentUser.roleLabel})` : 'R. K. Sharma (AEE Watershed)'
  );
  const [officerId, setOfficerId] = useState(() => 
    currentUser?.id ? currentUser.id.toUpperCase() : 'OFFICER-102'
  );

  useEffect(() => {
    if (currentUser?.name) {
      setOfficerName(`${currentUser.name} (${currentUser.roleLabel})`);
      setOfficerId(currentUser.id.toUpperCase());
    }
  }, [currentUser]);
  const [evidenceUsed, setEvidenceUsed] = useState('Field Geotagged Photo + Sentinel-2 NDVI');
  const [reviewDate, setReviewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auditLog, setAuditLog] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFeedback, setActionFeedback] = useState(null);

  const handleQuickStatusAction = async (targetStatus) => {
    if (!selectedItem) return;
    setNewStatus(targetStatus);
    setIsSubmitting(true);
    try {
      const fullRemarks = `[Status: ${targetStatus}] [Date: ${reviewDate}] ${officerRemarks || 'Updated via Review & Confirm portal'}`;
      const res = await fetch('/api/verification/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'Observation',
          target_id: selectedItem.id,
          new_status: targetStatus,
          officer_id: officerId,
          officer_name: officerName,
          remarks: fullRemarks
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchAuditLog();
        if (onVerificationUpdated) {
          onVerificationUpdated(selectedItem.id, targetStatus, fullRemarks);
        }
        setSelectedItem(prev => ({
          ...prev,
          verification_status: targetStatus,
          officer_remarks: fullRemarks
        }));
        const statusLabel = 
          targetStatus === 'Confirmed' ? 'Confirmed' :
          targetStatus === 'Rejected' ? 'Rejected' :
          targetStatus === 'Needs Reinspection' ? 'Needs Recheck' : targetStatus;
        setActionFeedback(`Success: Observation marked as "${statusLabel}". Confirmation logged.`);
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load audit log on mount
  const fetchAuditLog = () => {
    fetch('/api/verification/audit-log')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setAuditLog(data.audit_log || []);
        }
      })
      .catch(err => console.error('Error fetching audit log:', err));
  };

  useEffect(() => {
    fetchAuditLog();
  }, []);

  const items = observations || [];

  // Filter items
  const filtered = items.filter(it => {
    const matchesSearch = 
      it.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.sub_watershed?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' || 
      it.verification_status === statusFilter ||
      (statusFilter === 'Pending Review' && (it.verification_status === 'Pending Review' || it.verification_status === 'Flagged'));

    return matchesSearch && matchesStatus;
  });

  // Select first item if none selected
  useEffect(() => {
    if (!selectedItem && filtered.length > 0) {
      setSelectedItem(filtered[0]);
      setNewStatus(filtered[0].verification_status === 'Flagged' ? 'Pending Review' : (filtered[0].verification_status || 'Under Review'));
      setOfficerRemarks(filtered[0].officer_remarks || '');
    }
  }, [filtered, selectedItem]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setNewStatus(item.verification_status === 'Flagged' ? 'Pending Review' : (item.verification_status || 'Under Review'));
    setOfficerRemarks(item.officer_remarks || '');
  };

  // Submit Status Change to Backend
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      const fullRemarks = `[Evidence: ${evidenceUsed}] [Date: ${reviewDate}] ${officerRemarks}`;
      const res = await fetch('/api/verification/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'Observation',
          target_id: selectedItem.id,
          new_status: newStatus,
          officer_id: officerId,
          officer_name: officerName,
          remarks: fullRemarks
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchAuditLog();
        if (onVerificationUpdated) {
          onVerificationUpdated(selectedItem.id, newStatus, fullRemarks);
        }
        setSelectedItem(prev => ({
          ...prev,
          verification_status: newStatus,
          officer_remarks: fullRemarks
        }));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-navy-950 border border-slate-700/80 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5" />
              Review & Confirm Portal
            </div>
            <h1 className="text-2xl font-black text-white">
              Review & Confirm
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Review photos taken in the field and confirm what was observed. Select an observation, check the details, and tap Confirm or Needs Recheck.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Audit Trail Active</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Verification Queue (Left) + Officer Review Workspace (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Queue List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                Photos to Review ({filtered.length})
              </h2>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending Review">🟡 Needs Review</option>
                <option value="Under Review">🔵 Under Review</option>
                <option value="Confirmed">🟢 Confirmed</option>
                <option value="Rejected">🔴 Rejected</option>
                <option value="Needs Reinspection">🔴 Needs Recheck</option>
              </select>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search photos by title or location..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filtered.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const isConfirmed = item.verification_status === 'Confirmed';
                const isPending = item.verification_status === 'Pending Review' || item.verification_status === 'Flagged';
                const isReview = item.verification_status === 'Under Review';
                const isRejected = item.verification_status === 'Rejected';

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-400 text-white shadow-md'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-700 bg-slate-900">
                      <img
                        src={item.image_path}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[10px] text-sky-400 font-bold">
                          {item.id}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          isConfirmed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                          isPending ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          isReview ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' :
                          isRejected ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                          'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        }`}>
                          {isConfirmed ? '🟢 Confirmed' :
                           isReview ? '🔵 Under Review' :
                           item.verification_status === 'Needs Reinspection' ? '🔴 Needs Recheck' :
                           isRejected ? '🔴 Rejected' : '🟡 Needs Review'}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white mt-1 truncate">
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.sub_watershed} • {item.observer}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Officer Review Workspace (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedItem ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider">
                    {selectedItem.id} • GROUND EVIDENCE VERIFICATION
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedItem.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenEvidenceChain && (
                    <button
                      onClick={() => onOpenEvidenceChain(selectedItem)}
                      className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 rounded text-xs flex items-center gap-1 font-medium transition-colors"
                      title="Inspect 6-Tier Evidence Chain"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      Evidence Chain
                    </button>
                  )}
                  <button
                    onClick={() => onNavigateToMap(selectedItem)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded text-xs flex items-center gap-1 font-medium transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" /> View on Map
                  </button>
                </div>
              </div>

              {/* Photo & Metadata Split */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-52 relative">
                  <img
                    src={selectedItem.image_path}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                    Captured: {selectedItem.capture_date}
                  </div>
                </div>

                <div className="sm:col-span-6 bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>COORDINATES:</span>
                    <span className="text-sky-300">{selectedItem.lat?.toFixed(5)}°N, {selectedItem.lng?.toFixed(5)}°E</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>DEVICE / APP:</span>
                    <span className="text-slate-200">{selectedItem.device}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>SUB-BASIN:</span>
                    <span className="text-amber-300">{selectedItem.sub_watershed}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>STREAM DISTANCE:</span>
                    <span className="text-teal-300">{selectedItem.distance_to_stream_m} m</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>SILTATION RISK:</span>
                    <span className="text-rose-400 font-bold">{selectedItem.siltation_risk}</span>
                  </div>
                </div>
              </div>

              {/* Preliminary AI Interpretation Note */}
              <div className="p-3 bg-sky-950/20 border border-sky-900/40 rounded-xl text-xs space-y-1">
                <span className="text-sky-400 font-bold uppercase tracking-wider block text-[10px]">
                  AI / Remote Sensing Preliminary Diagnostic:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {selectedItem.ai_interpretation}
                </p>
              </div>

              {/* Feedback Confirmation Banner (Requirement #10) */}
              {actionFeedback && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 font-semibold text-xs flex items-center gap-2 animate-fadeIn shadow-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{actionFeedback}</span>
                </div>
              )}

              {/* Simple Status Flow (Requirement #10) */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Status Flow:
                  </span>
                  <span className="text-[11px] font-bold text-slate-200">
                    Current: {
                      selectedItem.verification_status === 'Confirmed' ? '🟢 Confirmed' :
                      selectedItem.verification_status === 'Under Review' ? '🔵 Under Review' :
                      selectedItem.verification_status === 'Needs Reinspection' ? '🔴 Needs Recheck' :
                      selectedItem.verification_status === 'Rejected' ? '🔴 Rejected' :
                      '🟡 Needs Review'
                    }
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-semibold">
                  <div className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                    selectedItem.verification_status === 'Pending Review' || selectedItem.verification_status === 'Flagged'
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 ring-1 ring-amber-400/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}>
                    <span>🟡</span>
                    <span>Needs Review</span>
                  </div>

                  <div className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                    selectedItem.verification_status === 'Under Review'
                      ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 ring-1 ring-sky-400/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}>
                    <span>🔵</span>
                    <span>Under Review</span>
                  </div>

                  <div className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                    selectedItem.verification_status === 'Confirmed'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-400/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}>
                    <span>🟢</span>
                    <span>Confirmed</span>
                  </div>

                  <div className={`p-2 rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                    selectedItem.verification_status === 'Needs Reinspection' || selectedItem.verification_status === 'Rejected'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 ring-1 ring-rose-400/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}>
                    <span>🔴</span>
                    <span>Needs Recheck</span>
                  </div>
                </div>

                {/* Simple Action Buttons (Requirement #14) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleQuickStatusAction('Confirmed')}
                    disabled={isSubmitting}
                    className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Confirm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickStatusAction('Needs Reinspection')}
                    disabled={isSubmitting}
                    className="py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-white" />
                    <span>Needs Recheck</span>
                  </button>
                </div>
              </div>

              {/* Expandable Officer Audit Form */}
              <details className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs group">
                <summary className="cursor-pointer hover:text-white font-semibold select-none flex items-center justify-between text-slate-300">
                  <span>Additional Officer Remarks & Statutory Metadata</span>
                  <span className="text-[10px] text-sky-400 font-mono">Expand ▾</span>
                </summary>
                <form onSubmit={handleUpdateStatus} className="pt-3 space-y-3 border-t border-slate-800 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">
                        Authorizing Reviewer:
                      </label>
                      <input
                        type="text"
                        value={officerName}
                        onChange={(e) => setOfficerName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-sky-500 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1 font-semibold">
                        Review Date:
                      </label>
                      <input
                        type="date"
                        value={reviewDate}
                        onChange={(e) => setReviewDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-sky-500 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">
                      Field Notes & Remarks:
                    </label>
                    <textarea
                      rows={2}
                      value={officerRemarks}
                      onChange={(e) => setOfficerRemarks(e.target.value)}
                      placeholder="Add any specific field notes or recommendations..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-xs transition-all"
                  >
                    Save Remarks
                  </button>
                </form>
              </details>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
              Select an observation from the queue to start verification.
            </div>
          )}
        </div>
      </div>

      {/* Historical Audit Trail Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
          <History className="w-4 h-4 text-sky-400" />
          Statutory Verification Audit Trail (Immutable Log)
        </h3>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-2.5 px-3">Log ID</th>
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">Transition</th>
                <th className="py-2.5 px-3">Officer</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Remarks & Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {auditLog.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/50">
                  <td className="py-2.5 px-3 font-mono text-slate-500">#{log.id}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-sky-400">{log.target_id}</td>
                  <td className="py-2.5 px-3 font-mono">
                    <span className="text-slate-400">{log.previous_status}</span>
                    <span className="text-sky-400 mx-1">→</span>
                    <span className="text-emerald-400 font-bold">{log.new_status}</span>
                  </td>
                  <td className="py-2.5 px-3">{log.officer_name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{log.timestamp}</td>
                  <td className="py-2.5 px-3 italic text-slate-300 max-w-sm truncate">{log.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
