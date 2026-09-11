import React from 'react';
import {
  AlertTriangle,
  Repeat,
  Wrench,
  Truck,
  PlusCircle,
  FileSpreadsheet,
  Building2,
  MapPin,
} from 'lucide-react';
import { KPICards } from './KPICards';
import { DowntimeChart } from './DowntimeChart';
import { UrgentAlerts } from './UrgentAlerts';
import { useAuth } from '../../context/AuthContext';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onOpenReportBreakdown: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenReportBreakdown }) => {
  const { canReportBreakdown, canRedeploy, canManageJobCards } = useAuth();

  return (
    <div className="space-y-6">
      {/* Top Banner with Civic Operations Summary */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
            <Building2 className="w-4 h-4" />
            <span>NAGAR NIGAM ALIGARH – CENTRAL CONTROL & COMMAND</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight">
            Fleet Operations & Workshop Monitoring System
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time tracking of municipal solid waste compactors, tippers, sewer suction jetting units, and road sweepers across 4 administrative zones and 70 wards.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {canReportBreakdown && (
            <button
              onClick={onOpenReportBreakdown}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Breakdown
            </button>
          )}

          {canRedeploy && (
            <button
              onClick={() => onNavigate('redeployment')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-all shadow-lg shadow-cyan-600/20 active:scale-95"
            >
              <Repeat className="w-4 h-4" />
              Assign Standby Vehicle
            </button>
          )}

          {canManageJobCards && (
            <button
              onClick={() => onNavigate('workshop')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <Wrench className="w-4 h-4" />
              Workshop Board
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Urgent Alerts */}
      <UrgentAlerts onNavigate={onNavigate} />

      {/* Downtime Charts */}
      <DowntimeChart />
    </div>
  );
};
