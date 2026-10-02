import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Upload, 
  Layers, 
  AlertCircle 
} from 'lucide-react';

export default function FieldEvidenceCaptureModal({ 
  isOpen, 
  onClose, 
  onEvidenceSaved,
  activeLocation,
  activeLocationMode
}) {
  const [step, setStep] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState('/static/sample_photos/field_check_dam_silt.jpg');
  const [isDemoPhoto, setIsDemoPhoto] = useState(true);
  const [locationCoords, setLocationCoords] = useState(
    activeLocation && activeLocation.lat 
      ? { lat: activeLocation.lat, lng: activeLocation.lng, accuracy: activeLocation.accuracy || 12 }
      : { lat: 15.4038, lng: 75.1049, accuracy: 14 }
  );
  const [selectedCategory, setSelectedCategory] = useState('Soil Erosion');
  const [remarks, setRemarks] = useState('Visible rill erosion and 1.1m sediment bed accumulation.');

  if (!isOpen) return null;

  const categories = [
    { id: 'Soil Erosion', label: 'Soil Erosion', icon: '🏞️' },
    { id: 'Water Body Condition', label: 'Water Body Condition', icon: '💧' },
    { id: 'Vegetation Condition', label: 'Vegetation Condition', icon: '🌿' },
    { id: 'Drainage Condition', label: 'Drainage Condition', icon: '〰' },
    { id: 'Intervention Condition', label: 'Intervention Condition', icon: '🛠️' },
    { id: 'Other', label: 'Other Observation', icon: '📌' }
  ];

  const handleUseDemoPhoto = (photoPath) => {
    setSelectedPhoto(photoPath);
    setIsDemoPhoto(true);
  };

  const handleSave = () => {
    const newEvidence = {
      id: `OBS-${Date.now().toString().slice(-4)}`,
      title: `${selectedCategory} Observation`,
      category: selectedCategory,
      latitude: locationCoords.lat,
      longitude: locationCoords.lng,
      lat: locationCoords.lat,
      lng: locationCoords.lng,
      accuracy: locationCoords.accuracy,
      remarks: remarks,
      image_path: selectedPhoto,
      isDemo: isDemoPhoto,
      status: 'Under Review',
      created_at: new Date().toLocaleTimeString()
    };

    if (onEvidenceSaved) {
      onEvidenceSaved(newEvidence);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans select-none">
      <div className="bg-slate-950 border border-slate-750 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm text-white font-mono flex items-center gap-2">
                <span>CAPTURE FIELD EVIDENCE</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  STEP {step} OF 4
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Synchronize on-site ground truth to the digital twin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="grid grid-cols-4 border-b border-slate-800 text-[10px] font-mono text-center">
          {[
            { num: 1, label: 'Photo' },
            { num: 2, label: 'Location' },
            { num: 3, label: 'Category' },
            { num: 4, label: 'Save' }
          ].map(s => (
            <div 
              key={s.num} 
              className={`py-2 border-r border-slate-800 last:border-r-0 ${
                step === s.num 
                  ? 'bg-teal-950/60 text-teal-300 font-bold border-b-2 border-b-teal-400' 
                  : step > s.num 
                  ? 'bg-slate-900 text-emerald-400 font-semibold' 
                  : 'bg-slate-950 text-slate-500'
              }`}
            >
              {s.num}. {s.label}
            </div>
          ))}
        </div>

        {/* Step Body */}
        <div className="p-5 space-y-4 flex-1 text-xs">
          
          {/* STEP 1: Capture / Upload Photo */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">STEP 1: Capture or Upload Photo</span>
                {isDemoPhoto && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                    DEMO EVIDENCE
                  </span>
                )}
              </div>

              <div className="h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative">
                <img
                  src={selectedPhoto}
                  alt="Selected Evidence"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-slate-950/85 backdrop-blur-sm text-[10px] font-mono text-slate-200 px-2 py-0.5 rounded border border-slate-800">
                  {isDemoPhoto ? 'Demo Photograph Loaded' : 'Device Camera Photo'}
                </span>
              </div>

              {/* Requirement 10: USE DEMO EVIDENCE button */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono text-slate-400 font-semibold block">
                  Select Demo Sample or Use Device Photo:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUseDemoPhoto('/static/sample_photos/field_check_dam_silt.jpg')}
                    className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 text-[11px] text-slate-300 font-medium text-center transition-colors cursor-pointer"
                  >
                    Check Dam Silt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseDemoPhoto('/static/sample_photos/field_leaking_bund.jpg')}
                    className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 text-[11px] text-slate-300 font-medium text-center transition-colors cursor-pointer"
                  >
                    Soil Erosion Rill
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseDemoPhoto('/static/sample_photos/field_cct_trenches.jpg')}
                    className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 text-[11px] text-slate-300 font-medium text-center transition-colors cursor-pointer"
                  >
                    Contour Trench
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Get Location */}
          {step === 2 && (
            <div className="space-y-3">
              <span className="font-bold text-slate-200 block">STEP 2: Coordinate & Spatial Geotag</span>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">LOCATION SOURCE:</span>
                  <span className="text-emerald-400 font-bold">
                    {activeLocationMode === 'live_gps' ? 'DEVICE GPS (LIVE)' : 'DEMO WATERSHED GPS'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-[10px] text-slate-400 block">LATITUDE</span>
                    <span className="text-sm font-bold text-white">{locationCoords.lat.toFixed(5)}°N</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850">
                    <span className="text-[10px] text-slate-400 block">LONGITUDE</span>
                    <span className="text-sm font-bold text-white">{locationCoords.lng.toFixed(5)}°E</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">ESTIMATED ACCURACY:</span>
                  <span className="text-sky-300 font-bold">±{locationCoords.accuracy} meters</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 text-[11px] text-sky-200">
                📍 Coordinates automatically pair with CartoDEM stream extraction & cadastral plot boundary.
              </div>
            </div>
          )}

          {/* STEP 3: Select Observation */}
          {step === 3 && (
            <div className="space-y-3">
              <span className="font-bold text-slate-200 block">STEP 3: Select Observation Category</span>

              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      selectedCategory === cat.id 
                        ? 'bg-teal-950/60 border-teal-400 text-teal-200 font-bold shadow' 
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-xs truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Save Evidence */}
          {step === 4 && (
            <div className="space-y-3">
              <span className="font-bold text-slate-200 block">STEP 4: Review Remarks & Confirm</span>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">CATEGORY:</span>
                  <span className="text-teal-300 font-bold">{selectedCategory}</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">COORDINATES:</span>
                  <span className="text-slate-200">{locationCoords.lat.toFixed(4)}°N, {locationCoords.lng.toFixed(4)}°E</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">DATA TYPE:</span>
                  <span className="text-amber-400 font-bold">{isDemoPhoto ? 'DEMO EVIDENCE' : 'LIVE GPS'}</span>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <label className="text-[11px] text-slate-400 block mb-1 font-mono">FIELD INSPECTOR REMARKS:</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={2}
                    className="w-full p-2 bg-slate-950 border border-slate-750 rounded-lg text-xs text-white outline-none focus:border-teal-500"
                    placeholder="Enter observation notes..."
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>SAVE EVIDENCE</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
