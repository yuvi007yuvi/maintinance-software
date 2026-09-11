import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const DowntimeChart: React.FC = () => {
  const { kpi, vehicles, breakdowns } = useApp();

  // 7-day dynamic availability trend calculated from actual breakdowns & fleet count
  const availabilityTrendData = useMemo(() => {
    const days: { day: string; availability: number; target: number; downtime: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const isToday = i === 0;
      const dayLabel = isToday
        ? `${d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })} (Today)`
        : d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

      if (isToday) {
        days.push({
          day: dayLabel,
          availability: kpi.availabilityPercentage,
          target: kpi.targetAvailabilityPercentage,
          downtime: kpi.totalDowntimeHours,
        });
      } else {
        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).getTime();
        const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59).getTime();

        const activeOnDay = breakdowns.filter((b) => {
          const bStart = new Date(b.breakdown_date || b.created_at).getTime();
          const bEnd = b.status === 'Completed' ? new Date(b.updated_at || b.created_at).getTime() : Date.now();
          return bStart <= endOfDay && bEnd >= startOfDay;
        });

        const activeCount = activeOnDay.length;
        const total = kpi.totalFleet || vehicles.length;
        const availPct = total > 0 ? Math.max(0, Math.min(100, Math.round(((total - activeCount) / total) * 100))) : 100;
        const dayDowntime = activeCount * 8;

        days.push({
          day: dayLabel,
          availability: availPct,
          target: kpi.targetAvailabilityPercentage,
          downtime: dayDowntime,
        });
      }
    }

    return days;
  }, [kpi, breakdowns, vehicles]);

  // Status distribution
  const statusData = [
    { name: 'Deployed / Running', value: kpi.deployedVehicles, color: '#10b981' },
    { name: 'Available Standby', value: kpi.availableVehicles, color: '#06b6d4' },
    { name: 'Under Repair', value: kpi.underRepairVehicles, color: '#f59e0b' },
    { name: 'Awaiting Parts', value: kpi.awaitingPartsVehicles, color: '#f97316' },
    { name: 'Breakdown in Field', value: kpi.breakdownVehicles, color: '#ef4444' },
    { name: 'Ready for Field', value: kpi.readyForDeploymentVehicles, color: '#14b8a6' },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 7-Day Trend Chart */}
      <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              Fleet Availability % vs Downtime Trend
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monitoring daily fleet uptime towards {kpi.targetAvailabilityPercentage}% target
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Availability %</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Target ({kpi.targetAvailabilityPercentage}%)</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={availabilityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="availGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis domain={[50, 100]} stroke="#64748b" fontSize={11} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="availability"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#availGrad)"
                name="Availability"
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="none"
                name="Target Benchmark"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fleet Status Donut Chart */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="mb-2">
          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
            Current Fleet Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time status breakdown ({kpi.totalFleet} vehicles)
          </p>
        </div>

        <div className="h-48 w-full my-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#0f172a',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend pills */}
        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
          {statusData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}:</span>
              <span className="font-bold text-slate-900 dark:text-white ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
