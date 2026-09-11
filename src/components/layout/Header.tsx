import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Bell,
  Clock,
  Car,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import type { UserRole } from '../../types';
import { getSupabaseConfig } from '../../lib/supabase';

interface HeaderProps {
  onOpenSupabaseModal: () => void;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSupabaseModal, onSelectTab }) => {
  const { currentRole, currentUser, setRole, logout } = useAuth();
  const { kpi, refreshData } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [timeStr, setTimeStr] = useState<string>('');
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cfg = getSupabaseConfig();
    setIsSupabaseConfigured(Boolean(cfg.anonKey));
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-3 no-print shadow-xs">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and Municipal Identity */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-0.5 shadow-md shadow-emerald-500/10 flex items-center justify-center">
            <div className="h-full w-full bg-slate-900 dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Car className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                NAGAR NIGAM ALIGARH
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                SBM (Urban)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vehicle Workshop & Fleet Management System (VWFMS)
            </p>
          </div>
        </div>

        {/* Center Live Stats Ticker */}
        <div className="hidden xl:flex items-center gap-4 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 px-3.5 py-1.5 rounded-lg">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="font-mono text-slate-800 dark:text-slate-300 font-medium">{timeStr}</span>
          </div>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">Availability:</span>
            <span
              className={`font-semibold px-1.5 py-0.5 rounded ${
                kpi.availabilityPercentage >= kpi.targetAvailabilityPercentage
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
              }`}
            >
              {kpi.availabilityPercentage}%
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-[10px]">(Target: {kpi.targetAvailabilityPercentage}%)</span>
          </div>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 dark:text-slate-400">Downtime:</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{kpi.totalDowntimeHours} hrs</span>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Supabase Connection Status Badge */}
          <button
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isSupabaseConfigured
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Configure Supabase Database"
          >
            <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured ? 'text-emerald-600 dark:text-emerald-400 animate-pulse' : 'text-cyan-600 dark:text-cyan-400'}`} />
            <span className="hidden sm:inline font-semibold">
              {isSupabaseConfigured ? 'Supabase Connected' : 'Supabase Setup'}
            </span>
          </button>

          {/* Authenticated Officer & Role Switcher */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <div className="flex items-center gap-1.5 px-2">
              <div className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                {currentUser?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[130px]">
                  {currentUser?.full_name}
                </p>
              </div>
            </div>

            <select
              value={currentRole}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-semibold py-1 px-2 rounded border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              title="Switch simulated role for testing"
            >
              <option value="nagar_nigam_officer">Officer (IAS / Comm.)</option>
              <option value="fleet_manager">Fleet Manager</option>
              <option value="workshop_manager">Workshop Manager</option>
              <option value="mechanic">Mechanic</option>
              <option value="driver">Driver</option>
              <option value="project_manager">Project Manager</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {/* Secure Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50 dark:hover:bg-rose-900/50 transition-colors shadow-2xs"
            title="Sign out of municipal session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* Quick Alert Bell */}
          <button
            onClick={() => onSelectTab('maintenance')}
            className="relative p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-transparent"
            title={`${kpi.documentsExpiringSoon + kpi.lowStockPartsCount} Active Alerts`}
          >
            <Bell className="w-4 h-4" />
            {kpi.documentsExpiringSoon + kpi.lowStockPartsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>

          {/* Refresh Data Button */}
          <button
            onClick={() => refreshData()}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors border border-slate-200 dark:border-transparent"
            title="Refresh Live Data from Supabase"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors border border-slate-200 dark:border-transparent"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-indigo-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
