import React, { createContext, useContext, useState } from 'react';
import type { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentRole: UserRole;
  currentUser: UserProfile;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('nagar_nigam_officer');

  // Create a default user representing the current role
  const currentUser: UserProfile = {
    id: `user-${currentRole}`,
    full_name: `${currentRole.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} User`,
    email: `${currentRole}@example.com`,
    phone: '',
    role: currentRole,
    is_active: true
  };

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
        currentRole,
        currentUser,
        setRole: setCurrentRole,
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
