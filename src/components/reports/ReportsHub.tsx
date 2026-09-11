import { useApp } from '../../context/AppContext';
import { FileText, Download, BarChart2, TrendingUp, Filter, Printer } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ReportsHub() {
  const { kpi, isLoading } = useApp();

  // Mock data for charts
  const downtimeTrendData = [
    { name: 'Jan', downtime: 120, target: 80 },
    { name: 'Feb', downtime: 145, target: 80 },
    { name: 'Mar', downtime: 110, target: 80 },
    { name: 'Apr', downtime: 95, target: 80 },
    { name: 'May', downtime: 105, target: 80 },
    { name: 'Jun', downtime: 85, target: 80 },
    { name: 'Jul', downtime: 75, target: 80 },
  ];

  const repairCostData = [
    { name: 'Heavy', cost: 45000 },
    { name: 'Medium', cost: 28000 },
    { name: 'Light', cost: 12000 },
    { name: 'Special', cost: 35000 },
  ];

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading reports...</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Reports & Analytics Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Generate MIS reports for fleet management & municipal administration</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-500">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fleet Availability</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{kpi.availabilityPercentage}%</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Avg Repair Time</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{kpi.averageRepairTimeHours}h</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm print:bg-white print:border-slate-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 print:text-slate-900">Downtime Trends (Hours)</h2>
            <select className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-sm text-slate-700 dark:text-slate-300 no-print">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={downtimeTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDowntime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="downtime" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDowntime)" name="Actual Downtime" />
                <Area type="step" dataKey="target" stroke="#10b981" strokeWidth={2} fill="none" strokeDasharray="5 5" name="Target Max" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Chart */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm print:bg-white print:border-slate-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 print:text-slate-900">Repair Cost by Category (₹)</h2>
            <button className="text-slate-400 hover:text-slate-600 no-print"><Filter className="w-4 h-4" /></button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repairCostData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#f1f5f9', opacity: 0.6}}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${Number(value || 0).toLocaleString()}`, 'Total Cost']}
                />
                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm print:border-slate-300">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 print:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 print:text-slate-900">Standard Reports (MIS)</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700/50 print:divide-slate-200">
          {[
            { title: 'Daily Vehicle Availability Report', desc: 'Status of all vehicles at 8:00 AM', format: 'PDF, CSV' },
            { title: 'Monthly Breakdown Analysis', desc: 'Summary of breakdowns by category and zone', format: 'PDF, Excel' },
            { title: 'Spare Parts Consumption Log', desc: 'Detailed issue log for workshop inventory', format: 'Excel' },
            { title: 'Vehicle Fitness & Insurance Due List', desc: 'Vehicles requiring document renewal within 30 days', format: 'PDF, CSV' }
          ].map((report, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 print:border print:border-slate-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-200 print:text-slate-800">{report.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{report.desc}</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-semibold flex items-center gap-1.5 no-print">
                <Download className="w-4 h-4" />
                <span>{report.format}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
