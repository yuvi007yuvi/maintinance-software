import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';

export interface PredefinedUser extends UserProfile {
  password?: string;
  department: string;
  designation: string;
}

export const PREDEFINED_USERS: PredefinedUser[] = [
  {
    id: 'usr-officer',
    full_name: 'Dr. Amit Pathak (IAS)',
    email: 'commissioner@vwfms.gov.in',
    phone: '+91 94120 00002',
    role: 'nagar_nigam_officer',
    designation: 'Municipal Commissioner',
    department: 'Executive Municipal Secretariat',
    zone_id: 'zone-1',
    is_active: true,
  },
  {
    id: 'usr-fleet',
    full_name: 'Mahesh Chandra Varshney',
    email: 'fleet.mgr@vwfms.gov.in',
    phone: '+91 94120 00004',
    role: 'fleet_manager',
    designation: 'Chief Fleet Officer',
    department: 'Central Municipal Fleet Desk',
    zone_id: 'zone-1',
    is_active: true,
  },
  {
    id: 'usr-workshop',
    full_name: 'Rakesh Babu Sharma',
    email: 'workshop.chief@vwfms.gov.in',
    phone: '+91 94120 00005',
    role: 'workshop_manager',
    designation: 'Central Workshop Superintendent',
    department: 'Central Maintenance Bay & Depot',
    zone_id: 'zone-2',
    is_active: true,
  },
  {
    id: 'usr-mech-1',
    full_name: 'Kallu Mistri',
    email: 'kallu.mechanic@vwfms.gov.in',
    phone: '+91 94120 11001',
    role: 'mechanic',
    designation: 'Master Hydraulic Specialist',
    department: 'Workshop Bay 1 (Heavy Equipment)',
    zone_id: 'zone-2',
    is_active: true,
  },
  {
    id: 'usr-driver-1',
    full_name: 'Rameshwar Dayal',
    email: 'rameshwar.driver@vwfms.gov.in',
    phone: '+91 94120 22001',
    role: 'driver',
    designation: 'Compactor Lead Driver (UP81 BT 1024)',
    department: 'Ward 1 Sanitation Beat',
    zone_id: 'zone-1',
    is_active: true,
  },
  {
    id: 'usr-admin',
    full_name: 'Er. Arvind Saxena',
    email: 'admin@vwfms.gov.in',
    phone: '+91 94120 00001',
    role: 'super_admin',
    designation: 'System Administrator & NIC Liaison',
    department: 'Fleet IT & Smart City Mission',
    zone_id: 'zone-1',
    is_active: true,
  },
];

interface AuthContextType {
  isAuthenticated: boolean;
  currentRole: UserRole;
  currentUser: PredefinedUser;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  canReportBreakdown: boolean;
  canAcknowledgeBreakdown: boolean;
  canManageJobCards: boolean;
  canAssignMechanic: boolean;
  canIssueParts: boolean;
  canApproveInspection: boolean;
  canRedeploy: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'vwfms_auth_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial session from localStorage
  const [currentUser, setCurrentUser] = useState<PredefinedUser>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          const match = PREDEFINED_USERS.find((u) => u.email === parsed.email);
          if (match) return match;
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return PREDEFINED_USERS[0]; // Default to Commissioner
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  });

  const currentRole = currentUser.role;

  // Persist session changes
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [isAuthenticated, currentUser]);

  const login = async (email: string, _password?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const user = PREDEFINED_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail || u.id.toLowerCase() === cleanEmail
    );

    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return { success: true };
    }

    // Generic fallback user if valid format
    if (cleanEmail.includes('@')) {
      const genericUser: PredefinedUser = {
        id: `usr-${Date.now()}`,
        full_name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
        email: cleanEmail,
        phone: '+91 94120 00000',
        role: 'nagar_nigam_officer',
        designation: 'Municipal Officer',
        department: 'Municipal Fleet Operations',
        is_active: true,
      };
      setCurrentUser(genericUser);
      setIsAuthenticated(true);
      return { success: true };
    }

    return { success: false, message: 'Invalid municipal credentials. Use an official email or 1-click demo profile.' };
  };

  const loginAsRole = (role: UserRole) => {
    const user = PREDEFINED_USERS.find((u) => u.role === role) || PREDEFINED_USERS[0];
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const setRole = (role: UserRole) => {
    const matched = PREDEFINED_USERS.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(matched);
    } else {
      setCurrentUser((prev) => ({
        ...prev,
        role,
      }));
    }
  };

  // RBAC Permission Gates
  const canReportBreakdown = ['super_admin', 'fleet_manager', 'driver', 'nagar_nigam_officer', 'project_manager'].includes(currentRole);
  const canAcknowledgeBreakdown = ['super_admin', 'fleet_manager', 'nagar_nigam_officer'].includes(currentRole);
  const canManageJobCards = ['super_admin', 'workshop_manager', 'mechanic'].includes(currentRole);
  const canAssignMechanic = ['super_admin', 'workshop_manager'].includes(currentRole);
  const canIssueParts = ['super_admin', 'workshop_manager'].includes(currentRole);
  const canApproveInspection = ['super_admin', 'workshop_manager', 'nagar_nigam_officer', 'project_manager'].includes(currentRole);
  const canRedeploy = ['super_admin', 'fleet_manager', 'project_manager'].includes(currentRole);
  const canViewReports = ['super_admin', 'nagar_nigam_officer', 'project_manager', 'fleet_manager', 'workshop_manager'].includes(currentRole);
  const canManageSettings = ['super_admin'].includes(currentRole);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentRole,
        currentUser,
        login,
        loginAsRole,
        logout,
        setRole,
        canReportBreakdown,
        canAcknowledgeBreakdown,
        canManageJobCards,
        canAssignMechanic,
        canIssueParts,
        canApproveInspection,
        canRedeploy,
        canViewReports,
        canManageSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
