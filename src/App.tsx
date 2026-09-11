import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import VehicleList from './components/vehicles/VehicleList';
import BreakdownDesk from './components/breakdowns/BreakdownDesk';
import JobCardKanban from './components/workshop/JobCardKanban';
import ReportsHub from './components/reports/ReportsHub';
import SparePartsInventory from './components/inventory/SparePartsInventory';
import MaintenanceCompliance from './components/maintenance/MaintenanceCompliance';
import RedeploymentDesk from './components/redeployment/RedeploymentDesk';
import AuditTrailHub from './components/audit/AuditTrailHub';
import DatabaseStatusHub from './components/database/DatabaseStatusHub';
import { SupabaseModal } from './components/layout/SupabaseModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} onOpenReportBreakdown={() => setActiveTab('breakdowns')} />;
      case 'vehicles':
        return <VehicleList />;
      case 'breakdowns':
        return <BreakdownDesk />;
      case 'workshop':
        return <JobCardKanban />;
      case 'parts':
        return <SparePartsInventory />;
      case 'maintenance':
        return <MaintenanceCompliance />;
      case 'redeployment':
        return <RedeploymentDesk />;
      case 'reports':
        return <ReportsHub />;
      case 'audit':
        return <AuditTrailHub />;
      case 'database':
        return <DatabaseStatusHub onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} />;
      default:
        return <Dashboard onNavigate={setActiveTab} onOpenReportBreakdown={() => setActiveTab('breakdowns')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Header onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)} onSelectTab={setActiveTab} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
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
