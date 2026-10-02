import React, { useState } from 'react';
import { 
  Compass, 
  Lock, 
  Mail, 
  Smartphone, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  MapPin, 
  Camera, 
  AlertCircle,
  User,
  Radio,
  FileText,
  Sliders
} from 'lucide-react';
import { ROLES, ROLE_CONFIGS, DEMO_USERS, authenticateUser, quickDemoLogin } from '../services/auth';

export default function Login({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState(ROLES.WATERSHED_OFFICER);
  const [emailOrUsername, setEmailOrUsername] = useState('officer.varma@jaldrishti.gov.in');
  const [password, setPassword] = useState('demo');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // When a user clicks a role tab, auto-populate sample credentials for convenience
  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setErrorMessage('');
    const demoUser = DEMO_USERS.find(u => u.role === roleKey);
    if (demoUser) {
      setEmailOrUsername(demoUser.email);
      setPassword('demo');
    }
  };

  // Direct 1-click login for demonstrator during SIH pitch
  const handleQuickDemoLogin = (roleKey) => {
    setIsLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      const user = quickDemoLogin(roleKey);
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    }, 250);
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = authenticateUser({
        emailOrUsername,
        password,
        role: selectedRole
      });

      setIsLoading(false);

      if (res.success) {
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please check credentials.');
      }
    }, 300);
  };

  const activeRoleConfig = ROLE_CONFIGS[selectedRole] || ROLE_CONFIGS[ROLES.WATERSHED_OFFICER];

  return (
    <div className="min-h-screen w-screen overflow-y-auto bg-[#070b14] text-slate-100 flex flex-col justify-between font-sans selection:bg-sky-500 selection:text-white relative">
      
      {/* Background Ambience: Subtle Cyber-Grid & Watershed Topographic Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-sky-600/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[15%] w-[600px] h-[600px] rounded-full bg-teal-600/10 blur-[140px]" />
        <div className="absolute top-[40%] left-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-600/10 blur-[120px]" />
        {/* Subtle grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '32px 32px' 
          }} 
        />
      </div>

      {/* Top Banner: SIH Operational Context */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-3 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-slate-300 font-semibold tracking-wider text-[11px]">
            SMART INDIA HACKATHON 2024 • DHARAMPURA PILOT BASIN
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span>Digital Twin Telemetry: <strong className="text-emerald-400">ONLINE</strong></span>
          </span>
          <span>•</span>
          <span className="text-slate-400">v2.6 Multi-Role</span>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-5xl space-y-6">

          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-sky-500/20 via-teal-500/20 to-indigo-600/30 border border-sky-400/40 shadow-xl shadow-sky-950/40 mb-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 via-teal-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Compass className="w-6 h-6 text-white" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                  JalDrishti
                </h1>
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-mono font-bold">
                  OPS
                </span>
              </div>
              <p className="text-sm sm:text-base font-medium text-sky-300 font-mono mt-1">
                Intelligent Watershed Digital Twin
              </p>
              <p className="text-xs sm:text-sm text-slate-400 italic mt-0.5 font-sans">
                “From Field Evidence to Watershed Action.”
              </p>
            </div>
          </div>

          {/* Dual Panel Layout: Credentials Form on Left/Top, Demo Quick Logins on Right/Bottom */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Card (Cols 1-7): Clean Standard Login Form */}
            <div className="lg:col-span-7 bg-slate-900/90 border border-slate-750/80 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                      <Lock className="w-4 h-4 text-sky-400" />
                      <span>Operations Center Access</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Select your operational role and authenticate to proceed.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                    Role-Based Access
                  </span>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  
                  {/* Field 1: Role Selector Tabs */}
                  <div>
                    <label className="block text-xs font-mono font-semibold text-slate-300 mb-1.5">
                      Operational Role <span className="text-sky-400">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleRoleSelect(ROLES.FIELD_WORKER)}
                        className={`p-2.5 rounded-xl border text-left font-mono transition-all flex flex-col justify-between ${
                          selectedRole === ROLES.FIELD_WORKER
                            ? 'bg-emerald-950/70 border-emerald-500/60 ring-2 ring-emerald-500/30 text-white shadow-md'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Smartphone className={`w-4 h-4 ${selectedRole === ROLES.FIELD_WORKER ? 'text-emerald-400' : 'text-slate-400'}`} />
                          {selectedRole === ROLES.FIELD_WORKER && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="text-xs font-bold leading-tight">Field Worker</div>
                          <div className="text-[9px] text-slate-400 truncate mt-0.5">Field Mode • GPS</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRoleSelect(ROLES.SUPERVISOR)}
                        className={`p-2.5 rounded-xl border text-left font-mono transition-all flex flex-col justify-between ${
                          selectedRole === ROLES.SUPERVISOR
                            ? 'bg-sky-950/70 border-sky-500/60 ring-2 ring-sky-500/30 text-white shadow-md'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <ShieldCheck className={`w-4 h-4 ${selectedRole === ROLES.SUPERVISOR ? 'text-sky-400' : 'text-slate-400'}`} />
                          {selectedRole === ROLES.SUPERVISOR && (
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="text-xs font-bold leading-tight">Supervisor</div>
                          <div className="text-[9px] text-slate-400 truncate mt-0.5">Triage • Queue</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRoleSelect(ROLES.WATERSHED_OFFICER)}
                        className={`p-2.5 rounded-xl border text-left font-mono transition-all flex flex-col justify-between ${
                          selectedRole === ROLES.WATERSHED_OFFICER
                            ? 'bg-amber-950/70 border-amber-500/60 ring-2 ring-amber-500/30 text-white shadow-md'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Compass className={`w-4 h-4 ${selectedRole === ROLES.WATERSHED_OFFICER ? 'text-amber-400' : 'text-slate-400'}`} />
                          {selectedRole === ROLES.WATERSHED_OFFICER && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="text-xs font-bold leading-tight">Officer</div>
                          <div className="text-[9px] text-slate-400 truncate mt-0.5">Full Twin • GIS</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Field 2: Email / User ID */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-mono font-semibold text-slate-300">
                        Email / User ID <span className="text-sky-400">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        DEMO ACCOUNT
                      </span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        placeholder="e.g. officer.varma@jaldrishti.gov.in"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-750 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-xs text-white placeholder-slate-500 font-mono transition-all"
                      />
                    </div>
                  </div>

                  {/* Field 3: Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-mono font-semibold text-slate-300">
                        Password <span className="text-sky-400">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-slate-400">
                        Demo: <code className="text-sky-400 bg-slate-950 px-1 py-0.5 rounded border border-slate-800">demo</code>
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password (demo)"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-750 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none text-xs text-white placeholder-slate-500 font-mono transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-500 hover:via-teal-500 hover:to-emerald-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-950/50 border border-sky-400/30 transition-all cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating Session...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In as {activeRoleConfig.label}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Bottom Security Note */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Demo Authentication Active</span>
                </span>
                <span className="text-slate-400">Local Auth Storage</span>
              </div>
            </div>

            {/* Right Card (Cols 8-12): "Demo Login" Fast Pass Personas */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-750/80 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-bold text-white font-mono">
                      ⚡ Demo Login (1-Click)
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    For SIH Jury
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Click any verified persona below to instantly experience role-tailored workflows:
                </p>

                {/* 3 Persona Cards */}
                <div className="mt-4 space-y-3">
                  
                  {/* 1. Field Worker Persona */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          FW
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white">Ramesh Kumar</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                              Field Worker
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-amber-500/30 font-bold">
                              DEMO ACCOUNT
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            field.ramesh@jaldrishti.gov.in <span className="text-amber-400/90 font-semibold">• DEMO ACCOUNT</span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin(ROLES.FIELD_WORKER)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-mono font-bold transition-all shadow-sm cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <span>Launch</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-850 flex flex-wrap gap-1 text-[9px] font-mono text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300">📱 Field Mode</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">📍 Live GPS</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">📷 Field Evidence</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Submit Cases</span>
                    </div>
                  </div>

                  {/* 2. Supervisor Persona */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          SP
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white">Priya Sharma</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold">
                              Supervisor
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-amber-500/30 font-bold">
                              DEMO ACCOUNT
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            supervisor.priya@jaldrishti.gov.in <span className="text-amber-400/90 font-semibold">• DEMO ACCOUNT</span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin(ROLES.SUPERVISOR)}
                        className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[10px] font-mono font-bold transition-all shadow-sm cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <span>Launch</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-850 flex flex-wrap gap-1 text-[9px] font-mono text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-300">⚡ Attention Queue</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">🗺️ Explore Map</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">✓ Verify Cases</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Reinspect</span>
                    </div>
                  </div>

                  {/* 3. Watershed Officer Persona */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          WO
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white">Dr. Rajesh Varma</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                              Watershed Officer
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-amber-500/30 font-bold">
                              DEMO ACCOUNT
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            officer.varma@jaldrishti.gov.in <span className="text-amber-400/90 font-semibold">• DEMO ACCOUNT</span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin(ROLES.WATERSHED_OFFICER)}
                        className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-mono font-bold transition-all shadow-sm cursor-pointer shrink-0 flex items-center gap-1"
                      >
                        <span>Launch</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-850 flex flex-wrap gap-1 text-[9px] font-mono text-slate-300">
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300">🌐 Full Digital Twin</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">🔄 Change Replay</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">🧱 Interventions</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">📊 Scenario & Reports</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Quick Persona Hint */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
                💡 <span className="text-slate-300">Demonstration tip:</span> You can also switch roles instantly after logging in via the top-right profile menu.
              </div>
            </div>

          </div>

          {/* Footer Highlights */}
          <div className="pt-4 text-center space-y-1 text-slate-400 font-mono text-[11px]">
            <p>
              JalDrishti Digital Twin • Dharampura Watershed Operations • AI & Field-Verified Telemetry
            </p>
            <p className="text-[10px] text-slate-400">
              Department of Water Resources & Catchment Conservation • Smart India Hackathon Prototype
            </p>
          </div>

        </div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 w-full px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/70 text-slate-400 font-mono text-[10px] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Demo Authentication Active</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Roles: Field Worker • Supervisor • Watershed Officer</span>
          <span>•</span>
          <span>SIH-2024 Evaluation Build</span>
        </div>
      </footer>

    </div>
  );
}
