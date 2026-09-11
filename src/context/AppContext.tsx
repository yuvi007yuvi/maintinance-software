import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  AuditLog,
  Breakdown,
  BreakdownStatus,
  JobCard,
  JobCardPart,
  JobCardStatus,
  KPISummary,
  MaintenanceSchedule,
  Part,
  Redeployment,
  UserProfile,
  Vehicle,
  Ward,
  Workshop,
  Zone,
} from '../types';
import { storage } from '../lib/storage';
import { useAuth } from './AuthContext';

interface AppContextType {
  vehicles: Vehicle[];
  breakdowns: Breakdown[];
  jobCards: JobCard[];
  parts: Part[];
  jobCardParts: JobCardPart[];
  redeployments: Redeployment[];
  maintenanceSchedules: MaintenanceSchedule[];
  auditLogs: AuditLog[];
  workshops: Workshop[];
  wards: Ward[];
  zones: Zone[];
  users: UserProfile[];
  kpi: KPISummary;
  targetAvailability: number;
  isLoading: boolean;
  setTargetAvailability: (target: number) => void;

  // Actions
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  reportBreakdown: (data: {
    vehicle_id: string;
    driver_id?: string;
    reported_by: string;
    location: string;
    ward_id: string;
    problem_category: string;
    problem_description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    vehicle_condition?: string;
    photo_url?: string;
  }) => string;
  acknowledgeBreakdown: (breakdownId: string) => void;
  advanceBreakdownStatus: (breakdownId: string, nextStatus: BreakdownStatus) => void;
  createJobCardFromBreakdown: (breakdownId: string, workshopId: string, assignedMechanicId?: string) => string;
  updateJobCard: (id: string, updates: Partial<JobCard>) => void;
  advanceJobCardStatus: (jobCardId: string, nextStatus: JobCardStatus, remarks?: string) => void;
  issuePartToJobCard: (jobCardId: string, partId: string, quantity: number) => { success: boolean; message: string };
  approveAndCloseJobCard: (jobCardId: string, remarks?: string) => void;
  assignRedeployment: (data: {
    original_vehicle_id: string;
    replacement_vehicle_id: string;
    ward_id: string;
    zone_id: string;
    deployment_location: string;
    assigned_driver_id?: string;
    reason: string;
  }) => void;
  releaseRedeployment: (redeploymentId: string) => void;
  addPart: (part: Omit<Part, 'id' | 'created_at'>) => void;
  adjustPartStock: (partId: string, quantityDelta: number, transactionType: 'purchase' | 'issue' | 'return' | 'adjustment', remarks: string) => void;
  addMaintenanceSchedule: (schedule: Omit<MaintenanceSchedule, 'id' | 'created_at'>) => void;
  completeMaintenance: (scheduleId: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => storage.getVehicles());
  const [breakdowns, setBreakdowns] = useState<Breakdown[]>(() => storage.getBreakdowns());
  const [jobCards, setJobCards] = useState<JobCard[]>(() => storage.getJobCards());
  const [parts, setParts] = useState<Part[]>(() => storage.getParts());
  const [jobCardParts, setJobCardParts] = useState<JobCardPart[]>(() => storage.getJobCardParts());
  const [redeployments, setRedeployments] = useState<Redeployment[]>(() => storage.getRedeployments());
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>(() => storage.getMaintenance());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storage.getAuditLogs());
  const [targetAvailability, setTargetAvailability] = useState<number>(85);

  const workshops = storage.getWorkshops();
  const wards = storage.getWards();
  const zones = storage.getZones();
  const users = storage.getUsers();

  // Save to storage on changes
  useEffect(() => { storage.saveVehicles(vehicles); }, [vehicles]);
  useEffect(() => { storage.saveBreakdowns(breakdowns); }, [breakdowns]);
  useEffect(() => { storage.saveJobCards(jobCards); }, [jobCards]);
  useEffect(() => { storage.saveParts(parts); }, [parts]);
  useEffect(() => { storage.saveJobCardParts(jobCardParts); }, [jobCardParts]);
  useEffect(() => { storage.saveRedeployments(redeployments); }, [redeployments]);
  useEffect(() => { storage.saveMaintenance(maintenanceSchedules); }, [maintenanceSchedules]);
  useEffect(() => { storage.saveAuditLogs(auditLogs); }, [auditLogs]);

  const addAuditLog = (
    entity_name: AuditLog['entity_name'],
    entity_id: string,
    action: string,
    details?: Record<string, any>
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      entity_name,
      entity_id,
      action,
      performed_by: currentUser.full_name,
      performed_by_role: currentUser.role,
      details,
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Calculate KPIs
  const totalFleet = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === 'Available').length;
  const deployedVehicles = vehicles.filter((v) => v.status === 'Deployed' || v.status === 'Running').length;
  const breakdownVehicles = vehicles.filter((v) => v.status === 'Breakdown').length;
  const underRepairVehicles = vehicles.filter((v) => v.status === 'Under Repair' || v.status === 'Under Inspection').length;
  const awaitingPartsVehicles = vehicles.filter((v) => v.status === 'Awaiting Spare Parts').length;
  const readyForDeploymentVehicles = vehicles.filter((v) => v.status === 'Ready for Deployment').length;
  const workshopVehicles = underRepairVehicles + awaitingPartsVehicles;

  const operationalVehicles = availableVehicles + deployedVehicles + readyForDeploymentVehicles;
  const availabilityPercentage = totalFleet > 0 ? Math.round((operationalVehicles / totalFleet) * 100) : 0;

  // Calculate total downtime hours across active breakdowns + completed
  let totalDowntimeHours = 0;
  breakdowns.forEach((b) => {
    const start = new Date(b.breakdown_date).getTime();
    const end = b.status === 'Completed' || b.status === 'Field Redeployment' ? Date.now() : Date.now();
    const diffHours = (end - start) / (1000 * 60 * 60);
    totalDowntimeHours += diffHours;
  });
  totalDowntimeHours = Math.round(totalDowntimeHours);

  const averageRepairTimeHours = Math.round(totalDowntimeHours / (breakdowns.length || 1));
  const lowStockPartsCount = parts.filter((p) => p.current_stock <= p.min_stock).length;
  const pendingJobCards = jobCards.filter((jc) => jc.status !== 'Closed').length;
  const preventiveMaintenanceDue = maintenanceSchedules.filter((m) => m.status === 'Scheduled' || m.status === 'Overdue').length;

  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 86400000);
  const documentsExpiringSoon = vehicles.filter((v) => {
    const dates = [
      new Date(v.insurance_expiry),
      new Date(v.fitness_expiry),
      new Date(v.puc_expiry),
      new Date(v.permit_expiry),
    ];
    return dates.some((d) => d <= thirtyDaysLater);
  }).length;

  const kpi: KPISummary = {
    totalFleet,
    availableVehicles,
    deployedVehicles,
    breakdownVehicles,
    workshopVehicles,
    underRepairVehicles,
    awaitingPartsVehicles,
    readyForDeploymentVehicles,
    availabilityPercentage,
    targetAvailabilityPercentage: targetAvailability,
    totalDowntimeHours,
    averageRepairTimeHours,
    preventiveMaintenanceDue,
    pendingJobCards,
    lowStockPartsCount,
    documentsExpiringSoon,
  };

  // Actions implementation
  const addVehicle = (vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => {
    const newId = `veh-${Date.now()}`;
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setVehicles((prev) => [newVehicle, ...prev]);
    addAuditLog('vehicle', newId, 'REGISTER_VEHICLE', { registration: newVehicle.registration_number });
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates, updated_at: new Date().toISOString() } : v))
    );
    addAuditLog('vehicle', id, 'UPDATE_VEHICLE', updates);
  };

  const reportBreakdown = (data: {
    vehicle_id: string;
    driver_id?: string;
    reported_by: string;
    location: string;
    ward_id: string;
    problem_category: string;
    problem_description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    vehicle_condition?: string;
    photo_url?: string;
  }): string => {
    const newId = `bk-${Date.now()}`;
    const breakdownNumber = `BD-${new Date().getFullYear()}-${String(breakdowns.length + 90).padStart(4, '0')}`;
    const newBreakdown: Breakdown = {
      ...data,
      id: newId,
      breakdown_number: breakdownNumber,
      breakdown_date: new Date().toISOString(),
      status: 'Reported',
      created_at: new Date().toISOString(),
    };

    setBreakdowns((prev) => [newBreakdown, ...prev]);
    updateVehicle(data.vehicle_id, { status: 'Breakdown' });
    addAuditLog('breakdown', newId, 'REPORT_BREAKDOWN', {
      breakdown_number: breakdownNumber,
      problem: data.problem_description,
      severity: data.severity,
    });

    return newId;
  };

  const acknowledgeBreakdown = (breakdownId: string) => {
    const nowIso = new Date().toISOString();
    setBreakdowns((prev) =>
      prev.map((b) =>
        b.id === breakdownId
          ? {
              ...b,
              status: 'Acknowledged',
              acknowledged_by: currentUser.id,
              acknowledged_at: nowIso,
            }
          : b
      )
    );
    addAuditLog('breakdown', breakdownId, 'ACKNOWLEDGE_BREAKDOWN', { acknowledged_by: currentUser.full_name });
  };

  const advanceBreakdownStatus = (breakdownId: string, nextStatus: BreakdownStatus) => {
    const nowIso = new Date().toISOString();
    setBreakdowns((prev) =>
      prev.map((b) => {
        if (b.id !== breakdownId) return b;
        const updates: Partial<Breakdown> = { status: nextStatus };
        if (nextStatus === 'Vehicle Collected') updates.collected_at = nowIso;
        if (nextStatus === 'Workshop Received') updates.workshop_received_at = nowIso;
        return { ...b, ...updates };
      })
    );

    const bd = breakdowns.find((b) => b.id === breakdownId);
    if (bd) {
      if (nextStatus === 'Workshop Received') {
        updateVehicle(bd.vehicle_id, { status: 'Under Inspection', workshop_id: workshops[0]?.id });
      } else if (nextStatus === 'Repair') {
        updateVehicle(bd.vehicle_id, { status: 'Under Repair' });
      } else if (nextStatus === 'Completed') {
        updateVehicle(bd.vehicle_id, { status: 'Ready for Deployment' });
      }
    }

    addAuditLog('breakdown', breakdownId, 'UPDATE_BREAKDOWN_STATUS', { new_status: nextStatus });
  };

  const createJobCardFromBreakdown = (
    breakdownId: string,
    workshopId: string,
    assignedMechanicId?: string
  ): string => {
    const bd = breakdowns.find((b) => b.id === breakdownId);
    if (!bd) return '';

    const newJcId = `jc-${Date.now()}`;
    const jcNumber = `JC-${new Date().getFullYear()}-${String(jobCards.length + 146).padStart(4, '0')}`;

    const newJobCard: JobCard = {
      id: newJcId,
      job_card_number: jcNumber,
      breakdown_id: breakdownId,
      vehicle_id: bd.vehicle_id,
      workshop_id: workshopId,
      complaint: bd.problem_description,
      diagnosis: 'Initial inspection underway at depot bay.',
      required_repair: 'Diagnostics and parts requisition.',
      assigned_mechanic_id: assignedMechanicId,
      estimated_cost: 5000,
      actual_cost: 0,
      work_started_at: new Date().toISOString(),
      inspection_status: 'Pending',
      status: assignedMechanicId ? 'Assigned' : 'Open',
      remarks: `Generated from Breakdown ${bd.breakdown_number}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setJobCards((prev) => [newJobCard, ...prev]);
    advanceBreakdownStatus(breakdownId, 'Diagnosis');
    updateVehicle(bd.vehicle_id, { status: 'Under Repair', workshop_id: workshopId });

    addAuditLog('job_card', newJcId, 'CREATE_JOB_CARD', {
      job_card_number: jcNumber,
      vehicle_id: bd.vehicle_id,
      assigned_to: assignedMechanicId,
    });

    return newJcId;
  };

  const updateJobCard = (id: string, updates: Partial<JobCard>) => {
    setJobCards((prev) =>
      prev.map((jc) => (jc.id === id ? { ...jc, ...updates, updated_at: new Date().toISOString() } : jc))
    );
    addAuditLog('job_card', id, 'UPDATE_JOB_CARD', updates);
  };

  const advanceJobCardStatus = (jobCardId: string, nextStatus: JobCardStatus, remarks?: string) => {
    const jc = jobCards.find((j) => j.id === jobCardId);
    if (!jc) return;

    const updates: Partial<JobCard> = { status: nextStatus, remarks: remarks || jc.remarks };
    if (nextStatus === 'Repair' && !jc.work_started_at) {
      updates.work_started_at = new Date().toISOString();
      updateVehicle(jc.vehicle_id, { status: 'Under Repair' });
    }
    if (nextStatus === 'Inspection') {
      updates.work_completed_at = new Date().toISOString();
      updateVehicle(jc.vehicle_id, { status: 'Under Inspection' });
    }
    if (nextStatus === 'Closed') {
      updates.closed_at = new Date().toISOString();
      updateVehicle(jc.vehicle_id, { status: 'Ready for Deployment' });
    }

    updateJobCard(jobCardId, updates);
    addAuditLog('job_card', jobCardId, 'ADVANCE_JOB_CARD_STATUS', { new_status: nextStatus, remarks });
  };

  const issuePartToJobCard = (
    jobCardId: string,
    partId: string,
    quantity: number
  ): { success: boolean; message: string } => {
    const part = parts.find((p) => p.id === partId);
    if (!part) return { success: false, message: 'Part not found' };
    if (part.current_stock < quantity) {
      return {
        success: false,
        message: `Insufficient stock for ${part.part_name}. Current stock is only ${part.current_stock} ${part.unit}`,
      };
    }

    // Deduct stock from parts
    setParts((prev) =>
      prev.map((p) => (p.id === partId ? { ...p, current_stock: p.current_stock - quantity } : p))
    );

    const cost = quantity * part.purchase_price;
    const newJcp: JobCardPart = {
      id: `jcp-${Date.now()}`,
      job_card_id: jobCardId,
      part_id: partId,
      quantity,
      unit_price: part.purchase_price,
      total_cost: cost,
      issued_by: currentUser.id,
      issued_at: new Date().toISOString(),
    };

    setJobCardParts((prev) => [newJcp, ...prev]);

    // Update job card actual cost
    setJobCards((prev) =>
      prev.map((jc) => (jc.id === jobCardId ? { ...jc, actual_cost: (jc.actual_cost || 0) + cost } : jc))
    );

    addAuditLog('part', partId, 'ISSUE_TO_JOB_CARD', {
      part_name: part.part_name,
      job_card_id: jobCardId,
      quantity,
      cost,
    });

    return { success: true, message: `Successfully issued ${quantity} ${part.unit} of ${part.part_name}` };
  };

  const approveAndCloseJobCard = (jobCardId: string, remarks?: string) => {
    const jc = jobCards.find((j) => j.id === jobCardId);
    if (!jc) return;

    const nowIso = new Date().toISOString();
    const updates: Partial<JobCard> = {
      status: 'Closed',
      inspection_status: 'Passed',
      approved_by: currentUser.id,
      approved_at: nowIso,
      closed_at: nowIso,
      remarks: remarks || jc.remarks || 'Work verified and approved for redeployment.',
    };

    updateJobCard(jobCardId, updates);
    updateVehicle(jc.vehicle_id, { status: 'Ready for Deployment' });

    if (jc.breakdown_id) {
      advanceBreakdownStatus(jc.breakdown_id, 'Completed');
    }

    addAuditLog('job_card', jobCardId, 'APPROVE_AND_CLOSE', {
      approved_by: currentUser.full_name,
      remarks,
    });
  };

  const assignRedeployment = (data: {
    original_vehicle_id: string;
    replacement_vehicle_id: string;
    ward_id: string;
    zone_id: string;
    deployment_location: string;
    assigned_driver_id?: string;
    reason: string;
  }) => {
    const newId = `rd-${Date.now()}`;
    const newRedeployment: Redeployment = {
      ...data,
      id: newId,
      deployment_date: new Date().toISOString(),
      status: 'Active',
      approved_by: currentUser.id,
      created_at: new Date().toISOString(),
    };

    setRedeployments((prev) => [newRedeployment, ...prev]);
    // Set replacement vehicle as running/deployed in the designated ward
    updateVehicle(data.replacement_vehicle_id, {
      status: 'Running',
      assigned_ward_id: data.ward_id,
      assigned_zone_id: data.zone_id,
      assigned_driver_id: data.assigned_driver_id,
    });

    addAuditLog('redeployment', newId, 'ASSIGN_REPLACEMENT', {
      original_vehicle: data.original_vehicle_id,
      replacement_vehicle: data.replacement_vehicle_id,
      ward: data.ward_id,
    });
  };

  const releaseRedeployment = (redeploymentId: string) => {
    const rd = redeployments.find((r) => r.id === redeploymentId);
    if (!rd) return;

    const nowIso = new Date().toISOString();
    setRedeployments((prev) =>
      prev.map((r) => (r.id === redeploymentId ? { ...r, status: 'Released', release_date: nowIso } : r))
    );

    // Return replacement vehicle to Available
    updateVehicle(rd.replacement_vehicle_id, { status: 'Available' });

    addAuditLog('redeployment', redeploymentId, 'RELEASE_REPLACEMENT', {
      replacement_vehicle: rd.replacement_vehicle_id,
    });
  };

  const addPart = (partData: Omit<Part, 'id' | 'created_at'>) => {
    const newId = `prt-${Date.now()}`;
    const newPart: Part = {
      ...partData,
      id: newId,
      created_at: new Date().toISOString(),
    };
    setParts((prev) => [newPart, ...prev]);
    addAuditLog('part', newId, 'CREATE_PART', { name: newPart.part_name, number: newPart.part_number });
  };

  const adjustPartStock = (
    partId: string,
    quantityDelta: number,
    transactionType: 'purchase' | 'issue' | 'return' | 'adjustment',
    remarks: string
  ) => {
    setParts((prev) =>
      prev.map((p) => {
        if (p.id !== partId) return p;
        const newStock = Math.max(0, p.current_stock + quantityDelta);
        return { ...p, current_stock: newStock };
      })
    );

    addAuditLog('part', partId, 'STOCK_ADJUSTMENT', {
      transaction_type: transactionType,
      delta: quantityDelta,
      remarks,
    });
  };

  const addMaintenanceSchedule = (scheduleData: Omit<MaintenanceSchedule, 'id' | 'created_at'>) => {
    const newId = `ms-${Date.now()}`;
    const newSchedule: MaintenanceSchedule = {
      ...scheduleData,
      id: newId,
      created_at: new Date().toISOString(),
    };
    setMaintenanceSchedules((prev) => [newSchedule, ...prev]);
    addAuditLog('maintenance', newId, 'SCHEDULE_MAINTENANCE', {
      vehicle: scheduleData.vehicle_id,
      title: scheduleData.title,
    });
  };

  const completeMaintenance = (scheduleId: string) => {
    const nowIso = new Date().toISOString().split('T')[0];
    setMaintenanceSchedules((prev) =>
      prev.map((m) => (m.id === scheduleId ? { ...m, status: 'Completed', completed_date: nowIso } : m))
    );
    addAuditLog('maintenance', scheduleId, 'COMPLETE_MAINTENANCE');
  };

  const resetAllData = () => {
    storage.resetToDefault();
    setVehicles(storage.getVehicles());
    setBreakdowns(storage.getBreakdowns());
    setJobCards(storage.getJobCards());
    setParts(storage.getParts());
    setJobCardParts(storage.getJobCardParts());
    setRedeployments(storage.getRedeployments());
    setMaintenanceSchedules(storage.getMaintenance());
    setAuditLogs(storage.getAuditLogs());
  };

  return (
    <AppContext.Provider
      value={{
        vehicles,
        breakdowns,
        jobCards,
        parts,
        jobCardParts,
        redeployments,
        maintenanceSchedules,
        auditLogs,
        workshops,
        wards,
        zones,
        users,
        kpi,
        targetAvailability,
        isLoading: false,
        setTargetAvailability,
        addVehicle,
        updateVehicle,
        reportBreakdown,
        acknowledgeBreakdown,
        advanceBreakdownStatus,
        createJobCardFromBreakdown,
        updateJobCard,
        advanceJobCardStatus,
        issuePartToJobCard,
        approveAndCloseJobCard,
        assignRedeployment,
        releaseRedeployment,
        addPart,
        adjustPartStock,
        addMaintenanceSchedule,
        completeMaintenance,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
