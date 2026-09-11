import React, { useState } from 'react';
import { X, Truck } from 'lucide-react';
import type { Vehicle, VehicleStatus } from '../../types';
import { useApp } from '../../context/AppContext';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose }) => {
  const { addVehicle, wards, zones } = useApp();

  const [formData, setFormData] = useState({
    registration_number: '',
    vehicle_type: 'Refuse Compactor (14 CBM)',
    category: 'Heavy Sanitation' as Vehicle['category'],
    make: 'Tata Motors',
    model: 'Signa 1918.K',
    manufacturing_year: 2023,
    fuel_type: 'Diesel' as Vehicle['fuel_type'],
    engine_number: '',
    chassis_number: '',
    capacity: '14 Cu.m',
    ownership_type: 'Municipal Owned' as Vehicle['ownership_type'],
    status: 'Available' as VehicleStatus,
    assigned_zone_id: zones[0]?.id || '',
    assigned_ward_id: wards[0]?.id || '',
    assigned_driver_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    insurance_expiry: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    fitness_expiry: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    puc_expiry: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    permit_expiry: new Date(Date.now() + 730 * 86400000).toISOString().split('T')[0],
    current_odometer_km: 1500,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.registration_number.trim()) {
      setError('Please enter a valid Registration Number (e.g. UP81 BT 1024)');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await addVehicle({
        ...formData,
        registration_number: formData.registration_number.trim().toUpperCase(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register vehicle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                Register New Municipal Vehicle
              </h3>
              <p className="text-xs text-slate-400">
                Add asset to Nagar Nigam Aligarh Digital Vehicle Master
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Registration Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. UP81 CZ 9922"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vehicle Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Heavy Sanitation">Heavy Sanitation (Compactor/Tippers)</option>
                <option value="Medium Sanitation">Medium Sanitation (Dumper Placers/Tractors)</option>
                <option value="Light Sanitation">Light Sanitation (Tata Ace / Mini Tippers)</option>
                <option value="Special Equipment">Special Equipment (JCB/Jetting/Sweeper/Tanker)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vehicle Type / Model</label>
              <input
                type="text"
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                placeholder="e.g. Refuse Compactor (14 CBM)"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Manufacturer (Make)</label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="e.g. Tata Motors, Ashok Leyland, JCB"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Fuel Type</label>
              <select
                value={formData.fuel_type}
                onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
                <option value="Petrol">Petrol</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Manufacturing Year</label>
              <input
                type="number"
                value={formData.manufacturing_year}
                onChange={(e) => setFormData({ ...formData, manufacturing_year: parseInt(e.target.value) || 2023 })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Assigned Zone</label>
              <select
                value={formData.assigned_zone_id}
                onChange={(e) => setFormData({ ...formData, assigned_zone_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Assigned Ward</label>
              <select
                value={formData.assigned_ward_id}
                onChange={(e) => setFormData({ ...formData, assigned_ward_id: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>Ward {w.ward_number}: {w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Fitness Expiry Date</label>
              <input
                type="date"
                value={formData.fitness_expiry}
                onChange={(e) => setFormData({ ...formData, fitness_expiry: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Insurance Expiry Date</label>
              <input
                type="date"
                value={formData.insurance_expiry}
                onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            {error && (
              <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 p-2 rounded-lg">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
              >
                {isSubmitting ? 'Registering...' : 'Register Vehicle'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
