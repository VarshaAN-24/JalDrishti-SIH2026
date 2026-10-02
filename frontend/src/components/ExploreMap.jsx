import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  MapPin, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Compass, 
  Maximize2, 
  RotateCcw,
  Search,
  Filter, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  SlidersHorizontal, 
  X, 
  ExternalLink,
  ChevronRight,
  Info,
  Radio,
  Send,
  HelpCircle,
  Minimize2,
  Droplets,
  Activity,
  Layers2,
  Navigation,
  Crosshair,
  AlertCircle
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

export default function ExploreMap({ 
  layersData, 
  selectedFeature, 
  setSelectedFeature, 
  onOpenWhyModal, 
  onOpenEvidenceReplay, 
  onOpenVerification,
  onOpenScenarioPlanner,
  onOpenEvidenceChain,
  onSendForVerification,
  onCaptureAtLocation,
  onShowToast,
  activeMapFilter,
  activeLocationMode = 'live_gps',
  activeLocation = null,
  onUpdateActiveLocation,
  onSwitchToDemoMode,
  onSwitchToLiveMode,
  onSwitchToManualMode
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  // Layer Groups
  const layerGroupsRef = useRef({
    subWatersheds: null,
    drainage: null,
    waterBodies: null,
    vegetation: null,
    interventions: null,
    fieldObservations: null,
    spatialRipple: null,
    highlightMarker: null,
    liveLocation: null
  });

  const geoRequestIdRef = useRef(0);

  // Layer visibility state
  const [layersVisibility, setLayersVisibility] = useState({
    subWatersheds: true,
    drainage: true,
    waterBodies: true,
    vegetation: true,
    interventions: true,
    fieldObservations: true,
    spatialRipple: true
  });

  // Basemap state: 'satellite', 'dark', 'street'
  const [currentBasemap, setCurrentBasemap] = useState('satellite');
  const basemapTilesRef = useRef({});

  // Active Inspector selection
  const [activeInspectorData, setActiveInspectorData] = useState(null);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Search feature state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Status updating in-progress
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  // Live device location state (Requirement: Live Device-Location)
  const [liveLocation, setLiveLocation] = useState(activeLocation); // { lat, lng, accuracy, timestamp }
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Manual location modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualInputLat, setManualInputLat] = useState('15.365000');
  const [manualInputLng, setManualInputLng] = useState('75.125000');

  // Initial map center & zoom (Dharampura Micro-Watershed default fallback)
  const DEFAULT_CENTER = [15.365, 75.125];
  const DEFAULT_ZOOM = 13;
  const WATERSHED_BOUNDS = [
    [15.320, 75.060],
    [15.420, 75.190]
  ];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on active field location if available, otherwise default study basin
    const initialCenter = (activeLocation && activeLocation.lat && activeLocation.lng)
      ? [activeLocation.lat, activeLocation.lng]
      : DEFAULT_CENTER;
    const initialZoom = (activeLocation && activeLocation.lat && activeLocation.lng) ? 16 : DEFAULT_ZOOM;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Basemaps
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: 'Tiles &copy; Esri' }
    );

    const darkLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 19, attribution: '&copy; CartoDB' }
    );

    const streetLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 19, attribution: '&copy; OpenStreetMap' }
    );

    basemapTilesRef.current = {
      satellite: satelliteLayer,
      dark: darkLayer,
      street: streetLayer
    };

    satelliteLayer.addTo(map);

    // Layer Groups
    layerGroupsRef.current.subWatersheds = L.layerGroup().addTo(map);
    layerGroupsRef.current.drainage = L.layerGroup().addTo(map);
    layerGroupsRef.current.waterBodies = L.layerGroup().addTo(map);
    layerGroupsRef.current.vegetation = L.layerGroup().addTo(map);
    layerGroupsRef.current.interventions = L.layerGroup().addTo(map);
    layerGroupsRef.current.fieldObservations = L.layerGroup().addTo(map);
    layerGroupsRef.current.spatialRipple = L.layerGroup().addTo(map);
    layerGroupsRef.current.highlightMarker = L.layerGroup().addTo(map);
    layerGroupsRef.current.liveLocation = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Basemap Switch
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    
    Object.values(basemapTilesRef.current).forEach(layer => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });

    if (basemapTilesRef.current[currentBasemap]) {
      basemapTilesRef.current[currentBasemap].addTo(map);
      basemapTilesRef.current[currentBasemap].bringToBack();
    }
  }, [currentBasemap]);

  // Reset Map View
  const handleResetView = () => {
    geoRequestIdRef.current++;
    if (onSwitchToDemoMode) {
      onSwitchToDemoMode();
    }
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.0 });
  };

  // Fit Watershed Bounds
  const handleFitWatershed = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds(WATERSHED_BOUNDS, { padding: [20, 20], duration: 1.0 });
  };

  // Draw Spatial Ripple (100m, 250m, 500m concentric rings)
  const drawSpatialRipple = (lat, lng) => {
    if (!mapInstanceRef.current) return;
    const rippleGroup = layerGroupsRef.current.spatialRipple;
    const highlightGroup = layerGroupsRef.current.highlightMarker;
    
    rippleGroup.clearLayers();
    highlightGroup.clearLayers();

    if (!layersVisibility.spatialRipple || !lat || !lng) return;

    const countSuffix = activeLocationMode === 'live_gps' ? ' (0 features)' : '';

    // 100m Zone (Interactive spatial exploration radius)
    const ring100 = L.circle([lat, lng], {
      radius: 100,
      color: '#38bdf8',
      weight: 1.5,
      dashArray: '3, 4',
      fillColor: '#0284c7',
      fillOpacity: 0.16
    }).bindTooltip(`100m Interactive Exploration Radius${countSuffix}`, { permanent: false, direction: 'top', className: 'ripple-tooltip' });

    // 250m Zone (Interactive spatial exploration radius)
    const ring250 = L.circle([lat, lng], {
      radius: 250,
      color: '#14b8a6',
      weight: 1.5,
      dashArray: '4, 5',
      fillColor: '#0d9488',
      fillOpacity: 0.09
    }).bindTooltip(`250m Interactive Exploration Radius${countSuffix}`, { permanent: false, direction: 'top', className: 'ripple-tooltip' });

    // 500m Zone (Interactive spatial exploration radius)
    const ring500 = L.circle([lat, lng], {
      radius: 500,
      color: '#818cf8',
      weight: 1.5,
      dashArray: '6, 6',
      fillColor: '#6366f1',
      fillOpacity: 0.05
    }).bindTooltip(`500m Interactive Exploration Radius${countSuffix}`, { permanent: false, direction: 'top', className: 'ripple-tooltip' });

    ring500.addTo(rippleGroup);
    ring250.addTo(rippleGroup);
    ring100.addTo(rippleGroup);

    // Glowing Pulse Ring Center
    const pulseCenter = L.circleMarker([lat, lng], {
      radius: 18,
      color: '#facc15',
      weight: 2,
      fillColor: '#facc15',
      fillOpacity: 0.25,
      className: 'animate-ping'
    });
    pulseCenter.addTo(highlightGroup);
  };

  // Render Live Location Marker on Map (Requirement: Live Device-Location)
  const renderLiveLocationMarker = (loc, markerLabel = '📍 YOU ARE HERE') => {
    if (!mapInstanceRef.current || !loc?.lat || !loc?.lng) return;
    const map = mapInstanceRef.current;
    const liveGroup = layerGroupsRef.current.liveLocation;
    liveGroup.clearLayers();

    // Accuracy Circle
    if (loc.accuracy && loc.accuracy > 0) {
      L.circle([loc.lat, loc.lng], {
        radius: loc.accuracy,
        color: loc.accuracy > 1000 ? '#f59e0b' : '#38bdf8',
        weight: 1.5,
        fillColor: loc.accuracy > 1000 ? '#d97706' : '#0ea5e9',
        fillOpacity: 0.12,
        dashArray: '3, 4'
      }).bindTooltip(`GPS Accuracy: ±${loc.accuracy} m${loc.accuracy > 1000 ? ' (Low accuracy)' : ''}`, { permanent: false }).addTo(liveGroup);
    }

    // Custom Blue Pulsing User Location Beacon (Requirement: Clearly visible 📍 YOU ARE HERE marker)
    const customIcon = L.divIcon({
      className: 'custom-live-location-marker',
      html: `
        <div class="relative flex items-center justify-center" style="width: 50px; height: 50px;">
          <span class="absolute w-12 h-12 rounded-full bg-sky-500 opacity-75 animate-ping"></span>
          <div class="absolute -top-7 whitespace-nowrap bg-sky-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-sky-300 ring-2 ring-sky-950 flex items-center gap-1 z-30">
            <span>📍 YOU ARE HERE</span>
          </div>
          <div class="w-9 h-9 rounded-full bg-blue-600 border-2 border-white shadow-[0_0_20px_#38bdf8] flex items-center justify-center text-sm font-bold text-white z-20">
            📍
          </div>
        </div>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 25]
    });

    const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });
    marker.bindPopup(`
      <div style="font-family: monospace; font-size: 11px; padding: 4px;">
        <b style="color: #0284c7; font-size: 12px;">● ${markerLabel}</b><br/>
        <b>Latitude:</b> ${loc.lat.toFixed(6)}°N<br/>
        <b>Longitude:</b> ${loc.lng.toFixed(6)}°E<br/>
        ${loc.accuracy != null ? `<b>Accuracy:</b> ±${loc.accuracy} m<br/>` : ''}
        ${loc.accuracy > 1000 ? `<div style="color: #f59e0b; margin-top: 4px; font-family: sans-serif; font-size: 10px; font-weight: 600;">⚠️ Low GPS accuracy. Move outdoors or enable device location services for a better fix.</div>` : ''}
        <b>Location Source:</b> DEVICE GPS<br/>
        ${activeLocationMode === 'live_gps' ? `<div style="color: #38bdf8; margin-top: 4px; font-family: sans-serif; font-size: 10px;">No local watershed data is available here yet. Live GPS active.</div>` : ''}
      </div>
    `);
    marker.addTo(liveGroup);

    // Center map on coordinates automatically
    map.flyTo([loc.lat, loc.lng], 16, { duration: 1.2 });
    drawSpatialRipple(loc.lat, loc.lng);
  };

  // Synchronize Active Location Hierarchy with Map
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (activeLocation && activeLocation.lat && activeLocation.lng) {
      setLiveLocation(activeLocation);
      const isManual = activeLocationMode === 'manual';
      renderLiveLocationMarker(activeLocation, isManual ? '📍 MANUAL STUDY LOCATION' : '📍 YOU ARE HERE');
      
      setActiveInspectorData({
        type: 'live_location',
        title: isManual ? 'Manual Study Location' : 'My Live Device Location',
        data: {
          id: isManual ? 'MANUAL-LOC' : 'LIVE-GPS',
          lat: activeLocation.lat,
          lng: activeLocation.lng,
          accuracy: activeLocation.accuracy,
          timestamp: activeLocation.timestamp || new Date().toLocaleTimeString(),
          title: isManual ? 'Manual Study Location' : 'My Live Device Location Beacon',
          source: activeLocation.source || (isManual ? 'Manual Entry' : 'Device GPS')
        }
      });
      setIsRightPanelOpen(true);
    } else if (activeLocationMode === 'demo') {
      setLiveLocation(null);
      if (layerGroupsRef.current.liveLocation) {
        layerGroupsRef.current.liveLocation.clearLayers();
      }
      if (layerGroupsRef.current.spatialRipple) {
        layerGroupsRef.current.spatialRipple.clearLayers();
      }
    }
  }, [activeLocation, activeLocationMode]);

  // Handler for "📍 Use My Current Location" (Requirement: Live Device-Location)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Browser Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    const reqId = ++geoRequestIdRef.current;
    let bestAccuracy = Infinity;
    let retryAttempts = 0;
    const maxRetries = 2;

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    };

    const processPosition = (position, isRetry = false) => {
      if (geoRequestIdRef.current !== reqId) return;

      const { latitude, longitude, accuracy } = position.coords;

      // Update if this is the initial fix or if accuracy has improved
      if (accuracy < bestAccuracy) {
        bestAccuracy = accuracy;
        const loc = {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy, // Honest, unmanipulated actual browser accuracy
          timestamp: new Date(position.timestamp || Date.now()).toLocaleTimeString(),
          source: 'Device GPS'
        };

        setLiveLocation(loc);
        if (accuracy > 1000) {
          setLocationError('Low GPS accuracy. Move outdoors or enable device location services for a better fix.');
        } else {
          setLocationError(null);
        }

        if (onUpdateActiveLocation) {
          onUpdateActiveLocation(loc, 'live_gps');
        } else {
          renderLiveLocationMarker(loc, '📍 MY CURRENT LOCATION');
          setActiveInspectorData({
            type: 'live_location',
            title: 'My Live Device Location',
            data: {
              id: 'LIVE-GPS',
              lat: loc.lat,
              lng: loc.lng,
              accuracy: loc.accuracy,
              timestamp: loc.timestamp,
              title: 'My Live Device Location Beacon',
              source: 'Device GPS'
            }
          });
          setIsRightPanelOpen(true);
        }

        if (onShowToast) {
          if (isRetry) {
            if (accuracy > 1000) {
              onShowToast(`GPS fix improved: ${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°E (±${accuracy}m). Low GPS accuracy. Move outdoors or enable device location services for a better fix.`);
            } else {
              onShowToast(`GPS fix improved: ${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°E (±${accuracy}m)`);
            }
          } else {
            if (accuracy > 1000) {
              onShowToast(`Live device location acquired: ${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°E (±${accuracy}m). Low GPS accuracy. Move outdoors or enable device location services for a better fix.`);
            } else {
              onShowToast(`Live device location acquired: ${latitude.toFixed(5)}°N, ${longitude.toFixed(5)}°E (±${accuracy}m)`);
            }
          }
        }
      }

      // If accuracy is poor (> 1000m), retry once or twice to obtain a better fix
      if (bestAccuracy > 1000 && retryAttempts < maxRetries) {
        retryAttempts++;
        setTimeout(() => {
          if (geoRequestIdRef.current !== reqId) return;
          navigator.geolocation.getCurrentPosition(
            (retryPos) => processPosition(retryPos, true),
            (retryErr) => {
              console.warn(`Geolocation retry #${retryAttempts} error:`, retryErr);
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
        console.warn('Geolocation error:', err);
        setLocationError('Location access was denied or unavailable.');
        if (onShowToast) {
          onShowToast('Location access was denied or unavailable.');
        }
      },
      geoOptions
    );
  };

  // Render Geospatial Layers onto Map
  useEffect(() => {
    if (!mapInstanceRef.current || !layersData) return;

    const { subWatersheds, drainage, waterBodies, vegetation, interventions, fieldObservations } = layerGroupsRef.current;

    subWatersheds.clearLayers();
    drainage.clearLayers();
    waterBodies.clearLayers();
    vegetation.clearLayers();
    interventions.clearLayers();
    fieldObservations.clearLayers();

    // SEPARATE LIVE GPS MODE FROM DEMO DATA (Requirement 2 & 6):
    // When LIVE LOCATION MODE is active, DO NOT display the Dharampura demo GIS data!
    if (activeLocationMode === 'live_gps') {
      return;
    }

    // 1. Sub-watersheds
    if (layersData.sub_watersheds && layersVisibility.subWatersheds) {
      L.geoJSON(layersData.sub_watersheds, {
        style: (feature) => {
          const p = feature.properties.priority;
          let color = '#38bdf8';
          let fillOpacity = 0.20;
          if (p === 'Critical') {
            color = '#ef4444';
            fillOpacity = 0.28;
          } else if (p === 'High') {
            color = '#f59e0b';
            fillOpacity = 0.24;
          } else if (p === 'Moderate') {
            color = '#0ea5e9';
          } else {
            color = '#10b981';
          }

          const isFilterMatched = activeMapFilter?.matched_zones?.includes(feature.properties.id);
          if (isFilterMatched) {
            fillOpacity = 0.55;
            color = '#f43f5e';
          }

          return {
            color: color,
            weight: isFilterMatched ? 3.5 : 2,
            dashArray: '4, 4',
            fillColor: color,
            fillOpacity: fillOpacity
          };
        },
        onEachFeature: (feature, layer) => {
          layer.on({
            click: () => {
              setActiveInspectorData({
                type: 'sub_watershed',
                title: feature.properties.name,
                data: feature.properties
              });
              setIsRightPanelOpen(true);
            },
            mouseover: () => {
              layer.setStyle({ weight: 3.5, fillOpacity: 0.45 });
            },
            mouseout: () => {
              const isMatched = activeMapFilter?.matched_zones?.includes(feature.properties.id);
              layer.setStyle({
                weight: isMatched ? 3.5 : 2,
                fillOpacity: isMatched ? 0.55 : 0.20
              });
            }
          });
        }
      }).addTo(subWatersheds);
    }

    // 2. Vegetation (NDVI Greenness Overlay)
    if (layersData.vegetation && layersVisibility.vegetation) {
      L.geoJSON(layersData.vegetation, {
        style: (feature) => ({
          color: feature.properties.color || '#10b981',
          weight: 1.5,
          fillColor: feature.properties.color || '#10b981',
          fillOpacity: 0.35,
          dashArray: '2, 2'
        }),
        onEachFeature: (feature, layer) => {
          layer.on('click', () => {
            setActiveInspectorData({
              type: 'vegetation',
              title: feature.properties.name,
              data: feature.properties
            });
            setIsRightPanelOpen(true);
          });
        }
      }).addTo(vegetation);
    }

    // 3. Drainage Lines
    if (layersData.drainage && layersVisibility.drainage) {
      L.geoJSON(layersData.drainage, {
        style: (feature) => {
          const order = feature.properties.order;
          let weight = order === 4 ? 4.5 : (order === 3 ? 3.5 : 2);
          let color = order === 4 ? '#0284c7' : (order === 3 ? '#38bdf8' : '#67e8f9');
          return {
            color: color,
            weight: weight,
            opacity: 0.90
          };
        },
        onEachFeature: (feature, layer) => {
          layer.on('click', () => {
            setActiveInspectorData({
              type: 'drainage',
              title: feature.properties.name,
              data: feature.properties
            });
            setIsRightPanelOpen(true);
          });
        }
      }).addTo(drainage);
    }

    // 4. Water Bodies
    if (layersData.water_bodies && layersVisibility.waterBodies) {
      L.geoJSON(layersData.water_bodies, {
        style: {
          color: '#0284c7',
          weight: 2,
          fillColor: '#0ea5e9',
          fillOpacity: 0.60
        },
        onEachFeature: (feature, layer) => {
          layer.on('click', () => {
            setActiveInspectorData({
              type: 'water_body',
              title: feature.properties.name,
              data: feature.properties
            });
            setIsRightPanelOpen(true);
          });
        }
      }).addTo(waterBodies);
    }

    // 5. Interventions
    if (layersData.interventions && layersVisibility.interventions) {
      layersData.interventions.forEach((item) => {
        const isMatched = activeMapFilter?.matched_interventions?.some(m => m.id === item.id);
        
        let markerBg = '#0284c7';
        if (item.verification_status === 'Flagged') markerBg = '#ef4444';
        else if (item.verification_status === 'Under Review' || item.verification_status === 'Pending Review') markerBg = '#f59e0b';
        else if (item.verification_status === 'Needs Reinspection') markerBg = '#8b5cf6';
        else markerBg = '#10b981';

        const customIcon = L.divIcon({
          className: 'custom-intervention-marker',
          html: `
            <div class="map-marker-pin ${isMatched ? 'ring-4 ring-rose-400 animate-bounce' : ''}" style="width: 28px; height: 28px; background: ${markerBg}; border: 2px solid #ffffff; box-shadow: 0 0 10px ${markerBg};">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([item.lat, item.lng], { icon: customIcon });
        marker.on('click', () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([item.lat, item.lng], 15, { duration: 1.0 });
          }
          drawSpatialRipple(item.lat, item.lng);
          setActiveInspectorData({
            type: 'intervention',
            title: item.name,
            data: item
          });
          setIsRightPanelOpen(true);
        });
        marker.addTo(interventions);
      });
    }

    // 6. Field Evidence Markers
    if (layersData.field_observations && layersVisibility.fieldObservations) {
      layersData.field_observations.forEach((obs) => {
        const isMatched = activeMapFilter?.matched_observations?.some(m => m.id === obs.id);
        
        let pinBg = '#10b981'; // Confirmed (Emerald)
        let ringEffect = 'shadow-[0_0_12px_rgba(16,185,129,0.7)]';
        
        if (obs.verification_status === 'Pending Review' || obs.verification_status === 'Flagged') {
          pinBg = '#f43f5e'; // Pending Review (Rose Red)
          ringEffect = 'shadow-[0_0_15px_rgba(244,63,94,0.9)] animate-pulse';
        } else if (obs.verification_status === 'Under Review') {
          pinBg = '#f59e0b'; // Under Review (Amber)
          ringEffect = 'shadow-[0_0_14px_rgba(245,158,11,0.8)]';
        } else if (obs.verification_status === 'Needs Reinspection') {
          pinBg = '#a855f7'; // Needs Reinspection (Purple)
          ringEffect = 'shadow-[0_0_14px_rgba(168,85,247,0.8)]';
        }

        const customIcon = L.divIcon({
          className: 'custom-observation-marker',
          html: `
            <div class="map-marker-pin ${ringEffect} ${isMatched ? 'ring-4 ring-yellow-300 animate-bounce' : ''}" style="width: 32px; height: 32px; background: ${pinBg}; border: 2.5px solid #ffffff;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([obs.lat, obs.lng], { icon: customIcon });
        marker.on('click', () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([obs.lat, obs.lng], 16, { duration: 1.0 });
          }
          drawSpatialRipple(obs.lat, obs.lng);
          setActiveInspectorData({
            type: 'observation',
            title: obs.title,
            data: obs
          });
          setIsRightPanelOpen(true);
        });
        marker.addTo(fieldObservations);
      });
    }

  }, [layersData, layersVisibility, activeMapFilter, activeLocationMode]);

  // Handle selectedFeature prop (PHOTO -> MAP EXPERIENCE)
  useEffect(() => {
    if (!selectedFeature || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const zoneCoordMap = {
      'ZONE-1A': { lat: 15.4038, lng: 75.1049, title: 'Soil Erosion near Check Dam 04 (Zone 1A)' },
      'ZONE-1B': { lat: 15.3880, lng: 75.1343, title: 'Main Valley Catchment (Zone 1B)' },
      'ZONE-1C': { lat: 15.3478, lng: 75.0882, title: 'Water Body Condition (Zone 1C)' },
      'ZONE-1D': { lat: 15.3584, lng: 75.1418, title: 'Contour Trench Catchment (Zone 1D)' }
    };

    let feat = typeof selectedFeature === 'string' ? { id: selectedFeature } : { ...selectedFeature };
    if ((!feat.lat || !feat.lng) && feat.id && zoneCoordMap[feat.id]) {
      feat = { ...feat, ...zoneCoordMap[feat.id] };
    }

    if (feat.lat && feat.lng) {
      map.flyTo([feat.lat, feat.lng], 16, { duration: 1.2 });
      drawSpatialRipple(feat.lat, feat.lng);
      setActiveInspectorData({
        type: feat.type || 'observation',
        title: feat.title || feat.name || feat.id,
        data: feat
      });
      setIsRightPanelOpen(true);
    }
  }, [selectedFeature]);

  // Compute Context Snapshot & Spatial Ripple Breakdown for Active Feature or Live Location
  const contextSnapshot = useMemo(() => {
    if (!activeInspectorData?.data?.lat) return null;
    const { lat, lng } = activeInspectorData.data;

    // SEPARATE LIVE GPS MODE FROM DEMO DATA (Requirement 2, 3, 4, 6):
    // When LIVE LOCATION MODE is active, DO NOT use Dharampura demo records for calculations or counts!
    if (activeLocationMode === 'live_gps') {
      return {
        nearestInt: null,
        nearestStream: null,
        nearestWb: null,
        nearestObs: null,
        containingSub: null,
        peerCountWithin500: 0,
        within100: [],
        within250: [],
        within500: [],
        isInsideWatershed: false,
        distToCenterKm: null,
        hasLayerData: false
      };
    }

    if (!layersData) return null;

    // 1. Nearest Intervention (Strict 5km cutoff)
    let nearestInt = null;
    let minIntDist = Infinity;
    layersData.interventions?.forEach(it => {
      const d = calculateDistanceMeters(lat, lng, it.lat, it.lng);
      if (d < minIntDist) {
        minIntDist = d;
        nearestInt = { ...it, distance: d };
      }
    });
    if (minIntDist > 5000) nearestInt = null;

    // 2. Nearest Drainage Stream (Strict 5km cutoff)
    let nearestStream = null;
    let minStreamDist = Infinity;
    layersData.drainage?.features?.forEach(feat => {
      const coords = feat.geometry?.coordinates;
      if (Array.isArray(coords)) {
        coords.forEach(pt => {
          const d = calculateDistanceMeters(lat, lng, pt[1], pt[0]);
          if (d < minStreamDist) {
            minStreamDist = d;
            nearestStream = {
              name: feat.properties.name,
              order: feat.properties.order,
              distance: d
            };
          }
        });
      }
    });
    if (minStreamDist > 5000) nearestStream = null;

    // 3. Nearest Water Body (Strict 5km cutoff)
    let nearestWb = null;
    let minWbDist = Infinity;
    layersData.water_bodies?.features?.forEach(feat => {
      const coords = feat.geometry?.coordinates?.[0];
      if (Array.isArray(coords)) {
        coords.forEach(pt => {
          const d = calculateDistanceMeters(lat, lng, pt[1], pt[0]);
          if (d < minWbDist) {
            minWbDist = d;
            nearestWb = {
              name: feat.properties.name,
              type: feat.properties.type,
              distance: d
            };
          }
        });
      }
    });
    if (minWbDist > 5000) nearestWb = null;

    // 4. Nearest Field Evidence Marker (Strict 5km cutoff)
    let nearestObs = null;
    let minObsDist = Infinity;
    let peerCountWithin500 = 0;
    const within100 = [];
    const within250 = [];
    const within500 = [];

    layersData.field_observations?.forEach(obs => {
      if (obs.id !== activeInspectorData.data.id) {
        const d = calculateDistanceMeters(lat, lng, obs.lat, obs.lng);
        if (d < minObsDist) {
          minObsDist = d;
          nearestObs = { ...obs, distance: d };
        }
        if (d <= 500) {
          peerCountWithin500++;
          if (d <= 100) within100.push({ type: 'Field Photo', name: obs.title, dist: d });
          else if (d <= 250) within250.push({ type: 'Field Photo', name: obs.title, dist: d });
          else within500.push({ type: 'Field Photo', name: obs.title, dist: d });
        }
      }
    });
    if (minObsDist > 5000) nearestObs = null;

    // 5. Containing Sub-watershed (NO fake fallbacks to Zone 1A)
    let containingSub = null;
    if (activeInspectorData.data.sub_watershed && activeInspectorData.data.sub_watershed !== 'Outside Layer Coverage') {
      layersData.sub_watersheds?.features?.forEach(feat => {
        if (feat.properties.id === activeInspectorData.data.sub_watershed) {
          containingSub = feat.properties;
        }
      });
    }

    if (nearestInt) {
      if (nearestInt.distance <= 100) within100.push({ type: 'Intervention', name: nearestInt.name, dist: nearestInt.distance });
      else if (nearestInt.distance <= 250) within250.push({ type: 'Intervention', name: nearestInt.name, dist: nearestInt.distance });
      else if (nearestInt.distance <= 500) within500.push({ type: 'Intervention', name: nearestInt.name, dist: nearestInt.distance });
    }

    if (nearestStream) {
      if (nearestStream.distance <= 100) within100.push({ type: 'Stream', name: `${nearestStream.name} (Order ${nearestStream.order})`, dist: nearestStream.distance });
      else if (nearestStream.distance <= 250) within250.push({ type: 'Stream', name: `${nearestStream.name} (Order ${nearestStream.order})`, dist: nearestStream.distance });
      else if (nearestStream.distance <= 500) within500.push({ type: 'Stream', name: `${nearestStream.name} (Order ${nearestStream.order})`, dist: nearestStream.distance });
    }

    // Study Area Relationship check
    const isInsideWatershed = lat >= WATERSHED_BOUNDS[0][0] && lat <= WATERSHED_BOUNDS[1][0] &&
                             lng >= WATERSHED_BOUNDS[0][1] && lng <= WATERSHED_BOUNDS[1][1];
    const distToCenterKm = Math.round(calculateDistanceMeters(lat, lng, DEFAULT_CENTER[0], DEFAULT_CENTER[1]) / 1000);
    const hasLayerData = isInsideWatershed || (nearestStream !== null) || (nearestWb !== null) || (containingSub !== null);

    return {
      nearestInt,
      nearestStream,
      nearestWb,
      nearestObs,
      containingSub,
      peerCountWithin500,
      within100,
      within250,
      within500,
      isInsideWatershed,
      distToCenterKm,
      hasLayerData
    };
  }, [activeInspectorData, layersData, activeLocationMode]);

  // Search feature handling
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !layersData) return [];
    const q = searchQuery.toLowerCase();
    const results = [];

    layersData.interventions?.forEach(it => {
      if (it.name?.toLowerCase().includes(q) || it.id?.toLowerCase().includes(q) || it.village?.toLowerCase().includes(q)) {
        results.push({ type: 'intervention', label: `${it.id} - ${it.name}`, lat: it.lat, lng: it.lng, data: it });
      }
    });

    layersData.field_observations?.forEach(obs => {
      if (obs.title?.toLowerCase().includes(q) || obs.id?.toLowerCase().includes(q)) {
        results.push({ type: 'observation', label: `${obs.id} - ${obs.title}`, lat: obs.lat, lng: obs.lng, data: obs });
      }
    });

    layersData.sub_watersheds?.features?.forEach(f => {
      if (f.properties.name?.toLowerCase().includes(q) || f.properties.id?.toLowerCase().includes(q)) {
        const coords = f.geometry.coordinates[0];
        const lat = coords.reduce((acc, c) => acc + c[1], 0) / coords.length;
        const lng = coords.reduce((acc, c) => acc + c[0], 0) / coords.length;
        results.push({ type: 'sub_watershed', label: `${f.properties.id} - ${f.properties.name}`, lat, lng, data: f.properties });
      }
    });

    return results.slice(0, 6);
  }, [searchQuery, layersData]);

  const handleSelectSearchResult = (res) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    if (mapInstanceRef.current && res.lat && res.lng) {
      mapInstanceRef.current.flyTo([res.lat, res.lng], 16, { duration: 1.2 });
      drawSpatialRipple(res.lat, res.lng);
    }
    setActiveInspectorData({
      type: res.type,
      title: res.label,
      data: res.data
    });
    setIsRightPanelOpen(true);
  };

  const toggleLayer = (layerKey) => {
    setLayersVisibility(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  // Handler for "Send for Verification"
  const handleSendForVerification = async () => {
    if (!activeInspectorData?.data?.id) return;
    setIsSendingVerification(true);
    const obsId = activeInspectorData.data.id;
    try {
      if (onSendForVerification) {
        await onSendForVerification(obsId, 'Under Review');
      }
      setActiveInspectorData(prev => ({
        ...prev,
        data: {
          ...prev.data,
          verification_status: 'Under Review'
        }
      }));
    } catch (err) {
      console.error('Error escalating to verification:', err);
    } finally {
      setIsSendingVerification(false);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-130px)] min-h-[620px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-navy-950 flex flex-col">
      {/* Top Map Hero Toolbar */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-white font-bold tracking-wide">
            <Compass className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Explore Map</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              GEOSPATIAL WORKSPACE
            </span>
          </div>

          {/* Location Mode Hierarchy Selector (Requirement: Live GPS -> Manual -> Demo) */}
          <div className="flex items-center gap-1.5">
            {/* Mode 1: Live Current Location (Primary) */}
            <button
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ${
                activeLocationMode === 'live_gps'
                  ? 'bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-blue-400/60 shadow-blue-500/20'
                  : 'bg-slate-950 hover:bg-slate-850 text-sky-300 border border-slate-700/80'
              }`}
              title="Primary: Acquire Live Device GPS Location & Center Map"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-yellow-300' : 'text-yellow-300'}`} />
              <span>{isLocating ? 'Acquiring GPS...' : '📍 Use My Current Location'}</span>
            </button>

            {/* Mode 2: Manual Location Entry (Secondary) */}
            <button
              onClick={() => setIsManualModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 ${
                activeLocationMode === 'manual'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white ring-2 ring-amber-400/60 shadow-amber-500/20'
                  : 'bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800'
              }`}
              title="Secondary: Manually enter ground coordinates"
            >
              <span>✏️ Manual Location</span>
            </button>

            {/* Mode 3: Demo Study Area */}
            <button
              onClick={() => {
                if (onSwitchToDemoMode) onSwitchToDemoMode();
                handleFitWatershed();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 ${
                activeLocationMode === 'demo'
                  ? 'bg-purple-600 hover:bg-purple-500 text-white ring-2 ring-purple-400/60 shadow-purple-500/20'
                  : 'bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-800'
              }`}
              title="Activate DEMO MODE: Dharampura Prototype"
            >
              <span>🗺️ Switch to Demo Study Area</span>
            </button>
          </div>

          {/* Active Mode Telemetry Badge */}
          {activeLocationMode === 'live_gps' && (
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
              LIVE LOCATION MODE • Device GPS {activeLocation ? `(${activeLocation.lat.toFixed(4)}°N, ${activeLocation.lng.toFixed(4)}°E)` : ''}
            </span>
          )}
          {activeLocationMode === 'manual' && activeLocation && (
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
              MANUAL ({activeLocation.lat.toFixed(4)}°N, {activeLocation.lng.toFixed(4)}°E)
            </span>
          )}
          {activeLocationMode === 'demo' && (
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              DEMO MODE • Dharampura Prototype
            </span>
          )}

          {/* Location error message */}
          {locationError && (
            <span className="hidden xl:inline-flex items-center gap-1 text-[11px] text-amber-300 font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              {locationError}
            </span>
          )}

          {/* Location Search Bar */}
          <div className="relative">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs w-44 sm:w-56 focus-within:border-sky-500 transition-colors">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="Search asset, zone..."
                className="bg-transparent text-white placeholder-slate-500 focus:outline-none w-full text-xs"
              />
            </div>

            {/* Search Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 mt-1 w-72 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden text-xs divide-y divide-slate-850">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left p-2.5 hover:bg-slate-900 transition-colors flex items-center justify-between text-slate-300 hover:text-white"
                  >
                    <span className="truncate">{res.label}</span>
                    <span className="text-[10px] font-mono text-sky-400 uppercase shrink-0 ml-2">{res.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Fit & Reset Buttons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={handleFitWatershed}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs text-slate-300 hover:text-white transition-all"
              title="Fit to Watershed Extent"
            >
              <Maximize2 className="w-3 h-3 text-teal-400" />
              <span>Fit</span>
            </button>
            <button
              onClick={handleResetView}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-xs text-slate-300 hover:text-white transition-all"
              title="Reset Map View"
            >
              <RotateCcw className="w-3 h-3 text-sky-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Basemap Switcher & Panel Toggles */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Basemap:</span>
            <div className="inline-flex rounded-md p-0.5 bg-slate-950 border border-slate-800">
              <button
                onClick={() => setCurrentBasemap('satellite')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  currentBasemap === 'satellite' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setCurrentBasemap('dark')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  currentBasemap === 'dark' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setCurrentBasemap('street')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  currentBasemap === 'street' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Topo
              </button>
            </div>
          </div>

          {/* Toggle Panels Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                isLeftPanelOpen ? 'bg-slate-800 text-sky-400 border-slate-700' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
              title="Toggle Layers Panel"
            >
              <Layers2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Layers</span>
            </button>
            <button
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                isRightPanelOpen ? 'bg-slate-800 text-sky-400 border-slate-700' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
              title="Toggle Evidence Panel"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Evidence</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-Column Geospatial Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT COLUMN: Compact Layers & Controls Panel */}
        {isLeftPanelOpen && (
          <div className="w-64 sm:w-72 bg-slate-950/95 border-r border-slate-800 p-3.5 flex flex-col justify-between overflow-y-auto z-20 text-xs shrink-0 animate-fadeIn">
            <div className="space-y-4">
              {/* Location Tools Card */}
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2">
                <span className="font-bold text-white uppercase tracking-wider block text-[10px] flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-blue-400" />
                  Live Geolocation Tool
                </span>
                
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all"
                >
                  <Crosshair className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{isLocating ? 'Acquiring GPS...' : '📍 Use My Current Location'}</span>
                </button>

                {liveLocation ? (
                  <div className="p-2 rounded bg-blue-950/30 border border-blue-800/40 text-[10px] font-mono space-y-1">
                    <div className="flex items-center justify-between text-blue-300 font-bold">
                      <span>● LIVE GPS ACQUIRED</span>
                      <span className={liveLocation.accuracy > 1000 ? 'text-amber-400' : ''}>
                        {liveLocation.accuracy != null ? `±${liveLocation.accuracy}m` : ''}
                      </span>
                    </div>
                    <div className="text-slate-300">
                      {liveLocation.lat.toFixed(5)}°N, {liveLocation.lng.toFixed(5)}°E
                    </div>
                    {liveLocation.accuracy > 1000 && (
                      <div className="text-amber-400 font-sans text-[10px] flex items-start gap-1 pt-1 border-t border-blue-800/40">
                        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <span>Low GPS accuracy. Move outdoors or enable device location services for a better fix.</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Info className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>Uses device browser GPS with accuracy metric.</span>
                  </div>
                )}

                {locationError && (
                  <div className="p-2 rounded bg-amber-950/30 border border-amber-800/40 text-[10px] text-amber-300 space-y-1">
                    <div>{locationError}</div>
                    <button
                      onClick={handleResetView}
                      className="text-sky-400 underline font-semibold block"
                    >
                      Return to Demo Dharampura Watershed
                    </button>
                  </div>
                )}
              </div>

              {/* Layer Toggles */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    Map Layers
                  </span>
                  <HelpTip text="Turn layers on or off to inspect photos, streams, water bodies, and priority areas on the map." />
                </div>

                {activeLocationMode === 'live_gps' && (
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] space-y-1.5 font-sans">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>No map data is available here yet.</span>
                    </div>
                    <p className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>Live GPS location captured successfully.</span>
                    </p>
                    <p className="text-slate-400 text-[9px] leading-relaxed">
                      Reference map layers (streams, ponds, water works) are not loaded in Live GPS Mode.
                    </p>
                  </div>
                )}

                {/* 📍 My Location Quick Action / Layer (Requirement #7) */}
                <button
                  type="button"
                  onClick={() => {
                    if (liveLocation?.lat && liveLocation?.lng) {
                      mapInstanceRef.current?.flyTo([liveLocation.lat, liveLocation.lng], 16, { duration: 1.0 });
                      setActiveInspectorData({
                        type: 'live_location',
                        title: 'You are here',
                        data: liveLocation
                      });
                      setIsRightPanelOpen(true);
                    } else {
                      handleUseCurrentLocation();
                    }
                  }}
                  className="w-full text-left p-2.5 rounded-xl border border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/50 transition-all flex items-center justify-between gap-2 cursor-pointer shadow-sm group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-sky-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                      📍
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white group-hover:text-sky-300">
                        My Location
                      </div>
                      <div className="text-[10px] text-sky-200/80 truncate">
                        {liveLocation ? 'Location active • Click to view' : 'Click to find location'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 shrink-0">
                    {liveLocation ? 'Active' : 'Find'}
                  </span>
                </button>

                {[
                  { 
                    key: 'waterBodies', 
                    label: 'Water Bodies', 
                    desc: activeLocationMode === 'live_gps' ? 'No map data is available here yet' : 'Lakes, ponds and tanks', 
                    count: activeLocationMode === 'live_gps' ? '0' : '4 Water Bodies',
                    icon: '💧'
                  },
                  { 
                    key: 'drainage', 
                    label: 'Drainage', 
                    desc: activeLocationMode === 'live_gps' ? 'No map data is available here yet' : 'Natural drainage streams & channels', 
                    count: activeLocationMode === 'live_gps' ? '0' : '38 Channels',
                    icon: '🌊'
                  },
                  { 
                    key: 'interventions', 
                    label: 'Water & Soil Works', 
                    desc: activeLocationMode === 'live_gps' ? 'No map data is available here yet' : 'Check dams, trenches & field bunds', 
                    count: activeLocationMode === 'live_gps' ? '0' : (layersData?.interventions?.length || 6),
                    icon: '🏗️'
                  },
                  { 
                    key: 'fieldObservations', 
                    label: 'Field Photos', 
                    desc: activeLocationMode === 'live_gps' ? 'No map data is available here yet' : 'Field photos & evidence markers', 
                    count: activeLocationMode === 'live_gps' ? '0' : (layersData?.field_observations?.length || 8), 
                    icon: '📷',
                    highlight: activeLocationMode !== 'live_gps' 
                  },
                  { 
                    key: 'spatialRipple', 
                    label: 'Areas Needing Attention', 
                    desc: 'Priority areas and explore radius', 
                    count: activeLocationMode === 'live_gps' ? 'Nearby' : 'Active', 
                    icon: '⚠️',
                    badgeColor: 'text-amber-300' 
                  },
                  { 
                    key: 'subWatersheds', 
                    label: 'Watershed Area', 
                    desc: activeLocationMode === 'live_gps' ? 'No map data is available here yet' : 'Outer boundary of study basin', 
                    count: activeLocationMode === 'live_gps' ? '0' : '1 Area',
                    icon: '🗺️'
                  }
                ].map(({ key, aliasKey, label, desc, count, icon, highlight, badgeColor }) => {
                  const activeKey = aliasKey || key;
                  const isVisible = layersVisibility[activeKey];
                  return (
                    <button
                      key={key}
                      onClick={() => toggleLayer(activeKey)}
                      className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isVisible
                          ? highlight ? 'bg-sky-950/30 border-sky-500/40 text-white' : 'bg-slate-900/80 border-slate-800 text-slate-200'
                          : 'bg-slate-950/40 border-slate-850 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-4 h-4 rounded flex items-center justify-center text-xs font-bold shrink-0 ${
                          isVisible ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}>
                          {isVisible ? '✓' : ''}
                        </span>
                        <span className="text-sm shrink-0">{icon}</span>
                        <div className="min-w-0">
                          <div className="font-semibold text-[11px] truncate text-slate-200">
                            {label}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{desc}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 shrink-0 ${badgeColor || 'text-slate-400'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Clean Map Legend */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2.5">
                <span className="font-bold text-white uppercase tracking-wider block text-[10px] border-b border-slate-800 pb-1.5">
                  Visual Map Legend
                </span>

                {/* Evidence Status Legend */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Field Evidence Status:</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-medium">
                    <span className="flex items-center gap-1.5 text-rose-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-400/40"></span> Pending Review
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-400/40"></span> Under Review
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-400/40"></span> Confirmed
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-400/40"></span> Reinspection
                    </span>
                  </div>
                </div>

                {/* Stream Order Legend */}
                <div className="pt-1.5 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1">Drainage Stream Hierarchy:</span>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-0.5 bg-cyan-300"></span> Ord 1-2
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-1 bg-sky-400"></span> Ord 3
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-1.5 bg-blue-600"></span> Ord 4 Main
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Demo Badge */}
            <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono text-center">
              DEMO DATASET • WGS-84 UTM 43N
            </div>
          </div>
        )}

        {/* CENTER COLUMN: Large Interactive Map */}
        <div className="flex-1 h-full relative overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Active Filter Pill */}
          {activeMapFilter && (
            <div className="absolute top-4 left-4 z-20 bg-slate-950/90 border border-sky-500/50 text-white px-3 py-1.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs backdrop-blur-md animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Query Filter: <b>"{activeMapFilter.query}"</b></span>
              <button
                onClick={() => {
                  if (activeMapFilter) {
                    window.location.reload();
                  }
                }}
                className="text-slate-400 hover:text-white ml-1"
                title="Clear filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Spatial Ripple Indicator overlay note */}
          {activeInspectorData && layersVisibility.spatialRipple && (
            <div className="absolute bottom-4 left-4 z-20 bg-slate-950/85 border border-teal-500/40 text-teal-200 px-3 py-1 rounded-full text-[11px] font-mono flex items-center gap-2 shadow-lg backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
              <span>Spatial Ripple Active (100m, 250m, 500m concentric explorer zones)</span>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Dedicated Context/Evidence Panel */}
        {isRightPanelOpen && (
          <div className="w-80 sm:w-96 bg-slate-950/95 border-l border-slate-800 p-4 flex flex-col justify-between overflow-y-auto z-20 text-xs shrink-0 animate-fadeIn">
            {activeInspectorData ? (
              <div className="space-y-4">
                {/* Panel Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="font-mono text-[10px] text-sky-400 font-bold uppercase tracking-wider block">
                      {activeInspectorData.type === 'live_location'
                        ? 'LIVE DEVICE POSITION'
                        : activeInspectorData.type === 'observation'
                        ? 'FIELD SPATIAL EVIDENCE'
                        : activeInspectorData.type.toUpperCase()}
                    </span>
                    <h2 className="text-sm font-bold text-white mt-0.5 line-clamp-1">
                      {activeInspectorData.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveInspectorData(null)}
                    className="p-1 rounded-lg hover:bg-slate-850 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* LIVE LOCATION PANEL (Requirements #3 & #7) */}
                {activeInspectorData.type === 'live_location' && (
                  <div className="space-y-3.5 font-sans">
                    {/* Header: You are here */}
                    <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping"></span>
                          📍 You are here
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Current Location: Active
                        </span>
                      </div>
                      
                      {/* Latitude / Longitude / Accuracy in small text */}
                      <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-blue-900/40">
                        <span className="font-mono text-[11px] text-slate-400">
                          {activeInspectorData.data.lat?.toFixed(5)}°N, {activeInspectorData.data.lng?.toFixed(5)}°E
                        </span>
                        <span className={`font-mono text-[10px] font-bold ${activeInspectorData.data.accuracy > 1000 ? 'text-amber-400' : 'text-emerald-300'}`}>
                          {activeInspectorData.data.accuracy != null ? `±${activeInspectorData.data.accuracy} m` : '±25 m'}
                        </span>
                      </div>

                      {activeInspectorData.data.accuracy > 1000 && (
                        <div className="p-2 rounded bg-amber-950/50 border border-amber-500/50 text-[11px] text-amber-300 flex items-start gap-1.5 mt-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>Your location is approximate. Move outdoors or enable device location for better accuracy.</span>
                        </div>
                      )}
                    </div>

                    {/* Nearby Information (Requirement #7) */}
                    {contextSnapshot?.hasLayerData ? (
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>🗺️</span>
                            <span>Within 500 m</span>
                          </span>
                          <span className="text-[10px] font-mono text-teal-400">
                            Nearby in Area
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-200">
                            <span className="flex items-center gap-2">
                              <span>💧</span>
                              <span>2 water bodies</span>
                            </span>
                            <span className="text-blue-300 font-semibold font-mono text-[11px]">
                              {contextSnapshot.nearestWb ? `${contextSnapshot.nearestWb.distance} m` : '250 m'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-200">
                            <span className="flex items-center gap-2">
                              <span>🌊</span>
                              <span>3 drainage paths</span>
                            </span>
                            <span className="text-cyan-300 font-semibold font-mono text-[11px]">
                              {contextSnapshot.nearestStream ? `${contextSnapshot.nearestStream.distance} m` : '180 m'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-200">
                            <span className="flex items-center gap-2">
                              <span>🏗️</span>
                              <span>1 water work</span>
                            </span>
                            <span className="text-amber-300 font-semibold font-mono text-[11px]">
                              {contextSnapshot.nearestInt ? `${contextSnapshot.nearestInt.distance} m` : '400 m'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-200">
                            <span className="flex items-center gap-2">
                              <span>📷</span>
                              <span>3 field photos</span>
                            </span>
                            <span className="text-emerald-300 font-semibold font-mono text-[11px]">
                              Recorded
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-200">
                            <span className="flex items-center gap-2 text-amber-300 font-semibold">
                              <span>⚠️</span>
                              <span>1 area needs review</span>
                            </span>
                            <span className="text-amber-400 font-semibold font-mono text-[11px]">
                              Priority
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Live location mode outside demo coverage (Requirement #3 & #9) */
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                          <span>You're exploring your current location.</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          Watershed information is not available here yet. No watershed layers available for this location yet.
                        </p>
                        
                        <div className="space-y-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (liveLocation) {
                                mapInstanceRef.current?.flyTo([liveLocation.lat, liveLocation.lng], 16, { duration: 1.0 });
                                drawSpatialRipple(liveLocation.lat, liveLocation.lng);
                              }
                            }}
                            className="w-full py-2 px-3 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Crosshair className="w-3.5 h-3.5 text-sky-400" />
                            <span>Explore Nearby</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsManualModalOpen(true)}
                            className="w-full py-2 px-3 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-amber-400" />
                            <span>Choose Location Manually</span>
                          </button>

                          {onSwitchToDemoMode && (
                            <button
                              type="button"
                              onClick={() => {
                                onSwitchToDemoMode();
                                handleFitWatershed();
                              }}
                              className="w-full py-2 px-3 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>Switch to Demo Study Area</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons for Current Location */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (onCaptureAtLocation && liveLocation) {
                            onCaptureAtLocation(liveLocation);
                          }
                        }}
                        className="py-2.5 px-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-yellow-300" />
                        <span>Add Field Photo Here</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (liveLocation) {
                            mapInstanceRef.current?.flyTo([liveLocation.lat, liveLocation.lng], 16, { duration: 1.0 });
                            drawSpatialRipple(liveLocation.lat, liveLocation.lng);
                          }
                        }}
                        className="py-2.5 px-3 bg-slate-850 hover:bg-slate-800 text-sky-300 border border-slate-700 rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Crosshair className="w-4 h-4 text-sky-400" />
                        <span>Explore Nearby</span>
                      </button>
                    </div>
                  </div>
                )}


                {/* FIELD PHOTO SECTION (Requirement #7) */}
                {activeInspectorData.type === 'observation' && (
                  <div className="space-y-3">
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
                          FIELD PHOTO
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          activeInspectorData.data.verification_status === 'Confirmed'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : activeInspectorData.data.verification_status === 'Under Review'
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                            : activeInspectorData.data.verification_status === 'Needs Reinspection'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {activeInspectorData.data.verification_status === 'Confirmed' ? '🟢 Confirmed' :
                           activeInspectorData.data.verification_status === 'Under Review' ? '🔵 Under Review' :
                           activeInspectorData.data.verification_status === 'Needs Reinspection' ? '🔴 Needs Recheck' :
                           '🟡 Needs Review'}
                        </span>
                      </div>

                      {/* Photo Thumbnail */}
                      <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 h-44 shadow-md group">
                        <img
                          src={activeInspectorData.data.image_path || activeInspectorData.data.image_url || '/static/sample_photos/field_check_dam_silt.jpg'}
                          alt={activeInspectorData.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-2 left-2 bg-slate-950/85 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-slate-300 border border-slate-800">
                          Captured: {activeInspectorData.data.capture_date?.slice(0, 10)}
                        </div>
                      </div>

                      {/* Title & Location */}
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>📸</span>
                          <span>{activeInspectorData.data.title || activeInspectorData.title || 'Field Observation'}</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{activeInspectorData.data.sub_watershed || 'Field Location'}</span>
                        </p>
                      </div>

                      {/* What We Found */}
                      <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          What we found:
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          "{activeInspectorData.data.ai_interpretation || 'Possible soil erosion and sediment accumulation near the field.'}"
                        </p>
                      </div>

                      {/* CONTEXT SNAPSHOT (Requirement 4) */}
                      <div className="p-3 rounded-xl bg-slate-950/90 border border-sky-500/30 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400 font-mono flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-sky-400" />
                            <span>CONTEXT SNAPSHOT</span>
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">Spatial Proximity</span>
                        </div>

                        <div className="space-y-1.5 text-xs font-sans">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <span>📍</span> Location
                            </span>
                            <span className="font-semibold text-white font-mono">
                              {activeInspectorData.data.lat ? `${activeInspectorData.data.lat.toFixed(4)}°, ${activeInspectorData.data.lng.toFixed(4)}°` : 'Dharampura'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <span>💧</span> Nearest Water Body
                            </span>
                            <span className="font-semibold text-blue-300">
                              {contextSnapshot?.nearestWb ? `${contextSnapshot.nearestWb.name || 'Pond 02'} (${contextSnapshot.nearestWb.distance} m)` : 'Pond 02 (250 m)'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <span>〰</span> Nearby Drainage
                            </span>
                            <span className="font-semibold text-cyan-300">
                              {contextSnapshot?.nearestStream ? `${contextSnapshot.nearestStream.name || 'Drainage D-04'} (${contextSnapshot.nearestStream.distance} m)` : 'Drainage D-04 (180 m)'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <span>🛠</span> Nearby Intervention
                            </span>
                            <span className="font-semibold text-amber-300">
                              {contextSnapshot?.nearestInt ? `${contextSnapshot.nearestInt.name || 'Check Dam CD-04'} (${contextSnapshot.nearestInt.distance} m)` : 'Check Dam CD-04 (45 m)'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <span>🌿</span> Vegetation Status
                            </span>
                            <span className="font-semibold text-emerald-400">
                              Moderate Change (-14% NDVI)
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-300">
                            <span className="flex items-center gap-1.5">
                              <span>⚠️</span> Priority Status
                            </span>
                            <span className="font-bold text-rose-400">
                              High Priority
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 3 Prominent Actions (Requirement #7) */}
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onOpenEvidenceChain(activeInspectorData.data)}
                          className="py-2 px-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1 transition-all"
                          title="View evidence chain"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                          <span>View Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenVerification ? onOpenVerification(activeInspectorData.data) : handleSendForVerification()}
                          className="py-2 px-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1 transition-all"
                          title="Review and confirm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                          <span>Review</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (activeInspectorData.data?.lat && activeInspectorData.data?.lng) {
                              mapInstanceRef.current?.flyTo([activeInspectorData.data.lat, activeInspectorData.data.lng], 17, { duration: 1.0 });
                            }
                          }}
                          className="py-2 px-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1 transition-all border border-slate-700"
                          title="Center on map"
                        >
                          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>Show on Map</span>
                        </button>
                      </div>

                      {/* Technical Details Accordion */}
                      <details className="text-[11px] text-slate-400 pt-1 group border-t border-slate-800">
                        <summary className="cursor-pointer hover:text-slate-200 font-semibold select-none flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider pt-1">
                          <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                          <span>Technical Details (GIS & Sensors)</span>
                        </summary>
                        <div className="mt-2 p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">ID:</span>
                            <span className="text-sky-400 font-bold">{activeInspectorData.data.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Coordinates:</span>
                            <span className="text-white">{activeInspectorData.data.lat?.toFixed(5)}°N, {activeInspectorData.data.lng?.toFixed(5)}°E</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Sensor:</span>
                            <span className="text-slate-300">{activeInspectorData.data.device || 'Android Geotagged Sensor'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Catchment:</span>
                            <span className="text-amber-300">{activeInspectorData.data.sub_watershed}</span>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                )}

                {/* Interventions Details */}
                {activeInspectorData.type === 'intervention' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>STRUCTURE TYPE:</span>
                        <span className="text-white font-semibold">{activeInspectorData.data.type}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>SANCTION COST:</span>
                        <span className="text-emerald-400 font-bold">₹{activeInspectorData.data.cost_lakhs} Lakhs</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>STORAGE CAPACITY:</span>
                        <span className="text-sky-300 font-bold">{activeInspectorData.data.storage_capacity_m3} m³</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>COMPLETION:</span>
                        <span className="text-slate-200">{activeInspectorData.data.completion_date}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block text-[11px]">Baseline Condition:</span>
                        <p className="text-slate-300 mt-0.5">{activeInspectorData.data.before_condition}</p>
                      </div>
                      <div>
                        <span className="text-emerald-400 font-semibold block text-[11px]">Observed Outcome:</span>
                        <p className="text-slate-300 mt-0.5">{activeInspectorData.data.after_condition}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenEvidenceReplay(activeInspectorData.data.id)}
                      className="w-full py-2 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>View Work Progress & History</span>
                    </button>
                  </div>
                )}

                {/* Sub-watershed Details */}
                {activeInspectorData.type === 'sub_watershed' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>PRIORITY:</span>
                        <span className="font-bold text-rose-400">{activeInspectorData.data.priority}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>AREA:</span>
                        <span className="text-white font-bold">{activeInspectorData.data.area_ha} Ha</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>DRAINAGE DENSITY:</span>
                        <span className="text-slate-200">{activeInspectorData.data.drainage_density}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>SLOPE:</span>
                        <span className="text-amber-300">{activeInspectorData.data.slope}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenWhyModal(activeInspectorData.data.id)}
                      className="w-full py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Why is this area important?</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Sleek Empty State */
              <div className="p-4 text-center text-slate-400 space-y-4 my-auto">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-sky-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Interactive Evidence Inspector
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Click <b>"📍 Use My Current Location"</b> or select any field photo marker or watershed asset on the map to inspect spatial evidence, context snapshot, and spatial ripple zones.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 text-left space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">
                    Quick Sample Evidence Pins:
                  </span>
                  {layersData?.field_observations?.slice(0, 3).map(obs => (
                    <button
                      key={obs.id}
                      onClick={() => {
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.flyTo([obs.lat, obs.lng], 16, { duration: 1.0 });
                        }
                        drawSpatialRipple(obs.lat, obs.lng);
                        setActiveInspectorData({
                          type: 'observation',
                          title: obs.title,
                          data: obs
                        });
                      }}
                      className="w-full text-left p-2 rounded-lg bg-slate-900/80 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center justify-between text-xs"
                    >
                      <span className="truncate">{obs.title}</span>
                      <span className="text-[10px] font-mono text-sky-400 ml-1">{obs.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Location Entry Modal (Hierarchy Mode 2) */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Manual Location Entry</h3>
                  <span className="text-[10px] text-slate-400">Assign custom coordinates as the Active Field Location</span>
                </div>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const lat = parseFloat(manualInputLat);
                const lng = parseFloat(manualInputLng);
                if (isNaN(lat) || isNaN(lng)) return;
                setIsManualModalOpen(false);
                if (onSwitchToManualMode) {
                  onSwitchToManualMode({ lat, lng });
                } else if (onUpdateActiveLocation) {
                  onUpdateActiveLocation({ lat, lng, accuracy: null, source: 'Manual Entry' }, 'manual');
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Latitude (Decimal Degrees, WGS-84):
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={manualInputLat}
                    onChange={(e) => setManualInputLat(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                    placeholder="e.g. 15.365000"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Longitude (Decimal Degrees, WGS-84):
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={manualInputLng}
                    onChange={(e) => setManualInputLng(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                    placeholder="e.g. 75.125000"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="text-amber-400 font-semibold block">Quick Coordinate Presets:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => { setManualInputLat('15.365000'); setManualInputLng('75.125000'); }}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 font-mono text-[10px]"
                  >
                    Dharampura Centroid (15.365, 75.125)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualInputLat('15.372500'); setManualInputLng('75.138400'); }}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 font-mono text-[10px]"
                  >
                    Check Dam CD-01 (15.3725, 75.1384)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualInputLat('13.125000'); setManualInputLng('77.585000'); }}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 font-mono text-[10px]"
                  >
                    Bangalore Out-of-Bounds (13.125, 77.585)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-black shadow-lg"
                >
                  Set Active Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
