import React from 'react';
import {
  AlertTriangle,
  Clock,
  PackageX,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface UrgentAlertsProps {
  onNavigate: (tab: string) => void;
  onSelectVehicle?: (regNo: string) => void;
}

export const UrgentAlerts: React.FC<UrgentAlertsProps> = ({ onNavigate }) => {
  const { breakdowns, parts, vehicles, kpi } = useApp();

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
      <div className="p-4 rounded-xl bg-slate-900 border border-rose-500/30 bg-gradient-to-b from-rose-950/20 to-slate-900 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Critical Breakdowns ({criticalBreakdowns.length})
            </h4>
          </div>
          <button
            onClick={() => onNavigate('breakdowns')}
            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
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
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-rose-900/40 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span className="font-mono text-rose-300">{veh?.registration_number || b.breakdown_number}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      {elapsedHours}h ago
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{b.problem_description}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{b.location}</span>
                    <span className="font-semibold text-amber-400">{b.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Bottleneck: High Downtime Vehicles (>30h) */}
      <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-900 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-amber-500/20 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Long Downtime Alerts ({longDowntimeBreakdowns.length})
            </h4>
          </div>
          <button
            onClick={() => onNavigate('workshop')}
            className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
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
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-amber-900/40 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span className="font-mono text-amber-300">{veh?.registration_number}</span>
                    <span className="text-[10px] font-bold text-rose-400">
                      Downtime: {elapsedHours} hrs
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{veh?.vehicle_type}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Category: {b.problem_category}</span>
                    <span className="font-semibold text-cyan-400">{b.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Low Spares Inventory */}
      <div className="p-4 rounded-xl bg-slate-900 border border-orange-500/30 bg-gradient-to-b from-orange-950/20 to-slate-900 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-orange-500/20 text-orange-400">
              <PackageX className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Low Stock Spares ({lowStockParts.length})
            </h4>
          </div>
          <button
            onClick={() => onNavigate('parts')}
            className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 font-medium"
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
                className="p-2.5 rounded-lg bg-slate-950/60 border border-orange-900/40 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-white">
                  <span className="truncate pr-2">{p.part_name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 shrink-0">
                    Stock: {p.current_stock} {p.unit}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Part #{p.part_number}</span>
                  <span>Min Threshold: {p.min_stock}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
