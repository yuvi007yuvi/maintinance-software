import React from 'react';
import {
  AlertTriangle,
  Clock,
  PackageX,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface UrgentAlertsProps {
  onNavigate: (tab: string) => void;
  onSelectVehicle?: (regNo: string) => void;
}

export const UrgentAlerts: React.FC<UrgentAlertsProps> = ({ onNavigate }) => {
  const { breakdowns, parts, vehicles } = useApp();

  // Find critical breakdowns uncompleted
  const criticalBreakdowns = breakdowns.filter(
    (b) => b.severity === 'Critical' && b.status !== 'Completed' && b.status !== 'Field Redeployment'
  );

  // Find low stock items
  const lowStockParts = parts.filter((p) => p.current_stock <= p.min_stock);

  // Vehicles with long downtime (> 30 hours)
  const longDowntimeBreakdowns = breakdowns.filter((b) => {
    if (b.status === 'Completed' || b.status === 'Field Redeployment') return false;
    const hours = (Date.now() - new Date(b.breakdown_date).getTime()) / (1000 * 60 * 60);
    return hours >= 30;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Critical Field Breakdowns */}
      <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-slate-900 border border-rose-200 dark:border-rose-500/30 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Critical Breakdowns ({criticalBreakdowns.length})
            </h4>
          </div>
          <button
            onClick={() => onNavigate('breakdowns')}
            className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold"
          >
            View All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {criticalBreakdowns.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No critical breakdowns in the field</p>
        ) : (
          <div className="space-y-2.5">
            {criticalBreakdowns.slice(0, 2).map((b) => {
              const veh = vehicles.find((v) => v.id === b.vehicle_id);
              const elapsedHours = Math.round(
                (Date.now() - new Date(b.breakdown_date).getTime()) / (1000 * 60 * 60)
              );
              return (
                <div
                  key={b.id}
                  className="p-2.5 rounded-lg bg-white dark:bg-slate-950/60 border border-rose-100 dark:border-rose-900/40 text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                    <span className="font-mono text-rose-600 dark:text-rose-300 font-bold">{veh?.registration_number || b.breakdown_number}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-300 font-bold">
                      {elapsedHours}h ago
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{b.problem_description}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>{b.location}</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{b.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Bottleneck: High Downtime Vehicles (>30h) */}
      <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-slate-900 border border-amber-200 dark:border-amber-500/30 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Long Downtime Alerts ({longDowntimeBreakdowns.length})
            </h4>
          </div>
          <button
            onClick={() => onNavigate('workshop')}
            className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
          >
            Workshop <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {longDowntimeBreakdowns.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">All vehicle repairs within acceptable SLA</p>
        ) : (
          <div className="space-y-2.5">
            {longDowntimeBreakdowns.slice(0, 2).map((b) => {
              const veh = vehicles.find((v) => v.id === b.vehicle_id);
              const elapsedHours = Math.round(
                (Date.now() - new Date(b.breakdown_date).getTime()) / (1000 * 60 * 60)
              );
              return (
                <div
                  key={b.id}
                  className="p-2.5 rounded-lg bg-white dark:bg-slate-950/60 border border-amber-100 dark:border-amber-900/40 text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                    <span className="font-mono text-amber-600 dark:text-amber-300 font-bold">{veh?.registration_number}</span>
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded">
                      Downtime: {elapsedHours} hrs
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{veh?.vehicle_type}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Category: {b.problem_category}</span>
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400">{b.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Low Spares Inventory */}
      <div className="p-4 rounded-xl bg-orange-50/50 dark:bg-slate-900 border border-orange-200 dark:border-orange-500/30 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
              <PackageX className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Low Stock Spares ({lowStockParts.length})
            </h4>
          </div>
          <button
            onClick={() => onNavigate('parts')}
            className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 font-semibold"
          >
            Inventory <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {lowStockParts.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">Workshop parts above reorder thresholds</p>
        ) : (
          <div className="space-y-2.5">
            {lowStockParts.slice(0, 2).map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-950/60 border border-orange-100 dark:border-orange-900/40 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                  <span className="truncate pr-2">{p.part_name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-300 shrink-0 font-bold">
                    Stock: {p.current_stock} {p.unit}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Part No: {p.part_number}</span>
                  <span className="text-amber-600 dark:text-amber-400">Min: {p.min_stock} {p.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
