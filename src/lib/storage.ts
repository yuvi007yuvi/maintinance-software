import type {
  AuditLog,
  Breakdown,
  JobCard,
  JobCardPart,
  MaintenanceSchedule,
  Part,
  Redeployment,
  UserProfile,
  Vehicle,
  Ward,
  Workshop,
  Zone,
} from '../types';
import { getSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  VEHICLES: 'vwfms_data_vehicles',
  BREAKDOWNS: 'vwfms_data_breakdowns',
  JOB_CARDS: 'vwfms_data_job_cards',
  PARTS: 'vwfms_data_parts',
  JOB_CARD_PARTS: 'vwfms_data_job_card_parts',
  REDEPLOYMENTS: 'vwfms_data_redeployments',
  MAINTENANCE: 'vwfms_data_maintenance',
  AUDIT_LOGS: 'vwfms_data_audit_logs',
  USERS: 'vwfms_data_users',
  WARDS: 'vwfms_data_wards',
  ZONES: 'vwfms_data_zones',
  WORKSHOPS: 'vwfms_data_workshops',
};

function getFromLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function setToLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export const storage = {
  getVehicles: (): Vehicle[] => getFromLocal(STORAGE_KEYS.VEHICLES, []),
  saveVehicles: (data: Vehicle[]) => setToLocal(STORAGE_KEYS.VEHICLES, data),

  getBreakdowns: (): Breakdown[] => getFromLocal(STORAGE_KEYS.BREAKDOWNS, []),
  saveBreakdowns: (data: Breakdown[]) => setToLocal(STORAGE_KEYS.BREAKDOWNS, data),

  getJobCards: (): JobCard[] => getFromLocal(STORAGE_KEYS.JOB_CARDS, []),
  saveJobCards: (data: JobCard[]) => setToLocal(STORAGE_KEYS.JOB_CARDS, data),

  getParts: (): Part[] => getFromLocal(STORAGE_KEYS.PARTS, []),
  saveParts: (data: Part[]) => setToLocal(STORAGE_KEYS.PARTS, data),

  getJobCardParts: (): JobCardPart[] => getFromLocal(STORAGE_KEYS.JOB_CARD_PARTS, []),
  saveJobCardParts: (data: JobCardPart[]) => setToLocal(STORAGE_KEYS.JOB_CARD_PARTS, data),

  getRedeployments: (): Redeployment[] => getFromLocal(STORAGE_KEYS.REDEPLOYMENTS, []),
  saveRedeployments: (data: Redeployment[]) => setToLocal(STORAGE_KEYS.REDEPLOYMENTS, data),

  getMaintenance: (): MaintenanceSchedule[] => getFromLocal(STORAGE_KEYS.MAINTENANCE, []),
  saveMaintenance: (data: MaintenanceSchedule[]) => setToLocal(STORAGE_KEYS.MAINTENANCE, data),

  getAuditLogs: (): AuditLog[] => getFromLocal(STORAGE_KEYS.AUDIT_LOGS, []),
  saveAuditLogs: (data: AuditLog[]) => setToLocal(STORAGE_KEYS.AUDIT_LOGS, data),

  getUsers: (): UserProfile[] => getFromLocal(STORAGE_KEYS.USERS, []),
  getWards: (): Ward[] => getFromLocal(STORAGE_KEYS.WARDS, []),
  getZones: (): Zone[] => getFromLocal(STORAGE_KEYS.ZONES, []),
  getWorkshops: (): Workshop[] => getFromLocal(STORAGE_KEYS.WORKSHOPS, []),

  resetToDefault: () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  },

  async syncWithSupabase(): Promise<{ synced: boolean; message: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { synced: false, message: 'Supabase client is not configured' };
    }

    try {
      const { data: vData, error: vErr } = await supabase.from('vehicles').select('*');
      if (vErr) throw vErr;
      if (vData && vData.length > 0) {
        storage.saveVehicles(vData as Vehicle[]);
      }

      const { data: bData, error: bErr } = await supabase.from('breakdowns').select('*');
      if (bErr) throw bErr;
      if (bData && bData.length > 0) {
        storage.saveBreakdowns(bData as Breakdown[]);
      }

      const { data: jData, error: jErr } = await supabase.from('job_cards').select('*');
      if (jErr) throw jErr;
      if (jData && jData.length > 0) {
        storage.saveJobCards(jData as JobCard[]);
      }

      const { data: pData, error: pErr } = await supabase.from('parts').select('*');
      if (pErr) throw pErr;
      if (pData && pData.length > 0) {
        storage.saveParts(pData as Part[]);
      }

      return { synced: true, message: 'Successfully synchronized data from Supabase!' };
    } catch (err: any) {
      return { synced: false, message: err.message || 'Supabase sync failed' };
    }
  },
};
