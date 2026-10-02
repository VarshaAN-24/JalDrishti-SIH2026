import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Camera, 
  MapPin, 
  Compass, 
  ShieldAlert, 
  CheckCircle2, 
  Droplets, 
  Layers, 
  ListCheck, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Maximize2,
  Map
} from 'lucide-react';
import FieldEvidenceCaptureModal from './FieldEvidenceCaptureModal';

export default function FieldModeView({
  activeLocation,
  activeLocationMode = 'live_gps',
  onCaptureEvidence,
  onOpenCase,
  setActiveTab,
  onShowToast,
  layersData,
  currentUser = null
}) {
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('radar'); // 'radar', 'tasks', 'evidence'
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Field location coordinates
  const lat = activeLocation?.lat || 15.4038;
  const lng = activeLocation?.lng || 75.1049;
  const accuracy = activeLocation?.accuracy != null ? activeLocation.accuracy : 12;
  const isPoorAccuracy = accuracy > 1000;

  // Initialize Field Mode Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Satellite Imagery
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    ).addTo(map);

    // Add Live Location GPS Marker with Pulsing Accuracy Ring
    const liveIcon = L.divIcon({
      className: 'live-gps-marker',
      html: `<div style="background:#0ea5e9; width:22px; height:22px; border-radius:50%; border:3px solid white; box-shadow:0 0 16px #38bdf8; display:flex; align-items:center; justify-content:center; color:white; font-size:10px;">📍</div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    L.marker([lat, lng], { icon: liveIcon }).addTo(map);

    L.circle([lat, lng], {
      radius: Math.min(accuracy, 120),
      color: '#38bdf8',
      fillColor: '#38bdf8',
      fillOpacity: 0.2,
      weight: 1.5
    }).addTo(map);

    // Render Nearby Assets
    const nearbyLocations = [
      { name: 'Water Body PB-02', lat: lat - 0.0015, lng: lng + 0.0012, icon: '💧', color: '#0ea5e9', dist: '180 m' },
      { name: 'Check Dam CD-04', lat: lat + 0.0018, lng: lng - 0.0010, icon: '🛠️', color: '#10b981', dist: '240 m' },
      { name: 'Soil Erosion Area 1A', lat: lat + 0.0022, lng: lng + 0.0018, icon: '⚠️', color: '#f43f5e', dist: '320 m' }
    ];

    nearbyLocations.forEach(asset => {
      const icon = L.divIcon({
        className: 'asset-marker',
        html: `<div style="background:${asset.color}; color:white; padding:2px 6px; border-radius:12px; border:2px solid white; font-weight:bold; font-size:10px; display:flex; align-items:center; gap:2px; box-shadow:0 0 8px rgba(0,0,0,0.6);">${asset.icon} ${asset.dist}</div>`,
        iconSize: [60, 22],
        iconAnchor: [30, 11]
      });
      L.marker([asset.lat, asset.lng], { icon }).addTo(map);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [lat, lng]);

  const handleCenterGps = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 0.8 });
  };

  const handleEvidenceSaved = (ev) => {
    if (onShowToast) {
      onShowToast(`Field photo logged at ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E. Queued for verification.`);
    }
  };

  return (
    <div className="space-y-4 pb-16 animate-fadeIn font-sans select-none">
      
      {/* Top Field Mode Status Banner (Requirement 10) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-sky-950 border border-teal-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/50 font-black font-mono text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
              FIELD MODE ACTIVE
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold">
              {activeLocationMode === 'live_gps' ? '● LIVE GPS' : '● DEMO STUDY AREA'}
            </span>
            {currentUser && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                Scout: {currentUser.name}
              </span>
            )}
          </div>

          <div className="mt-2 space-y-0.5">
            <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider block">
              MY LOCATION
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-white font-mono font-bold text-sm">
                {lat.toFixed(5)}°N, {lng.toFixed(5)}°E
              </span>
              <span className={`font-mono text-xs font-bold ${isPoorAccuracy ? 'text-amber-400' : 'text-emerald-400'}`}>
                Accuracy: ±{accuracy} m
              </span>
            </div>
          </div>

          {isPoorAccuracy && (
            <p className="text-[11px] text-amber-300/90 mt-1 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Low GPS accuracy. Move outdoors or enable device location services for a better fix.</span>
            </p>
          )}

          {/* Requirement 12: Demo Mode Safety Notice */}
          {(Math.abs(lat - 15.365) > 0.4 || Math.abs(lng - 75.125) > 0.4) && (
            <div className="mt-2 p-2 rounded-xl bg-slate-950/90 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <span className="text-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Your current location is outside the prototype study area.</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCenterGps}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                >
                  USE LIVE LOCATION
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyToBounds([[15.320, 75.060], [15.420, 75.190]], { duration: 1.0 });
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] cursor-pointer"
                >
                  EXPLORE DEMO STUDY AREA
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleCenterGps}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-sky-300 hover:text-white border border-slate-750 hover:border-sky-500/40 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Compass className="w-4 h-4 text-sky-400" />
          <span>Center on GPS</span>
        </button>
      </div>

      {/* Main Action Button (Requirement 10) */}
      <button
        type="button"
        onClick={() => setIsCaptureModalOpen(true)}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-teal-950/60 border border-teal-400/50 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer font-mono"
      >
        <Camera className="w-5 h-5 text-yellow-300 fill-current" />
        <span>+ CAPTURE EVIDENCE</span>
      </button>

      {/* Field Operations Layout: Map + Nearby Assets Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Large Field Map Container (Requirement 9) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[380px] sm:min-h-[440px]">
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-extrabold text-white font-mono flex items-center gap-1.5">
              <span>FIELD WORKER SATELLITE RADAR</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              High-Precision Mobile Mode
            </span>
          </div>

          <div className="relative flex-1 bg-slate-950">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
          </div>

          <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>● Blue circle indicates GPS error radius (±{accuracy}m)</span>
            <span>Study Basin: Dharampura</span>
          </div>
        </div>

        {/* Right Panel: Nearby Assets & Actions (Requirement 9) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
          
          {/* Nearby Assets Card */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-black text-xs uppercase text-slate-200 font-mono flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-sky-400" />
                <span>NEARBY ASSETS RADAR</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Live Proximity
              </span>
            </div>

            {/* Proximity Items per Requirement 9 */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">💧</span>
                  <div>
                    <span className="font-bold text-white block">Water Body</span>
                    <span className="text-[10px] text-slate-400">Pond PB-02 Reservoir</span>
                  </div>
                </div>
                <span className="font-mono font-extrabold text-sky-400 text-sm">
                  180 m
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🛠️</span>
                  <div>
                    <span className="font-bold text-white block">Intervention</span>
                    <span className="text-[10px] text-slate-400">Check Dam CD-04 Weir</span>
                  </div>
                </div>
                <span className="font-mono font-extrabold text-emerald-400 text-sm">
                  240 m
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <div>
                    <span className="font-bold text-white block">Priority Area</span>
                    <span className="text-[10px] text-slate-400">Upper Ridge Soil Scour</span>
                  </div>
                </div>
                <span className="font-mono font-extrabold text-rose-400 text-sm">
                  320 m
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 12: NEARBY CASES */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-black text-xs uppercase text-slate-200 font-mono flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>NEARBY CASES</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                DEMO EVIDENCE
              </span>
            </div>

            {/* Check if outside demo area */}
            {(activeLocationMode === 'live_gps' && (Math.abs(lat - 15.365) > 0.4 || Math.abs(lng - 75.125) > 0.4)) ? (
              <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/40 text-xs font-mono space-y-2.5">
                <div className="flex items-center gap-2 text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium">No demo watershed cases are available at your current location.</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your live device GPS is active. Dharampura prototype cases are located in Gadag district.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (onSwitchToDemoMode) onSwitchToDemoMode();
                    else if (setActiveTab) setActiveTab('overview');
                  }}
                  className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold font-mono transition-all cursor-pointer shadow flex items-center justify-center gap-1.5"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Explore Demo Study Area</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-xs font-mono">
                {[
                  {
                    id: 'EVD-004',
                    title: 'SOIL EROSION',
                    subtitle: 'Check Dam CD-04',
                    status: 'PENDING VERIFICATION',
                    badge: '🔴 HIGH',
                    lat: 15.4038,
                    lng: 75.1049,
                    image_path: '/static/sample_photos/field_check_dam_silt.jpg'
                  },
                  {
                    id: 'EVD-005',
                    title: 'POND CONDITION',
                    subtitle: 'PB-02 Reservoir',
                    status: 'UNDER REVIEW',
                    badge: '🟠 REVIEW',
                    lat: 15.3478,
                    lng: 75.0882,
                    image_path: '/static/sample_photos/field_leaking_bund.jpg'
                  }
                ].map(caseItem => (
                  <div key={caseItem.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{caseItem.id} • {caseItem.title}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {caseItem.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{caseItem.subtitle}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenCase) onOpenCase(caseItem);
                          else if (setActiveTab) setActiveTab('overview');
                        }}
                        className="text-sky-400 hover:underline font-bold"
                      >
                        View Case →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Secondary Actions per Requirement 9: [See Nearby], [Existing Evidence], [My Tasks] */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl grid grid-cols-3 gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-sky-500/50 text-center font-bold transition-colors cursor-pointer"
            >
              See Nearby
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('geolens')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-teal-500/50 text-center font-bold transition-colors cursor-pointer"
            >
              Existing Evidence
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-amber-500/50 text-center font-bold transition-colors cursor-pointer"
            >
              My Tasks
            </button>
          </div>

        </div>

      </div>

      {/* Field Evidence Capture Workflow Modal */}
      <FieldEvidenceCaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onEvidenceSaved={handleEvidenceSaved}
        activeLocation={activeLocation}
        activeLocationMode={activeLocationMode}
      />

    </div>
  );
}
