import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { JobCardStatus } from '../../types';

export default function JobCardKanban() {
  const { jobCards, vehicles, users, isLoading } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const columns: { title: string; status: JobCardStatus[] }[] = [
    { title: 'To Do & Assigned', status: ['Open', 'Assigned'] },
    { title: 'In Progress', status: ['Diagnosis', 'Repair'] },
    { title: 'Inspection / Approval', status: ['Inspection', 'Approved'] },
    { title: 'Closed', status: ['Closed'] },
  ];

  const filteredCards = useMemo(() => {
    return jobCards.filter(jc => {
      const vehicle = vehicles.find(v => v.id === jc.vehicle_id);
      const mechanic = users.find(u => u.id === jc.assigned_mechanic_id);
      
      const searchStr = searchTerm.toLowerCase();
      return (
        jc.job_card_number.toLowerCase().includes(searchStr) ||
        vehicle?.registration_number.toLowerCase().includes(searchStr) ||
        mechanic?.full_name.toLowerCase().includes(searchStr) ||
        jc.complaint.toLowerCase().includes(searchStr)
      );
    });
  }, [jobCards, vehicles, users, searchTerm]);

  const getStatusColor = (status: JobCardStatus) => {
    switch(status) {
      case 'Open': return 'bg-slate-700 text-slate-300';
      case 'Assigned': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Diagnosis': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Repair': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Inspection': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Approved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Closed': return 'bg-emerald-500/10 text-emerald-500/70 border-emerald-500/20';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading Kanban board...</div>;
  }

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Workshop & Job Cards</h1>
          <p className="text-slate-400 text-sm mt-1">Manage repair tasks and mechanic assignments</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search job cards..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <button className="bg-amber-600 hover:bg-amber-500 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            New Job Card
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((col, idx) => {
            const columnCards = filteredCards.filter(c => col.status.includes(c.status));
            
            return (
              <div key={idx} className="w-80 flex flex-col h-full bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="p-3 border-b border-slate-800 flex justify-between items-center shrink-0">
                  <h3 className="font-semibold text-slate-300">{col.title}</h3>
                  <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-1 rounded-md">
                    {columnCards.length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {columnCards.map(jc => {
                    const vehicle = vehicles.find(v => v.id === jc.vehicle_id);
                    const mechanic = users.find(u => u.id === jc.assigned_mechanic_id);
                    
                    return (
                      <div 
                        key={jc.id}
                        className="bg-slate-800 border border-slate-700 p-3.5 rounded-lg hover:border-amber-500/50 cursor-pointer group transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusColor(jc.status)}`}>
                            {jc.status}
                          </span>
                          <span className="text-xs text-slate-500 font-mono group-hover:text-amber-400 transition-colors">
                            {jc.job_card_number}
                          </span>
                        </div>
                        
                        <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                          {vehicle?.registration_number}
                        </div>
                        
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                          {jc.complaint}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-700/50">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <User className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[100px]" title={mechanic?.full_name || 'Unassigned'}>
                              {mechanic?.full_name?.split(' ')[0] || 'Unassigned'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{format(new Date(jc.created_at), 'dd MMM')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {columnCards.length === 0 && (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg text-slate-500 text-xs font-medium">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* <JobCardModal isOpen={!!selectedJobCardId} onClose={() => setSelectedJobCardId(null)} jobCardId={selectedJobCardId} /> */}
    </div>
  );
}
