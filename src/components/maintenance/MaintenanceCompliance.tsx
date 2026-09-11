import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Filter,
  Clock,
  ShieldAlert,
  FileCheck,
  Truck,
} from 'lucide-react';

export default function MaintenanceCompliance() {
  const { vehicles, isLoading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [docFilter, setDocFilter] = useState<'all' | 'expired' | 'dueSoon' | 'valid'>('all');

  const now = new Date();

  // Calculate compliance statistics across vehicles
  const complianceData = useMemo(() => {
    return vehicles.map((v) => {
      const getDiffDays = (dateStr: string) => {
        if (!dateStr) return 999;
        const target = new Date(dateStr);
        return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      };

      const fitnessDays = getDiffDays(v.fitness_expiry);
      const insuranceDays = getDiffDays(v.insurance_expiry);
      const pucDays = getDiffDays(v.puc_expiry);
      const permitDays = getDiffDays(v.permit_expiry);

      const minDays = Math.min(fitnessDays, insuranceDays, pucDays, permitDays);
      let status: 'expired' | 'dueSoon' | 'valid' = 'valid';
      if (minDays < 0) status = 'expired';
      else if (minDays <= 30) status = 'dueSoon';

      return {
        vehicle: v,
        fitnessDays,
        insuranceDays,
        pucDays,
        permitDays,
        minDays,
        status,
      };
    });
  }, [vehicles]);

  const filteredCompliance = useMemo(() => {
    return complianceData.filter((item) => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch =
        item.vehicle.registration_number.toLowerCase().includes(searchStr) ||
        item.vehicle.vehicle_type.toLowerCase().includes(searchStr) ||
        item.vehicle.make.toLowerCase().includes(searchStr);

      const matchesFilter = docFilter === 'all' || item.status === docFilter;
      return matchesSearch && matchesFilter;
    });
  }, [complianceData, searchTerm, docFilter]);

  const stats = useMemo(() => {
    const expiredCount = complianceData.filter((i) => i.status === 'expired').length;
    const dueSoonCount = complianceData.filter((i) => i.status === 'dueSoon').length;
    const validCount = complianceData.filter((i) => i.status === 'valid').length;
    return { expiredCount, dueSoonCount, validCount };
  }, [complianceData]);

  const getPill = (days: number) => {
    if (days < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300">
          Expired ({Math.abs(days)}d ago)
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300">
          Due in {days}d
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300">
        Valid ({days}d)
      </span>
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading compliance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Maintenance & Legal Compliance
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Statutory fitness certificates, commercial insurance, PUC, and municipal route permits
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Expired Documents</p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400 font-mono">
              {stats.expiredCount} Vehicles
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Due in 30 Days</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              {stats.dueSoonCount} Vehicles
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fully Compliant Fleet</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.validCount} Vehicles
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vehicle number or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={docFilter}
            onChange={(e) => setDocFilter(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">All Vehicles ({complianceData.length})</option>
            <option value="expired">Critical: Expired ({stats.expiredCount})</option>
            <option value="dueSoon">Urgent: Due in 30 Days ({stats.dueSoonCount})</option>
            <option value="valid">Compliant ({stats.validCount})</option>
          </select>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Vehicle Details</th>
                <th className="p-4">RTO Fitness</th>
                <th className="p-4">Insurance Policy</th>
                <th className="p-4">PUC Certificate</th>
                <th className="p-4">Municipal Permit</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredCompliance.map(({ vehicle, fitnessDays, insuranceDays, pucDays, permitDays, status }) => (
                <tr key={vehicle.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {vehicle.registration_number}
                      </span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                      {vehicle.make} {vehicle.model} • {vehicle.category}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="font-mono text-slate-700 dark:text-slate-300 font-medium mb-1">
                      {vehicle.fitness_expiry}
                    </div>
                    {getPill(fitnessDays)}
                  </td>

                  <td className="p-4">
                    <div className="font-mono text-slate-700 dark:text-slate-300 font-medium mb-1">
                      {vehicle.insurance_expiry}
                    </div>
                    {getPill(insuranceDays)}
                  </td>

                  <td className="p-4">
                    <div className="font-mono text-slate-700 dark:text-slate-300 font-medium mb-1">
                      {vehicle.puc_expiry}
                    </div>
                    {getPill(pucDays)}
                  </td>

                  <td className="p-4">
                    <div className="font-mono text-slate-700 dark:text-slate-300 font-medium mb-1">
                      {vehicle.permit_expiry}
                    </div>
                    {getPill(permitDays)}
                  </td>

                  <td className="p-4">
                    {status === 'expired' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200">
                        Action Required
                      </span>
                    ) : status === 'dueSoon' ? (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                        Renew Soon
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                        Clear
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredCompliance.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No vehicles found matching the compliance filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
