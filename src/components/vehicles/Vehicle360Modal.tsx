import React, { useState } from 'react';
import {
  X,
  Truck,
  User,
  MapPin,
  Calendar,
  Wrench,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  IndianRupee,
  ShieldCheck,
  Fuel,
} from 'lucide-react';
import { Vehicle } from '../../types';
import { useApp } from '../../context/AppContext';

interface Vehicle360ModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onOpenReportBreakdown?: (vehicleId: string) => void;
}

export const Vehicle360Modal: React.FC<Vehicle360ModalProps> = ({
  vehicle,
  onClose,
  onOpenReportBreakdown,
}) => {
  const {
    breakdowns,
    jobCards,
    jobCardParts,
    parts,
    wards,
    zones,
    users,
    redeployments,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'breakdowns' | 'workshop' | 'parts' | 'documents'>('overview');

  if (!vehicle) return null;

  const assignedWard = wards.find((w) => w.id === vehicle.assigned_ward_id);
  const assignedZone = zones.find((z) => z.id === vehicle.assigned_zone_id);
  const assignedDriver = users.find((u) => u.id === vehicle.assigned_driver_id);

  // Filter records belonging to this vehicle
  const vehicleBreakdowns = breakdowns.filter((b) => b.vehicle_id === vehicle.id);
  const vehicleJobCards = jobCards.filter((jc) => jc.vehicle_id === vehicle.id);
  
  // Find all parts consumed by this vehicle across all its job cards
  const vehicleJobCardIds = new Set(vehicleJobCards.map((j) => j.id));
  const vehiclePartsUsed = jobCardParts.filter((jcp) => vehicleJobCardIds.has(jcp.job_card_id));
  const totalPartsCost = vehiclePartsUsed.reduce((sum, p) => sum + (p.total_cost || 0), 0);

  // Active redeployment (if this vehicle is replaced or is acting as replacement)
  const activeRedeployment = redeployments.find(
    (r) => (r.original_vehicle_id === vehicle.id || r.replacement_vehicle_id === vehicle.id) && r.status === 'Active'
  );

  // Document expiry calculations
  const now = new Date();
  const getDocumentStatus = (expiryDateStr: string) => {
    const exp = new Date(expiryDateStr);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Expired', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', days: diffDays };
    if (diffDays <= 30) return { label: `Expiring in ${diffDays} days`, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', days: diffDays };
    return { label: `Valid (${diffDays} days left)`, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', days: diffDays };
  };

  const fitnessStatus = getDocumentStatus(vehicle.fitness_expiry);
  const insuranceStatus = getDocumentStatus(vehicle.insurance_expiry);
  const pucStatus = getDocumentStatus(vehicle.puc_expiry);
  const permitStatus = getDocumentStatus(vehicle.permit_expiry);

  // Total downtime hours calculation
  let cumulativeDowntime = 0;
  vehicleBreakdowns.forEach((b) => {
    const start = new Date(b.breakdown_date).getTime();
    const end = Date.now();
    cumulativeDowntime += Math.round((end - start) / (1000 * 60 * 60));
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-white shadow-lg">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-xl text-white tracking-wide">
                  {vehicle.registration_number}
                </h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    vehicle.status === 'Available' || vehicle.status === 'Ready for Deployment'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : vehicle.status === 'Deployed' || vehicle.status === 'Running'
                      ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      : vehicle.status === 'Breakdown'
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 animate-pulse'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {vehicle.status}
                </span>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {vehicle.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {vehicle.make} {vehicle.model} ({vehicle.manufacturing_year}) • {vehicle.vehicle_type}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-800 bg-slate-950/40 divide-x divide-slate-800 text-xs">
          <div className="p-3 text-center">
            <span className="text-slate-400 block text-[11px]">Breakdown Incidents</span>
            <span className="font-bold text-white text-base font-mono">{vehicleBreakdowns.length}</span>
          </div>
          <div className="p-3 text-center">
            <span className="text-slate-400 block text-[11px]">Job Cards Generated</span>
            <span className="font-bold text-white text-base font-mono">{vehicleJobCards.length}</span>
          </div>
          <div className="p-3 text-center">
            <span className="text-slate-400 block text-[11px]">Cumulative Downtime</span>
            <span className="font-bold text-amber-400 text-base font-mono">{cumulativeDowntime} hrs</span>
          </div>
          <div className="p-3 text-center">
            <span className="text-slate-400 block text-[11px]">Total Spares Cost</span>
            <span className="font-bold text-emerald-400 text-base font-mono">₹{totalPartsCost.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-5 bg-slate-950/20">
          {[
            { id: 'overview', label: '360° Overview' },
            { id: 'breakdowns', label: `Breakdowns (${vehicleBreakdowns.length})` },
            { id: 'workshop', label: `Job Cards (${vehicleJobCards.length})` },
            { id: 'parts', label: `Parts Consumed (${vehiclePartsUsed.length})` },
            { id: 'documents', label: 'Documents & Expiries' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Active Standby Banner if applicable */}
              {activeRedeployment && (
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white">Active Field Redeployment: </span>
                      <span className="text-cyan-300">
                        {activeRedeployment.original_vehicle_id === vehicle.id
                          ? `Standby Vehicle active in Ward ${activeRedeployment.ward_id.replace('ward-', '')}`
                          : `Currently deployed as Standby Replacement for original vehicle`}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">{activeRedeployment.reason}</span>
                </div>
              )}

              {/* Master Specs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tech Specs */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 text-xs">
                  <h4 className="font-heading font-bold text-slate-300 text-xs uppercase tracking-wider mb-2">
                    Vehicle Specifications
                  </h4>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Registration Number:</span>
                    <span className="font-mono font-bold text-white">{vehicle.registration_number}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Vehicle Type:</span>
                    <span className="text-white font-medium">{vehicle.vehicle_type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Make & Model:</span>
                    <span className="text-white">{vehicle.make} {vehicle.model}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Fuel Type:</span>
                    <span className="text-white flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-cyan-400" /> {vehicle.fuel_type}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Payload / Capacity:</span>
                    <span className="text-white">{vehicle.capacity}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Chassis Number:</span>
                    <span className="font-mono text-slate-300">{vehicle.chassis_number}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Engine Number:</span>
                    <span className="font-mono text-slate-300">{vehicle.engine_number}</span>
                  </div>
                </div>

                {/* Operations & Location Assignment */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 text-xs">
                  <h4 className="font-heading font-bold text-slate-300 text-xs uppercase tracking-wider mb-2">
                    Operations & Ward Allocation
                  </h4>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Assigned Zone:</span>
                    <span className="text-emerald-400 font-semibold">{assignedZone?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Assigned Ward:</span>
                    <span className="text-white font-medium">
                      Ward {assignedWard?.ward_number}: {assignedWard?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Sanitation Inspector:</span>
                    <span className="text-slate-300">{assignedWard?.sanitation_inspector || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Assigned Driver:</span>
                    <span className="text-cyan-300 font-semibold">{assignedDriver?.full_name || 'Standby Driver Pool'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Ownership:</span>
                    <span className="text-white">{vehicle.ownership_type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Current Odometer:</span>
                    <span className="font-mono text-white">{vehicle.current_odometer_km.toLocaleString('en-IN')} KM</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Purchase Date:</span>
                    <span className="text-slate-300">{vehicle.purchase_date}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'breakdowns' && (
            <div className="space-y-3">
              {vehicleBreakdowns.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic">
                  No breakdown incidents registered for this vehicle.
                </div>
              ) : (
                vehicleBreakdowns.map((b) => (
                  <div key={b.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-400">{b.breakdown_number}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {b.problem_category}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          b.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {b.severity} Severity
                        </span>
                      </div>
                      <span className="text-cyan-400 font-semibold">{b.status}</span>
                    </div>

                    <p className="mt-2 text-slate-300">{b.problem_description}</p>

                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                      <span>Location: <strong className="text-slate-200">{b.location}</strong></span>
                      <span>Reported By: <strong className="text-slate-200">{b.reported_by}</strong></span>
                      <span>Date: <strong className="text-slate-200">{new Date(b.breakdown_date).toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'workshop' && (
            <div className="space-y-3">
              {vehicleJobCards.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic">
                  No workshop job cards recorded for this vehicle.
                </div>
              ) : (
                vehicleJobCards.map((jc) => (
                  <div key={jc.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400">{jc.job_card_number}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                        Stage: {jc.status}
                      </span>
                    </div>
                    <p className="text-slate-300"><strong>Complaint:</strong> {jc.complaint}</p>
                    <p className="text-slate-400"><strong>Diagnosis:</strong> {jc.diagnosis || 'Diagnosis pending'}</p>
                    <p className="text-slate-400"><strong>Required Work:</strong> {jc.required_repair || 'Pending'}</p>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Mechanic Assigned: <strong className="text-slate-200">{users.find(u => u.id === jc.assigned_mechanic_id)?.full_name || 'Unassigned'}</strong></span>
                      <span>Actual Cost: <strong className="text-emerald-400">₹{jc.actual_cost.toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'parts' && (
            <div className="space-y-3">
              {vehiclePartsUsed.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs italic">
                  No spare parts logged for this vehicle repairs yet.
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3">Part Name</th>
                        <th className="p-3">Part No.</th>
                        <th className="p-3">Quantity</th>
                        <th className="p-3">Unit Price</th>
                        <th className="p-3">Total Cost</th>
                        <th className="p-3">Issued On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {vehiclePartsUsed.map((p) => {
                        const partMeta = parts.find((pt) => pt.id === p.part_id);
                        return (
                          <tr key={p.id} className="hover:bg-slate-800/30">
                            <td className="p-3 font-semibold text-white">{partMeta?.part_name || p.part_id}</td>
                            <td className="p-3 font-mono text-slate-400">{partMeta?.part_number || '-'}</td>
                            <td className="p-3">{p.quantity} {partMeta?.unit}</td>
                            <td className="p-3 font-mono">₹{p.unit_price}</td>
                            <td className="p-3 font-mono font-bold text-emerald-400">₹{p.total_cost}</td>
                            <td className="p-3 text-slate-400">{new Date(p.issued_at).toLocaleDateString('en-IN')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">Fitness Certificate</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${fitnessStatus.color}`}>
                    {fitnessStatus.label}
                  </span>
                </div>
                <p className="text-slate-400">Expiry Date: <strong className="text-slate-200">{vehicle.fitness_expiry}</strong></p>
                <p className="text-[11px] text-slate-400 mt-2">Required by RTO Aligarh for commercial municipal vehicles</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">Commercial Insurance</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${insuranceStatus.color}`}>
                    {insuranceStatus.label}
                  </span>
                </div>
                <p className="text-slate-400">Expiry Date: <strong className="text-slate-200">{vehicle.insurance_expiry}</strong></p>
                <p className="text-[11px] text-slate-400 mt-2">Comprehensive municipal fleet policy</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">Pollution Under Control (PUC)</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${pucStatus.color}`}>
                    {pucStatus.label}
                  </span>
                </div>
                <p className="text-slate-400">Expiry Date: <strong className="text-slate-200">{vehicle.puc_expiry}</strong></p>
                <p className="text-[11px] text-slate-400 mt-2">UP Pollution Control Board standard</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">Municipal Permit</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${permitStatus.color}`}>
                    {permitStatus.label}
                  </span>
                </div>
                <p className="text-slate-400">Expiry Date: <strong className="text-slate-200">{vehicle.permit_expiry}</strong></p>
                <p className="text-[11px] text-slate-400 mt-2">Municipal route permit for sanitation operations</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Nagar Nigam Asset ID: <span className="font-mono text-slate-200 font-semibold">{vehicle.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenReportBreakdown && vehicle.status !== 'Breakdown' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReportBreakdown(vehicle.id);
                }}
                className="px-3 py-1.5 text-xs font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/30 rounded-lg transition-colors"
              >
                Report Breakdown
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
