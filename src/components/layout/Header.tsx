import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Database,
  RefreshCw,
  UserCheck,
  Bell,
  Clock,
  Car,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { getSupabaseConfig } from '../../lib/supabase';

interface HeaderProps {
  onOpenSupabaseModal: () => void;
  onSelectTab: (tab: string) => void;
}

const roleDisplayNames: Record<UserRole, { title: string; subtitle: string; badgeColor: string }> = {
  super_admin: { title: 'Super Admin', subtitle: 'System & Master Controller', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  nagar_nigam_officer: { title: 'Nagar Nigam Officer', subtitle: 'Commissioner / Executive Monitoring', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  project_manager: { title: 'Project Manager (SBM)', subtitle: 'Swachh Bharat Mission Ops', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  fleet_manager: { title: 'Fleet Manager', subtitle: 'Fleet Allocation & Standby Desk', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  workshop_manager: { title: 'Workshop Manager', subtitle: 'Central Depot & Repair Control', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  mechanic: { title: 'Mechanic', subtitle: 'Depot Repair Technician', badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  driver: { title: 'Driver / Staff', subtitle: 'Vehicle Operator & Field Reporting', badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
};

export const Header: React.FC<HeaderProps> = ({ onOpenSupabaseModal, onSelectTab }) => {
  const { currentRole, setRole, currentUser } = useAuth();
  const { kpi, resetAllData } = useApp();
  const [timeStr, setTimeStr] = useState<string>('');
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cfg = getSupabaseConfig();
    setIsSupabaseConfigured(Boolean(cfg.anonKey));
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 py-3 no-print">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and Municipal Identity */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Car className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg text-white tracking-tight">
                NAGAR NIGAM ALIGARH
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                SBM (Urban)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Vehicle Workshop & Fleet Management System (VWFMS)
            </p>
          </div>
        </div>

        {/* Center Live Stats Ticker */}
        <div className="hidden xl:flex items-center gap-4 text-xs bg-slate-950/60 border border-slate-800/80 px-3.5 py-1.5 rounded-lg">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-slate-300">{timeStr}</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Availability:</span>
            <span
              className={`font-semibold px-1.5 py-0.5 rounded ${
                kpi.availabilityPercentage >= kpi.targetAvailabilityPercentage
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {kpi.availabilityPercentage}%
            </span>
            <span className="text-slate-500 text-[10px]">(Target: {kpi.targetAvailabilityPercentage}%)</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Downtime:</span>
            <span className="font-mono font-bold text-amber-400">{kpi.totalDowntimeHours} hrs</span>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Supabase Connection Status Badge */}
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isSupabaseConfigured
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Configure Supabase Database"
          >
            <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`} />
            <span className="hidden sm:inline">
              {isSupabaseConfigured ? 'Supabase Connected' : 'Supabase Setup'}
            </span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg p-1">
            <div className="flex items-center gap-1 px-1.5 text-slate-400">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-medium hidden lg:inline">Role:</span>
            </div>
            <select
              value={currentRole}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-slate-900 text-white text-xs font-semibold py-1 px-2 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="nagar_nigam_officer">Officer (IAS / Comm.)</option>
              <option value="fleet_manager">Fleet Manager</option>
              <option value="workshop_manager">Workshop Manager</option>
              <option value="mechanic">Mechanic</option>
              <option value="driver">Driver</option>
              <option value="project_manager">Project Manager</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {/* Quick Alert Bell */}
          <button
            onClick={() => onSelectTab('maintenance')}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={`${kpi.documentsExpiringSoon + kpi.lowStockPartsCount} Active Alerts`}
          >
            <Bell className="w-4 h-4" />
            {kpi.documentsExpiringSoon + kpi.lowStockPartsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (confirm('Reset all demo fleet data to Nagar Nigam Aligarh initial state?')) {
                resetAllData();
              }
            }}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset to Initial Aligarh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
