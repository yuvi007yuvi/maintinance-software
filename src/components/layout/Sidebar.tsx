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
  Search,
  X,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
  LogOut,
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
  icon: React.ElementType;
  badge?: string | number | null;
  badgeType?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  pulse?: boolean;
}

interface NavGroup {
  id: string;
  title: string;
  hindiTitle: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { kpi, breakdowns, jobCards, redeployments, auditLogs } = useApp();
  const { currentRole, currentUser, logout } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Metric counts
  const activeBreakdownsCount = breakdowns.filter(
    (b) => b.status !== 'Completed' && b.status !== 'Field Redeployment'
  ).length;
  const activeJobsCount = jobCards.filter((jc) => jc.status !== 'Closed').length;
  const activeRedeploymentsCount = redeployments.filter((r) => r.status === 'Active').length;

  // Nav configuration
  const groups: NavGroup[] = useMemo(() => [
    {
      id: 'command',
      title: 'Command & Telemetry',
      hindiTitle: 'कमांड कक्ष',
      items: [
        {
          id: 'dashboard',
          label: 'Executive Dashboard',
          hindiLabel: 'डैशबोर्ड',
          icon: LayoutDashboard,
          badge: `${kpi.availabilityPercentage}%`,
          badgeType: kpi.availabilityPercentage >= 80 ? 'success' : 'warning',
        },
      ],
    },
    {
      id: 'fleet',
      title: 'Fleet Operations',
      hindiTitle: 'वाहन बेड़ा',
      items: [
        {
          id: 'vehicles',
          label: 'Fleet Master & 360°',
          hindiLabel: 'वाहन रजिस्टर',
          icon: Truck,
          badge: kpi.totalFleet,
          badgeType: 'neutral',
        },
        {
          id: 'maintenance',
          label: 'Compliance & Fitness',
          hindiLabel: 'वैधानिक प्रपत्र',
          icon: CalendarCheck,
          badge: kpi.preventiveMaintenanceDue > 0 ? `${kpi.preventiveMaintenanceDue} Due` : null,
          badgeType: kpi.preventiveMaintenanceDue > 0 ? 'warning' : 'neutral',
        },
        {
          id: 'redeployment',
          label: 'Standby Route Desk',
          hindiLabel: 'प्रतिस्थापन',
          icon: Repeat,
          badge: activeRedeploymentsCount > 0 ? activeRedeploymentsCount : null,
          badgeType: 'info',
        },
      ],
    },
    {
      id: 'workshop',
      title: 'Workshop & Maintenance',
      hindiTitle: 'कार्यशाला',
      items: [
        {
          id: 'breakdowns',
          label: 'Breakdown Incidents',
          hindiLabel: 'ब्रेकडाउन',
          icon: AlertTriangle,
          badge: activeBreakdownsCount > 0 ? activeBreakdownsCount : null,
          badgeType: 'danger',
          pulse: activeBreakdownsCount > 0,
        },
        {
          id: 'workshop',
          label: 'Workshop Job Cards',
          hindiLabel: 'जॉब कार्ड',
          icon: Wrench,
          badge: activeJobsCount > 0 ? activeJobsCount : null,
          badgeType: 'warning',
        },
        {
          id: 'parts',
          label: 'Spares & Inventory',
          hindiLabel: 'स्पेयर पार्ट्स',
          icon: Package,
          badge: kpi.lowStockPartsCount > 0 ? `${kpi.lowStockPartsCount} Low` : null,
          badgeType: kpi.lowStockPartsCount > 0 ? 'warning' : 'neutral',
        },
      ],
    },
    {
      id: 'governance',
      title: 'Governance & Records',
      hindiTitle: 'प्रशासन',
      items: [
        {
          id: 'reports',
          label: 'Analytics & Reports',
          hindiLabel: 'एमआईएस रिपोर्ट',
          icon: FileBarChart2,
        },
        {
          id: 'audit',
          label: 'Audit Trail & Logs',
          hindiLabel: 'ऑडिट लॉग',
          icon: History,
          badge: auditLogs.length > 0 ? auditLogs.length : null,
          badgeType: 'neutral',
        },
        {
          id: 'database',
          label: 'Database & Sync',
          hindiLabel: 'डेटाबेस सेटिंग्स',
          icon: Database,
          badge: 'Live',
          badgeType: 'success',
        },
      ],
    },
  ], [kpi, activeBreakdownsCount, activeJobsCount, activeRedeploymentsCount, auditLogs.length]);

