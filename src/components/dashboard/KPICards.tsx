import React from 'react';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Clock,
  PackageX,
  Repeat,
  Gauge,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const KPICards: React.FC = () => {
  const { kpi } = useApp();

  const isDowntimeHigh = kpi.totalFleet > 0 && kpi.availabilityPercentage < kpi.targetAvailabilityPercentage;

  return (
    <div className="space-y-4">
      {/* Top Banner KPI highlight: Availability vs 30% Downtime problem statement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Availability Metric Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Fleet Availability
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                !isDowntimeHigh
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30 animate-pulse'
              }`}
            >
              {isDowntimeHigh ? 'Below Target' : 'Optimal'}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-heading font-extrabold text-4xl text-slate-900 dark:text-white">
              {kpi.availabilityPercentage}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Target: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{kpi.targetAvailabilityPercentage}%</strong>
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                !isDowntimeHigh ? 'bg-emerald-500' : 'bg-gradient-to-r from-rose-500 to-amber-500'
              }`}
              style={{ width: `${Math.min(100, kpi.availabilityPercentage)}%` }}
            />
          </div>

          <p className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">
            {kpi.totalFleet > 0
              ? `${kpi.availableVehicles + kpi.deployedVehicles + kpi.readyForDeploymentVehicles} of ${kpi.totalFleet} vehicles ready or deployed in municipal wards`
              : 'Fleet database ready. Register your first vehicle.'}
          </p>
        </div>

        {/* Total Downtime Metric Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Cumulative Downtime
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-4xl text-amber-500 dark:text-amber-400">
              {kpi.totalDowntimeHours}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Hours</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Avg Repair Turnaround:</span>
            <span className="font-semibold text-slate-800 dark:text-white">{kpi.averageRepairTimeHours} hrs / vehicle</span>
          </div>

          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            Automated tracking from Breakdown reported to Gate Pass closure
          </p>
        </div>

        {/* Workshop & Job Card Active Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Workshop Repair Load
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-cyan-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-heading font-extrabold text-4xl text-blue-600 dark:text-cyan-400">
              {kpi.workshopVehicles}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Vehicles in Workshop Bay</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Under Repair</span>
              <span className="font-bold text-slate-800 dark:text-white text-sm">{kpi.underRepairVehicles}</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Awaiting Parts</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{kpi.awaitingPartsVehicles}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Operational Status Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Fleet */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
            <Truck className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] font-semibold">Total Fleet</span>
          </div>
          <p className="font-heading font-bold text-xl text-slate-900 dark:text-white">{kpi.totalFleet}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">All municipal vehicles</span>
        </div>

        {/* Deployed in Field */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-semibold">In Field</span>
          </div>
          <p className="font-heading font-bold text-xl text-emerald-600 dark:text-emerald-400">{kpi.deployedVehicles}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Active ward duties</span>
        </div>

        {/* Available Standby */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-300 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-[11px] font-semibold">Available</span>
          </div>
          <p className="font-heading font-bold text-xl text-cyan-600 dark:text-cyan-400">{kpi.availableVehicles}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Ready in depot yard</span>
        </div>

        {/* Breakdown in Field */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-rose-300 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[11px] font-semibold">Breakdown</span>
          </div>
          <p className="font-heading font-bold text-xl text-rose-600 dark:text-rose-400">{kpi.breakdownVehicles}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Awaiting collection</span>
        </div>

        {/* Ready for Redeployment */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-300 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
            <Repeat className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-[11px] font-semibold">Ready to Roll</span>
          </div>
          <p className="font-heading font-bold text-xl text-teal-600 dark:text-teal-400">{kpi.readyForDeploymentVehicles}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Repaired & inspected</span>
        </div>

        {/* Low Stock Parts */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-300 transition-colors">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
            <PackageX className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[11px] font-semibold">Low Spares</span>
          </div>
          <p className="font-heading font-bold text-xl text-orange-600 dark:text-orange-400">{kpi.lowStockPartsCount}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Below reorder level</span>
        </div>
      </div>
    </div>
  );
};
