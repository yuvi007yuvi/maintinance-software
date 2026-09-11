import React, { useState, useMemo } from 'react';
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
  ChevronDown,
  ChevronRight,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  hindiLabel: string;
  subtitle: string;
  icon: React.ElementType;
  badge?: string | null;
  badgeColor?: string;
}

interface NavSection {
  id: string;
  title: string;
  hindiTitle: string;
  icon: React.ElementType;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { kpi, breakdowns, jobCards, redeployments, auditLogs } = useApp();
  const { currentRole, currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const activeBreakdownsCount = breakdowns.filter(
    (b) => b.status !== 'Completed' && b.status !== 'Field Redeployment'
  ).length;

  const activeJobsCount = jobCards.filter((jc) => jc.status !== 'Closed').length;
  const activeRedeploymentsCount = redeployments.filter((r) => r.status === 'Active').length;

  const sections: NavSection[] = useMemo(() => [
    {
      id: 'command',
      title: 'Executive & Command',
      hindiTitle: 'कमांड एवं नियंत्रण कक्ष',
      icon: LayoutDashboard,
      items: [
        {
          id: 'dashboard',
          label: 'Executive Dashboard',
          hindiLabel: 'डैशबोर्ड एवं मुख्य संकेतक',
          subtitle: 'Live Fleet SLA & Telemetry',
          icon: LayoutDashboard,
          badge: `${kpi.availabilityPercentage}% SLA`,
          badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300',
        },
      ],
    },
    {
      id: 'fleet',
      title: 'Fleet Operations',
      hindiTitle: 'वाहन बेड़ा एवं संचालन',
      icon: Truck,
      items: [
        {
          id: 'vehicles',
          label: 'Fleet Master & 360°',
          hindiLabel: 'वाहन मास्टर एवं ३६०° विवरण',
          subtitle: 'Asset Register & Diagnostics',
          icon: Truck,
          badge: `${kpi.totalFleet} Total`,
          badgeColor: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-700 dark:text-slate-200',
        },
        {
          id: 'maintenance',
          label: 'Compliance & Expiries',
          hindiLabel: 'फिटनेस एवं वैधानिक प्रपत्र',
          subtitle: 'RTO Fitness, Insurance, PUC',
          icon: CalendarCheck,
          badge: kpi.preventiveMaintenanceDue > 0 ? `${kpi.preventiveMaintenanceDue} Due` : 'Clear',
          badgeColor: kpi.preventiveMaintenanceDue > 0
            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300',
        },
        {
          id: 'redeployment',
          label: 'Standby Redeployment',
          hindiLabel: 'आपातकालीन वाहन प्रतिस्थापन',
          subtitle: 'Zero-Downtime Route Desk',
          icon: Repeat,
          badge: activeRedeploymentsCount > 0 ? `${activeRedeploymentsCount} Active` : null,
          badgeColor: 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/20 dark:text-teal-300',
        },
      ],
    },
    {
      id: 'workshop',
      title: 'Workshop & Maintenance',
      hindiTitle: 'कार्यशाला एवं रखरखाव',
      icon: Wrench,
      items: [
        {
          id: 'breakdowns',
          label: 'Breakdown Incidents',
          hindiLabel: 'ब्रेकडाउन एवं संग्रहण',
          subtitle: 'Field Triage & Collection',
          icon: AlertTriangle,
          badge: activeBreakdownsCount > 0 ? `${activeBreakdownsCount} Active` : 'All Clear',
          badgeColor: activeBreakdownsCount > 0
            ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 animate-pulse'
            : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400',
        },
        {
          id: 'workshop',
          label: 'Workshop Job Cards',
          hindiLabel: 'कार्यशाला एवं जॉब कार्ड',
          subtitle: 'Kanban Stages & Mechanic Tasks',
          icon: Wrench,
          badge: activeJobsCount > 0 ? `${activeJobsCount} In-Shop` : null,
          badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300',
        },
        {
          id: 'parts',
          label: 'Spare Parts & Inventory',
          hindiLabel: 'स्पेयर पार्ट्स एवं स्टॉक',
          subtitle: 'Central Depot & Reorder Levels',
          icon: Package,
          badge: kpi.lowStockPartsCount > 0 ? `${kpi.lowStockPartsCount} Low` : 'In Stock',
          badgeColor: kpi.lowStockPartsCount > 0
            ? 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/20 dark:text-orange-300'
            : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-700 dark:text-slate-300',
        },
      ],
    },
    {
      id: 'governance',
      title: 'Governance & Analytics',
      hindiTitle: 'प्रशासन एवं ऑडिट',
      icon: FileBarChart2,
      items: [
        {
          id: 'reports',
          label: 'Reports & Analytics',
          hindiLabel: 'प्रबंधन रिपोर्ट एवं विश्लेषण',
          subtitle: 'MIS Reports & CSV Export',
          icon: FileBarChart2,
          badge: 'MIS',
          badgeColor: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300',
        },
        {
          id: 'audit',
          label: 'Audit Trail & History',
          hindiLabel: 'ऑडिट ट्रेल एवं उत्तरदायित्व',
          subtitle: 'Immutable Action Logs',
          icon: History,
          badge: `${auditLogs.length} Logs`,
          badgeColor: 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-300',
        },
        {
          id: 'database',
          label: 'Database & Supabase',
          hindiLabel: 'डेटाबेस एवं बैकएंड सेटिंग्स',
          subtitle: 'Synchronized Cloud Tables',
          icon: Database,
          badge: 'Live',
          badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300',
        },
      ],
    },
  ], [kpi, activeBreakdownsCount, activeJobsCount, activeRedeploymentsCount, auditLogs.length]);

  // Filter sections by search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const query = searchQuery.toLowerCase();

    return sections
      .map((sec) => {
        const matchesSection = sec.title.toLowerCase().includes(query) || sec.hindiTitle.toLowerCase().includes(query);
        const matchingItems = sec.items.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.hindiLabel.toLowerCase().includes(query) ||
            item.subtitle.toLowerCase().includes(query)
        );

        if (matchesSection) return sec;
        if (matchingItems.length > 0) {
          return { ...sec, items: matchingItems };
        }
        return null;
      })
      .filter(Boolean) as NavSection[];
  }, [sections, searchQuery]);

  return (
    <aside className="w-72 lg:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 h-[calc(100vh-61px)] overflow-hidden no-print select-none shadow-xs">
      {/* Officer Scope Card */}
      <div className="p-3.5 mx-3 mt-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-sm">
            {currentUser.full_name.charAt(0)}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {currentUser.full_name}
              </p>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 font-bold">
                Online
              </span>
            </div>
            <p className="text-[11px] text-blue-600 dark:text-cyan-400 capitalize truncate font-medium">
              {currentRole.replace(/_/g, ' ')}
            </p>
          </div>
        </div>

        {/* Fleet Readiness Bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Fleet Availability</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {kpi.availableVehicles + kpi.deployedVehicles} / {kpi.totalFleet} ({kpi.availabilityPercentage}%)
          </span>
        </div>
      </div>

      {/* Quick Filter Search Bar */}
      <div className="px-3 pt-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search sections or modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Grouped Navigation List */}
      <nav className="p-3 space-y-4 flex-1 overflow-y-auto">
        {filteredSections.map((section) => {
          const isCollapsed = Boolean(collapsedSections[section.id]);
          const SectionIcon = section.icon;

          return (
            <div key={section.id} className="space-y-1">
              {/* Group Section Header */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <SectionIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
                  <div className="text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block leading-tight">
                      {section.title}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-none mt-0.5">
                      {section.hindiTitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {section.items.length}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {/* Items within Section */}
              {!isCollapsed && (
                <div className="space-y-1 pl-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectTab(item.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all group ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-600/20 text-emerald-950 dark:text-white border border-emerald-200 dark:border-emerald-500/30 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isActive
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-slate-800 dark:group-hover:text-white'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="text-left truncate">
                            <div className={`font-semibold leading-tight truncate ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                              {item.label}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                              {item.subtitle}
                            </div>
                          </div>
                        </div>

                        {item.badge && (
                          <span
                            className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs italic">
            No modules match "{searchQuery}"
          </div>
        )}
      </nav>

      {/* Footer Municipal Scope */}
      <div className="p-3.5 m-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] shrink-0">
        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold mb-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>VWFMS v1.0 • Nagar Nigam Aligarh</span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
          Swachh Bharat Mission (SBM) Urban Municipal Fleet Command Portal
        </p>
      </div>
    </aside>
  );
};
