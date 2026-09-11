import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Repeat,
  CheckCircle2,
  Truck,
  MapPin,
  User,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

export default function RedeploymentDesk() {
  const { redeployments, vehicles, wards, users, isLoading } = useApp();
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Released'>('All');

  const filteredRedeployments = redeployments.filter((r) => {
    if (filterStatus === 'All') return true;
    return r.status === filterStatus;
  });

  const activeCount = redeployments.filter((r) => r.status === 'Active').length;

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading redeployments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Field Redeployment & Standby Desk
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Maintain zero-downtime sanitation routes by deploying standby replacement vehicles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'All'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            All ({redeployments.length})
          </button>
          <button
            onClick={() => setFilterStatus('Active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'Active'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Active Standby ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('Released')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterStatus === 'Released'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Released
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-500/30 flex items-start gap-3">
        <Repeat className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <strong className="text-teal-900 dark:text-teal-200 font-bold">Standard Operating Procedure (SOP):</strong> When a primary municipal vehicle enters breakdown or workshop status, an emergency standby vehicle is assigned to the ward route within 45 minutes to guarantee zero civic garbage accumulation.
        </div>
      </div>

      {/* Grid of Redeployments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRedeployments.map((r) => {
          const original = vehicles.find((v) => v.id === r.original_vehicle_id);
          const replacement = vehicles.find((v) => v.id === r.replacement_vehicle_id);
          const ward = wards.find((w) => w.id === r.ward_id);
          const driver = users.find((u) => u.id === r.assigned_driver_id);

          return (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              {/* Top Row: Ward & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {ward ? `Ward ${ward.ward_number}: ${ward.name}` : r.ward_id}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    r.status === 'Active'
                      ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30'
                      : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                  }`}
                >
                  {r.status === 'Active' ? 'Active in Field' : 'Released Back to Pool'}
                </span>
              </div>

              {/* Vehicle Swap Comparison */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-[11px] text-rose-600 font-bold uppercase block mb-1">
                    Original (In Shop)
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <Truck className="w-3.5 h-3.5 text-rose-500" />
                    <span>{original?.registration_number || 'Unknown'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {original?.vehicle_type}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-teal-600 font-bold uppercase block mb-1">
                    Standby Replacement
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                    <span>{replacement?.registration_number || 'Unknown'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {replacement?.vehicle_type}
                  </div>
                </div>
              </div>

              {/* Deployment Details */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <p>
                  <strong className="text-slate-700 dark:text-slate-300">Reason:</strong> {r.reason}
                </p>
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-700/50">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Driver: <strong className="text-slate-800 dark:text-slate-200">{driver?.full_name || 'Standby Driver'}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {format(new Date(r.deployment_date), 'dd MMM yyyy')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredRedeployments.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
            No redeployments recorded under this filter.
          </div>
        )}
      </div>
    </div>
  );
}
