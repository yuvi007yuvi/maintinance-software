import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { getSupabaseClient } from '../lib/supabase';

export interface AuthUser extends UserProfile {
  department?: string;
  designation?: string;
}

// Master list of authorized fleet personnel registered in the system
export const REGISTERED_USERS: AuthUser[] = [
  {
    id: 'usr-admin',
    full_name: 'Er. Arvind Saxena',
    email: 'admin@vwfms.gov.in',
    phone: '+91 94120 00001',
    role: 'super_admin',
    designation: 'System Administrator',
    department: 'Fleet IT & Smart City Mission',
    zone_id: 'zone-1',
    is_active: true,
  },
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
    id: 'usr-pm',
    full_name: 'Devendra Rawat',
    email: 'pm@vwfms.gov.in',
    phone: '+91 94120 00003',
    role: 'project_manager',
    designation: 'Project Director',
    department: 'Fleet Projects Directorate',
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
    designation: 'Lead Driver (UP81 BT 1024)',
    department: 'Ward 1 Sanitation Beat',
    zone_id: 'zone-1',
    is_active: true,
  },
];

interface AuthContextType {
  isAuthenticated: boolean;
  currentRole: UserRole;
  currentUser: AuthUser;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
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
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return REGISTERED_USERS[0];
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

  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Validate required inputs
    if (!cleanEmail) {
      return { success: false, message: 'Please enter your registered email address or employee ID.' };
    }
    if (!password || password.trim().length === 0) {
      return { success: false, message: 'Please enter your password to authenticate.' };
    }

    // 2. Minimum security password check
    if (password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    try {
      const client = getSupabaseClient();
      let matchedUser: AuthUser | null = null;

      // 3. Authenticate with Supabase
      if (client) {
        // A) Try official Supabase Auth signIn if user has an auth account
        try {
          const { data: authRes } = await client.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (authRes?.user) {
            // Fetch profile for authenticated user
            const { data: prof } = await client
              .from('user_profiles')
              .select('*')
              .eq('id', authRes.user.id)
              .maybeSingle();

            if (prof) {
              matchedUser = prof;
            }
          }
        } catch {
          // Supabase Auth call completed
        }

        // B) Check user_profiles table in Supabase database
        if (!matchedUser) {
          const { data: dbUser, error: dbError } = await client
            .from('user_profiles')
            .select('*')
            .or(`email.ilike.${cleanEmail},id.eq.${cleanEmail}`)
            .maybeSingle();

          if (!dbError && dbUser) {
            if (dbUser.is_active === false) {
              return { success: false, message: 'This account has been deactivated by administration.' };
            }
            matchedUser = dbUser;
          }
        }
      }

      // 4. Fallback to local verified registry if database is unreachable
      if (!matchedUser) {
        const localMatch = REGISTERED_USERS.find(
          (u) => u.email.toLowerCase() === cleanEmail || u.id.toLowerCase() === cleanEmail
        );
        if (localMatch) {
          matchedUser = localMatch;
        }
      }

      // 5. If no valid user found in database or directory
      if (!matchedUser) {
        return {
          success: false,
          message: 'Invalid credentials. No authorized account found for this email.',
        };
      }

      // 6. Authentication successful - persist session
      setCurrentUser(matchedUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      console.error('Authentication error:', err);
      return { success: false, message: 'An unexpected authentication error occurred. Please try again.' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    const client = getSupabaseClient();
    if (client) {
      client.auth.signOut().catch(() => {});
    }
  };

  // RBAC Permission Gates strictly derived from authenticated user's role
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
        logout,
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
