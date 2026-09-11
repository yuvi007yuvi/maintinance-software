import React, { useState, useMemo } from 'react';
import {
  Users,
  Shield,
  Building,
  Compass,
  Sliders,
  UserPlus,
  Plus,
  Search,
  MapPin,
  Gauge,
  Database,
  RefreshCw,
  Power,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { AddUserModal } from './AddUserModal';
import { AddWorkshopModal } from './AddWorkshopModal';
import { AddZoneWardModal } from './AddZoneWardModal';
import type { UserRole } from '../../types';

interface AdminHubProps {
  onOpenSupabaseModal?: () => void;
}

export const AdminHub: React.FC<AdminHubProps> = ({ onOpenSupabaseModal }) => {
  const {
    users,
    workshops,
    zones,
    wards,
    vehicles,
    jobCards,
    targetAvailability,
    setTargetAvailability,
    toggleUserStatus,
    refreshData,
  } = useApp();

  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'users' | 'workshops' | 'zones' | 'settings'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddWorkshopOpen, setIsAddWorkshopOpen] = useState(false);
  const [isAddZoneWardOpen, setIsAddZoneWardOpen] = useState(false);
  const [zoneWardType, setZoneWardType] = useState<'zone' | 'ward'>('zone');

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch =
        u.full_name.toLowerCase().includes(searchStr) ||
        u.email.toLowerCase().includes(searchStr) ||
        (u.phone && u.phone.includes(searchStr));

      const matchesRole = roleFilter === 'All' || u.role === roleFilter;
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && u.is_active !== false) ||
        (statusFilter === 'Deactivated' && u.is_active === false);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'nagar_nigam_officer':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'project_manager':
        return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'fleet_manager':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'workshop_manager':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'mechanic':
        return 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'driver':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-white via-white to-purple-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/30 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs mb-1">
            <Shield className="w-4 h-4" />
            <span>EXECUTIVE ADMIN & USER MANAGEMENT CONSOLE</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">
            System Administration & Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage authenticated employee credentials, role permissions, maintenance depots, and operational jurisdiction
          </p>
        </div>

        {/* Quick Stats Strip */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400">Total Staff</span>
            <span className="font-heading font-black text-lg text-slate-900 dark:text-white">{users.length}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400">Depots</span>
            <span className="font-heading font-black text-lg text-slate-900 dark:text-white">{workshops.length}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center">
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400">Wards</span>
            <span className="font-heading font-black text-lg text-slate-900 dark:text-white">{wards.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff & User Roles ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('workshops')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'workshops'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Workshop Facilities ({workshops.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('zones')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'zones'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Civic Zones & Wards ({zones.length} Zones / {wards.length} Wards)</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Fleet SLAs & Settings</span>
        </button>
      </div>

      {/* TAB 1: USERS & STAFF */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="nagar_nigam_officer">Municipal Officer</option>
                <option value="project_manager">Project Manager</option>
                <option value="fleet_manager">Fleet Manager</option>
                <option value="workshop_manager">Workshop Manager</option>
                <option value="mechanic">Mechanic</option>
                <option value="driver">Driver</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Deactivated">Deactivated</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddUserOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Onboard Employee</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Employee Details</th>
                    <th className="py-3 px-4">Official Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Jurisdiction</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        No employees match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const zone = zones.find((z) => z.id === u.zone_id);
                      const isCurrent = currentUser?.id === u.id;
                      const active = u.is_active !== false;

                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center text-xs shrink-0">
                                {u.full_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">
                                  {u.full_name} {isCurrent && <span className="text-[10px] text-purple-600 dark:text-purple-400 font-normal">(You)</span>}
                                </p>
                                <p className="text-[10px] text-slate-400">ID: {u.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                            {u.email}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                            {u.phone || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] border capitalize ${getRoleBadge(
                                u.role
                              )}`}
                            >
                              {u.role.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            {zone ? `${zone.name} (${zone.code})` : 'Central HQ'}
                          </td>
                          <td className="py-3 px-4">
                            {active ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Deactivated
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {!isCurrent && (
                              <button
                                onClick={() => toggleUserStatus(u.id, !active)}
                                title={active ? 'Deactivate account' : 'Reactivate account'}
                                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                  active
                                    ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                    : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                }`}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKSHOP DEPOTS */}
      {activeTab === 'workshops' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Maintenance Depots & Service Bays
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Workshop facilities available for vehicle triage, overhaul, and parts management
              </p>
            </div>
            <button
              onClick={() => setIsAddWorkshopOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Workshop Bay</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workshops.length === 0 ? (
              <div className="col-span-3 text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <Building className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No workshop depots registered</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add Workshop Bay" above to register your first depot.</p>
              </div>
            ) : (
              workshops.map((w) => {
                const manager = users.find((u) => u.id === w.manager_id);
                // Active jobs in this workshop
                const activeJobs = jobCards.filter(
                  (jc) => jc.workshop_id === w.id && jc.status !== 'Closed'
                ).length;
                const utilPct = Math.min(100, Math.round((activeJobs / (w.capacity || 1)) * 100));

                return (
                  <div
                    key={w.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                            Depot ID: {w.id}
                          </span>
                          <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mt-0.5">
                            {w.name}
                          </h4>
                        </div>
                        <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
                          <Building className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{w.location}</span>
                      </div>

                      {/* Capacity Meter */}
                      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-500 dark:text-slate-400">Bay Occupancy</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {activeJobs} / {w.capacity} Bays ({utilPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              utilPct > 80 ? 'bg-rose-500' : utilPct > 50 ? 'bg-amber-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${utilPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                      <span className="text-slate-400">Superintendent:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {manager?.full_name || 'Central Head'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CIVIC ZONES & WARDS */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Civic Operational Zones & Sanitation Wards
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Geographical boundaries for vehicle beat deployment and inspector assignment
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setZoneWardType('zone');
                  setIsAddZoneWardOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Zone</span>
              </button>
              <button
                onClick={() => {
                  setZoneWardType('ward');
                  setIsAddZoneWardOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Ward</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <Compass className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No operational zones configured</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add Zone" above to configure your municipal zones.</p>
              </div>
            ) : (
              zones.map((z) => {
                const zoneWards = wards.filter((w) => w.zone_id === z.id);
                const zoneVehicles = vehicles.filter((v) => v.assigned_zone_id === z.id).length;

                return (
                  <div
                    key={z.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                            {z.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] border border-indigo-200 dark:border-indigo-800">
                            {z.code}
                          </span>
                        </div>
                        {z.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {z.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {zoneVehicles} Vehicles
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        <span>Sanitation Wards ({zoneWards.length})</span>
                      </div>

                      {zoneWards.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No wards mapped to this zone yet.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {zoneWards.map((w) => (
                            <div
                              key={w.id}
                              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                  #{w.ward_number}
                                </span>
                                <span className="text-slate-800 dark:text-slate-200">{w.name}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {w.sanitation_inspector || 'Inspector Assigned'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM SETTINGS & SLAS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Availability SLA Threshold */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Fleet Availability Benchmark Target
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Defines the critical SLA target benchmark across all municipal dashboards
                </p>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">Target Benchmark</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {targetAvailability}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={targetAvailability}
                onChange={(e) => setTargetAvailability(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>50% (Minimum)</span>
                <span>85% (Recommended)</span>
                <span>100% (Maximum)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              When overall fleet availability falls below <strong>{targetAvailability}%</strong>, the system triggers real-time <em>"Below Target"</em> alerts for executive officers and managers.
            </div>
          </div>

          {/* Database Connection & Cloud Synchronization */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cloud Database Connection
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live Supabase backend telemetry and API settings
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-500">Backend Provider:</span>
                  <span className="font-bold text-slate-800 dark:text-white">Supabase Cloud PostgreSQL</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-500">Database Connection:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {onOpenSupabaseModal && (
                <button
                  onClick={onOpenSupabaseModal}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Configure Supabase Keys
                </button>
              )}
              <button
                onClick={() => refreshData()}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Force refresh database cache"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sync</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddUserModal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} />
      <AddWorkshopModal isOpen={isAddWorkshopOpen} onClose={() => setIsAddWorkshopOpen(false)} />
      <AddZoneWardModal
        isOpen={isAddZoneWardOpen}
        onClose={() => setIsAddZoneWardOpen(false)}
        defaultType={zoneWardType}
      />
    </div>
  );
};
