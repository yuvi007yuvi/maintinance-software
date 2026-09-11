import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLES: { role: UserRole; title: string; desc: string }[] = [
  { role: 'super_admin', title: 'Super Admin', desc: 'Full system & administrative control across all fleet modules' },
  { role: 'nagar_nigam_officer', title: 'Executive Municipal Officer', desc: 'Commissioner & executive oversight, MIS analytics & approval' },
  { role: 'project_manager', title: 'Project Director / PM', desc: 'Fleet operations oversight, SLA compliance, vehicle redeployments' },
  { role: 'fleet_manager', title: 'Chief Fleet Manager', desc: 'Incident triage, vehicle assignment, breakdown verification' },
  { role: 'workshop_manager', title: 'Workshop Superintendent', desc: 'Job card creation, mechanics assignment, parts issuance & closure' },
  { role: 'mechanic', title: 'Workshop Mechanic', desc: 'Diagnostic reporting, repairs execution, parts request' },
  { role: 'driver', title: 'Vehicle Driver', desc: 'Field incident & breakdown ticket logging, beat operations' },
];

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const { addUser, zones } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('driver');
  const [zoneId, setZoneId] = useState(zones[0]?.id || '');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter employee full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter a valid official email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await addUser({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || '+91 90000 00000',
        role,
        zone_id: zoneId || undefined,
        is_active: isActive,
      });

      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.message || 'Failed to onboard employee.');
      }
    } catch {
      setErrorMsg('A system error occurred while adding the user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Onboard New Employee
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register authorized fleet staff and assign role-based access rights
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Official Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rajesh@vwfms.gov.in"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 94120 00000"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Role & Access Level *
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {ROLES.map((r) => (
                <label
                  key={r.role}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    role === r.role
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="user_role"
                    checked={role === r.role}
                    onChange={() => setRole(r.role)}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {r.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {r.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Assigned Zone */}
          {zones.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Operational Zone
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Central Command (All Zones)</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Active Status */}
          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Account is Active immediately upon onboarding</span>
            </label>
          </div>

          {/* Footer Actions */}
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
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Onboarding...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Onboard Employee</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
