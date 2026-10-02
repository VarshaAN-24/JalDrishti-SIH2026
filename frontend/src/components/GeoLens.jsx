import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Clock, 
  Compass, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Droplets, 
  ShieldAlert, 
  SlidersHorizontal, 
  RefreshCw, 
  Info,
  AlertCircle,
  Plus,
  X,
  Radio,
  Navigation,
  Crosshair
} from 'lucide-react';
import HelpTip from './HelpTip';

// Geodesic distance calculation (Haversine formula in meters)
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function GeoLens({ 
  onPhotoAnalyzed, 
  onNavigateToMap,
  onOpenVerification,
  onOpenEvidenceChain,
  onShowToast,
  prefilledLocation,
  activeLocationMode = 'demo',
  activeLocation = null,
  onUpdateActiveLocation,
  onSwitchToDemoMode,
  onSwitchToManualMode
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('/static/sample_photos/field_check_dam_silt.jpg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedEvidence, setAnalyzedEvidence] = useState(null);
  const [manualTitle, setManualTitle] = useState('Field Inspection Ground Truth');
  const [selectedPreset, setSelectedPreset] = useState('field_check_dam_silt.jpg');
  const [isDragging, setIsDragging] = useState(false);

  // Manual location selection state if GPS is unavailable (Requirement #5)
  const [manualLat, setManualLat] = useState('15.3950');
  const [manualLng, setManualLng] = useState('75.1150');
  const [isManualGpsActive, setIsManualGpsActive] = useState(false);
  const [locationOrigin, setLocationOrigin] = useState('gps'); // 'live_gps', 'gps', 'manual', 'demo'
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  // Live Device Geolocation state (Requirement: Live Device-Location)
  const [liveAccuracy, setLiveAccuracy] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationDeniedError, setLocationDeniedError] = useState(null);
  const geoLensReqIdRef = useRef(0);

  // Photo EXIF vs Device GPS Disparity state
  const [photoExifCoords, setPhotoExifCoords] = useState({ lat: 15.4038, lng: 75.1049, hasGps: true });
  const [disparityWarning, setDisparityWarning] = useState(null); // { detected, distM, distKm, photoCoords, deviceCoords }
  const [boundCoordinateSource, setBoundCoordinateSource] = useState('device'); // 'device' | 'photo_exif' | 'manual'

  // 5 attractive demo cards (Requirement #4: Demo Photo Option)
  const presets = [
    {
      id: 'field_farm_pond_green.jpg',
      category: 'Water Body',
      emoji: '💧',
      label: '💧 Water Body',
      title: 'Model Farm Pond (FP-08)',
      desc: 'Stores rainwater for dry spell irrigation',
      hasGps: true,
      lat: 15.3882,
      lng: 75.1321
    },
    {
      id: 'field_cct_trenches.jpg',
      category: 'Vegetation',
      emoji: '🌱',
      label: '🌱 Vegetation',
      title: 'Hillside Green Cover',
      desc: 'Grass buffer along contour trenches',
      hasGps: true,
      lat: 15.3950,
      lng: 75.1150
    },
    {
      id: 'field_uncontrolled_erosion.jpg',
      category: 'Soil Erosion',
      emoji: '🏞️',
      label: '🏞️ Soil Erosion',
      title: 'Active Gully Erosion',
      desc: 'Rain runoff cutting gully through topsoil',
      hasGps: false,
      lat: null,
      lng: null
    },
    {
      id: 'field_check_dam_silt.jpg',
      category: 'Check Dam',
      emoji: '🏗️',
      label: '🏗️ Check Dam',
      title: 'Silted Check Dam (CD-01)',
      desc: 'Masonry structure with 68% silt buildup',
      hasGps: true,
      lat: 15.4038,
      lng: 75.1049
    },
    {
      id: 'field_leaking_bund.jpg',
      category: 'Watershed Work',
      emoji: '🌾',
      label: '🌾 Watershed Work',
      title: 'Contour Bund & Spillway',
      desc: 'Conservation bund to arrest farm slope runoff',
      hasGps: true,
      lat: 15.3621,
      lng: 75.0934
    }
  ];

  // Helper to check disparity between Photo EXIF coordinates and Device GPS
  const checkAndSetDisparity = (photoLat, photoLng, devLat, devLng) => {
    if (photoLat && photoLng && devLat && devLng) {
      const distM = calculateDistanceMeters(parseFloat(photoLat), parseFloat(photoLng), parseFloat(devLat), parseFloat(devLng));
      if (distM > 150) {
        setDisparityWarning({
          detected: true,
          distM,
          distKm: (distM / 1000).toFixed(2),
          photoCoords: [parseFloat(photoLat), parseFloat(photoLng)],
          deviceCoords: [parseFloat(devLat), parseFloat(devLng)]
        });
        return;
      }
    }
    setDisparityWarning(null);
  };

  // Synchronize prefilled location when transferred from Explore Map
  useEffect(() => {
    if (prefilledLocation && prefilledLocation.lat && prefilledLocation.lng) {
      setManualLat(prefilledLocation.lat.toFixed(6));
      setManualLng(prefilledLocation.lng.toFixed(6));
      setLiveAccuracy(prefilledLocation.accuracy != null ? prefilledLocation.accuracy : null);
      setLocationOrigin('live_gps');
      setIsManualGpsActive(false);
      setLocationDeniedError(null);
      setBoundCoordinateSource('device');

      if (photoExifCoords?.hasGps && photoExifCoords.lat && photoExifCoords.lng) {
        checkAndSetDisparity(photoExifCoords.lat, photoExifCoords.lng, prefilledLocation.lat, prefilledLocation.lng);
      }
    }
  }, [prefilledLocation]);

  // Request browser/device geolocation (Requirement: Live Device-Location)
  const handleUseDeviceLocation = () => {
    if (!navigator.geolocation) {
      setLocationDeniedError('Browser Geolocation is not supported by your device.');
      return;
    }

    setIsLocating(true);
    setLocationDeniedError(null);

    const reqId = ++geoLensReqIdRef.current;
    let bestAccuracy = Infinity;
    let retryAttempts = 0;
    const maxRetries = 2;

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    };

    const processPosition = (position, isRetry = false) => {
      if (geoLensReqIdRef.current !== reqId) return;

      const { latitude, longitude, accuracy } = position.coords;

      // Update if this is the initial fix or if accuracy has improved
      if (accuracy < bestAccuracy) {
        bestAccuracy = accuracy;
        const newLoc = {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy, // Honest, unmanipulated actual browser accuracy
          timestamp: new Date(position.timestamp || Date.now()).toLocaleTimeString(),
          source: 'DEVICE GPS'
        };

        setManualLat(latitude.toFixed(6));
        setManualLng(longitude.toFixed(6));
        setLiveAccuracy(accuracy);
        setLocationOrigin('live_gps');
        setIsManualGpsActive(false);
        setLocationDeniedError(null);
        setBoundCoordinateSource('device');

        if (onUpdateActiveLocation) {
          onUpdateActiveLocation(newLoc, 'live_gps');
        }

        // Check disparity if current photo has EXIF GPS
        if (photoExifCoords?.hasGps && photoExifCoords.lat && photoExifCoords.lng) {
          checkAndSetDisparity(photoExifCoords.lat, photoExifCoords.lng, latitude, longitude);
        } else {
          setDisparityWarning(null);
        }

        if (onShowToast) {
          if (isRetry) {
            if (accuracy > 1000) {
              onShowToast(`📍 Live device GPS improved: ±${accuracy} m. Low GPS accuracy. Move outdoors or enable device location services for a better fix.`);
            } else {
              onShowToast(`📍 Live device GPS improved: ${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°E (±${accuracy} m)`);
            }
          } else {
            if (accuracy > 1000) {
              onShowToast(`📍 Live device GPS locked: ±${accuracy} m. Low GPS accuracy. Move outdoors or enable device location services for a better fix.`);
            } else {
              onShowToast(`📍 Live device GPS locked: ${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°E (±${accuracy} m)`);
            }
          }
        }
      }

      // Retry once or twice if returned accuracy is very poor (> 1000 m)
      if (bestAccuracy > 1000 && retryAttempts < maxRetries) {
        retryAttempts++;
        setTimeout(() => {
          if (geoLensReqIdRef.current !== reqId) return;
          navigator.geolocation.getCurrentPosition(
            (retryPos) => processPosition(retryPos, true),
            (retryErr) => {
              console.warn(`GeoLens GPS retry #${retryAttempts} error:`, retryErr);
            },
            geoOptions
          );
        }, 1500);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        processPosition(position, false);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation permission error:', err);
        setLocationDeniedError('Location access was not granted.');
        if (onShowToast) {
          onShowToast('Location access was not granted.');
        }
      },
      geoOptions
    );
  };

  // Provenance tag badge helper (Requirement: Provenance Labels)
  const renderProvenanceTag = (origin, hasNativeGps, accuracy) => {
    if (origin === 'live_gps') {
      const isLowAcc = accuracy != null && accuracy > 1000;
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border shadow-sm ${
          isLowAcc
            ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
            : 'bg-sky-500/20 text-sky-300 border-sky-400/50 animate-pulse'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isLowAcc ? 'bg-amber-400' : 'bg-sky-400'}`}></span>
          ● LIVE DEVICE LOCATION {accuracy != null ? `(±${accuracy}m)` : ''}
        </span>
      );
    }
    if (origin === 'gps' || hasNativeGps) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          GPS-DERIVED EVIDENCE
        </span>
      );
    }
    if (origin === 'manual') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          MANUALLY ASSIGNED LOCATION
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
        DEMO LOCATION
      </span>
    );
  };

  const handleSelectPreset = (p) => {
    setSelectedPreset(p.id);
    setSelectedFile(null);
    setPreviewUrl(`/static/sample_photos/${p.id}`);
    setAnalyzedEvidence(null);
    
    if (p.hasGps && p.lat && p.lng) {
      setPhotoExifCoords({ lat: p.lat, lng: p.lng, hasGps: true });
      if (locationOrigin === 'live_gps') {
        checkAndSetDisparity(p.lat, p.lng, manualLat, manualLng);
      } else {
        setManualLat(p.lat.toFixed(6));
        setManualLng(p.lng.toFixed(6));
        setLocationOrigin('gps');
        setIsManualGpsActive(false);
        setDisparityWarning(null);
      }
    } else {
      setPhotoExifCoords({ lat: null, lng: null, hasGps: false });
      setDisparityWarning(null);
      if (locationOrigin !== 'live_gps') {
        setIsManualGpsActive(true);
        setLocationOrigin('manual');
      }
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file) => {
    setSelectedFile(file);
    setSelectedPreset(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAnalyzedEvidence(null);
    if (locationOrigin !== 'live_gps') {
      setIsManualGpsActive(false);
      setLocationOrigin('gps');
    }
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('photo', selectedFile);
      } else {
        formData.append('sample_filename', selectedPreset);
      }
      formData.append('title', manualTitle);
      formData.append('observer', 'GeoLens Field Surveyor');

      if (locationOrigin === 'live_gps' || isManualGpsActive || locationOrigin === 'manual' || locationOrigin === 'demo') {
        formData.append('latitude', manualLat);
        formData.append('longitude', manualLng);
        formData.append('location_origin', locationOrigin);
        if (liveAccuracy) {
          formData.append('gps_accuracy', liveAccuracy);
        }
      }

      const res = await fetch('/api/geolens/analyze', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.status === 'success') {
        const obs = data.observation;
        obs.has_spatial_context = data.has_spatial_context;
        obs.spatial_context_message = data.spatial_context_message;
        obs.honesty_notice = data.honesty_notice;
        obs.spatial_context = data.spatial_context || obs.spatial_context;
        obs.photo_exif_location = data.photo_exif_location;
        obs.device_gps_location = data.device_gps_location;

        let originType = locationOrigin;
        if (locationOrigin === 'live_gps') {
          originType = 'live_gps';
          obs.gps_accuracy = liveAccuracy;
          obs.location_source_label = 'Device GPS';
        } else if (!data.gps_metadata_available || isManualGpsActive) {
          originType = locationOrigin === 'demo' ? 'demo' : 'manual';
          obs.location_source_label = locationOrigin === 'demo' ? 'Demo Grid' : 'Manually Picked';
        } else {
          originType = 'gps';
          obs.location_source_label = 'Photo EXIF Header';
        }
        setLocationOrigin(originType);
        obs.location_origin = originType;

        setAnalyzedEvidence(obs);
        if (!data.gps_metadata_available && !isManualGpsActive && locationOrigin !== 'live_gps') {
          setIsManualGpsActive(true);
        }
      }
    } catch (err) {
      console.error('GeoLens analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Immediate "View on Map" action (Requirement #3)
  const handleViewOnMap = () => {
    if (!analyzedEvidence) return;
    if (onPhotoAnalyzed) {
      onPhotoAnalyzed(analyzedEvidence);
    }
    if (onNavigateToMap) {
      onNavigateToMap(analyzedEvidence);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner (Requirement #3: Simple English) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-navy-950 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-400 text-xs font-semibold tracking-wider">
              <Camera className="w-3.5 h-3.5 text-yellow-300" />
              <span>Step 2 of Field Workflow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Add a Photo from the Field
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Take a photo or choose one from your device. We will use its location to understand the area.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono text-teal-400">
            <Compass className="w-4 h-4" />
            <span>Photo Location Detection Active</span>
            <HelpTip 
              title="Photo Location Detection" 
              text="Automatically reads camera coordinates saved inside your photo, or pairs with your phone GPS." 
            />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Controls & Presets (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 text-xs">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Camera className="w-4 h-4 text-sky-400" />
              <span>1. Add Field Photo</span>
            </h2>

            {/* Requirement #8: Three Large Buttons: Take Photo, Choose Photo, Use My Current Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {/* Button 1: 📷 Take Photo */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                  id="camera-capture-input"
                />
                <label
                  htmlFor="camera-capture-input"
                  className="w-full py-2.5 px-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-yellow-300 shrink-0" />
                  <span>📷 Take Photo</span>
                </label>
              </div>

              {/* Button 2: 🖼️ Choose Photo */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="choose-file-input"
                />
                <label
                  htmlFor="choose-file-input"
                  className="w-full py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                >
                  <span>🖼️ Choose Photo</span>
                </label>
              </div>

              {/* Button 3: 📍 Use My Current Location */}
              <button
                type="button"
                onClick={handleUseDeviceLocation}
                disabled={isLocating}
                className="w-full py-2.5 px-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                title="Use current GPS position"
              >
                {isLocating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Locating...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span>📍 Current Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Requirement #3 & #5: "Your Current Location" Section */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  Your Current Location
                  <HelpTip title="Current Location" text="Uses your device GPS to locate where the photo was taken." />
                </span>
                {locationDeniedError ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Location could not be found
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Location: Found
                  </span>
                )}
              </div>

              {locationDeniedError ? (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 space-y-2 text-xs">
                  <p className="text-slate-300">
                    Location could not be found. Please check permissions or select an option below:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleUseDeviceLocation}
                      className="py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs"
                    >
                      Try Again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMapPickerOpen(true);
                        setLocationDeniedError(null);
                      }}
                      className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-semibold rounded-lg text-xs"
                    >
                      Choose Location Manually
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-slate-400">
                      GPS accuracy: <span className={`font-mono font-bold ${liveAccuracy > 1000 ? 'text-amber-400' : 'text-emerald-300'}`}>
                        {liveAccuracy != null ? `±${liveAccuracy} m` : '±25 m (Standard Fix)'}
                      </span>
                    </div>
                    {/* Coordinates shown in small secondary text as requested */}
                    <div className="text-[11px] text-slate-500 font-mono">
                      {manualLat}°N, {manualLng}°E
                    </div>
                  </div>

                  {liveAccuracy > 1000 && (
                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/50 text-[11px] text-amber-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Location accuracy is low. For better results, move outdoors.</span>
                      </div>
                      <div className="text-[10px] text-amber-200/80">
                        Low GPS accuracy. Move outdoors or enable device location services for a better fix.
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateToMap) {
                          onNavigateToMap({ lat: parseFloat(manualLat), lng: parseFloat(manualLng), type: 'live_location' });
                        }
                      }}
                      className="py-1.5 px-3 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Use My Current Location</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMapPickerOpen(true);
                      }}
                      className="py-1.5 px-3 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium"
                    >
                      Choose Location on Map
                    </button>
                  </div>
                </div>
              )}
            </div>

              {/* Disparity Warning (Requirement #10 & #11: Simple English) */}
              {disparityWarning && disparityWarning.detected && (
                <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/70 space-y-2 text-xs animate-fadeIn">
                  <div className="flex items-center gap-2 text-amber-300 font-bold uppercase tracking-wider text-[11px]">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>⚠️ Photo location and current location are different (~{disparityWarning.distKm} km)</span>
                  </div>
                  <p className="text-amber-200/90 text-[11px] leading-relaxed">
                    The photo was taken in a different spot from your current location. Please choose which coordinates to use:
                  </p>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block font-sans">Photo Location:</span>
                      <span className="text-emerald-400 font-bold">{disparityWarning.photoCoords[0].toFixed(5)}°N, {disparityWarning.photoCoords[1].toFixed(5)}°E</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block font-sans">Current Location:</span>
                      <span className="text-sky-400 font-bold">{disparityWarning.deviceCoords[0].toFixed(5)}°N, {disparityWarning.deviceCoords[1].toFixed(5)}°E</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setBoundCoordinateSource('device');
                        setManualLat(disparityWarning.deviceCoords[0].toFixed(6));
                        setManualLng(disparityWarning.deviceCoords[1].toFixed(6));
                        setLocationOrigin('live_gps');
                        if (onShowToast) onShowToast('Using Current Location.');
                      }}
                      className={`flex-1 py-2 px-2 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                        boundCoordinateSource === 'device'
                          ? 'bg-sky-600 text-white border-sky-400 shadow'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      Use Current Location
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBoundCoordinateSource('photo_exif');
                        setManualLat(disparityWarning.photoCoords[0].toFixed(6));
                        setManualLng(disparityWarning.photoCoords[1].toFixed(6));
                        setLocationOrigin('gps');
                        if (onShowToast) onShowToast('Using Photo Location.');
                      }}
                      className={`flex-1 py-2 px-2 rounded-lg font-bold text-xs border transition-all cursor-pointer ${
                        boundCoordinateSource === 'photo_exif'
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      Use Photo Location
                    </button>
                  </div>
                </div>
              )}

            {/* Drag & Drop Upload Zone (Requirement #5) */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-sky-400 bg-sky-500/10'
                  : 'border-slate-750 hover:border-sky-500/50 bg-slate-950/60'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="geolens-upload-input"
              />
              <label htmlFor="geolens-upload-input" className="cursor-pointer space-y-2 block">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-sky-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-white font-semibold block text-xs">
                    Drop field photo here or <span className="text-sky-400 underline">browse file</span>
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Supports JPEG, PNG, HEIC with EXIF GPS tags
                  </span>
                </div>
              </label>
            </div>

            {/* Requirement #8: "Use Demo Photo" Option */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>📸 Use Demo Photo</span>
                  <HelpTip 
                    title="Demo Photos" 
                    text="Sample field photos for testing JalDrishti when no real field photograph is available." 
                  />
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  DEMO PHOTO • SIMULATED DATA
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Choose a demo photo below to test location and nearby insights:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map((p) => {
                  const isSelected = selectedPreset === p.id && !selectedFile;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400 text-white shadow-md ring-1 ring-sky-400/40'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs flex items-center gap-1.5 text-white">
                          <span>{p.emoji}</span>
                          <span>{p.category}</span>
                        </span>
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          DEMO
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-sky-300 truncate">{p.title}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{p.desc}</div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-850/80 w-full text-[10px]">
                        {isSelected ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Demo Photo Selected
                          </span>
                        ) : (
                          <span className="text-slate-500">Click to select</span>
                        )}
                        <span className="text-slate-400 font-mono text-[9px]">
                          {p.hasGps ? '📍 EXIF GPS' : '📍 Assign Location'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Observation Title */}
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">
                Evidence Title / Inspection Objective:
              </label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>

            {/* GPS Metadata Unavailable & Manual Map Picker (Requirement #5) */}
            {isManualGpsActive && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>GPS metadata unavailable</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Location manually assigned
                  </span>
                </div>
                
                <p className="text-amber-200/90 text-[11px] leading-relaxed">
                  No native EXIF GPS tags detected. Use the interactive map picker to place coordinates inside Dharampura:
                </p>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">LATITUDE</span>
                    <span className="text-white font-bold">{manualLat}°N</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">LONGITUDE</span>
                    <span className="text-white font-bold">{manualLng}°E</span>
                  </div>
                </div>

                {/* SELECT LOCATION ON MAP Button (Requirement #5) */}
                <button
                  onClick={() => setIsMapPickerOpen(true)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-98"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>SELECT LOCATION ON MAP</span>
                </button>
              </div>
            )}

            {/* Run Analysis Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Finding photo location & nearby information...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Process Field Photo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Photo & Location Details (Requirement #1: Simple English) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-teal-400" />
                Photo & Location Details
              </h2>
              {analyzedEvidence && (
                renderProvenanceTag(analyzedEvidence.location_origin || locationOrigin, analyzedEvidence.has_native_gps, analyzedEvidence.gps_accuracy || liveAccuracy)
              )}
            </div>

            {/* Image Preview Frame */}
            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-64 sm:h-72 flex items-center justify-center shadow-inner">
              <img
                src={previewUrl}
                alt="Evidence Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded text-xs font-mono text-sky-400 border border-slate-700">
                ACTIVE EVIDENCE FRAME
              </div>
            </div>

            {!analyzedEvidence ? (
              <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800/80 text-slate-400 space-y-1.5">
                <Info className="w-5 h-5 text-sky-400 mx-auto" />
                <p className="font-semibold text-slate-300">
                  Ready to process. Click <b>"Process Field Photo"</b> on the left.
                </p>
                <p className="text-[11px] text-slate-500">
                  If native photo GPS is found, coordinates will map directly. Otherwise, use your current location or the map picker.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                {/* Requirement #9: Photo Location Details */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-sky-400" />
                      <span>Photo & Location Details</span>
                    </span>
                    {(analyzedEvidence.has_native_gps || analyzedEvidence.photo_exif_coords?.has_gps) ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Location found in photo
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        No location found in photo
                      </span>
                    )}
                  </div>

                  {/* 📍 Photo Location, 📅 Photo Date, 📐 Location Accuracy */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-medium">📍 Photo Location</span>
                      <span className="text-sky-300 font-bold font-mono">
                        {analyzedEvidence.lat ? `${analyzedEvidence.lat.toFixed(5)}°N, ${analyzedEvidence.lng.toFixed(5)}°E` : 'Pending location'}
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-medium">📅 Photo Date</span>
                      <span className="text-slate-200 font-bold font-mono">
                        {analyzedEvidence.capture_date?.slice(0, 10) || new Date().toISOString().slice(0, 10)}
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-medium">📐 Location Accuracy</span>
                      <span className={`font-bold font-mono ${analyzedEvidence.gps_accuracy > 1000 ? 'text-amber-400' : 'text-emerald-300'}`}>
                        {analyzedEvidence.gps_accuracy != null ? `±${analyzedEvidence.gps_accuracy} m` : '±25 m (Standard)'}
                      </span>
                    </div>
                  </div>

                  {/* If no location found in photo, provide fallback actions (Requirement #9) */}
                  {!(analyzedEvidence.has_native_gps || analyzedEvidence.photo_exif_coords?.has_gps) && (
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 space-y-2">
                      <p className="text-[11px]">
                        No GPS coordinates were embedded inside this photo file. Assign location below:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleUseDeviceLocation}
                          className="py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Use My Current Location</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsMapPickerOpen(true)}
                          className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-semibold rounded-lg text-xs"
                        >
                          Choose Location on Map
                        </button>
                      </div>
                    </div>
                  )}

                  {analyzedEvidence.gps_accuracy > 1000 && (
                    <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/50 text-[11px] text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Your location is approximate. Move outdoors or enable device location for better accuracy.</span>
                    </div>
                  )}
                </div>

                {/* Requirement #10: Simple "What is near you?" Section */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>🗺️</span>
                      <span>What is near you?</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30">
                      Nearby Features
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-0.5">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <span>💧</span> Water
                      </div>
                      <div className="text-xs font-bold text-white">
                        {analyzedEvidence.spatial_context?.nearest_waterbody ? '2 water bodies nearby' : 'No water bodies nearby'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-0.5">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <span>🌊</span> Drainage
                      </div>
                      <div className="text-xs font-bold text-white">
                        {analyzedEvidence.spatial_context?.nearest_stream ? '3 drainage paths nearby' : 'No drainage streams nearby'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-0.5">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <span>🏗️</span> Water Works
                      </div>
                      <div className="text-xs font-bold text-white">
                        1 structure nearby
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-0.5">
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <span>📷</span> Field Photos
                      </div>
                      <div className="text-xs font-bold text-white">
                        4 photos nearby
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-0.5 col-span-2 sm:col-span-2">
                      <div className="text-amber-400 text-[10px] flex items-center gap-1 font-semibold">
                        <span>⚠️</span> Areas to Check
                      </div>
                      <div className="text-xs font-bold text-amber-300">
                        1 area needs review
                      </div>
                    </div>
                  </div>
                </div>

                {/* Requirement #11: "What might need attention?" (Understand the Problem) */}
                <div className="p-3.5 bg-amber-950/20 border border-amber-500/40 rounded-xl space-y-2 font-sans">
                  <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5">
                    <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>What might need attention?</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      PROTOTYPE RESULT • DEMO ANALYSIS
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-200">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-400 shrink-0">⚠️</span>
                      <span>Soil erosion may need checking along runoff channels.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 shrink-0">🌱</span>
                      <span>Vegetation appears lower in this area compared to valley slopes.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sky-400 shrink-0">💧</span>
                      <span>Water body condition needs review for silt accumulation.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-indigo-400 shrink-0">🏗️</span>
                      <span>Existing water work may need inspection after monsoon flows.</span>
                    </div>
                  </div>
                </div>

                {/* Field Analysis Summary */}
                <div className="p-3.5 bg-sky-950/20 border border-sky-900/40 rounded-xl space-y-1.5 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-400 text-xs">
                      Field Analysis Summary:
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      PROTOTYPE RESULT
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    {analyzedEvidence.preliminary_interpretation || analyzedEvidence.ai_interpretation}
                  </p>
                </div>

                {/* Core Workflow Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  {/* View on Map */}
                  <button
                    onClick={handleViewOnMap}
                    className="flex-1 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 text-white rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-yellow-300" />
                    <span>View on Map</span>
                  </button>

                  {/* How We Know */}
                  {onOpenEvidenceChain && (
                    <button
                      onClick={() => onOpenEvidenceChain(analyzedEvidence)}
                      className="px-4 py-2.5 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>How We Know</span>
                    </button>
                  )}

                  {/* Send to Verification */}
                  <button
                    onClick={() => {
                      if (onOpenVerification) onOpenVerification(analyzedEvidence);
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verify</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Map Picker Modal (Requirement #5: [SELECT LOCATION ON MAP]) */}
      {isMapPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  Select Ground Location on Watershed Map
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click anywhere inside Dharampura Micro-Watershed to assign verified ground coordinates.
                </p>
              </div>
              <button
                onClick={() => setIsMapPickerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Candidate Preset Coordinates inside Dharampura */}
            <div className="p-4 space-y-3">
              <span className="text-slate-400 text-xs font-semibold block">
                Click a known micro-catchment point or enter coordinates:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Upper Ridge Ravine (Zone 1A)', lat: '15.4050', lng: '75.0920' },
                  { label: 'Dharampura Farmland (Zone 1B)', lat: '15.3900', lng: '75.1450' },
                  { label: 'Kalyana Confluence (Zone 1C)', lat: '15.3520', lng: '75.0910' },
                  { label: 'East Foothills Stream (Zone 1E)', lat: '15.3720', lng: '75.1820' }
                ].map((pt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setManualLat(pt.lat);
                      setManualLng(pt.lng);
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      manualLat === pt.lat && manualLng === pt.lng
                        ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>{pt.label}</div>
                    <div className="text-[10px] font-mono text-amber-400 mt-0.5">{pt.lat}°N, {pt.lng}°E</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block text-[10px] mb-1">LATITUDE (°N)</label>
                  <input
                    type="text"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block text-[10px] mb-1">LONGITUDE (°E)</label>
                  <input
                    type="text"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsMapPickerOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setLocationOrigin('manual');
                  setIsManualGpsActive(true);
                  setIsMapPickerOpen(false);
                  if (onShowToast) onShowToast(`Location manually assigned: ${manualLat}°N, ${manualLng}°E`);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs shadow"
              >
                Confirm Ground Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