  // Search filtering
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();

    return groups
      .map((grp) => {
        const matchesGrp = grp.title.toLowerCase().includes(q) || grp.hindiTitle.toLowerCase().includes(q);
        const matchingItems = grp.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.hindiLabel.toLowerCase().includes(q)
        );

        if (matchesGrp) return grp;
        if (matchingItems.length > 0) return { ...grp, items: matchingItems };
        return null;
      })
      .filter(Boolean) as NavGroup[];
  }, [groups, searchQuery]);

  const getBadgeClasses = (type: NavItem['badgeType'] = 'neutral') => {
    switch (type) {
      case 'danger':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30';
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30';
      case 'info':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/30';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  return (
    <aside
      className={`relative flex flex-col shrink-0 h-[calc(100vh-61px)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 select-none z-20 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Bar: Search & Collapse Button */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
        {!isCollapsed ? (
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-200 dark:border-emerald-800/50">
              NN
            </span>
          </div>
        )}

        {/* Expand / Collapse Rail Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Scroll Area */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {filteredGroups.map((group) => {
          const isGroupCollapsed = Boolean(collapsedGroups[group.id]) && !isCollapsed;

          return (
            <div key={group.id} className="space-y-0.5">
              {/* Group Header (Only when not collapsed) */}
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2 py-1 rounded text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 uppercase tracking-wider transition-colors group"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span>{group.title}</span>
                    <span className="text-[10px] font-normal normal-case opacity-70 text-slate-400">
                      ({group.hindiTitle})
                    </span>
                  </div>
                  <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                    {isGroupCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </span>
                </button>
              ) : (
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-2 mx-1" />
              )}

              {/* Group Items */}
              {!isGroupCollapsed && (
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectTab(item.id)}
                        title={isCollapsed ? `${item.label} (${item.hindiLabel})` : undefined}
                        className={`w-full relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-950 dark:bg-emerald-500/15 dark:text-emerald-300 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                        } ${isCollapsed ? 'justify-center px-0 py-2.5' : ''}`}
                      >
                        {/* Active Accent Bar on Left */}
                        {isActive && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-full" />
                        )}

                        {/* Icon */}
                        <div
                          className={`flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Text Details (When expanded) */}
                        {!isCollapsed && (
                          <>
                            <span className="truncate flex-1 text-left">
                              {item.label}
                            </span>

                            {/* Badge */}
                            {item.badge !== undefined && item.badge !== null && (
                              <span
                                className={`ml-auto text-[10px] font-semibold px-1.5 py-0.2 rounded-full border leading-tight shrink-0 flex items-center gap-1 ${getBadgeClasses(
                                  item.badgeType
                                )}`}
                              >
                                {item.pulse && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                )}
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}

                        {/* Tooltip Badge for collapsed mode */}
                        {isCollapsed && item.badge !== undefined && item.badge !== null && (
                          <span
                            className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                              item.badgeType === 'danger'
                                ? 'bg-rose-500 animate-ping'
                                : item.badgeType === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredGroups.length === 0 && !isCollapsed && (
          <div className="text-center py-6 text-slate-400 text-xs italic">
            No matching modules
          </div>
        )}
      </nav>

      {/* Footer: Fleet Availability Ticker & Officer Identity */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 shrink-0 space-y-2.5">
        {!isCollapsed ? (
          <>
            {/* Fleet Mini Gauge */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                  <Activity className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Fleet Readiness</span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {kpi.availabilityPercentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-500 ${
                    kpi.availabilityPercentage >= 75
                      ? 'bg-emerald-500'
                      : kpi.availabilityPercentage >= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${kpi.availabilityPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                <span>{kpi.availableVehicles + kpi.deployedVehicles}/{kpi.totalFleet} Active</span>
                <span>{kpi.totalDowntimeHours}h Down</span>
              </div>
            </div>

            {/* Officer Profile Badge */}
            <div className="flex items-center gap-2.5 px-1 pt-0.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {currentUser.full_name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.full_name}
                  </p>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Online" />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize truncate">
                  {currentRole.replace(/_/g, ' ')}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Log out of session"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          /* Collapsed Mini Profile */
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer"
              title={`${currentUser.full_name} (${currentRole.replace(/_/g, ' ')})`}
            >
              {currentUser.full_name.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
