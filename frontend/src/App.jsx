import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import ExploreMap from './components/ExploreMap';
import GeoLens from './components/GeoLens';
import ChangeAnalysis from './components/ChangeAnalysis';
import InterventionsLedger from './components/InterventionsLedger';
import PriorityZonesView from './components/PriorityZonesView';
import VerificationPortal from './components/VerificationPortal';
import ScenarioPlanner from './components/ScenarioPlanner';
import ReportsBriefing from './components/ReportsBriefing';
import FieldModeView from './components/FieldModeView';
import WhyModal from './components/WhyModal';
import EvidenceReplayModal from './components/EvidenceReplayModal';
import AskWatershedModal from './components/AskWatershedModal';
import DigitalTwinStatusModal from './components/DigitalTwinStatusModal';
import EvidenceChainModal from './components/EvidenceChainModal';
import DemoStoryModal from './components/DemoStoryModal';
import Login from './components/Login';
import { 
  getCurrentUser, 
  setCurrentUserSession, 
  clearCurrentUserSession, 
  ROLES, 
  DEMO_USERS 
} from './services/auth';
import { 
  CheckCircle2, 
  Home, 
  Map, 
  Camera, 
  History, 
  Layers, 
  ShieldAlert, 
  Plus, 
  Smartphone,
  Activity,
  ListCheck
} from 'lucide-react';

