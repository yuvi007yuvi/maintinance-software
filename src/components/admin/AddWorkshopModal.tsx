import React, { useState } from 'react';
import { X, MapPin, Building, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AddWorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddWorkshopModal: React.FC<AddWorkshopModalProps> = ({ isOpen, onClose }) => {
  const { addWorkshop, users } = useApp();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number>(10);
  const [managerId, setManagerId] = useState(users[0]?.id || 'usr-admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter workshop name.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Please enter geographical depot location.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await addWorkshop({
        name: name.trim(),
        location: location.trim(),
        capacity: Number(capacity) || 10,
        manager_id: managerId,
      });
      onClose();
    } catch {
      setErrorMsg('Failed to register workshop facility.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add Maintenance Depot / Bay
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register a new civic workshop bay for vehicle repairs and triage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Workshop Facility Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Central Fleet Workshop & Maintenance Bay"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Location / Address *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Industrial Area Depot, Sector 4"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vehicle Bay Capacity *
              </label>
              <input
                type="number"
                min="1"
                max="200"
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Depot Superintendent
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Depot</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
