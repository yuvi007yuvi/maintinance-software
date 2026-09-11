import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const DowntimeChart: React.FC = () => {
  const { kpi, vehicles, breakdowns } = useApp();

  // 7-day Availability trend
  const availabilityTrendData = [
    { day: '05 Sep', availability: 78, target: 85, downtime: 46 },
    { day: '06 Sep', availability: 80, target: 85, downtime: 42 },
    { day: '07 Sep', availability: 76, target: 85, downtime: 52 },
    { day: '08 Sep', availability: 74, target: 85, downtime: 58 },
    { day: '09 Sep', availability: 72, target: 85, downtime: 64 },
    { day: '10 Sep', availability: 70, target: 85, downtime: 68 },
    { day: '11 Sep (Today)', availability: kpi.availabilityPercentage, target: kpi.targetAvailabilityPercentage, downtime: kpi.totalDowntimeHours },
  ];

  // Status distribution
  const statusData = [
    { name: 'Deployed / Running', value: kpi.deployedVehicles, color: '#10b981' },
    { name: 'Available Standby', value: kpi.availableVehicles, color: '#06b6d4' },
    { name: 'Under Repair', value: kpi.underRepairVehicles, color: '#f59e0b' },
    { name: 'Awaiting Parts', value: kpi.awaitingPartsVehicles, color: '#f97316' },
    { name: 'Breakdown in Field', value: kpi.breakdownVehicles, color: '#ef4444' },
    { name: 'Ready for Field', value: kpi.readyForDeploymentVehicles, color: '#14b8a6' },
  ].filter((item) => item.value > 0);

  // Downtime cause breakdown
  const categoryCount: Record<string, number> = {};
  breakdowns.forEach((b) => {
    categoryCount[b.problem_category] = (categoryCount[b.problem_category] || 0) + 1;
  });

  const causeData = Object.entries(categoryCount).map(([category, count]) => ({
    category,
    count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 7-Day Trend Chart */}
      <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm text-white">
              Fleet Availability % vs Downtime Trend
            </h3>
            <p className="text-xs text-slate-400">
              Monitoring daily fleet uptime towards {kpi.targetAvailabilityPercentage}% target
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Availability %</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-300">Target (85%)</span>
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
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
        <div className="mb-2">
          <h3 className="font-heading font-bold text-sm text-white">
            Current Fleet Distribution
          </h3>
          <p className="text-xs text-slate-400">
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
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend pills */}
        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800 text-[11px]">
          {statusData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-400 truncate">{item.name}:</span>
              <span className="font-bold text-white ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
