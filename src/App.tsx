import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import VehicleList from './components/vehicles/VehicleList';
import BreakdownDesk from './components/breakdowns/BreakdownDesk';
import JobCardKanban from './components/workshop/JobCardKanban';
import ReportsHub from './components/reports/ReportsHub';
import { SupabaseModal } from './components/layout/SupabaseModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isReportBreakdownModalOpen, setIsReportBreakdownModalOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} onOpenReportBreakdown={() => setIsReportBreakdownModalOpen(true)} />;
      case 'vehicles':
        return <VehicleList />;
      case 'breakdowns':
        return <BreakdownDesk />;
      case 'workshop':
        return <JobCardKanban />;
      case 'reports':
        return <ReportsHub />;
      case 'parts':
      case 'redeployment':
      case 'maintenance':
      case 'audit':
      case 'database':
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>Module '{activeTab}' is under development.</p>
          </div>
        );
      default:
        return <Dashboard onNavigate={setActiveTab} onOpenReportBreakdown={() => setIsReportBreakdownModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      <Header onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} onSelectTab={setActiveTab} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950/50">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </main>
      </div>
      
      <SupabaseModal isOpen={isSupabaseModalOpen} onClose={() => setIsSupabaseModalOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;
