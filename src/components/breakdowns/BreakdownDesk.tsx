import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Filter, AlertTriangle, CheckCircle, Clock, MapPin, Truck } from 'lucide-react';
import { format } from 'date-fns';

export default function BreakdownDesk() {
  const { breakdowns, vehicles, isLoading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  
  const [, setIsReportModalOpen] = useState(false);
  const [, setSelectedBreakdownId] = useState<string | null>(null);

  const activeStatuses = ['Reported', 'Acknowledged', 'Vehicle Collected', 'Workshop Received', 'Diagnosis', 'Repair', 'Inspection'];
  
  const filteredBreakdowns = useMemo(() => {
    return breakdowns.filter(bd => {
      const vehicle = vehicles.find(v => v.id === bd.vehicle_id);
      
      const searchMatch = 
        bd.breakdown_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
        vehicle?.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bd.location.toLowerCase().includes(searchTerm.toLowerCase());
        
      let statusMatch = true;
      if (statusFilter === 'Active') {
        statusMatch = activeStatuses.includes(bd.status);
      } else if (statusFilter === 'Resolved') {
        statusMatch = ['Completed', 'Field Redeployment'].includes(bd.status);
      } else if (statusFilter !== 'All') {
        statusMatch = bd.status === statusFilter;
      }
      
      return searchMatch && statusMatch;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [breakdowns, vehicles, searchTerm, statusFilter]);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Critical': return 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20';
      case 'High': return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20';
      case 'Medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/20';
      case 'Low': return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20';
      default: return 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700';
    }
  };

  const getStatusBadge = (status: string) => {
    let colorClass = 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700';
    let Icon = Clock;
    
    if (['Completed', 'Field Redeployment'].includes(status)) {
      colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
      Icon = CheckCircle;
    } else if (['Repair', 'Diagnosis', 'Inspection'].includes(status)) {
      colorClass = 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20';
      Icon = AlertTriangle;
    } else if (['Reported'].includes(status)) {
      colorClass = 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20';
      Icon = AlertTriangle;
    }

    return (
      <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 whitespace-nowrap ${colorClass}`}>
        <Icon className="w-3.5 h-3.5" />
        {status}
      </div>
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading breakdown data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Breakdown Desk</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Monitor, acknowledge, and resolve vehicle breakdowns</p>
        </div>
        <button 
          onClick={() => setIsReportModalOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Report Breakdown
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by ID, Vehicle No., or Location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-rose-500 transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Breakdowns</option>
            <option value="Resolved">Resolved</option>
            <option value="Reported">Just Reported</option>
            <option value="Repair">Under Repair</option>
          </select>
        </div>
      </div>

      {/* Breakdowns List */}
      <div className="space-y-4">
        {filteredBreakdowns.map(bd => {
          const vehicle = vehicles.find(v => v.id === bd.vehicle_id);
          
          return (
            <div 
              key={bd.id}
              onClick={() => setSelectedBreakdownId(bd.id)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row gap-6"
            >
              {/* Left Column: Core Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {bd.breakdown_number}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getSeverityColor(bd.severity)}`}>
                        {bd.severity}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{bd.problem_category}</div>
                  </div>
                  <div className="md:hidden">
                    {getStatusBadge(bd.status)}
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                  {bd.problem_description}
                </p>
                
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {bd.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {format(new Date(bd.created_at), 'dd MMM yyyy, HH:mm')}
                  </div>
                </div>
              </div>
              
              {/* Right Column: Vehicle & Status */}
              <div className="md:w-64 flex flex-col justify-between items-start md:items-end gap-4 md:border-l border-slate-200 dark:border-slate-700/50 md:pl-6">
                <div className="hidden md:block">
                  {getStatusBadge(bd.status)}
                </div>
                
                <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span className="font-bold text-slate-900 dark:text-slate-200">{vehicle?.registration_number || 'Unknown'}</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{vehicle?.vehicle_type}</div>
                  <div className="text-xs text-slate-500">Reported by: <span className="text-slate-700 dark:text-slate-300 font-medium">{bd.reported_by}</span></div>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredBreakdowns.length === 0 && (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700/50 border-dashed flex flex-col items-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200">All Clear</p>
            <p className="text-sm">No breakdowns found matching your criteria.</p>
          </div>
        )}
      </div>
      
      {/* Modals would go here in the future */}
      {/* <ReportBreakdownModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} /> */}
      {/* <BreakdownDetailsModal breakdownId={selectedBreakdownId} onClose={() => setSelectedBreakdownId(null)} /> */}
    </div>
  );
}
