export type UserRole =
  | 'super_admin'
  | 'nagar_nigam_officer'
  | 'project_manager'
  | 'fleet_manager'
  | 'workshop_manager'
  | 'mechanic'
  | 'driver';

export interface Zone {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Ward {
  id: string;
  ward_number: number;
  name: string;
  zone_id: string;
  sanitation_inspector: string;
  contact_number: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  zone_id?: string;
  avatar_url?: string;
  is_active: boolean;
}

export type VehicleStatus =
  | 'Available'
  | 'Running'
  | 'Deployed'
  | 'Breakdown'
  | 'Under Inspection'
  | 'Under Repair'
  | 'Awaiting Spare Parts'
  | 'Ready for Deployment'
  | 'Inactive'
  | 'Scrapped';

export interface Vehicle {
  id: string;
  registration_number: string; // e.g. UP81 BT 1024
  vehicle_type: string;        // e.g. Refuse Compactor (14 CBM), Dumper Placer, Tipper, JCB, Sewer Jetting Machine
  category: 'Heavy Sanitation' | 'Medium Sanitation' | 'Light Sanitation' | 'Special Equipment';
  make: string;
  model: string;
  manufacturing_year: number;
  fuel_type: 'Diesel' | 'CNG' | 'Electric' | 'Petrol';
  engine_number: string;
  chassis_number: string;
  capacity: string;
  ownership_type: 'Municipal Owned' | 'Contractual' | 'SBM (Swachh Bharat)';
  status: VehicleStatus;
  assigned_zone_id: string;
  assigned_ward_id: string;
  assigned_driver_id?: string;
  workshop_id?: string;
  purchase_date: string;
  insurance_expiry: string;
  fitness_expiry: string;
  puc_expiry: string;
  permit_expiry: string;
  current_odometer_km: number;
  created_at: string;
  updated_at: string;
}

export interface Workshop {
  id: string;
  name: string;
  location: string;
  capacity: number;
  manager_id: string;
}

export type BreakdownSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type BreakdownStatus =
  | 'Reported'
  | 'Acknowledged'
  | 'Vehicle Collected'
  | 'Workshop Received'
  | 'Diagnosis'
  | 'Repair'
  | 'Inspection'
  | 'Completed'
  | 'Field Redeployment';

export interface Breakdown {
  id: string;
  breakdown_number: string; // BD-2026-0089
  vehicle_id: string;
  driver_id?: string;
  reported_by: string;
  location: string;
  ward_id: string;
  breakdown_date: string;
  problem_category: string;
  problem_description: string;
  severity: BreakdownSeverity;
  vehicle_condition?: string;
  photo_url?: string;
  status: BreakdownStatus;
  acknowledged_by?: string;
  acknowledged_at?: string;
  collected_at?: string;
  workshop_received_at?: string;
  created_at: string;
}

export type JobCardStatus =
  | 'Open'
  | 'Assigned'
  | 'Diagnosis'
  | 'Repair'
  | 'Inspection'
  | 'Approved'
  | 'Closed';

export interface JobCard {
  id: string;
  job_card_number: string; // JC-2026-0142
  breakdown_id?: string;
  vehicle_id: string;
  workshop_id: string;
  complaint: string;
  diagnosis?: string;
  required_repair?: string;
  assigned_mechanic_id?: string;
  estimated_cost: number;
  actual_cost: number;
  work_started_at?: string;
  work_completed_at?: string;
  inspection_status: 'Pending' | 'Passed' | 'Rework Required';
  inspection_remarks?: string;
  inspected_by?: string;
  approved_by?: string;
  approved_at?: string;
  closed_at?: string;
  status: JobCardStatus;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface Part {
  id: string;
  part_name: string;
  part_number: string;
  category: 'Hydraulics' | 'Brakes' | 'Engine' | 'Transmission' | 'Electrical' | 'Special Equipment' | 'Consumables' | 'Suspension';
  compatible_vehicle_types: string;
  unit: string;
  opening_stock: number;
  current_stock: number;
  min_stock: number;
  supplier: string;
  purchase_price: number;
  created_at: string;
}

export interface JobCardPart {
  id: string;
  job_card_id: string;
  part_id: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
  issued_by: string;
  issued_at: string;
}

export interface InventoryTransaction {
  id: string;
  part_id: string;
  transaction_type: 'purchase' | 'issue' | 'return' | 'adjustment';
  quantity: number;
  reference_id?: string;
  remarks?: string;
  performed_by: string;
  created_at: string;
}

export interface Redeployment {
  id: string;
  original_vehicle_id: string;
  replacement_vehicle_id: string;
  ward_id: string;
  zone_id: string;
  deployment_location: string;
  assigned_driver_id?: string;
  reason: string;
  deployment_date: string;
  release_date?: string;
  status: 'Active' | 'Released';
  approved_by: string;
  created_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  vehicle_id: string;
  maintenance_type: 'Preventive' | 'Corrective';
  title: string;
  description: string;
  interval_km?: number;
  interval_days?: number;
  last_service_date?: string;
  next_due_date: string;
  status: 'Scheduled' | 'Overdue' | 'In Progress' | 'Completed';
  completed_date?: string;
  created_at: string;
}

export interface DowntimeLog {
  id: string;
  vehicle_id: string;
  breakdown_id?: string;
  job_card_id?: string;
  start_time: string;
  end_time?: string;
  total_downtime_hours: number;
  cause_category: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  entity_name: 'vehicle' | 'breakdown' | 'job_card' | 'part' | 'redeployment' | 'maintenance' | 'user';
  entity_id: string;
  action: string;
  performed_by: string;
  performed_by_role: UserRole;
  details?: Record<string, any>;
  created_at: string;
}

export interface KPISummary {
  totalFleet: number;
  availableVehicles: number;
  deployedVehicles: number;
  breakdownVehicles: number;
  workshopVehicles: number;
  underRepairVehicles: number;
  awaitingPartsVehicles: number;
  readyForDeploymentVehicles: number;
  availabilityPercentage: number;
  targetAvailabilityPercentage: number;
  totalDowntimeHours: number;
  averageRepairTimeHours: number;
  preventiveMaintenanceDue: number;
  pendingJobCards: number;
  lowStockPartsCount: number;
  documentsExpiringSoon: number;
}