export default function App() {
  // Session Authentication & Role State
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState(null);
  const [layersData, setLayersData] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [scenarioCoords, setScenarioCoords] = useState(null);
  
  // Operational Field Mode (Requirement 9)
  const [isFieldModeActive, setIsFieldModeActive] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Modals state
  const [whyZoneId, setWhyZoneId] = useState(null);
  const [replayInterventionId, setReplayInterventionId] = useState(null);
  const [isAskWatershedOpen, setIsAskWatershedOpen] = useState(false);
  const [isDigitalTwinStatusOpen, setIsDigitalTwinStatusOpen] = useState(false);
  const [evidenceChainItem, setEvidenceChainItem] = useState(null);
  const [isGlobalDemoTourOpen, setIsGlobalDemoTourOpen] = useState(false);
  const [isSihDemoRunning, setIsSihDemoRunning] = useState(false);
  const [activeMapFilter, setActiveMapFilter] = useState(null);

  // Location Hierarchy & Mode state: 'live_gps' | 'manual' | 'demo'
  const [activeLocationMode, setActiveLocationMode] = useState('live_gps');
  const [activeLocation, setActiveLocation] = useState(null); // { lat, lng, accuracy, timestamp, source, locality }
  const [prefilledLocation, setPrefilledLocation] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [isLocatingGlobal, setIsLocatingGlobal] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Reverse geocode helper
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const loc = addr.city || addr.town || addr.village || addr.suburb || addr.district || addr.county || addr.state_district;
        const st = addr.state;
        if (loc && st) return `${loc}, ${st}`;
        if (loc) return loc;
      }
    } catch (e) {
      // offline / blocked - silent fallback
    }
    return null;
  };

  // Set active field location and mode
  const handleUpdateActiveLocation = async (loc, mode = 'live_gps') => {
    let locality = loc.locality;
    if (!locality && loc.lat && loc.lng) {
      locality = await reverseGeocode(loc.lat, loc.lng);
    }
    const fullLoc = { ...loc, locality };
    setActiveLocation(fullLoc);
    setActiveLocationMode(mode);
    setPrefilledLocation(fullLoc);
    if (mode === 'live_gps' && loc.accuracy != null && loc.accuracy > 1000) {
      showToast(`Low GPS accuracy (±${Math.round(loc.accuracy)}m). Move outdoors for a better fix.`);
    }
  };

  const [isSwitchToDemoModalOpen, setIsSwitchToDemoModalOpen] = useState(false);

  // Switch to Demo Study Area mode (Requirements 1 & 5)
  const handleRequestSwitchToDemo = () => {
    setActiveLocationMode('demo');
    showToast('Switched to Demo Study Area');
  };

  const handleConfirmSwitchToDemo = () => {
    setIsSwitchToDemoModalOpen(false);
    setActiveLocationMode('demo');
    showToast('Switched to Demo Study Area');
  };

  // Switch to Live Mode (Requirements 1 & 5)
  const handleSwitchToLiveMode = () => {
    setActiveLocationMode('live_gps');
    showToast('Switched to Live Device GPS');
    handleFindMyLocation();
  };

  // Switch to Manual Mode
  const handleSwitchToManualMode = (coords) => {
    handleUpdateActiveLocation({
      lat: parseFloat(coords.lat),
      lng: parseFloat(coords.lng),
      accuracy: null,
      source: 'Manual'
    }, 'manual');
  };

  // Primary action: 📍 Find My Location
  const handleFindMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingGlobal(true);
    setLocationPermissionDenied(false);

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocatingGlobal(false);
        const { latitude, longitude, accuracy } = pos.coords;
        const locality = await reverseGeocode(latitude, longitude);

        const loc = {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy,
          timestamp: new Date(pos.timestamp || Date.now()).toLocaleTimeString(),
          source: 'Device GPS',
          locality: locality
        };

        handleUpdateActiveLocation(loc, 'live_gps');
      },
      (err) => {
        setIsLocatingGlobal(false);
        console.warn('Geolocation error:', err);
        if (err.code === 1) { // PERMISSION_DENIED
          setLocationPermissionDenied(true);
        } else {
          showToast(`Location error: ${err.message || 'Unable to retrieve location'}.`);
        }
      },
      geoOptions
    );
  };

  // Live device location handler: transfer coordinates to GeoLens and switch tab
  const handleCaptureAtLocation = (loc) => {
    handleUpdateActiveLocation(loc, 'live_gps');
    setActiveTab('geolens');
  };

  // Fetch initial digital twin data
  const loadData = async () => {
    try {
      const [resOverview, resLayers] = await Promise.all([
        fetch('/api/overview').then(r => r.json()),
        fetch('/api/layers').then(r => r.json())
      ]);

      if (resOverview.status === 'success') {
        setOverviewData(resOverview);
      }
      if (resLayers.status === 'success') {
        setLayersData(resLayers);
      }
    } catch (err) {
      console.error('Error fetching initial digital twin data:', err);
    }
  };

  useEffect(() => {
    loadData();
    // Prompt for live location automatically on startup
    handleFindMyLocation();
  }, []);

  // When a photo is analyzed in GeoLens, refresh layers and select it
  const handlePhotoAnalyzed = (newObs) => {
    loadData();
    setSelectedFeature({
      ...newObs,
      type: 'observation'
    });
    showToast(`GeoLens evidence "${newObs.title || newObs.id}" ingested and mapped.`);
  };

  // When verification status is changed via Portal
  const handleVerificationUpdated = (targetId, newStatus, remarks) => {
    loadData();
    showToast(`Verification status updated to "${newStatus}" for ${targetId}. Audit stamped.`);
  };

  const handleSendForVerification = async (targetId, newStatus = 'Under Review') => {
    try {
      const res = await fetch('/api/verification/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'Observation',
          target_id: targetId,
          new_status: newStatus,
          officer_id: currentUser?.id ? currentUser.id.toUpperCase() : 'SYSTEM-TRIAGE',
          officer_name: currentUser ? `${currentUser.name} (${currentUser.roleLabel})` : 'Field Triage Automation',
          remarks: 'Escalated from Map Evidence Panel to Officer Verification Queue'
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        showToast('Evidence added to officer verification queue.');
        loadData();
      }
    } catch (err) {
      console.error('Error sending for verification:', err);
    }
  };

  const handleApplyFilterToMap = (result) => {
    setActiveMapFilter(result);
    setActiveTab('map');
    showToast(`Query applied: "${result.query || 'Spatial Filter'}" (Highlighted on map)`);
  };

  const handleOpenScenarioPlanner = (coords) => {
    setScenarioCoords(coords);
    setActiveTab('scenario');
  };

  const handleStartSihDemo = () => {
    setIsFieldModeActive(false);
    setActiveTab('overview');
    setIsSihDemoRunning(true);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role === ROLES.FIELD_WORKER) {
      setIsFieldModeActive(true);
      setActiveLocationMode('live_gps');
      showToast(`Logged in as ${user.name} (${user.roleLabel}). Field Mode activated.`);
    } else if (user.role === ROLES.SUPERVISOR) {
      setIsFieldModeActive(false);
      setActiveTab('overview');
      showToast(`Logged in as ${user.name} (${user.roleLabel}). Operations Center ready.`);
    } else {
      setIsFieldModeActive(false);
      setActiveTab('overview');
      showToast(`Logged in as ${user.name} (${user.roleLabel}). Full Digital Twin ready.`);
    }
  };

  const handleLogout = () => {
    clearCurrentUserSession();
    setCurrentUser(null);
    setIsFieldModeActive(false);
    setActiveTab('overview');
    showToast('Signed out of JalDrishti Operations Center.');
  };

  const handleSwitchRole = (newRoleKey) => {
    const targetUser = DEMO_USERS.find(u => u.role === newRoleKey);
    if (targetUser) {
      setCurrentUserSession(targetUser);
      setCurrentUser(targetUser);
      if (newRoleKey === ROLES.FIELD_WORKER) {
        setIsFieldModeActive(true);
        setActiveLocationMode('live_gps');
      } else {
        setIsFieldModeActive(false);
      }
      showToast(`Switched persona to ${targetUser.name} (${targetUser.roleLabel}).`);
    }
  };

  // Authentication Gate: Render Login screen if no active session
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-navy-950 text-slate-100 flex flex-col font-sans select-none">
      
      {/* Top Notification Toast */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 animate-bounceIn flex items-center gap-2.5 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-mono font-medium backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Header (Requirement 2) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAskWatershed={() => setIsAskWatershedOpen(true)}
        watershedInfo={overviewData?.watershed}
        onOpenScenarioPlanner={handleOpenScenarioPlanner}
        onOpenDigitalTwinStatus={() => setIsDigitalTwinStatusOpen(true)}
        pendingCount={overviewData?.kpis?.pending_verification_count || 5}
        activeLocationMode={activeLocationMode}
        activeLocation={activeLocation}
        onSwitchToDemoMode={handleRequestSwitchToDemo}
        onSwitchToLiveMode={handleSwitchToLiveMode}
        isFieldModeActive={isFieldModeActive}
        setIsFieldModeActive={setIsFieldModeActive}
        onToggleSidebarMobile={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
      />

      {/* Main Operational Body: Sidebar + Workspace (Requirement 2 & 23) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Persistent Desktop Sidebar (220–240px) */}
        <div className="hidden lg:flex shrink-0">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            pendingCount={overviewData?.kpis?.pending_verification_count || 5}
            attentionCount={3}
            activeLocationMode={activeLocationMode}
            onSwitchToDemoMode={handleRequestSwitchToDemo}
            onSwitchToLiveMode={handleSwitchToLiveMode}
            isFieldModeActive={isFieldModeActive}
            setIsFieldModeActive={setIsFieldModeActive}
            onStartDemoTour={handleStartSihDemo}
            onOpenDigitalTwinStatus={() => setIsDigitalTwinStatusOpen(true)}
            onOpenScenarioPlanner={handleOpenScenarioPlanner}
            currentUser={currentUser}
          />
        </div>

        {/* Mobile/Tablet Off-canvas Sidebar Drawer */}
        {isSidebarOpenMobile && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsSidebarOpenMobile(false)}
            />
            <div className="relative w-64 max-w-[80vw] h-full z-10 animate-slideInLeft flex">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setIsSidebarOpenMobile(false);
                }}
                pendingCount={overviewData?.kpis?.pending_verification_count || 5}
                attentionCount={3}
                activeLocationMode={activeLocationMode}
                onSwitchToDemoMode={handleRequestSwitchToDemo}
                onSwitchToLiveMode={handleSwitchToLiveMode}
                isFieldModeActive={isFieldModeActive}
                setIsFieldModeActive={(val) => {
                  setIsFieldModeActive(val);
                  setIsSidebarOpenMobile(false);
                }}
                onStartDemoTour={() => {
                  setIsSidebarOpenMobile(false);
                  handleStartSihDemo();
                }}
                onOpenDigitalTwinStatus={() => {
                  setIsSidebarOpenMobile(false);
                  setIsDigitalTwinStatusOpen(true);
                }}
                onOpenScenarioPlanner={handleOpenScenarioPlanner}
                currentUser={currentUser}
              />
            </div>
          </div>
        )}

        {/* Main Content Workspace (Scrollable) */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-5 lg:px-6 pt-3 pb-16 lg:pb-8 bg-navy-950">
          
          {/* Requirement 9: FIELD MODE INTERFACE */}
          {isFieldModeActive ? (
            <FieldModeView
              activeLocation={activeLocation}
              activeLocationMode={activeLocationMode}
              onCaptureEvidence={() => setActiveTab('geolens')}
              onOpenCase={(caseItem) => setSelectedFeature(caseItem)}
              setActiveTab={(tab) => {
                setIsFieldModeActive(false);
                setActiveTab(tab);
              }}
              onShowToast={showToast}
              layersData={layersData}
              onSwitchToDemoMode={handleRequestSwitchToDemo}
              currentUser={currentUser}
            />
          ) : (
            <>
              {activeTab === 'overview' && (
                <Overview
                  overviewData={overviewData}
                  layersData={layersData}
                  setActiveTab={setActiveTab}
                  onSelectZone={(zoneId) => setWhyZoneId(zoneId)}
                  onSelectObservation={(obs) => {
                    setSelectedFeature(obs);
                    setActiveTab('map');
                  }}
                  onOpenWhyModal={(zoneId) => setWhyZoneId(zoneId)}
                  onOpenEvidenceReplay={(intId) => setReplayInterventionId(intId)}
                  onOpenEvidenceChain={(item) => setEvidenceChainItem(item)}
                  onOpenScenarioPlanner={handleOpenScenarioPlanner}
                  onOpenAskWatershed={() => setIsAskWatershedOpen(true)}
                  onOpenDigitalTwinStatus={() => setIsDigitalTwinStatusOpen(true)}
                  activeLocationMode={activeLocationMode}
                  activeLocation={activeLocation}
                  onUseCurrentLocation={handleFindMyLocation}
                  onSwitchToDemoMode={handleRequestSwitchToDemo}
                  onSwitchToLiveMode={handleSwitchToLiveMode}
                  onShowToast={showToast}
                  isSihDemoRunningProp={isSihDemoRunning}
                  onStopSihDemo={() => setIsSihDemoRunning(false)}
                />
              )}

              {activeTab === 'map' && (
                <ExploreMap
                  layersData={layersData}
                  selectedFeature={selectedFeature}
                  setSelectedFeature={setSelectedFeature}
                  onOpenWhyModal={(zoneId) => setWhyZoneId(zoneId)}
                  onOpenEvidenceReplay={(intId) => setReplayInterventionId(intId)}
                  onOpenVerification={(item) => {
                    setSelectedFeature(item);
                    setActiveTab('verification');
                  }}
                  onOpenScenarioPlanner={handleOpenScenarioPlanner}
                  onOpenEvidenceChain={(item) => setEvidenceChainItem(item)}
                  onSendForVerification={handleSendForVerification}
                  onCaptureAtLocation={handleCaptureAtLocation}
                  onShowToast={showToast}
                  activeMapFilter={activeMapFilter}
                  activeLocationMode={activeLocationMode}
                  activeLocation={activeLocation}
                  onUpdateActiveLocation={handleUpdateActiveLocation}
                  onSwitchToDemoMode={handleRequestSwitchToDemo}
                  onSwitchToLiveMode={handleSwitchToLiveMode}
                  onSwitchToManualMode={handleSwitchToManualMode}
                />
              )}

              {activeTab === 'geolens' && (
                <GeoLens
                  onPhotoAnalyzed={handlePhotoAnalyzed}
                  onNavigateToMap={(obs) => {
                    setSelectedFeature(obs);
                    setActiveTab('map');
                  }}
                  onOpenVerification={(obs) => {
                    setSelectedFeature(obs);
                    setActiveTab('verification');
                  }}
                  onOpenEvidenceChain={(item) => setEvidenceChainItem(item)}
                  onShowToast={showToast}
                  prefilledLocation={prefilledLocation}
                  activeLocationMode={activeLocationMode}
                  activeLocation={activeLocation}
                  onUpdateActiveLocation={handleUpdateActiveLocation}
                  onSwitchToDemoMode={handleRequestSwitchToDemo}
                  onSwitchToManualMode={handleSwitchToManualMode}
                />
              )}

              {activeTab === 'change' && (
                <ChangeAnalysis />
              )}

              {activeTab === 'interventions' && (
                <InterventionsLedger
                  interventions={layersData?.interventions}
                  onOpenEvidenceReplay={(intId) => setReplayInterventionId(intId)}
                  onNavigateToMap={(item) => {
                    setSelectedFeature({ ...item, type: 'intervention' });
                    setActiveTab('map');
                  }}
                  onOpenVerification={(item) => {
                    setSelectedFeature(item);
                    setActiveTab('verification');
                  }}
                  onOpenEvidenceChain={(item) => setEvidenceChainItem(item)}
                />
              )}

              {activeTab === 'priority' && (
                <PriorityZonesView
                  zones={layersData?.sub_watersheds?.features?.map(f => f.properties)}
                  onOpenWhyModal={(zoneId) => setWhyZoneId(zoneId)}
                  onNavigateToMap={(zone) => {
                    setSelectedFeature({ ...zone, type: 'sub_watershed' });
                    setActiveTab('map');
                  }}
                />
              )}

              {activeTab === 'verification' && (
                <VerificationPortal
                  observations={layersData?.field_observations}
                  onVerificationUpdated={handleVerificationUpdated}
                  onNavigateToMap={(item) => {
                    setSelectedFeature(item);
                    setActiveTab('map');
                  }}
                  onOpenEvidenceChain={(item) => setEvidenceChainItem(item)}
                  currentUser={currentUser}
                />
              )}

              {activeTab === 'scenario' && (
                <ScenarioPlanner
                  initialCoords={scenarioCoords}
                  onNavigateToMap={(coords) => {
                    setSelectedFeature(coords);
                    setActiveTab('map');
                  }}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsBriefing />
              )}
            </>
          )}

        </main>
      </div>

      {/* Requirement 24: Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/98 border-t border-slate-800 px-2 py-1.5 flex items-center justify-around font-mono text-[10px]">
        <button
          type="button"
          onClick={() => {
            setIsFieldModeActive(false);
            setActiveTab('overview');
          }}
          className={`flex flex-col items-center gap-0.5 p-1 ${!isFieldModeActive && activeTab === 'overview' ? 'text-sky-400 font-bold' : 'text-slate-400'}`}
        >
          <Home className="w-4 h-4" />
          <span>Ops</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsFieldModeActive(false);
            setActiveTab('map');
          }}
          className={`flex flex-col items-center gap-0.5 p-1 ${!isFieldModeActive && activeTab === 'map' ? 'text-sky-400 font-bold' : 'text-slate-400'}`}
        >
          <Map className="w-4 h-4" />
          <span>Map</span>
        </button>

        {/* Center Prominent Mobile Action: + Evidence */}
        <button
          type="button"
          onClick={() => {
            setIsFieldModeActive(false);
            setActiveTab('geolens');
          }}
          className="flex flex-col items-center justify-center -mt-4 w-11 h-11 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg border-2 border-slate-950"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => setIsFieldModeActive(!isFieldModeActive)}
          className={`flex flex-col items-center gap-0.5 p-1 ${isFieldModeActive ? 'text-teal-300 font-bold' : 'text-slate-400'}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Field</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsFieldModeActive(false);
            setActiveTab('verification');
          }}
          className={`flex flex-col items-center gap-0.5 p-1 ${!isFieldModeActive && activeTab === 'verification' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Review</span>
        </button>
      </div>

      {/* Global Modals */}
      {whyZoneId && (
        <WhyModal
          zoneId={whyZoneId}
          onClose={() => setWhyZoneId(null)}
          onNavigateToMap={(zId) => {
            setWhyZoneId(null);
            setActiveTab('map');
          }}
          onOpenVerification={(zId) => {
            setWhyZoneId(null);
            setActiveTab('verification');
          }}
        />
      )}

      {replayInterventionId && (
        <EvidenceReplayModal
          interventionId={replayInterventionId}
          onClose={() => setReplayInterventionId(null)}
          onNavigateToMap={() => {
            setReplayInterventionId(null);
            setActiveTab('map');
          }}
        />
      )}

      <AskWatershedModal
        isOpen={isAskWatershedOpen}
        onClose={() => setIsAskWatershedOpen(false)}
        onApplyFilterToMap={handleApplyFilterToMap}
      />

      <DigitalTwinStatusModal
        isOpen={isDigitalTwinStatusOpen}
        onClose={() => setIsDigitalTwinStatusOpen(false)}
      />

      <EvidenceChainModal
        evidenceData={evidenceChainItem}
        onClose={() => setEvidenceChainItem(null)}
        onNavigateToMap={(item) => {
          setEvidenceChainItem(null);
          setSelectedFeature(item);
          setActiveTab('map');
        }}
        onOpenWhyModal={(zoneId) => {
          setEvidenceChainItem(null);
          setWhyZoneId(zoneId);
        }}
      />

      <DemoStoryModal
        isOpen={isGlobalDemoTourOpen}
        onClose={() => setIsGlobalDemoTourOpen(false)}
        onViewOnMap={() => {
          setIsGlobalDemoTourOpen(false);
          setActiveTab('map');
        }}
        onOpenWhy={(zoneId) => {
          setIsGlobalDemoTourOpen(false);
          setWhyZoneId(zoneId);
        }}
        onConfirmVerification={() => {
          showToast('Demonstration case verified.');
        }}
      />

      {/* Demo Switch Confirmation Modal */}
      {isSwitchToDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
              <span className="text-xl">🗺️</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Switch to Demo Mode?
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Demo Mode loads certified sample layers of Dharampura Micro-Watershed for demonstration.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmSwitchToDemo}
                className="py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
              >
                Switch to Demo
              </button>
              <button
                type="button"
                onClick={() => setIsSwitchToDemoModalOpen(false)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Permission Denied Dialog */}
      {locationPermissionDenied && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <span className="text-xl">📍</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                Location Access Required
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                To use Live GPS Mode, allow location access in your browser, or switch to the Demo Study Area.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setLocationPermissionDenied(false);
                  handleFindMyLocation();
                }}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
              >
                Retry Live GPS Fix
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocationPermissionDenied(false);
                  handleConfirmSwitchToDemo();
                }}
                className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-750 text-amber-300 rounded-xl text-xs font-mono transition-all cursor-pointer"
              >
                Switch to Demo Study Area
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
