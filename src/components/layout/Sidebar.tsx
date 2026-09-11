import React from 'react';
import {
  LayoutDashboard,
  Truck,
  AlertTriangle,
  Wrench,
  Package,
  Repeat,
  CalendarCheck,
  FileBarChart2,
  History,
  Database,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { kpi, breakdowns, jobCards, redeployments } = useApp();
  const { currentRole, currentUser } = useAuth();

  const activeBreakdownsCount = breakdowns.filter(
    (b) => b.status !== 'Completed' && b.status !== 'Field Redeployment'
  ).length;

  const activeJobsCount = jobCards.filter((jc) => jc.status !== 'Closed').length;
  const activeRedeploymentsCount = redeployments.filter((r) => r.status === 'Active').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      hindiLabel: 'डैशबोर्ड एवं मुख्य संकेतक',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'vehicles',
      label: 'Vehicle Master & 360°',
      hindiLabel: 'वाहन मास्टर एवं ३६०° प्रोफाइल',
      icon: Truck,
      badge: `${kpi.totalFleet}`,
      badgeColor: 'bg-slate-700 text-slate-200',
    },
    {
      id: 'breakdowns',
      label: 'Breakdown Management',
      hindiLabel: 'ब्रेकडाउन एवं संग्रहण',
      icon: AlertTriangle,
      badge: activeBreakdownsCount > 0 ? `${activeBreakdownsCount}` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    {
      id: 'workshop',
      label: 'Workshop & Job Cards',
      hindiLabel: 'कार्यशाला एवं जॉब कार्ड',
      icon: Wrench,
      badge: activeJobsCount > 0 ? `${activeJobsCount}` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'parts',
      label: 'Spare Parts & Inventory',
      hindiLabel: 'स्पेयर पार्ट्स एवं स्टॉक',
      icon: Package,
      badge: kpi.lowStockPartsCount > 0 ? `${kpi.lowStockPartsCount} Low` : null,
      badgeColor: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    },
    {
      id: 'redeployment',
      label: 'Field Redeployment Desk',
      hindiLabel: 'स्टैंडबाय वाहन एवं प्रतिस्थापन',
      icon: Repeat,
      badge: activeRedeploymentsCount > 0 ? `${activeRedeploymentsCount} Active` : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    },
    {
      id: 'maintenance',
      label: 'Maintenance & Expiries',
      hindiLabel: 'निवारक रखरखाव एवं फिटनेस',
      icon: CalendarCheck,
      badge: kpi.documentsExpiringSoon > 0 ? `${kpi.documentsExpiringSoon} Expiring` : null,
      badgeColor: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      hindiLabel: 'प्रबंधन रिपोर्ट एवं विश्लेषण',
      icon: FileBarChart2,
      badge: null,
    },
    {
      id: 'audit',
      label: 'Audit Trail & History',
      hindiLabel: 'ऑडिट ट्रेल एवं उत्तरदायित्व',
      icon: History,
      badge: null,
    },
    {
      id: 'database',
      label: 'Supabase SQL & Schema',
      hindiLabel: 'डेटाबेस एवं बैकएंड सेटिंग्स',
      icon: Database,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 lg:w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-[calc(100vh-61px)] overflow-y-auto no-print">
      {/* Current User Card */}
      <div className="p-3.5 mx-3 mt-3 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-950/80 border border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
            {currentUser.full_name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{currentUser.full_name}</p>
            <p className="text-[11px] text-cyan-400 capitalize truncate font-medium">
              {currentRole.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="p-3 space-y-1.5 flex-1">
        <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Core Operations
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/10 text-white border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <div className="text-left">
                  <div className="leading-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal leading-tight">{item.hindiLabel}</div>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Branding */}
      <div className="p-3.5 m-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>VWFMS v1.0 Production</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Nagar Nigam Aligarh Municipal Corporation & SBM Portal
        </p>
      </div>
    </aside>
  );
};
