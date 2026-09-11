import React, { useState } from 'react';
import { X, Compass, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AddZoneWardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'zone' | 'ward';
}

export const AddZoneWardModal: React.FC<AddZoneWardModalProps> = ({ isOpen, onClose, defaultType = 'zone' }) => {
  const { addZone, addWard, zones } = useApp();

  const [entryType, setEntryType] = useState<'zone' | 'ward'>(defaultType);

  // Zone Form State
  const [zoneName, setZoneName] = useState('');
  const [zoneCode, setZoneCode] = useState('');
  const [zoneDesc, setZoneDesc] = useState('');

  // Ward Form State
  const [wardNumber, setWardNumber] = useState<number>(1);
  const [wardName, setWardName] = useState('');
  const [wardZoneId, setWardZoneId] = useState(zones[0]?.id || '');
  const [inspector, setInspector] = useState('');
  const [contact, setContact] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (entryType === 'zone') {
        if (!zoneName.trim() || !zoneCode.trim()) {
          setErrorMsg('Please enter Zone name and short code.');
          setIsSubmitting(false);
          return;
        }
        await addZone({
          name: zoneName.trim(),
          code: zoneCode.trim().toUpperCase(),
          description: zoneDesc.trim(),
        });
      } else {
        if (!wardName.trim() || !wardZoneId) {
          setErrorMsg('Please enter Ward name and select its administrative zone.');
          setIsSubmitting(false);
          return;
        }
        await addWard({
          ward_number: Number(wardNumber) || 1,
          name: wardName.trim(),
          zone_id: wardZoneId,
          sanitation_inspector: inspector.trim() || 'Assigned Inspector',
          contact_number: contact.trim() || '+91 90000 00000',
        });
      }
      onClose();
    } catch {
      setErrorMsg('Failed to create civic jurisdiction record.');
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
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add Civic Jurisdiction
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure operational administrative Zones and Sanitation Wards
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

        {/* Type Switcher */}
        <div className="px-6 pt-4 pb-0 flex gap-2 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setEntryType('zone')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              entryType === 'zone'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Administrative Zone
          </button>
          <button
            type="button"
            onClick={() => setEntryType('ward')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              entryType === 'ward'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Sanitation Ward
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

          {entryType === 'zone' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Zone Name *
                </label>
                <input
                  type="text"
                  required
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="e.g. North Administrative Zone"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Short Code *
                </label>
                <input
                  type="text"
                  required
                  value={zoneCode}
                  onChange={(e) => setZoneCode(e.target.value)}
                  placeholder="e.g. ZN-01"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white uppercase focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Sector Area
                </label>
                <textarea
                  rows={3}
                  value={zoneDesc}
                  onChange={(e) => setZoneDesc(e.target.value)}
                  placeholder="Key residential sectors, industrial beats, and civic landmarks..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ward Number *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={wardNumber}
                    onChange={(e) => setWardNumber(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ward Name / Sector *
                  </label>
                  <input
                    type="text"
                    required
                    value={wardName}
                    onChange={(e) => setWardName(e.target.value)}
                    placeholder="e.g. Civil Lines & High Court Beat"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Administrative Zone *
                </label>
                <select
                  required
                  value={wardZoneId}
                  onChange={(e) => setWardZoneId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {zones.length === 0 ? (
                    <option value="">No zones created yet (Add a zone first)</option>
                  ) : (
                    zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} ({z.code})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sanitation Inspector
                  </label>
                  <input
                    type="text"
                    value={inspector}
                    onChange={(e) => setInspector(e.target.value)}
                    placeholder="e.g. Inspector Sharma"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+91 94120 00000"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

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
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save {entryType === 'zone' ? 'Zone' : 'Ward'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
