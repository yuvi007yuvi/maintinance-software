import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Filter,
  ShieldCheck,
  Clock,
  User,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AuditTrailHub() {
  const { auditLogs, isLoading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch =
        log.action.toLowerCase().includes(searchStr) ||
        log.performed_by.toLowerCase().includes(searchStr) ||
        log.entity_name.toLowerCase().includes(searchStr) ||
        log.entity_id.toLowerCase().includes(searchStr);

      const matchesEntity =
        entityFilter === 'All' || log.entity_name === entityFilter;

      return matchesSearch && matchesEntity;
    });
  }, [auditLogs, searchTerm, entityFilter]);

  const entityTypes = ['All', 'vehicle', 'breakdown', 'job_card', 'part', 'redeployment', 'user'];

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading audit trail...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Audit Trail & Municipal Accountability
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Tamper-evident logs of all asset modifications, breakdown reports, and workshop approvals
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, official name, or record ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors capitalize"
          >
            {entityTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Entities' : `Entity: ${t}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit List */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Activity History ({filteredLogs.length} Records)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Immutable Audit Storage
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-700/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {log.action}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[10px] uppercase">
                      {log.entity_name}
                    </span>
                  </div>

                  <div className="text-slate-500 dark:text-slate-400 text-xs">
                    Target Reference: <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{log.entity_id}</span>
                  </div>

                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 mt-1 max-w-xl">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center md:flex-col md:items-end justify-between gap-1 text-[11px] text-slate-500 shrink-0">
                <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>{log.performed_by}</span>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400">({log.performed_by_role})</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{format(new Date(log.created_at), 'dd MMM yyyy, HH:mm:ss')}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              No audit logs found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
