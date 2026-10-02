/**
 * JalDrishti Role-Based Authentication Service (Demo Layer)
 * 
 * Provides local authentication and persona presets for:
 * 1. Field Worker (Ground observations, Field Mode, geotagged evidence, GPS)
 * 2. Supervisor (Operations Center, Attention Queue, verification triage, review)
 * 3. Watershed Officer (Digital Twin executive dashboard, change replay, interventions, scenario planner)
 */

export const ROLES = {
  FIELD_WORKER: 'field_worker',
  SUPERVISOR: 'supervisor',
  WATERSHED_OFFICER: 'watershed_officer'
};

export const ROLE_CONFIGS = {
  [ROLES.FIELD_WORKER]: {
    id: ROLES.FIELD_WORKER,
    label: 'Field Worker',
    code: 'ROLE_FIELD',
    tagline: 'Field Scout & Jal Mitra',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    primaryTab: 'geolens',
    startInFieldMode: true,
    capabilities: [
      'Field Mode (Mobile-optimized)',
      'Capture & View Field Evidence (GeoLens)',
      'Nearby Cases & Proximity Alerts',
      'Live GPS / Location Tracking',
      'Submit Ground Proof & Field Observations'
    ],
    primaryModules: ['field_mode', 'geolens', 'map']
  },
  [ROLES.SUPERVISOR]: {
    id: ROLES.SUPERVISOR,
    label: 'Supervisor',
    code: 'ROLE_SUPERVISOR',
    tagline: 'Sub-Division AEE / Technical Officer',
    color: 'sky',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    primaryTab: 'overview',
    startInFieldMode: false,
    capabilities: [
      'Operations Center Oversight',
      'Explore Map & Spatial Layers',
      'Attention Queue & Case Triage',
      'Field Evidence Review',
      'Verification Portal & Re-inspection Orders'
    ],
    primaryModules: ['overview', 'map', 'geolens', 'verification', 'priority']
  },
  [ROLES.WATERSHED_OFFICER]: {
    id: ROLES.WATERSHED_OFFICER,
    label: 'Watershed Officer',
    code: 'ROLE_OFFICER',
    tagline: 'Executive Watershed Director',
    color: 'amber',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    primaryTab: 'overview',
    startInFieldMode: false,
    capabilities: [
      'Full Digital Twin Dashboard & KPIs',
      'Explore Map & Multi-Layer GIS',
      'Multi-Temporal Change Replay (NDVI/NDWI)',
      'Interventions Ledger & Infrastructure Status',
      'Priority Zones & Critical Catchments',
      'Verification Portal & Audit Trail',
      'Scenario Planner & Decision Simulator',
      'Executive Briefings & Exportable Reports'
    ],
    primaryModules: ['overview', 'map', 'geolens', 'change', 'interventions', 'priority', 'verification', 'scenario', 'reports']
  }
};

export const DEMO_USERS = [
  {
    id: 'usr_field_01',
    name: 'Ramesh Kumar',
    email: 'field.ramesh@jaldrishti.gov.in',
    username: 'field_ramesh',
    password: 'demo',
    role: ROLES.FIELD_WORKER,
    roleLabel: 'Field Worker',
    roleTitle: 'Field Scout & Jal Mitra',
    organization: 'Dharampura Micro-Watershed Field Team',
    zone: 'Gadag Catchment Zone 4',
    avatarText: 'RK',
    badgeColor: 'emerald',
    phone: '+91 98450 12345'
  },
  {
    id: 'usr_sup_02',
    name: 'Priya Sharma',
    email: 'supervisor.priya@jaldrishti.gov.in',
    username: 'supervisor_priya',
    password: 'demo',
    role: ROLES.SUPERVISOR,
    roleLabel: 'Supervisor',
    roleTitle: 'Assistant Executive Engineer (AEE)',
    organization: 'Minor Irrigation Sub-Division Office',
    zone: 'Dharampura Basin Division',
    avatarText: 'PS',
    badgeColor: 'sky',
    phone: '+91 98450 67890'
  },
  {
    id: 'usr_off_03',
    name: 'Dr. Rajesh Varma',
    email: 'officer.varma@jaldrishti.gov.in',
    username: 'officer_varma',
    password: 'demo',
    role: ROLES.WATERSHED_OFFICER,
    roleLabel: 'Watershed Officer',
    roleTitle: 'Executive Watershed Director',
    organization: 'State Watershed Development Department',
    zone: 'Regional River Basin Authority',
    avatarText: 'RV',
    badgeColor: 'amber',
    phone: '+91 98450 99999'
  }
];

const AUTH_STORAGE_KEY = 'jaldrishti_auth_user';

/**
 * Get current session user from localStorage
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse auth user session:', e);
    return null;
  }
}

/**
 * Save user session to localStorage
 */
export function setCurrentUserSession(user) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to persist auth user session:', e);
  }
}

/**
 * Clear user session from localStorage
 */
export function clearCurrentUserSession() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear auth user session:', e);
  }
}

/**
 * Authenticate credentials against demo directory
 * In demo mode, accepts password 'demo', or standard role-specific passwords,
 * or allows matching by email/username and role.
 */
export function authenticateUser({ emailOrUsername, password, role }) {
  const query = (emailOrUsername || '').trim().toLowerCase();
  const trimmedPassword = (password || '').trim();

  // Find by email or username
  let matchedUser = DEMO_USERS.find(
    u => u.email.toLowerCase() === query || u.username.toLowerCase() === query
  );

  // If query was empty or not matched by email, fallback to role match
  if (!matchedUser && role) {
    matchedUser = DEMO_USERS.find(u => u.role === role);
  }

  if (!matchedUser) {
    return {
      success: false,
      error: 'User not found. Please choose a demo persona below or select your role.'
    };
  }

  // Password validation: accept 'demo' or user's password or if password was left blank in quick demo mode
  const validPasswords = ['demo', 'field123', 'supervisor123', 'officer123', 'admin', 'password'];
  if (
    trimmedPassword && 
    trimmedPassword !== matchedUser.password && 
    !validPasswords.includes(trimmedPassword.toLowerCase())
  ) {
    return {
      success: false,
      error: 'Incorrect password. Default demo password is "demo".'
    };
  }

  // If user selected a different role in the dropdown, adopt that role config for demonstration
  let effectiveRole = role || matchedUser.role;
  let finalUser = {
    ...matchedUser,
    role: effectiveRole,
    roleLabel: ROLE_CONFIGS[effectiveRole]?.label || matchedUser.roleLabel,
    roleTitle: ROLE_CONFIGS[effectiveRole]?.tagline || matchedUser.roleTitle,
    badgeColor: ROLE_CONFIGS[effectiveRole]?.color || matchedUser.badgeColor
  };

  setCurrentUserSession(finalUser);
  return {
    success: true,
    user: finalUser
  };
}

/**
 * Quick demo login by role
 */
export function quickDemoLogin(roleKey) {
  const targetUser = DEMO_USERS.find(u => u.role === roleKey) || DEMO_USERS[0];
  setCurrentUserSession(targetUser);
  return targetUser;
}
