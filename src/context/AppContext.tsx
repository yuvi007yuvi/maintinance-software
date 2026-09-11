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
import { getSupabaseClient } from '../lib/supabase';
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
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<void>;
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
  }) => Promise<string>;
  acknowledgeBreakdown: (breakdownId: string) => Promise<void>;
  advanceBreakdownStatus: (breakdownId: string, nextStatus: BreakdownStatus) => Promise<void>;
  createJobCardFromBreakdown: (breakdownId: string, workshopId: string, assignedMechanicId?: string) => Promise<string>;
  updateJobCard: (id: string, updates: Partial<JobCard>) => Promise<void>;
  advanceJobCardStatus: (jobCardId: string, nextStatus: JobCardStatus, remarks?: string) => Promise<void>;
  issuePartToJobCard: (jobCardId: string, partId: string, quantity: number) => Promise<{ success: boolean; message: string }>;
  approveAndCloseJobCard: (jobCardId: string, remarks?: string) => Promise<void>;
  assignRedeployment: (data: {
    original_vehicle_id: string;
    replacement_vehicle_id: string;
    ward_id: string;
    zone_id: string;
    deployment_location: string;
    assigned_driver_id?: string;
    reason: string;
  }) => Promise<void>;
  releaseRedeployment: (redeploymentId: string) => Promise<void>;
  addPart: (part: Omit<Part, 'id' | 'created_at'>) => Promise<void>;
  adjustPartStock: (partId: string, quantityDelta: number, transactionType: 'purchase' | 'issue' | 'return' | 'adjustment', remarks: string) => Promise<void>;
  addMaintenanceSchedule: (schedule: Omit<MaintenanceSchedule, 'id' | 'created_at'>) => Promise<void>;
  completeMaintenance: (scheduleId: string) => Promise<void>;
  resetAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [breakdowns, setBreakdowns] = useState<Breakdown[]>([]);
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [jobCardParts, setJobCardParts] = useState<JobCardPart[]>([]);
  const [redeployments, setRedeployments] = useState<Redeployment[]>([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  
  const [targetAvailability, setTargetAvailability] = useState<number>(85);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchInitialData = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [
        vRes, bRes, jcRes, pRes, jcpRes, rdRes, mRes, wRes, wdRes, zRes, uRes
      ] = await Promise.all([
        supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
        supabase.from('breakdowns').select('*').order('created_at', { ascending: false }),
        supabase.from('job_cards').select('*').order('created_at', { ascending: false }),
        supabase.from('parts').select('*').order('created_at', { ascending: false }),
        supabase.from('job_card_parts').select('*').order('issued_at', { ascending: false }),
        supabase.from('redeployments').select('*').order('created_at', { ascending: false }),
        supabase.from('maintenance_schedules').select('*').order('created_at', { ascending: false }),
        supabase.from('workshops').select('*'),
        supabase.from('wards').select('*'),
        supabase.from('zones').select('*'),
        supabase.from('user_profiles').select('*')
      ]);

      if (vRes.error) console.warn('Supabase vehicles error:', vRes.error.message);
      if (vRes.data) setVehicles(vRes.data as Vehicle[]);

      if (bRes.error) console.warn('Supabase breakdowns error:', bRes.error.message);
      if (bRes.data) setBreakdowns(bRes.data as Breakdown[]);

      if (jcRes.error) console.warn('Supabase job_cards error:', jcRes.error.message);
      if (jcRes.data) setJobCards(jcRes.data as JobCard[]);

      if (pRes.error) console.warn('Supabase parts error:', pRes.error.message);
      if (pRes.data) setParts(pRes.data as Part[]);

      if (jcpRes.error) console.warn('Supabase job_card_parts error:', jcpRes.error.message);
      if (jcpRes.data) setJobCardParts(jcpRes.data as JobCardPart[]);

      if (rdRes.error) console.warn('Supabase redeployments error:', rdRes.error.message);
      if (rdRes.data) setRedeployments(rdRes.data as Redeployment[]);

      if (mRes.error) console.warn('Supabase maintenance_schedules error:', mRes.error.message);
      if (mRes.data) setMaintenanceSchedules(mRes.data as MaintenanceSchedule[]);

      if (wRes.error) console.warn('Supabase workshops error:', wRes.error.message);
      if (wRes.data) setWorkshops(wRes.data as Workshop[]);

      if (wdRes.error) console.warn('Supabase wards error:', wdRes.error.message);
      if (wdRes.data) setWards(wdRes.data as Ward[]);

      if (zRes.error) console.warn('Supabase zones error:', zRes.error.message);
      if (zRes.data) setZones(zRes.data as Zone[]);

      if (uRes.error) console.warn('Supabase user_profiles error:', uRes.error.message);
      if (uRes.data) setUsers(uRes.data as UserProfile[]);
    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const addAuditLog = async (
    entity_name: AuditLog['entity_name'],
    entity_id: string,
    action: string,
    details?: Record<string, any>
  ) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const newLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      entity_name,
      entity_id,
      action,
      performed_by: currentUser?.full_name || 'System User',
      performed_by_role: currentUser?.role || 'super_admin',
      details,
    };

    const { error } = await supabase.from('audit_logs').insert([newLog]);
    if (!error) {
      setAuditLogs((prev) => [newLog as AuditLog, ...prev]);
    }
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
  const availabilityPercentage = totalFleet > 0 ? Math.round((operationalVehicles / totalFleet) * 100) : 100;

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
  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const newId = `veh-${Date.now()}`;
    const newVehicle = {
      ...vehicleData,
      id: newId,
      assigned_zone_id: vehicleData.assigned_zone_id || null,
      assigned_ward_id: vehicleData.assigned_ward_id || null,
      assigned_driver_id: vehicleData.assigned_driver_id || null,
      workshop_id: vehicleData.workshop_id || null,
    };
    
    const { data, error } = await supabase.from('vehicles').insert([newVehicle]).select().single();
    
    if (!error && data) {
      setVehicles((prev) => [data as Vehicle, ...prev]);
      await addAuditLog('vehicle', newId, 'REGISTER_VEHICLE', { registration: newVehicle.registration_number });
    } else {
      console.error(error);
      throw new Error(error?.message || 'Failed to add vehicle');
    }
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const cleanedUpdates = { ...updates };
    if ('assigned_zone_id' in cleanedUpdates && !cleanedUpdates.assigned_zone_id) cleanedUpdates.assigned_zone_id = undefined;
    if ('assigned_ward_id' in cleanedUpdates && !cleanedUpdates.assigned_ward_id) cleanedUpdates.assigned_ward_id = undefined;
    if ('assigned_driver_id' in cleanedUpdates && !cleanedUpdates.assigned_driver_id) cleanedUpdates.assigned_driver_id = undefined;
    if ('workshop_id' in cleanedUpdates && !cleanedUpdates.workshop_id) cleanedUpdates.workshop_id = undefined;

    const { error } = await supabase.from('vehicles').update(cleanedUpdates).eq('id', id);
    
    if (!error) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updates, updated_at: new Date().toISOString() } : v))
      );
      await addAuditLog('vehicle', id, 'UPDATE_VEHICLE', updates);
    } else {
      console.error(error);
      throw new Error(error.message);
    }
  };

  const reportBreakdown = async (data: {
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
  }): Promise<string> => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("No Supabase client");

    const newId = `bk-${Date.now()}`;
    const breakdownNumber = `BD-${new Date().getFullYear()}-${String(breakdowns.length + 90).padStart(4, '0')}`;
    const newBreakdown = {
      ...data,
      id: newId,
      breakdown_number: breakdownNumber,
      status: 'Reported',
      driver_id: data.driver_id || null,
      ward_id: data.ward_id || null,
    };

    const { data: insertedData, error } = await supabase.from('breakdowns').insert([newBreakdown]).select().single();

    if (!error && insertedData) {
      setBreakdowns((prev) => [insertedData as Breakdown, ...prev]);
      await updateVehicle(data.vehicle_id, { status: 'Breakdown' });
      await addAuditLog('breakdown', newId, 'REPORT_BREAKDOWN', {
        breakdown_number: breakdownNumber,
        problem: data.problem_description,
        severity: data.severity,
      });
      return newId;
    } else {
      console.error(error);
      throw new Error(error?.message || 'Failed to report breakdown');
    }
  };

  const acknowledgeBreakdown = async (breakdownId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    const nowIso = new Date().toISOString();
    const updates = {
      status: 'Acknowledged',
      acknowledged_by: currentUser?.id || 'system',
      acknowledged_at: nowIso,
    };

    const { error } = await supabase.from('breakdowns').update(updates).eq('id', breakdownId);
    if (!error) {
      setBreakdowns((prev) =>
        prev.map((b) => (b.id === breakdownId ? { ...b, ...updates } as Breakdown : b))
      );
      await addAuditLog('breakdown', breakdownId, 'ACKNOWLEDGE_BREAKDOWN', { acknowledged_by: currentUser?.full_name || 'System User' });
    }
  };

  const advanceBreakdownStatus = async (breakdownId: string, nextStatus: BreakdownStatus) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const nowIso = new Date().toISOString();
    const updates: Partial<Breakdown> = { status: nextStatus };
    if (nextStatus === 'Vehicle Collected') updates.collected_at = nowIso;
    if (nextStatus === 'Workshop Received') updates.workshop_received_at = nowIso;

    const { error } = await supabase.from('breakdowns').update(updates).eq('id', breakdownId);
    
    if (!error) {
      setBreakdowns((prev) =>
        prev.map((b) => (b.id === breakdownId ? { ...b, ...updates } as Breakdown : b))
      );

      const bd = breakdowns.find((b) => b.id === breakdownId);
      if (bd) {
        if (nextStatus === 'Workshop Received') {
          await updateVehicle(bd.vehicle_id, { status: 'Under Inspection', workshop_id: workshops[0]?.id });
        } else if (nextStatus === 'Repair') {
          await updateVehicle(bd.vehicle_id, { status: 'Under Repair' });
        } else if (nextStatus === 'Completed') {
          await updateVehicle(bd.vehicle_id, { status: 'Ready for Deployment' });
        }
      }

      await addAuditLog('breakdown', breakdownId, 'UPDATE_BREAKDOWN_STATUS', { new_status: nextStatus });
    }
  };

  const createJobCardFromBreakdown = async (
    breakdownId: string,
    workshopId: string,
    assignedMechanicId?: string
  ): Promise<string> => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("No supabase client");

    const bd = breakdowns.find((b) => b.id === breakdownId);
    if (!bd) throw new Error('Breakdown not found');

    const newJcId = `jc-${Date.now()}`;
    const jcNumber = `JC-${new Date().getFullYear()}-${String(jobCards.length + 146).padStart(4, '0')}`;

    const newJobCard = {
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
      inspection_status: 'Pending',
      status: assignedMechanicId ? 'Assigned' : 'Open',
      remarks: `Generated from Breakdown ${bd.breakdown_number}`,
    };

    const { data, error } = await supabase.from('job_cards').insert([newJobCard]).select().single();

    if (!error && data) {
      setJobCards((prev) => [data as JobCard, ...prev]);
      await advanceBreakdownStatus(breakdownId, 'Diagnosis');
      await updateVehicle(bd.vehicle_id, { status: 'Under Repair', workshop_id: workshopId });

      await addAuditLog('job_card', newJcId, 'CREATE_JOB_CARD', {
        job_card_number: jcNumber,
        vehicle_id: bd.vehicle_id,
        assigned_to: assignedMechanicId,
      });

      return newJcId;
    } else {
      throw new Error(error?.message || 'Failed to create Job Card');
    }
  };

  const updateJobCard = async (id: string, updates: Partial<JobCard>) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { error } = await supabase.from('job_cards').update(updates).eq('id', id);
    if (!error) {
      setJobCards((prev) =>
        prev.map((jc) => (jc.id === id ? { ...jc, ...updates, updated_at: new Date().toISOString() } : jc))
      );
      await addAuditLog('job_card', id, 'UPDATE_JOB_CARD', updates);
    }
  };

  const advanceJobCardStatus = async (jobCardId: string, nextStatus: JobCardStatus, remarks?: string) => {
    const jc = jobCards.find((j) => j.id === jobCardId);
    if (!jc) return;

    const updates: Partial<JobCard> = { status: nextStatus, remarks: remarks || jc.remarks };
    if (nextStatus === 'Repair' && !jc.work_started_at) {
      updates.work_started_at = new Date().toISOString();
      await updateVehicle(jc.vehicle_id, { status: 'Under Repair' });
    }
    if (nextStatus === 'Inspection') {
      updates.work_completed_at = new Date().toISOString();
      await updateVehicle(jc.vehicle_id, { status: 'Under Inspection' });
    }
    if (nextStatus === 'Closed') {
      updates.closed_at = new Date().toISOString();
      await updateVehicle(jc.vehicle_id, { status: 'Ready for Deployment' });
    }

    await updateJobCard(jobCardId, updates);
    await addAuditLog('job_card', jobCardId, 'ADVANCE_JOB_CARD_STATUS', { new_status: nextStatus, remarks });
  };

  const issuePartToJobCard = async (
    jobCardId: string,
    partId: string,
    quantity: number
  ): Promise<{ success: boolean; message: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, message: 'No db connection' };

    const part = parts.find((p) => p.id === partId);
    if (!part) return { success: false, message: 'Part not found' };
    if (part.current_stock < quantity) {
      return {
        success: false,
        message: `Insufficient stock for ${part.part_name}. Current stock is only ${part.current_stock} ${part.unit}`,
      };
    }

    const cost = quantity * part.purchase_price;
    const newJcp = {
      id: `jcp-${Date.now()}`,
      job_card_id: jobCardId,
      part_id: partId,
      quantity,
      unit_price: part.purchase_price,
      issued_by: currentUser?.id || 'system',
    };

    const { data, error } = await supabase.from('job_card_parts').insert([newJcp]).select().single();
    if (!error && data) {
      // triggers in DB will update inventory and job card actual cost
      await fetchInitialData(); // refresh to get updated stock and actual cost
      
      await addAuditLog('part', partId, 'ISSUE_TO_JOB_CARD', {
        part_name: part.part_name,
        job_card_id: jobCardId,
        quantity,
        cost,
      });

      return { success: true, message: `Successfully issued ${quantity} ${part.unit} of ${part.part_name}` };
    }
    
    return { success: false, message: error?.message || 'Failed' };
  };

  const approveAndCloseJobCard = async (jobCardId: string, remarks?: string) => {
    const jc = jobCards.find((j) => j.id === jobCardId);
    if (!jc) return;

    const nowIso = new Date().toISOString();
    const updates: Partial<JobCard> = {
      status: 'Closed',
      inspection_status: 'Passed',
      approved_by: currentUser?.id || 'system',
      approved_at: nowIso,
      closed_at: nowIso,
      remarks: remarks || jc.remarks || 'Work verified and approved for redeployment.',
    };

    await updateJobCard(jobCardId, updates);
    await updateVehicle(jc.vehicle_id, { status: 'Ready for Deployment' });

    if (jc.breakdown_id) {
      await advanceBreakdownStatus(jc.breakdown_id, 'Completed');
    }

    await addAuditLog('job_card', jobCardId, 'APPROVE_AND_CLOSE', {
      approved_by: currentUser?.full_name || 'System User',
      remarks,
    });
  };

  const assignRedeployment = async (data: {
    original_vehicle_id: string;
    replacement_vehicle_id: string;
    ward_id: string;
    zone_id: string;
    deployment_location: string;
    assigned_driver_id?: string;
    reason: string;
  }) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const newId = `rd-${Date.now()}`;
    const newRedeployment = {
      ...data,
      id: newId,
      status: 'Active',
      approved_by: currentUser?.id || 'system',
    };

    const { data: insertedData, error } = await supabase.from('redeployments').insert([newRedeployment]).select().single();
    
    if (!error && insertedData) {
      setRedeployments((prev) => [insertedData as Redeployment, ...prev]);
      await updateVehicle(data.replacement_vehicle_id, {
        status: 'Running',
        assigned_ward_id: data.ward_id,
        assigned_zone_id: data.zone_id,
        assigned_driver_id: data.assigned_driver_id,
      });

      await addAuditLog('redeployment', newId, 'ASSIGN_REPLACEMENT', {
        original_vehicle: data.original_vehicle_id,
        replacement_vehicle: data.replacement_vehicle_id,
        ward: data.ward_id,
      });
    }
  };

  const releaseRedeployment = async (redeploymentId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const rd = redeployments.find((r) => r.id === redeploymentId);
    if (!rd) return;

    const nowIso = new Date().toISOString();
    const { error } = await supabase.from('redeployments').update({ status: 'Released', release_date: nowIso }).eq('id', redeploymentId);

    if (!error) {
      setRedeployments((prev) =>
        prev.map((r) => (r.id === redeploymentId ? { ...r, status: 'Released', release_date: nowIso } : r))
      );
      await updateVehicle(rd.replacement_vehicle_id, { status: 'Available' });
      await addAuditLog('redeployment', redeploymentId, 'RELEASE_REPLACEMENT', {
        replacement_vehicle: rd.replacement_vehicle_id,
      });
    }
  };

  const addPart = async (partData: Omit<Part, 'id' | 'created_at'>) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const newId = `prt-${Date.now()}`;
    const newPart = {
      ...partData,
      id: newId,
    };
    
    const { data, error } = await supabase.from('parts').insert([newPart]).select().single();
    if (!error && data) {
      setParts((prev) => [data as Part, ...prev]);
      await addAuditLog('part', newId, 'CREATE_PART', { name: newPart.part_name, number: newPart.part_number });
    }
  };

  const adjustPartStock = async (
    partId: string,
    quantityDelta: number,
    transactionType: 'purchase' | 'issue' | 'return' | 'adjustment',
    remarks: string
  ) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    const p = parts.find(pt => pt.id === partId);
    if (!p) return;
    
    const newStock = Math.max(0, p.current_stock + quantityDelta);
    const { error } = await supabase.from('parts').update({ current_stock: newStock }).eq('id', partId);

    if (!error) {
      setParts((prev) => prev.map((pt) => pt.id === partId ? { ...pt, current_stock: newStock } : pt));
      
      const newTxn = {
        id: `TXN-${Date.now()}`,
        part_id: partId,
        transaction_type: transactionType,
        quantity: quantityDelta,
        remarks,
        performed_by: currentUser?.id || 'system',
      };
      await supabase.from('inventory_transactions').insert([newTxn]);

      await addAuditLog('part', partId, 'STOCK_ADJUSTMENT', {
        transaction_type: transactionType,
        delta: quantityDelta,
        remarks,
      });
    }
  };

  const addMaintenanceSchedule = async (scheduleData: Omit<MaintenanceSchedule, 'id' | 'created_at'>) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const newId = `ms-${Date.now()}`;
    const newSchedule = {
      ...scheduleData,
      id: newId,
    };
    
    const { data, error } = await supabase.from('maintenance_schedules').insert([newSchedule]).select().single();
    if (!error && data) {
      setMaintenanceSchedules((prev) => [data as MaintenanceSchedule, ...prev]);
      await addAuditLog('maintenance', newId, 'SCHEDULE_MAINTENANCE', {
        vehicle: scheduleData.vehicle_id,
        title: scheduleData.title,
      });
    }
  };

  const completeMaintenance = async (scheduleId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const nowIso = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('maintenance_schedules').update({ status: 'Completed', completed_date: nowIso }).eq('id', scheduleId);
    
    if (!error) {
      setMaintenanceSchedules((prev) =>
        prev.map((m) => (m.id === scheduleId ? { ...m, status: 'Completed', completed_date: nowIso } : m))
      );
      await addAuditLog('maintenance', scheduleId, 'COMPLETE_MAINTENANCE');
    }
  };

  const resetAllData = async () => {
    // In live mode, we might not want this to do anything or drop all tables which is dangerous.
    console.warn("Reset All Data called - unsupported in live Supabase mode via client side.");
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
        isLoading,
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
        refreshData: fetchInitialData
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
