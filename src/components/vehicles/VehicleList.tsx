import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Filter,
  Plus,
  AlertCircle,
  Wrench,
  CheckCircle,
  Download,
  Eye,
  ShieldAlert,
  Fuel,
  MapPin,
  Gauge,
  RotateCcw,
} from 'lucide-react';
import { Vehicle360Modal } from './Vehicle360Modal';
import { AddVehicleModal } from './AddVehicleModal';
import type { Vehicle } from '../../types';

export default function VehicleList() {
  const { vehicles, wards, zones, users, isLoading } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter options
  const categories = useMemo(() => ['All', ...Array.from(new Set(vehicles.map((v) => v.category)))], [vehicles]);
  const statuses = [
    'All',
    'Available',
    'Running',
    'Deployed',
    'Breakdown',
    'Under Inspection',
    'Under Repair',
    'Awaiting Spare Parts',
    'Ready for Deployment',
    'Inactive',
    'Scrapped',
  ];

  // Helper maps
  const wardMap = useMemo(() => new Map(wards.map((w) => [w.id, w])), [wards]);
  const zoneMap = useMemo(() => new Map(zones.map((z) => [z.id, z])), [zones]);
  const userMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  // Quick stats
  const stats = useMemo(() => {
    const total = vehicles.length;
    const deployed = vehicles.filter((v) => v.status === 'Deployed' || v.status === 'Running').length;
    const available = vehicles.filter((v) => v.status === 'Available' || v.status === 'Ready for Deployment').length;
    const inWorkshop = vehicles.filter(
      (v) => v.status === 'Under Repair' || v.status === 'Under Inspection' || v.status === 'Awaiting Spare Parts'
    ).length;
    const breakdown = vehicles.filter((v) => v.status === 'Breakdown').length;

    // Compliance alerts (expiring within 30 days or overdue)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
    const complianceIssues = vehicles.filter((v) => {
      const fit = new Date(v.fitness_expiry);
      const ins = new Date(v.insurance_expiry);
      return fit <= thirtyDaysFromNow || ins <= thirtyDaysFromNow;
    }).length;

    return { total, deployed, available, inWorkshop, breakdown, complianceIssues };
  }, [vehicles]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const ward = wardMap.get(vehicle.assigned_ward_id);
      const zone = zoneMap.get(vehicle.assigned_zone_id);
      const driver = vehicle.assigned_driver_id ? userMap.get(vehicle.assigned_driver_id) : null;

      const q = searchTerm.toLowerCase();
      const matchesSearch =
        vehicle.registration_number.toLowerCase().includes(q) ||
        vehicle.vehicle_type.toLowerCase().includes(q) ||
        vehicle.make.toLowerCase().includes(q) ||
        vehicle.model.toLowerCase().includes(q) ||
        (ward && ward.name.toLowerCase().includes(q)) ||
        (zone && zone.name.toLowerCase().includes(q)) ||
        (driver && driver.full_name.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'All' || vehicle.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || vehicle.category === categoryFilter;
      const matchesZone = zoneFilter === 'All' || vehicle.assigned_zone_id === zoneFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesZone;
    });
  }, [vehicles, searchTerm, statusFilter, categoryFilter, zoneFilter, wardMap, zoneMap, userMap]);

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
      case 'Running':
      case 'Deployed':
      case 'Ready for Deployment':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {status}
          </span>
        );
      case 'Under Inspection':
      case 'Under Repair':
      case 'Awaiting Spare Parts':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
            <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            {status}
          </span>
        );
      case 'Breakdown':
      case 'Inactive':
      case 'Scrapped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30 animate-pulse">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            {status}
          </span>
        );
    }
  };

  // Compliance check
  const getComplianceStatus = (vehicle: Vehicle) => {
    const now = new Date();
    const fitDate = new Date(vehicle.fitness_expiry);
    const insDate = new Date(vehicle.insurance_expiry);

    const isFitExpired = fitDate < now;
    const isInsExpired = insDate < now;

    if (isFitExpired || isInsExpired) {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/50"
          title={`Fitness: ${vehicle.fitness_expiry} | Insurance: ${vehicle.insurance_expiry}`}
        >
          <ShieldAlert className="w-3 h-3 text-rose-600" />
          Expired
        </span>
      );
    }

    const thirtyDays = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
    if (fitDate <= thirtyDays || insDate <= thirtyDays) {
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/50"
          title={`Fitness: ${vehicle.fitness_expiry} | Insurance: ${vehicle.insurance_expiry}`}
        >
          <ShieldAlert className="w-3 h-3 text-amber-600" />
          Due Soon
        </span>
      );
    }

    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40"
        title={`Fitness: ${vehicle.fitness_expiry} | Insurance: ${vehicle.insurance_expiry}`}
      >
        <CheckCircle className="w-3 h-3 text-emerald-600" />
        Valid
      </span>
    );
  };

  // CSV export
  const exportCSV = () => {
    const headers = [
      'Registration Number',
      'Vehicle Type',
      'Category',
      'Make',
      'Model',
      'Year',
      'Fuel Type',
      'Status',
      'Zone',
      'Ward',
      'Driver',
      'Odometer (KM)',
      'Fitness Expiry',
      'Insurance Expiry',
    ];

    const rows = filteredVehicles.map((v) => {
      const ward = wardMap.get(v.assigned_ward_id);
      const zone = zoneMap.get(v.assigned_zone_id);
      const driver = v.assigned_driver_id ? userMap.get(v.assigned_driver_id) : null;

      return [
        `"${v.registration_number}"`,
        `"${v.vehicle_type}"`,
        `"${v.category}"`,
        `"${v.make}"`,
        `"${v.model}"`,
        v.manufacturing_year,
        `"${v.fuel_type}"`,
        `"${v.status}"`,
        `"${zone ? zone.name : v.assigned_zone_id}"`,
        `"${ward ? ward.name : v.assigned_ward_id}"`,
        `"${driver ? driver.full_name : 'Unassigned'}"`,
        v.current_odometer_km,
        v.fitness_expiry,
        v.insurance_expiry,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nagar_nigam_fleet_master_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setZoneFilter('All');
  };

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500 dark:text-slate-400">Loading municipal fleet master...</div>;
  }

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              Fleet Master & Asset Register
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold">
              {vehicles.length} Vehicles
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-0.5">
            वाहन बेड़ा एवं संपत्ति रजिस्टर • Complete municipal asset register, live status, and compliance tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            title="Export filtered fleet to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Fleet Summary Mini KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Fleet</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">{stats.total}</p>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-2xs">
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">In Field / Deployed</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 font-mono mt-0.5">{stats.deployed}</p>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-2xs">
          <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">Depot Available</p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300 font-mono mt-0.5">{stats.available}</p>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-2xs">
          <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">In Workshop</p>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300 font-mono mt-0.5">{stats.inWorkshop}</p>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-2xs">
          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Breakdown</p>
          <p className="text-xl font-bold text-rose-700 dark:text-rose-300 font-mono mt-0.5">{stats.breakdown}</p>
        </div>
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-2xs">
          <p className="text-[11px] font-medium text-purple-600 dark:text-purple-400">Compliance Due</p>
          <p className="text-xl font-bold text-purple-700 dark:text-purple-300 font-mono mt-0.5">{stats.complianceIssues}</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Registration No., Type, Make, Ward, Driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            {statuses.filter((s) => s !== 'All').map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.filter((c) => c !== 'All').map((c) => (
              <option key={String(c)} value={String(c)}>
                {String(c)}
              </option>
            ))}
          </select>

          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="All">All Zones</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>

          {(searchTerm || statusFilter !== 'All' || categoryFilter !== 'All' || zoneFilter !== 'All') && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Fleet Data Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Vehicle / Reg Plate</th>
                <th className="py-3 px-4">Equipment & Model</th>
                <th className="py-3 px-4">Category & Fuel</th>
                <th className="py-3 px-4">Zone & Ward Beat</th>
                <th className="py-3 px-4">Assigned Driver</th>
                <th className="py-3 px-4 text-right">Odometer</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Compliance</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredVehicles.map((vehicle) => {
                const ward = wardMap.get(vehicle.assigned_ward_id);
                const zone = zoneMap.get(vehicle.assigned_zone_id);
                const driver = vehicle.assigned_driver_id ? userMap.get(vehicle.assigned_driver_id) : null;

                return (
                  <tr
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors cursor-pointer group"
                  >
                    {/* Reg Plate */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="bg-slate-900 text-amber-300 font-mono font-bold text-xs px-2.5 py-1 rounded border border-slate-700 shadow-2xs tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {vehicle.registration_number}
                        </div>
                      </div>
                    </td>

                    {/* Equipment & Model */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {vehicle.vehicle_type}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {vehicle.make} {vehicle.model} • ({vehicle.manufacturing_year})
                      </div>
                    </td>

                    {/* Category & Fuel */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                          {vehicle.category}
                        </span>
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40">
                          <Fuel className="w-3 h-3" />
                          {vehicle.fuel_type}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Cap: {vehicle.capacity}
                      </div>
                    </td>

                    {/* Zone & Ward Beat */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{zone ? zone.name : vehicle.assigned_zone_id}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-4 truncate">
                        {ward ? ward.name : vehicle.assigned_ward_id}
                      </div>
                    </td>

                    {/* Assigned Driver */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {driver ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {driver.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                              {driver.full_name}
                            </p>
                            <p className="text-[10px] text-slate-400">{driver.phone}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Odometer */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 font-mono font-bold text-slate-900 dark:text-slate-100">
                        <Gauge className="w-3 h-3 text-slate-400" />
                        <span>{vehicle.current_odometer_km.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">km run</span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(vehicle.status)}
                    </td>

                    {/* Compliance */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getComplianceStatus(vehicle)}
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVehicleId(vehicle.id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 dark:hover:bg-emerald-500/25 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>360°</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 italic bg-slate-50/50 dark:bg-slate-900/30">
                    No vehicles found matching the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredVehicles.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{vehicles.length}</strong> municipal vehicles
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px]">Click any vehicle row to inspect 360° diagnostic history, job cards & telemetry</span>
          </div>
        </div>
      </div>

      {/* 360 View Modal */}
      {selectedVehicleId && (
        <Vehicle360Modal
          vehicle={vehicles.find((v) => v.id === selectedVehicleId) || null}
          onClose={() => setSelectedVehicleId(null)}
        />
      )}

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
