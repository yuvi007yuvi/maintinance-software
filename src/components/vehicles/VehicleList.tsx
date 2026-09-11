import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Filter, Plus, AlertCircle, Wrench, CheckCircle } from 'lucide-react';
import { Vehicle360Modal } from './Vehicle360Modal';
import { AddVehicleModal } from './AddVehicleModal';

export default function VehicleList() {
  const { vehicles, isLoading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const categories = ['All', ...Array.from(new Set(vehicles.map(v => v.category)))];
  const statuses = ['All', 'Available', 'Running', 'Deployed', 'Breakdown', 'Under Inspection', 'Under Repair', 'Awaiting Spare Parts', 'Ready for Deployment', 'Inactive', 'Scrapped'];

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = vehicle.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            vehicle.vehicle_type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || vehicle.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || vehicle.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [vehicles, searchTerm, statusFilter, categoryFilter]);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Available':
      case 'Running':
      case 'Deployed':
      case 'Ready for Deployment':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'Under Inspection':
      case 'Under Repair':
      case 'Awaiting Spare Parts':
        return <Wrench className="w-4 h-4 text-orange-500" />;
      case 'Breakdown':
      case 'Inactive':
      case 'Scrapped':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Available':
      case 'Running':
      case 'Deployed':
      case 'Ready for Deployment':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'Under Inspection':
      case 'Under Repair':
      case 'Awaiting Spare Parts':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20';
      case 'Breakdown':
      case 'Inactive':
      case 'Scrapped':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading vehicles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Fleet Master</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and track all municipal vehicles</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Registration No. or Type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors max-w-[150px]"
          >
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors max-w-[150px]"
          >
            {categories.map(d => <option key={String(d)} value={String(d)}>{String(d)}</option>)}
          </select>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVehicles.map(vehicle => (
          <div 
            key={vehicle.id}
            onClick={() => setSelectedVehicleId(vehicle.id)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {vehicle.registration_number}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{vehicle.vehicle_type} • {vehicle.make}</p>
              </div>
              <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 whitespace-nowrap ${getStatusColor(vehicle.status)}`}>
                {getStatusIcon(vehicle.status)}
                {vehicle.status}
              </div>
            </div>
            
            <div className="space-y-2 mt-4 text-sm">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Category</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{vehicle.category}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Fuel Type</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{vehicle.fuel_type}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Year</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{vehicle.manufacturing_year}</span>
              </div>
            </div>
          </div>
        ))}
        
        {filteredVehicles.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50 border-dashed">
            No vehicles found matching your criteria.
          </div>
        )}
      </div>

      {selectedVehicleId && (
        <Vehicle360Modal 
          vehicle={vehicles.find(v => v.id === selectedVehicleId) || null}
          onClose={() => setSelectedVehicleId(null)}
        />
      )}

      <AddVehicleModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
