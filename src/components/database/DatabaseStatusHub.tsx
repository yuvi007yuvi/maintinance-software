import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  CheckCircle2,
  RefreshCw,
  Server,
  Layers,
  Copy,
} from 'lucide-react';
import { getSupabaseConfig } from '../../lib/supabase';

interface DatabaseStatusHubProps {
  onOpenSupabaseModal?: () => void;
}

export default function DatabaseStatusHub({ onOpenSupabaseModal }: DatabaseStatusHubProps) {
  const {
    vehicles,
    breakdowns,
    jobCards,
    parts,
    jobCardParts,
    redeployments,
    workshops,
    wards,
    zones,
    users,
    auditLogs,
    refreshData,
    isLoading,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const config = getSupabaseConfig();

  const tables = [
    { name: 'vehicles', count: vehicles.length, desc: 'Municipal Vehicle Asset Master' },
    { name: 'breakdowns', count: breakdowns.length, desc: 'Field Incident Tickets & Triage' },
    { name: 'job_cards', count: jobCards.length, desc: 'Workshop Inspection & Repair Tasks' },
    { name: 'parts', count: parts.length, desc: 'Spare Parts Inventory & Thresholds' },
    { name: 'job_card_parts', count: jobCardParts.length, desc: 'Parts Issued to Job Cards' },
    { name: 'redeployments', count: redeployments.length, desc: 'Standby Vehicle Route Replacements' },
    { name: 'workshops', count: workshops.length, desc: 'Maintenance Depots & Facilities' },
    { name: 'wards', count: wards.length, desc: 'Municipal Sanitation Wards' },
    { name: 'zones', count: zones.length, desc: 'Administrative Civic Zones' },
    { name: 'user_profiles', count: users.length, desc: 'Officers, Drivers & Workshop Staff' },
    { name: 'audit_logs', count: auditLogs.length, desc: 'Tamper-Evident Action Trail' },
  ];

  const totalRecords = tables.reduce((sum, t) => sum + t.count, 0);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(config.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Database & Cloud Backend
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Live telemetry, schema integrity, and synchronized tables on Supabase
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing...' : 'Sync Live DB'}
          </button>

          {onOpenSupabaseModal && (
            <button
              onClick={onOpenSupabaseModal}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
            >
              <Database className="w-3.5 h-3.5" />
              Configure Credentials
            </button>
          )}
        </div>
      </div>

      {/* Connection Info Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-base">
                Supabase PostgreSQL 15 Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3" /> Live & Connected
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>{config.url}</span>
              <button
                onClick={copyUrl}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Copy URL"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {copied && <span className="text-emerald-600 text-[10px]">Copied!</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-700 pt-3 md:pt-0 md:pl-6">
          <div>
            <span className="block text-[11px]">Total Tables</span>
            <strong className="text-base text-slate-900 dark:text-white font-mono">{tables.length}</strong>
          </div>
          <div>
            <span className="block text-[11px]">Total Records</span>
            <strong className="text-base text-emerald-600 dark:text-emerald-400 font-mono">{totalRecords}</strong>
          </div>
          <div>
            <span className="block text-[11px]">Row Level Security</span>
            <strong className="text-base text-blue-600 dark:text-blue-400 font-mono">Enabled</strong>
          </div>
        </div>
      </div>

      {/* Table Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((tbl) => (
          <div
            key={tbl.name}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:border-blue-400 transition-all flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  public.{tbl.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {tbl.desc}
              </p>
            </div>

            <div className="text-right">
              <span className="font-mono font-bold text-lg text-slate-900 dark:text-white">
                {tbl.count}
              </span>
              <span className="block text-[10px] text-slate-400 uppercase font-medium">Rows</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
