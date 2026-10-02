import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Home, 
  Map, 
  Camera, 
  History, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Activity, 
  Sparkles, 
  Search, 
  AlertTriangle, 
  Droplets, 
  Database, 
  ListCheck, 
  Maximize2, 
  X,
  Play,
  CheckSquare,
  Square,
  FileCheck,
  TrendingUp,
  Sliders,
  ChevronRight,
  UserCheck,
  Radio,
  Eye
} from 'lucide-react';
import CaseDetailsDrawer from './CaseDetailsDrawer';
import DemoStoryModal from './DemoStoryModal';
import QuickVerifyModal from './QuickVerifyModal';
import VerifyFieldEvidenceModal from './VerifyFieldEvidenceModal';
import SIHDemoController from './SIHDemoController';

export default function Overview({ 
  overviewData, 
  layersData,
  setActiveTab, 
  onSelectZone, 
  onSelectObservation,
  onOpenWhyModal,
  onOpenEvidenceReplay,
  onOpenEvidenceChain,
  onOpenScenarioPlanner,
  onOpenAskWatershed,
  onOpenDigitalTwinStatus,
  activeLocationMode = 'live_gps',
  activeLocation = null,
  onUseCurrentLocation,
  onSwitchToDemoMode,
  onSwitchToLiveMode,
  onShowToast,
  isSihDemoRunningProp,
  onStopSihDemo
}) {
  // Case Details Drawer State (Requirements 2, 3, 8, 9, 10)
  const [selectedCase, setSelectedCase] = useState(null);
  const [isDemoStoryOpen, setIsDemoStoryOpen] = useState(false);
  
  // Verification Modal State (Requirements 6 & 7)
  const [verifyModalItem, setVerifyModalItem] = useState(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verificationCompleteData, setVerificationCompleteData] = useState(null);

  // Primary SIH Demo Workflow State (Requirement 13)
  const [isSihDemoActive, setIsSihDemoActive] = useState(false);
  const [sihDemoStep, setSihDemoStep] = useState(0);

  useEffect(() => {
    if (isSihDemoRunningProp) {
      setIsSihDemoActive(true);
      setSihDemoStep(0);
      handleTriggerSihDemoStep({ step: 0 });
    }
  }, [isSihDemoRunningProp]);

  // In-Map Context Snapshot State (Requirements 4 & 5)
  const [contextSnapshot, setContextSnapshot] = useState(null);

  // Map state
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupsRef = useRef({
    subWatersheds: null,
    drainage: null,
    waterBodies: null,
    interventions: null,
    observations: null,
    highlight: null,
    liveLocation: null
  });
  const basemapLayersRef = useRef({});

  const [currentBasemap, setCurrentBasemap] = useState('satellite');
  const [showLayersMenu, setShowLayersMenu] = useState(false);

  // Requirement 1: Make Map Cleaner — Hide Drainage & secondary boundaries by default
  const [layerVisibility, setLayerVisibility] = useState({
    subWatersheds: true,
    drainage: false, // Hidden by default per Requirement 1
    waterBodies: true,
    interventions: true,
    observations: true
  });

  // Timeline slider for Case CD-04 Replay (Requirement 7: BASELINE -> INTERVENTION -> FOLLOW-UP -> CURRENT)
  const [replaySliderVal, setReplaySliderVal] = useState(3);

  // Attention Queue Items (Requirements 1, 4, 5, 8)
  const [attentionQueue, setAttentionQueue] = useState([
    {
      id: 'ZONE-1A',
      caseId: 'CASE EVD-004',
      caseNumber: 'EVD-004',
      problem: 'Soil Erosion',
      title: 'SOIL EROSION',
      subtitle: 'Check Dam CD-04',
      observation: 'Soil Erosion',
      priorityBadge: '🔴 HIGH PRIORITY',
      priority: 'High',
      badgeColor: 'rose',
      caseStatus: 'PENDING VERIFICATION',
      status: 'PENDING VERIFICATION',
      verificationStatus: 'PENDING VERIFICATION',
      why: 'Field evidence detected + nearby drainage D-04 + Check Dam CD-04 context',
      whyItWasFlagged: 'Field evidence detected + nearby drainage D-04 + Check Dam CD-04 context',
      supportingEvidence: 'GeoLens EXIF (1.1m sediment depth), Sentinel-2 change (-14.2%)',
      recommendedFieldAction: 'Mechanical de-siltation of CD-04 basin & boulder apron reinforcement',
      nextStep: 'Field verification required',
      actionLabel: 'Verify',
      lat: 15.4038,
      lng: 75.1049,
      distanceToDrainage: 'D-04 (Order-2 Stream Channel, 180m)',
      distanceToIntervention: 'Check Dam CD-04 (Adjacent)',
      distanceToWater: 'Pond PB-02 (220m)',
      priorityZone: 'Zone 1A (High Priority)',
      historicalObservation: '-14.2% canopy drop since 2021',
      soilSlope: 'Gravelly loam • 8.5% slope',
      date: 'Today, 14:22 IST',
      image_path: '/static/sample_photos/field_check_dam_silt.jpg'
    },
    {
      id: 'ZONE-1C',
      caseId: 'CASE EVD-005',
      caseNumber: 'EVD-005',
      problem: 'Pond Condition (Bund Seepage)',
      title: 'POND CONDITION',
      subtitle: 'PB-02 Reservoir',
      observation: 'Pond Bund Seepage',
      priorityBadge: '🟠 REVIEW',
      priority: 'Medium',
      badgeColor: 'amber',
      caseStatus: 'UNDER REVIEW',
      status: 'UNDER REVIEW',
      verificationStatus: 'UNDER REVIEW',
      why: 'Observed change & water extent reduction require verification',
      whyItWasFlagged: 'Observed change & water extent reduction require verification',
      supportingEvidence: 'Field inspection photograph, water body surface reduction telemetry',
      recommendedFieldAction: 'Wing-wall foundation audit & clay core compaction',
      nextStep: 'Review field evidence',
      actionLabel: 'Verify',
      lat: 15.3478,
      lng: 75.0882,
      distanceToDrainage: 'Kalyana Stream Confluence (40m)',
      distanceToIntervention: 'Check Dam CD-03 (120m)',
      distanceToWater: 'PB-02 Impoundment Basin',
      priorityZone: 'Zone 1C (Medium Priority)',
      historicalObservation: 'Seasonal surface water contraction (-8%)',
      soilSlope: 'Clayey loam • 3.2% slope',
      date: 'Today, 11:05 IST',
      image_path: '/static/sample_photos/field_leaking_bund.jpg'
    },
    {
      id: 'ZONE-1D',
      caseId: 'CASE EVD-006',
      caseNumber: 'EVD-006',
      problem: 'Contour Trench Siltation',
      title: 'CONTOUR TRENCH',
      subtitle: 'CT-03',
      observation: 'Contour Trench Siltation',
      priorityBadge: '🟡 REINSPECT',
      priority: 'Medium',
      badgeColor: 'yellow',
      caseStatus: 'PENDING REINSPECTION',
      status: 'PENDING REINSPECTION',
      verificationStatus: 'PENDING REINSPECTION',
      why: 'Sediment trap filled; verification required before monsoon',
      whyItWasFlagged: 'Sediment trap filled; verification required before monsoon',
      supportingEvidence: 'Drone survey elevation change & berm silt profile',
      recommendedFieldAction: 'Berm clearance & moisture trap volume re-measurement',
      nextStep: 'Field reinspection',
      actionLabel: 'Verify',
      lat: 15.3584,
      lng: 75.1418,
      distanceToDrainage: 'Ridge Runoff Divide (240m)',
      distanceToIntervention: 'Contour Trench CT-03 Unit',
      distanceToWater: 'Farm Pond FP-02 (310m)',
      priorityZone: 'Zone 1D (Medium Priority)',
      historicalObservation: '+18% soil moisture retention post-rain',
      soilSlope: 'Sandy clay loam • 6.2% slope',
      date: 'Yesterday, 16:40 IST',
      image_path: '/static/sample_photos/field_cct_trenches.jpg'
    }
  ]);

  // My Tasks list (Requirement 13)
  const [tasks, setTasks] = useState([
    { id: 'TASK-1', caseRef: 'ZONE-1A', title: 'Verify Check Dam CD-04', desc: 'Audit 1.1m sediment depth & left abutment', done: false },
    { id: 'TASK-2', caseRef: 'ZONE-1C', title: 'Inspect Pond PB-02', desc: 'Check wing wall foundation for bypass seepage', done: false },
    { id: 'TASK-3', caseRef: 'ZONE-1D', title: 'Reinspect Contour Trench CT-03', desc: 'Field measure berm moisture trap volume', done: false }
  ]);

  // Verification Queue (Requirement 14)
  const [verificationQueue, setVerificationQueue] = useState([
    { id: 'EVD-004', title: 'Soil Erosion', status: 'UNDER REVIEW', location: 'Check Dam CD-04', lat: 15.4038, lng: 75.1049 },
    { id: 'EVD-005', title: 'Pond Condition', status: 'CONFIRMED', location: 'Pond PB-02', lat: 15.3478, lng: 75.0882 },
    { id: 'EVD-006', title: 'Contour Trench', status: 'NEEDS REINSPECTION', location: 'Trench CT-03', lat: 15.3584, lng: 75.1418 }
  ]);

  // Activity Feed (Requirement 15)
  const [activities, setActivities] = useState([
    { id: 'ACT-1', text: 'Evidence EVD-004 added', time: '2 min ago', tag: 'Field Photo' },
    { id: 'ACT-2', text: 'Check Dam CD-04 verified', time: '18 min ago', tag: 'Inspection' },
    { id: 'ACT-3', text: 'Pond PB-02 marked for review', time: '1 hr ago', tag: 'Alert' },
    { id: 'ACT-4', text: 'Sentinel-2 prototype variance ingested', time: '4 hr ago', tag: 'Analysis' }
  ]);

  // Requirement 7: Watershed Time Machine / Change Replay (BASELINE -> INTERVENTION -> FOLLOW-UP -> CURRENT)
  const replayTimeline = [
    { 
      stage: 'BASELINE', 
      year: '2019', 
      label: '2019 BASELINE: Severe Scouring', 
      desc: 'Pre-intervention unretrenched runoff causing active gully scouring and topsoil loss across ridge slope.', 
      img: '/static/sample_photos/cd01_2021.jpg',
      veg: 'Sparse scrub (-18% NDVI)',
      water: 'Zero surface retention',
      intervention: 'No structure (Uncontrolled runoff)'
    },
    { 
      stage: 'INTERVENTION', 
      year: '2021-22', 
      label: '2021-22 INTERVENTION: CD-04 Constructed', 
      desc: 'Masonry overflow check dam constructed across 2nd order channel D-04 under WDC-PMKSY scheme.', 
      img: '/static/sample_photos/cd01_2022.jpg',
      veg: 'Construction footprint stabilization',
      water: '1,200 m³ retention capacity created',
      intervention: 'Masonry weir spillway completed'
    },
    { 
      stage: 'FOLLOW-UP', 
      year: '2024', 
      label: '2024 FOLLOW-UP: Vegetative Greening & Storage', 
      desc: 'Sentinel-2 monitoring evidence indicates +14.2% canopy recovery downstream and seasonal pond recharge.', 
      img: '/static/sample_photos/cd01_2024.jpg',
      veg: 'Canopy greening (+14.2% NDVI)',
      water: 'Full pond storage recharge',
      intervention: 'Structure intact & actively impounding'
    },
    { 
      stage: 'CURRENT', 
      year: 'CURRENT', 
      label: 'CURRENT: GeoLens Siltation & Scour Alert', 
      desc: 'Field audit detects 1.1m sediment bed and weir scouring; logged into attention queue for human verification.', 
      img: '/static/sample_photos/field_check_dam_silt.jpg',
      veg: 'Localized sediment stress',
      water: '68% capacity loss from siltation',
      intervention: 'Requires de-siltation & verify'
    }
  ];

  const currentReplay = replayTimeline[replaySliderVal] || replayTimeline[3];

  // Device Location check vs Demo Study Area (Requirement 2)
  const deviceLat = activeLocation?.lat || 13.1683;
  const deviceLng = activeLocation?.lng || 77.5353;
  const deviceAccuracy = activeLocation?.accuracy || 500;
  // Dharampura is approx 15.365°N, 75.125°E. If device is far from Dharampura:
  const isOutsideDemoArea = Math.abs(deviceLat - 15.365) > 0.4 || Math.abs(deviceLng - 75.125) > 0.4;

  // Initialize Embedded Leaflet Map (Requirement 1 & 5)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [15.365, 75.125],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Basemaps
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    );
    const darkLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 19 }
    );
    const streetLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 19 }
    );

    basemapLayersRef.current = {
      satellite: satelliteLayer,
      dark: darkLayer,
      street: streetLayer
    };

    satelliteLayer.addTo(map);

    // Layer Groups
    layerGroupsRef.current.subWatersheds = L.layerGroup().addTo(map);
    layerGroupsRef.current.drainage = L.layerGroup().addTo(map);
    layerGroupsRef.current.waterBodies = L.layerGroup().addTo(map);
    layerGroupsRef.current.interventions = L.layerGroup().addTo(map);
    layerGroupsRef.current.observations = L.layerGroup().addTo(map);
    layerGroupsRef.current.highlight = L.layerGroup().addTo(map);
    layerGroupsRef.current.liveLocation = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Synchronize Map Position when activeLocationMode changes (Requirements 4, 8 & 9)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (activeLocationMode === 'live_gps') {
      map.flyTo([deviceLat, deviceLng], 15, { duration: 1.0 });
    } else {
      map.flyToBounds([[15.320, 75.060], [15.420, 75.190]], { duration: 1.0 });
    }
  }, [activeLocationMode]);

  // Update Basemap
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    Object.values(basemapLayersRef.current).forEach(layer => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });
    if (basemapLayersRef.current[currentBasemap]) {
      basemapLayersRef.current[currentBasemap].addTo(map);
      basemapLayersRef.current[currentBasemap].bringToBack();
    }
  }, [currentBasemap]);

  // Render Clean Operational GIS Layers (Requirements 1, 8 & 9)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const groups = layerGroupsRef.current;

    groups.subWatersheds.clearLayers();
    groups.drainage.clearLayers();
    groups.waterBodies.clearLayers();
    groups.interventions.clearLayers();
    groups.observations.clearLayers();
    if (groups.liveLocation) groups.liveLocation.clearLayers();

    // 1. Drainage (〰 Drainage Channels — Hidden by default, clean when toggled)
    if (layerVisibility.drainage && layersData?.drainage?.features) {
      L.geoJSON(layersData.drainage, {
        style: (feat) => ({
          color: '#38bdf8',
          weight: feat.properties?.order >= 3 ? 2.5 : 1.5,
          opacity: 0.75
        })
      }).addTo(groups.drainage);
    }

    // 2. Water Bodies (💧 Water Bodies)
    if (layerVisibility.waterBodies && layersData?.water_bodies?.features) {
      L.geoJSON(layersData.water_bodies, {
        style: () => ({
          color: '#0284c7',
          weight: 1.5,
          fillColor: '#0ea5e9',
          fillOpacity: 0.45
        })
      }).addTo(groups.waterBodies);
    }

    // 3. Sub-watershed Zones (🔴 Priority Areas — Subtle borders)
    if (layerVisibility.subWatersheds && layersData?.sub_watersheds?.features) {
      L.geoJSON(layersData.sub_watersheds, {
        style: (feat) => {
          const isHigh = feat.properties?.priority === 'High' || feat.properties?.priority === 'HIGH';
          return {
            color: isHigh ? '#f43f5e' : '#f59e0b',
            weight: 1.5,
            dashArray: '3, 3',
            fillColor: isHigh ? '#f43f5e' : '#f59e0b',
            fillOpacity: 0.08
          };
        }
      }).addTo(groups.subWatersheds);
    }

    // 4. Interventions (🛠 Interventions)
    if (layerVisibility.interventions) {
      const interventions = layersData?.interventions || [
        { id: 'INT-CD-01', name: 'Check Dam CD-01', latitude: 15.4038, longitude: 75.1049, type: 'Check Dam' },
        { id: 'INT-CT-03', name: 'Contour Trench CT-03', latitude: 15.3584, longitude: 75.1418, type: 'Contour Trench' },
        { id: 'INT-FP-02', name: 'Farm Pond FP-02', latitude: 15.3478, longitude: 75.0882, type: 'Farm Pond' }
      ];

      interventions.forEach(item => {
        if (!item.latitude || !item.longitude) return;
        const icon = L.divIcon({
          className: 'custom-tool-marker',
          html: `<div style="background:#10b981; color:white; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; border:2px solid white; box-shadow:0 0 6px rgba(16,185,129,0.7); cursor:pointer;">🛠️</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        const m = L.marker([item.latitude, item.longitude], { icon });
        m.on('click', () => {
          const matched = attentionQueue.find(a => a.id === item.id || a.subtitle.includes(item.name)) || {
            id: item.id,
            caseId: `CASE-${item.id}`,
            caseNumber: item.id,
            title: item.name || 'Watershed Intervention',
            subtitle: item.type || 'Conservation Structure',
            priorityBadge: '🟢 MONITORED',
            caseStatus: 'VERIFIED',
            status: 'VERIFIED',
            why: 'PMKSY-WDC 2.0 watershed intervention record.',
            nextStep: 'Routine monitoring',
            lat: item.latitude,
            lng: item.longitude,
            distanceToDrainage: 'Situated across order 2 drainage path',
            distanceToIntervention: 'Primary structure',
            distanceToWater: 'Near upstream storage basin',
            soilSlope: 'Boulder apron silt trap',
            image_path: '/static/sample_photos/cd01_2024.jpg'
          };
          handleMapCaseClick(matched);
        });
        m.addTo(groups.interventions);
      });
    }

    // 5. Attention Priority Markers (📍 Priority, Evidence & Verification Status)
    attentionQueue.forEach(att => {
      const isConfirmed = att.status === 'CONFIRMED' || att.caseStatus === 'CONFIRMED';
      const isReinspect = att.status === 'NEEDS REINSPECTION';
      const isRose = att.badgeColor === 'rose' && !isConfirmed && !isReinspect;
      
      const bgColor = isConfirmed ? '#10b981' : isReinspect ? '#a855f7' : isRose ? '#ef4444' : '#f59e0b';
      const glowColor = isConfirmed ? 'rgba(16,185,129,0.8)' : isReinspect ? 'rgba(168,85,247,0.8)' : isRose ? 'rgba(239,68,68,0.8)' : 'rgba(245,158,11,0.8)';
      const markerSymbol = isConfirmed ? '✓' : isReinspect ? '↻' : isRose ? '⚠️' : '📍';

      const icon = L.divIcon({
        className: 'custom-attention-marker',
        html: `<div style="background:${bgColor}; color:white; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; border:2px solid white; box-shadow:0 0 10px ${glowColor}; cursor:pointer;">${markerSymbol}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const m = L.marker([att.lat, att.lng], { icon });
      m.on('click', () => {
        handleMapCaseClick(att);
      });
      m.addTo(groups.observations);
    });

    // 6. Distinct Live Device Location Marker (Requirement 8: 📍 YOU ARE HERE)
    if (groups.liveLocation && activeLocationMode === 'live_gps') {
      const youAreHereIcon = L.divIcon({
        className: 'custom-you-are-here-marker',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <span style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: #0284c7; opacity: 0.6; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="position: absolute; top: -20px; white-space: nowrap; background: #0284c7; color: white; font-weight: 800; font-family: monospace; font-size: 9px; padding: 2px 6px; border-radius: 9999px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 1px solid #7dd3fc;">
              📍 YOU ARE HERE
            </div>
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #0284c7; border: 2.5px solid white; box-shadow: 0 0 10px #38bdf8; display: flex; align-items: center; justify-content: center; font-size: 11px; color: white; font-weight: bold; z-index: 10;">
              📍
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      L.marker([deviceLat, deviceLng], { icon: youAreHereIcon })
        .bindPopup(`
          <div style="font-family: monospace; font-size: 11px; padding: 2px;">
            <b style="color: #0284c7;">📍 YOU ARE HERE</b><br/>
            <b>Device Location:</b> ${deviceLat.toFixed(5)}°N, ${deviceLng.toFixed(5)}°E<br/>
            <b>Accuracy:</b> ±${deviceAccuracy}m<br/>
            <span style="color: #64748b; font-size: 10px;">Device GPS Position</span>
          </div>
        `)
        .addTo(groups.liveLocation);

      L.circle([deviceLat, deviceLng], {
        radius: Math.max(deviceAccuracy, 50),
        color: '#38bdf8',
        fillColor: '#38bdf8',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '3, 4'
      }).addTo(groups.liveLocation);
    }

  }, [layersData, layerVisibility, attentionQueue, activeLocationMode, deviceLat, deviceLng, deviceAccuracy]);

  // Requirement 4: MAP INTERACTION (Center, zoom, highlight with subtle pulse, show nearby spatial features, open Context Snapshot)
  const handleMapCaseClick = (item) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    
    // 1. Center & Zoom appropriately
    map.flyTo([item.lat, item.lng], 16, { duration: 1.0 });

    // 2. Ensure nearby spatial features are visible (Requirement 4)
    setLayerVisibility(prev => ({
      ...prev,
      waterBodies: true,
      interventions: true,
      drainage: true
    }));

    // 3. Highlight selected evidence marker with pulsing effect (Requirement 4)
    const hlGroup = layerGroupsRef.current.highlight;
    if (hlGroup) {
      hlGroup.clearLayers();

      const pulseIcon = L.divIcon({
        className: 'case-pulse-marker',
        html: `
          <div style="position: relative; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center;">
            <span style="position: absolute; width: 52px; height: 52px; border-radius: 50%; background: #38bdf8; opacity: 0.5; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <span style="position: absolute; width: 34px; height: 34px; border-radius: 50%; border: 2.5px solid #38bdf8; opacity: 0.9; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></span>
            <div style="width: 14px; height: 14px; border-radius: 50%; background: #0284c7; border: 2px solid white; box-shadow: 0 0 10px #38bdf8;"></div>
          </div>
        `,
        iconSize: [56, 56],
        iconAnchor: [28, 28]
      });

      L.marker([item.lat, item.lng], { icon: pulseIcon }).addTo(hlGroup);

      // Requirement 9: Interactive Exploration Radius labeled as visual proximity reference (not a scientific threshold)
      const explorationCircle = L.circle([item.lat, item.lng], {
        radius: 250,
        color: '#38bdf8',
        fillColor: '#38bdf8',
        fillOpacity: 0.16,
        weight: 1.5,
        dashArray: '3, 4'
      });

      explorationCircle.bindTooltip(`
        <div style="font-family: monospace; font-size: 10px; font-weight: bold; color: #0284c7; background: rgba(15,23,42,0.95); padding: 3px 6px; border-radius: 6px; border: 1px solid #38bdf8; box-shadow: 0 4px 6px rgba(0,0,0,0.4);">
          ⭕ Exploration Radius (250m) — Visual proximity reference, not a scientific cutoff
        </div>
      `, { permanent: true, direction: 'top', className: 'exploration-radius-tooltip', opacity: 0.95 });

      explorationCircle.addTo(hlGroup);

      setTimeout(() => {
        if (hlGroup) hlGroup.clearLayers();
      }, 9000);
    }

    // 4. Open in-map Context Snapshot (Requirement 4 & 5)
    setContextSnapshot(item);
  };

  const handleFitArea = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyToBounds(
      [[15.320, 75.060], [15.420, 75.190]],
      { duration: 0.9 }
    );
  };

  const handleFocusLiveLocation = () => {
    if (onSwitchToLiveMode) onSwitchToLiveMode();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([deviceLat, deviceLng], 15, { duration: 1.0 });
    }
  };

  const handleFocusDemoArea = () => {
    if (onSwitchToDemoMode) onSwitchToDemoMode();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyToBounds(
        [[15.320, 75.060], [15.420, 75.190]],
        { duration: 1.0 }
      );
    }
  };

  // Requirement 6: Open Verification Dialog
  const handleOpenVerifyModal = (item) => {
    setVerifyModalItem(item);
    setIsVerifyModalOpen(true);
  };

  // Requirement 7: STATUS UPDATE (Confirmed vs Needs Reinspection)
  const handleSaveVerification = ({ caseItem, result, note }) => {
    const isConfirmed = result === 'CONFIRMED';
    const newStatus = isConfirmed ? 'CONFIRMED' : 'NEEDS REINSPECTION';
    const newPriorityBadge = isConfirmed ? '🟢 CONFIRMED' : '🟣 REINSPECT';
    const newBadgeColor = isConfirmed ? 'emerald' : 'purple';
    const caseNum = caseItem.caseNumber || caseItem.caseId?.replace('CASE ', '') || 'EVD-004';

    // 1. Update Attention Queue (Section 7)
    setAttentionQueue(prev => prev.map(c => {
      const match = c.caseNumber === caseNum || c.id === caseItem.id || c.caseId === caseItem.caseId;
      if (match) {
        return {
          ...c,
          status: newStatus,
          caseStatus: newStatus,
          priorityBadge: newPriorityBadge,
          badgeColor: newBadgeColor
        };
      }
      return c;
    }));

    // 2. Update Verification Queue list
    setVerificationQueue(prev => prev.map(v => {
      if (v.id === caseNum || v.id === caseItem.id?.replace('ZONE-', 'EVD-00')) {
        return { ...v, status: newStatus };
      }
      return v;
    }));

    // 3. Update Activity Feed per Requirement 7
    const activityText = isConfirmed 
      ? `${caseNum} confirmed by field verification.`
      : `${caseNum} requires reinspection.`;

    setActivities(prev => [
      {
        id: `ACT-${Date.now()}`,
        text: activityText,
        time: 'Just now',
        tag: isConfirmed ? 'Confirmed' : 'Reinspection'
      },
      ...prev
    ]);

    // 4. Update selectedCase if drawer was open
    if (selectedCase && (selectedCase.caseNumber === caseNum || selectedCase.id === caseItem.id)) {
      setSelectedCase(prev => ({
        ...prev,
        status: newStatus,
        caseStatus: newStatus,
        priorityBadge: newPriorityBadge,
        badgeColor: newBadgeColor
      }));
    }

    // 5. Update contextSnapshot if open
    if (contextSnapshot && (contextSnapshot.caseNumber === caseNum || contextSnapshot.id === caseItem.id)) {
      setContextSnapshot(prev => ({
        ...prev,
        status: newStatus,
        caseStatus: newStatus,
        priorityBadge: newPriorityBadge
      }));
    }

    // 6. Show toast
    if (onShowToast) {
      onShowToast(activityText);
    }

    // 7. Trigger Celebration Banner for SIH presentation
    setVerificationCompleteData({
      caseNumber: caseNum,
      title: caseItem.title,
      status: newStatus,
      note,
      isConfirmed
    });
  };

  // Requirement 13: PRIMARY SIH DEMO Step Action Handler
  const handleTriggerSihDemoStep = (stepObj) => {
    const evd004 = attentionQueue[0];
    if (!evd004) return;

    switch (stepObj.step) {
      case 0:
      case 1:
        // Operations Center / Attention Queue focus
        setSelectedCase(null);
        setContextSnapshot(null);
        setIsVerifyModalOpen(false);
        break;
      case 2:
      case 3:
        // Click Soil Erosion -> Open Case Drawer showing Why panel
        setSelectedCase(evd004);
        setContextSnapshot(null);
        setIsVerifyModalOpen(false);
        break;
      case 4:
      case 5:
        // Click Map -> Close drawer, center map on CD-04, pulse, show Context Snapshot
        setSelectedCase(null);
        setIsVerifyModalOpen(false);
        handleMapCaseClick(evd004);
        break;
      case 6:
        // View Field Evidence in Drawer
        setContextSnapshot(null);
        setSelectedCase(evd004);
        setIsVerifyModalOpen(false);
        break;
      case 7:
        // Click Verify -> Open Verification Modal
        setSelectedCase(null);
        setContextSnapshot(null);
        handleOpenVerifyModal(evd004);
        break;
      case 8:
      case 9:
        // Select Confirmed & Update Case Status
        setIsVerifyModalOpen(false);
        handleSaveVerification({
          caseItem: evd004,
          result: 'CONFIRMED',
          note: 'Field evidence confirmed by Assistant Executive Engineer. Silt depth 1.1m and embankment scour verified on ground.'
        });
        break;
      case 10:
        // Verification Complete Celebration
        setVerificationCompleteData({
          caseNumber: 'EVD-004',
          title: 'SOIL EROSION',
          status: 'CONFIRMED',
          note: 'Field evidence confirmed by Assistant Executive Engineer. Silt depth 1.1m and embankment scour verified on ground.',
          isConfirmed: true
        });
        break;
      default:
        break;
    }
  };

  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      const match = attentionQueue.find(a => a.id === targetTask.caseRef);
      if (match) handleMapCaseClick(match);
    }
  };

  return (
    <div className="space-y-4 pb-16 animate-fadeIn font-sans text-slate-100 select-none">
      
      {/* ================================================== */}
      {/* 0. FIELD-TO-OFFICE WATERSHED WORKFLOW (Requirement 10) */}
      {/* ================================================== */}
      <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-extrabold text-white text-xs tracking-wider uppercase">
            FIELD-TO-OFFICE WORKFLOW:
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {/* Role 1: FIELD USER */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-teal-500/40 text-teal-300 text-[11px] shadow-sm">
            <span className="font-black text-white px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300">📱 FIELD USER:</span>
            <span>Capture</span>
            <span className="text-teal-400 font-bold">➔</span>
            <span>Geo-location</span>
            <span className="text-teal-400 font-bold">➔</span>
            <span>Evidence</span>
          </div>

          {/* Role 2: SUPERVISOR */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-sky-500/40 text-sky-300 text-[11px] shadow-sm">
            <span className="font-black text-white px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300">🏢 SUPERVISOR:</span>
            <span>Review</span>
            <span className="text-sky-400 font-bold">➔</span>
            <span>Spatial Context</span>
            <span className="text-sky-400 font-bold">➔</span>
            <span>WHY?</span>
            <span className="text-sky-400 font-bold">➔</span>
            <span>Verify</span>
            <span className="text-sky-400 font-bold">➔</span>
            <span>Action</span>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 1. SEPARATE LIVE GPS VS DEMO STUDY AREA (Requirements 2, 3 & 4) */}
      {/* ================================================== */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          
          {/* Side A: LIVE GPS Device Location */}
          <div className={`p-3 rounded-xl bg-slate-950 border transition-all flex-1 ${
            activeLocationMode === 'live_gps' ? 'border-emerald-500/50 ring-1 ring-emerald-500/30' : 'border-slate-800 opacity-90'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-bold text-slate-300 uppercase text-[10px] flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${activeLocationMode === 'live_gps' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                <span>LIVE GPS</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-400 font-bold">
                Accuracy: ±{deviceAccuracy}m
              </span>
            </div>
            <div className="mt-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">
                CURRENT DEVICE LOCATION
              </span>
              <div className="font-mono text-sm text-white font-bold">
                {deviceLat.toFixed(4)}°N, {deviceLng.toFixed(4)}°E
              </div>
            </div>
          </div>

          {/* Separator / Divider icon */}
          <span className="text-slate-600 hidden lg:inline text-xs font-mono font-bold">VS</span>

          {/* Side B: STUDY AREA Demo Dataset */}
          <div className={`p-3 rounded-xl bg-slate-950 border transition-all flex-1 ${
            activeLocationMode === 'demo' ? 'border-amber-500/50 ring-1 ring-amber-500/30' : 'border-slate-800 opacity-90'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-bold text-amber-400 uppercase text-[10px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>ACTIVE STUDY AREA</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                {activeLocationMode === 'demo' ? '● DEMO MODE ACTIVE' : 'DEMO DATA'}
              </span>
            </div>
            <div className="mt-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase block font-semibold">
                Dharampura Demo Dataset
              </span>
              <div className="font-mono text-sm text-white font-bold flex items-center justify-between">
                <span>Gadag District</span>
                <span className="text-[10px] font-mono text-amber-400/80 font-normal">
                  SIMULATED / PROTOTYPE DATA
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Clear Notice when device GPS is outside the demo area (Requirement 4) */}
        {isOutsideDemoArea && (
          <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Device location is outside the current demo study area.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFocusLiveLocation}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer shadow-sm transition-all"
              >
                USE LIVE LOCATION
              </button>
              <button
                type="button"
                onClick={handleFocusDemoArea}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] cursor-pointer shadow-sm transition-all"
              >
                EXPLORE DEMO STUDY AREA
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* 2. SIMPLE OPERATIONAL STATUS CARDS (Requirements 3 & 4) */}
      {/* ================================================== */}
      <section className="space-y-1.5">
        <div className="flex items-center justify-between text-xs px-1 font-mono">
          <span className="font-bold uppercase tracking-wider text-slate-400 text-[11px] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>WATERSHED STATUS</span>
          </span>
          <span className="text-[10px] text-amber-400 font-bold">
            DEMO DATA ACTIVE
          </span>
        </div>

        {/* 4 Simple Status Cards with PROTOTYPE ANALYSIS badge */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Card 1: VEGETATION */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center gap-1">
                <span>🌿</span> VEGETATION
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
                PROTOTYPE ANALYSIS
              </span>
            </div>
            <div className="mt-2">
              <div className="text-base font-black text-white font-mono uppercase">
                STABLE
              </div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                ↑ 4.2%
              </div>
            </div>
            <div className="mt-1 pt-1.5 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
              <span>Positive vegetation indicator</span>
              <span className="text-[10px] font-mono text-slate-400">NDVI</span>
            </div>
          </div>

          {/* Card 2: WATER */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center gap-1">
                <span>💧</span> WATER
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
                PROTOTYPE ANALYSIS
              </span>
            </div>
            <div className="mt-2">
              <div className="text-base font-black text-amber-300 font-mono uppercase">
                NEEDS REVIEW
              </div>
              <div className="text-sm font-bold text-white font-mono">
                3 areas
              </div>
            </div>
            <div className="mt-1 pt-1.5 border-t border-slate-850 text-[11px] text-slate-400">
              Storage & retention review
            </div>
          </div>

          {/* Card 3: SOIL */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-500/30 hover:border-rose-500/60 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center gap-1">
                <span>🏞</span> SOIL
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
                PROTOTYPE ANALYSIS
              </span>
            </div>
            <div className="mt-2">
              <div className="text-base font-black text-rose-300 font-mono uppercase">
                MODERATE RISK
              </div>
              <div className="text-sm font-bold text-white font-mono">
                4 areas
              </div>
            </div>
            <div className="mt-1 pt-1.5 border-t border-slate-850 text-[11px] text-slate-400">
              Exposed soil & runoff risk
            </div>
          </div>

          {/* Card 4: WORKS */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 hover:border-indigo-500/60 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase font-mono flex items-center gap-1">
                <span>🛠</span> WORKS
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
                PROTOTYPE ANALYSIS
              </span>
            </div>
            <div className="mt-2">
              <div className="text-base font-black text-white font-mono uppercase">
                {12 + attentionQueue.filter(a => a.status === 'CONFIRMED').length} VERIFIED
              </div>
              <div className="text-sm font-bold text-indigo-300 font-mono">
                {attentionQueue.filter(a => a.status !== 'CONFIRMED').length} PENDING
              </div>
            </div>
            <div className="mt-1 pt-1.5 border-t border-slate-850 text-[11px] text-slate-400">
              Conservation structures audited
            </div>
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 3. MAIN WORKSPACE: CLEAN OPERATIONS MAP & ATTENTION QUEUE */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* ================================================== */}
        {/* LEFT (60%): WATERSHED OPERATIONS MAP (Requirements 1, 6, 7 & 8) */}
        {/* ================================================== */}
        <div className="lg:col-span-7 xl:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[460px] sm:min-h-[520px]">
          
          {/* Map Top Bar (Requirement 6) */}
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
            <div className="flex items-center gap-2.5">
              <Map className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-white font-mono">
                    WATERSHED OPERATIONS MAP
                  </span>
                  {activeLocationMode === 'live_gps' ? (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      LIVE DEVICE LOCATION
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      DHARAMPURA DEMO STUDY AREA • DEMO DATA
                    </span>
                  )}
                </div>
                {activeLocationMode === 'live_gps' && isOutsideDemoArea && (
                  <div className="text-[10px] font-mono text-amber-400 font-semibold mt-0.5 flex items-center gap-1">
                    <span>⚠</span>
                    <span>DEVICE LOCATION OUTSIDE DEMO AREA</span>
                  </div>
                )}
              </div>
            </div>

            {/* Map Controls */}
            <div className="flex items-center gap-1.5 relative">
              <button
                type="button"
                onClick={handleFocusLiveLocation}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                title="Focus Device GPS Location"
              >
                <span>⌖ Live GPS</span>
              </button>

              <button
                type="button"
                onClick={handleFocusDemoArea}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] font-mono font-semibold flex items-center gap-1 cursor-pointer"
                title="Fit Demo Study Area"
              >
                <Maximize2 className="w-3 h-3 text-amber-400" />
                <span>Demo Area</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentBasemap(prev => prev === 'satellite' ? 'dark' : prev === 'dark' ? 'street' : 'satellite')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-mono font-semibold capitalize cursor-pointer"
                title="Toggle Basemap"
              >
                {currentBasemap}
              </button>

              <button
                type="button"
                onClick={() => setShowLayersMenu(!showLayersMenu)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-mono font-semibold flex items-center gap-1 cursor-pointer"
                title="Toggle Layers"
              >
                <Layers className="w-3 h-3 text-teal-400" />
                <span>Layers</span>
              </button>

              {/* Layers Popover Menu (Requirement 1) */}
              {showLayersMenu && (
                <div className="absolute right-0 top-9 z-[1001] w-48 bg-slate-900 border border-slate-750 rounded-xl p-3 shadow-2xl space-y-2 text-xs font-mono">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block border-b border-slate-800 pb-1">
                    ACTIVE GIS LAYERS
                  </span>
                  {[
                    { key: 'observations', label: '📍 Field Evidence' },
                    { key: 'waterBodies', label: '💧 Water Bodies' },
                    { key: 'interventions', label: '🛠 Interventions' },
                    { key: 'subWatersheds', label: '🔴 Priority Zones' },
                    { key: 'drainage', label: '〰 Drainage (Secondary)' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center justify-between text-slate-200 cursor-pointer">
                      <span>{label}</span>
                      <input
                        type="checkbox"
                        checked={layerVisibility[key]}
                        onChange={(e) => setLayerVisibility({ ...layerVisibility, [key]: e.target.checked })}
                        className="accent-sky-500 rounded"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Leaflet Container */}
          <div className="relative flex-1 bg-slate-950">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

            {/* In-Map Notice when Live GPS is outside Demo Watershed (Requirement 8) */}
            {activeLocationMode === 'live_gps' && isOutsideDemoArea && (
              <div className="absolute top-3 left-3 z-[1000] p-3 rounded-xl bg-slate-950/95 border border-amber-500/50 shadow-2xl backdrop-blur-md max-w-xs text-xs font-mono space-y-2 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>No demo watershed data is loaded for this location.</span>
                </div>
                <p className="text-[10.5px] text-slate-300 leading-normal">
                  Live GPS position: {deviceLat.toFixed(4)}°N, {deviceLng.toFixed(4)}°E (±{deviceAccuracy}m). Prototype watershed dataset is in Dharampura, Gadag.
                </p>
                <button
                  type="button"
                  onClick={handleFocusDemoArea}
                  className="w-full py-1.5 px-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow flex items-center justify-center gap-1"
                >
                  <span>Explore Demo Study Area →</span>
                </button>
              </div>
            )}

            {/* In-Map Context Snapshot Card (Requirement 3) */}
            {contextSnapshot && (
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm bg-slate-950/98 border border-sky-500/70 rounded-2xl p-3.5 shadow-2xl z-[1000] backdrop-blur-md animate-fadeIn text-xs space-y-2.5 font-mono">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/40 px-1.5 py-0.2 rounded">
                        CONTEXT SNAPSHOT
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${
                        contextSnapshot.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : contextSnapshot.status === 'NEEDS REINSPECTION'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {contextSnapshot.status || contextSnapshot.caseStatus || 'PENDING VERIFICATION'}
                      </span>
                    </div>
                    <div className="text-white font-black text-sm mt-1">
                      {contextSnapshot.caseNumber || contextSnapshot.caseId?.replace('CASE ', '') || 'EVD-004'} • {contextSnapshot.problem || contextSnapshot.observation || 'Soil Erosion'}
                    </div>
                  </div>
                  <button
                    onClick={() => setContextSnapshot(null)}
                    className="text-slate-400 hover:text-white p-1 cursor-pointer"
                    title="Close Snapshot"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 9-Point Compact Key-Value Grid (Requirement 3) */}
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-850">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">GPS LOCATION:</span>
                      <span className="font-bold text-slate-200">
                        {contextSnapshot.lat?.toFixed(4)}°N, {contextSnapshot.lng?.toFixed(4)}°E
                      </span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-850">
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">PRIORITY ZONE:</span>
                      <span className="font-bold text-rose-400">
                        {contextSnapshot.priorityZone || 'Zone 1A (High Priority)'}
                      </span>
                    </div>
                  </div>

                  <div className="p-1.5 rounded bg-slate-900 border border-slate-850 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span>〰</span>
                      <span>Nearby Drainage:</span>
                    </span>
                    <span className="text-sky-300 font-bold truncate max-w-[170px]">
                      {contextSnapshot.distanceToDrainage || 'D-04 (Order-2 Stream, 180m)'}
                    </span>
                  </div>

                  <div className="p-1.5 rounded bg-slate-900 border border-slate-850 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span>💧</span>
                      <span>Nearby Water Body:</span>
                    </span>
                    <span className="text-sky-300 font-bold truncate max-w-[170px]">
                      {contextSnapshot.distanceToWater || 'Pond PB-02 (220m)'}
                    </span>
                  </div>

                  <div className="p-1.5 rounded bg-slate-900 border border-slate-850 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span>🛠</span>
                      <span>Nearby Intervention:</span>
                    </span>
                    <span className="text-emerald-300 font-bold truncate max-w-[170px]">
                      {contextSnapshot.distanceToIntervention || contextSnapshot.subtitle || 'Check Dam CD-04'}
                    </span>
                  </div>

                  <div className="p-1.5 rounded bg-slate-900 border border-slate-850 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span>🕒</span>
                      <span>Historical Observation:</span>
                    </span>
                    <span className="text-amber-300 font-bold truncate max-w-[170px]">
                      {contextSnapshot.historicalObservation || '-14.2% canopy drop since 2021'}
                    </span>
                  </div>

                  <div className="p-1.5 rounded bg-slate-900 border border-slate-850 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">⭕ Exploration Radius:</span>
                    <span className="text-slate-300 font-semibold">250m proximity envelope</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCase(contextSnapshot);
                      setContextSnapshot(null);
                    }}
                    className="py-2 px-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold text-center cursor-pointer transition-colors shadow flex items-center justify-center gap-1"
                  >
                    <span>View Evidence</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleOpenVerifyModal(contextSnapshot);
                    }}
                    className="py-2 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold text-center cursor-pointer transition-colors shadow flex items-center justify-center gap-1"
                  >
                    <span>Verify Case</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Clean Operational Legend per Requirement 1 */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono shrink-0">
            <span className="font-bold text-slate-400 uppercase">
              LEGEND:
            </span>
            <div className="flex items-center gap-3.5 flex-wrap">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Priority Area
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Field Evidence
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Water Body
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Intervention
              </span>
              {layerVisibility.drainage && (
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="w-3 h-0.5 bg-sky-400"></span> Drainage
                </span>
              )}
            </div>
          </div>

        </div>

        {/* ================================================== */}
        {/* RIGHT (40%): OPERATIONAL ATTENTION QUEUE (Requirement 5) */}
        {/* ================================================== */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between space-y-3">
          
          {/* Attention Queue Header (Requirements 1 & 13) */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="font-black text-xs sm:text-sm text-white uppercase font-mono">
                ATTENTION QUEUE
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsSihDemoActive(true);
                  setSihDemoStep(0);
                  handleTriggerSihDemoStep({ step: 0 });
                }}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                title="Launch SIH Demo Walkthrough Sequence"
              >
                <Play className="w-3 h-3 fill-current text-sky-400" />
                <span>START DEMO</span>
              </button>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                attentionQueue.filter(a => a.status !== 'CONFIRMED').length > 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {attentionQueue.filter(a => a.status !== 'CONFIRMED').length} ITEMS NEED ATTENTION
              </span>
            </div>
          </div>

          {/* 3 Strong Operational Case Cards per Requirements 1, 5, 7 */}
          <div className="space-y-3 flex-1 flex flex-col justify-between">
            {/* 3 Prominent Watershed Case Action Cards per Requirements 4 & 8 */}
            {attentionQueue.map((item) => {
              const isConfirmed = item.status === 'CONFIRMED' || item.caseStatus === 'CONFIRMED';
              const isReinspect = item.status === 'NEEDS REINSPECTION';
              const isRose = item.badgeColor === 'rose' && !isConfirmed && !isReinspect;
              const isAmber = item.badgeColor === 'amber' && !isConfirmed && !isReinspect;

              return (
                <div 
                  key={item.id}
                  className={`p-3.5 rounded-xl bg-slate-950 border transition-all hover:border-slate-600 shadow flex flex-col justify-between space-y-2.5 ${
                    isConfirmed 
                      ? 'border-emerald-500/50 bg-emerald-950/15 ring-1 ring-emerald-500/30' 
                      : isReinspect
                      ? 'border-purple-500/40 bg-purple-950/10'
                      : isRose 
                      ? 'border-rose-500/40' 
                      : isAmber 
                      ? 'border-amber-500/40' 
                      : 'border-yellow-500/40'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Header: CASE ID, PRIORITY, VERIFICATION STATUS */}
                    <div className="flex items-center justify-between text-[10px] font-mono flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-white font-black text-xs">{item.caseNumber || item.caseId.replace('CASE ', '')}</span>
                        <span className="text-slate-600">•</span>
                        <span className={`px-2 py-0.2 rounded font-extrabold border ${
                          isConfirmed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                          isRose ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                          isAmber ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                        }`}>
                          {item.priority?.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      
                      {/* VERIFICATION STATUS Badge */}
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-extrabold border ${
                        isConfirmed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                        isReinspect ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                        item.caseStatus === 'PENDING VERIFICATION' ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' :
                        item.caseStatus === 'UNDER REVIEW' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    {/* PROBLEM */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">PROBLEM:</span>
                        <h4 className="font-black text-sm text-white">
                          {item.title} — <span className="font-normal text-xs text-slate-300">{item.subtitle}</span>
                        </h4>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shrink-0">
                        DEMO EVIDENCE
                      </span>
                    </div>

                    {/* WHY IT WAS FLAGGED */}
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-850 space-y-1 text-xs">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-rose-300 font-bold block">WHY IT WAS FLAGGED:</span>
                        <p className="text-slate-200 text-[11px] leading-relaxed">
                          {item.whyItWasFlagged || item.why}
                        </p>
                      </div>

                      {/* SUPPORTING EVIDENCE */}
                      <div className="pt-1 border-t border-slate-850">
                        <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">SUPPORTING EVIDENCE:</span>
                        <p className="text-slate-300 text-[11px]">
                          {item.supportingEvidence || 'GeoLens field photograph & Sentinel-2 spectral canopy change.'}
                        </p>
                      </div>

                      {/* RECOMMENDED FIELD ACTION */}
                      <div className="pt-1 border-t border-slate-850">
                        <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">RECOMMENDED FIELD ACTION:</span>
                        <p className="text-slate-300 text-[11px]">
                          {item.recommendedFieldAction || item.nextStep}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Requirements 4 & 8: Working Action Buttons */}
                  {/* [WHY] [VIEW EVIDENCE] [VIEW ON MAP] [VERIFY] [REINSPECT] */}
                  <div className="pt-2 border-t border-slate-850 flex flex-wrap items-center justify-between gap-1 font-mono text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          // Feature 18: Signature WOW Moment — Synchronously centers map on case, activates 250m exploration ring & spatial features, and opens Case Drawer
                          handleMapCaseClick(item);
                          setSelectedCase(item);
                        }}
                        className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 rounded-lg font-bold text-[10px] cursor-pointer"
                        title="Explain Why this case needs attention"
                      >
                        WHY?
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedCase(item)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-lg font-bold transition-colors cursor-pointer text-[10px]"
                        title="View ground truth evidence photograph and metadata"
                      >
                        VIEW EVIDENCE
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMapCaseClick(item)}
                        className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 rounded-lg font-bold transition-colors cursor-pointer text-[10px] flex items-center gap-1"
                        title="Center on map & inspect 250m exploration radius"
                      >
                        <Map className="w-3 h-3 text-sky-400" />
                        <span>VIEW ON MAP</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenVerifyModal(item)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer text-[10px] flex items-center gap-1 ${
                          isConfirmed 
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50' 
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        }`}
                        title="Official statutory verification dialogue"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>VERIFY</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleSaveVerification({
                            caseItem: item,
                            result: 'NEEDS REINSPECTION',
                            note: 'Marked for field reinspection from action card.'
                          });
                        }}
                        className="px-2 py-1 bg-slate-850 hover:bg-purple-900/60 text-slate-300 hover:text-purple-200 border border-slate-750 hover:border-purple-500/50 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                        title="Mark case for secondary field reinspection"
                      >
                        REINSPECT
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* ================================================== */}
      {/* 4. OPERATIONAL QUEUES: MY TASKS, VERIFICATION QUEUE & ACTIVITY FEED */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Column 1: MY TASKS (Requirement 13) */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl shadow space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-extrabold text-xs text-white font-mono uppercase flex items-center gap-1.5">
              <ListCheck className="w-4 h-4 text-teal-400" />
              <span>MY TASKS</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold">
              3 PENDING
            </span>
          </div>

          <div className="space-y-2">
            {tasks.map(task => (
              <div 
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                  task.done 
                    ? 'bg-slate-900/60 border-slate-850 opacity-60' 
                    : 'bg-slate-900 border-slate-800 hover:border-teal-500/50'
                }`}
              >
                <button type="button" className="mt-0.5 text-teal-400">
                  {task.done ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-white ${task.done ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {task.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: VERIFICATION QUEUE (Requirement 14) */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl shadow space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-extrabold text-xs text-white font-mono uppercase flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span>VERIFICATION QUEUE</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                {verificationQueue.filter(v => v.status !== 'CONFIRMED').length} PENDING
              </span>
              <button
                onClick={() => setActiveTab('verification')}
                className="text-[10px] font-mono text-sky-400 hover:underline"
              >
                All →
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {verificationQueue.map((item) => (
              <div key={item.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex flex-col justify-between space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="font-bold text-slate-200">{item.id} • {item.title}</span>
                  <span className={`px-1.5 py-0.2 rounded font-extrabold text-[9px] ${
                    item.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-300' :
                    item.status === 'NEEDS REINSPECTION' ? 'bg-rose-500/20 text-rose-300' :
                    'bg-amber-500/20 text-amber-300'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-850">
                  <span className="text-[10px] text-slate-400 font-mono">{item.location}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setVerificationQueue(prev => prev.map(v => v.id === item.id ? { ...v, status: 'CONFIRMED' } : v));
                        if (onShowToast) onShowToast(`${item.id} confirmed.`);
                      }}
                      className="px-2 py-0.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVerificationQueue(prev => prev.map(v => v.id === item.id ? { ...v, status: 'NEEDS REINSPECTION' } : v));
                        if (onShowToast) onShowToast(`${item.id} marked for reinspection.`);
                      }}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 rounded text-[10px] font-mono font-semibold cursor-pointer"
                    >
                      Reinspect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: RECENT ACTIVITY FEED (Requirement 15) */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl shadow space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-extrabold text-xs text-white font-mono uppercase flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>RECENT ACTIVITY</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              DEMO ACTIVITY
            </span>
          </div>

          <div className="space-y-2">
            {activities.map(act => (
              <div key={act.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-850 text-xs flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-200 block text-[11px]">
                    {act.text}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {act.time}
                  </span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-sky-300 border border-slate-800">
                  {act.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ================================================== */}
      {/* 5. WATERSHED TIME MACHINE / CHANGE REPLAY (Requirement 7) */}
      {/* ================================================== */}
      <section className="p-4 bg-slate-950 border border-slate-800 rounded-2xl shadow-lg space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-400" />
            <span className="font-extrabold text-xs text-white uppercase tracking-wider">
              WATERSHED TIME MACHINE / CHANGE REPLAY — CASE: CHECK DAM CD-04
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40">
              PROTOTYPE DATA
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onOpenEvidenceReplay) onOpenEvidenceReplay('INT-CD-01');
              else setActiveTab('change');
            }}
            className="text-xs text-teal-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Launch Evidence Replay →</span>
          </button>
        </div>

        {/* 4 Clickable Stage Buttons (Requirement 7: BASELINE -> INTERVENTION -> FOLLOW-UP -> CURRENT) */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          {replayTimeline.map((item, idx) => (
            <button
              key={item.stage}
              type="button"
              onClick={() => setReplaySliderVal(idx)}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                replaySliderVal === idx
                  ? 'bg-teal-600/30 border-teal-400 text-teal-200 ring-1 ring-teal-400/50 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] uppercase font-bold text-slate-400">{item.year}</div>
              <div className="font-black text-xs text-white mt-0.5">{item.stage}</div>
            </button>
          ))}
        </div>

        {/* Timeline Slider Box */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4 h-40 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-inner">
            <img
              src={currentReplay.img}
              alt={currentReplay.label}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <span className="absolute top-2 left-2 bg-slate-950/85 text-[10px] text-teal-300 px-2 py-0.5 rounded border border-slate-800 font-bold">
              {currentReplay.stage}
            </span>
            <span className="absolute bottom-2 right-2 bg-slate-950/85 text-[10px] text-amber-300 px-2 py-0.5 rounded border border-slate-800">
              {currentReplay.year}
            </span>
          </div>

          <div className="md:col-span-8 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-white">
                {currentReplay.label}
              </span>
              <span className="text-[10px] text-slate-400">
                Stage {replaySliderVal + 1} of 4
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={replaySliderVal}
              onChange={(e) => setReplaySliderVal(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />

            <p className="text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-850 leading-relaxed">
              {currentReplay.desc}
            </p>

            {/* 3 Observable Changes: Vegetation, Water, Intervention (Requirement 7) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] pt-1">
              <div className="p-2 rounded-lg bg-slate-900/90 border border-emerald-500/30">
                <span className="text-emerald-400 font-bold block mb-0.5">🌿 VEGETATION OBSERVATION:</span>
                <span className="text-slate-200">{currentReplay.veg}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 border border-sky-500/30">
                <span className="text-sky-300 font-bold block mb-0.5">💧 WATER OBSERVATION:</span>
                <span className="text-slate-200">{currentReplay.water}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/90 border border-amber-500/30">
                <span className="text-amber-300 font-bold block mb-0.5">🛠️ STRUCTURE OBSERVATION:</span>
                <span className="text-slate-200">{currentReplay.intervention}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Details Drawer (Requirements 2, 3, 8, 9, 10) */}
      <CaseDetailsDrawer
        caseItem={selectedCase}
        onClose={() => setSelectedCase(null)}
        onViewOnMap={(item) => {
          setSelectedCase(null);
          handleMapCaseClick(item);
        }}
        onVerify={(item) => {
          setSelectedCase(null);
          handleOpenVerifyModal(item);
        }}
        onNeedsReinspection={(item) => {
          setSelectedCase(null);
          handleSaveVerification({
            caseItem: item,
            result: 'NEEDS REINSPECTION',
            note: 'Marked for reinspection from case file drawer.'
          });
        }}
      />

      {/* Verification Modal (Requirements 6 & 7) */}
      <VerifyFieldEvidenceModal
        isOpen={isVerifyModalOpen}
        caseItem={verifyModalItem}
        onClose={() => {
          setIsVerifyModalOpen(false);
          setVerifyModalItem(null);
        }}
        onSaveVerification={handleSaveVerification}
      />

      {/* Primary SIH Demo Controller (Requirement 13) */}
      <SIHDemoController
        isOpen={isSihDemoActive}
        currentStep={sihDemoStep}
        onStepChange={(step) => setSihDemoStep(step)}
        onClose={() => {
          setIsSihDemoActive(false);
          if (onStopSihDemo) onStopSihDemo();
        }}
        onTriggerAction={handleTriggerSihDemoStep}
      />

      {/* Verification Complete Celebration Banner (Section 13 & 15) */}
      {verificationCompleteData && (
        <div className="fixed inset-0 z-[1250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn text-slate-100 font-sans select-none">
          <div className="bg-slate-950 border border-emerald-500/60 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden p-6 space-y-4 animate-scaleUp text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-950/60">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
                DEMONSTRATION COMPLETE
              </span>
              <h3 className="text-xl font-black text-white mt-1.5 font-mono">
                VERIFICATION COMPLETE
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Case <span className="text-emerald-400 font-bold">{verificationCompleteData.caseNumber}</span> ({verificationCompleteData.title}) status updated to{' '}
                <span className="text-emerald-300 font-bold">{verificationCompleteData.status}</span>.
              </p>
            </div>

            {/* Signature 5-Pillar JalDrishti Workflow */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-400 block border-b border-slate-800 pb-1">
                THE SIGNATURE JALDRISHTI WORKFLOW:
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-sky-300 font-bold">WHERE?</span>
                  <span className="text-slate-300">→ MAP (Check Dam CD-04 • 15.4038°N, 75.1049°E)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-bold">WHAT?</span>
                  <span className="text-slate-300">→ EVIDENCE (Field Photograph & EXIF Telemetry)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-300 font-bold">WHY?</span>
                  <span className="text-slate-300">→ EXPLANATION (Drainage + Intervention + History)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 font-bold">WHAT NEXT?</span>
                  <span className="text-slate-300">→ ACTION (De-siltation & Boulder apron repair)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-bold">IS IT TRUE?</span>
                  <span className="text-emerald-300 font-bold">→ HUMAN VERIFICATION (Certified Officer Sign-off)</span>
                </div>
              </div>
            </div>

            {/* Signature Positioning Statement & Tagline (Requirement 15) */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-sky-500/30 text-left space-y-1 text-xs font-mono">
              <span className="text-[10px] uppercase font-bold text-sky-400 block">
                FROM FIELD EVIDENCE TO WATERSHED ACTION
              </span>
              <p className="text-[11px] text-slate-300 italic leading-relaxed">
                “JalDrishti doesn't just show where a watershed problem exists. It connects the evidence, explains why it needs attention, provides spatial context, guides the next action and tracks the case through human verification.”
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setVerificationCompleteData(null)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold rounded-xl shadow cursor-pointer transition-all"
              >
                Return to Operations Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guided Tour Modal */}
      <DemoStoryModal
        isOpen={isDemoStoryOpen}
        onClose={() => setIsDemoStoryOpen(false)}
        onViewOnMap={(zoneId) => {
          setIsDemoStoryOpen(false);
          setActiveTab('map');
        }}
        onOpenWhy={(zoneId) => {
          setIsDemoStoryOpen(false);
          if (onOpenWhyModal) onOpenWhyModal(zoneId);
        }}
        onConfirmVerification={(zoneId) => {
          if (onShowToast) onShowToast('Verified during guided demonstration walkthrough.');
        }}
      />

    </div>
  );
}
