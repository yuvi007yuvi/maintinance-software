import React, { useState } from 'react';
import { useAuth, PREDEFINED_USERS } from '../../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  Truck,
  Wrench,
  UserCheck,
  ArrowRight,
  AlertCircle,
  Building2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import type { UserRole } from '../../types';

export const LoginScreen: React.FC = () => {
  const { login, loginAsRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'quick' | 'credentials'>('quick');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your official municipal email or employee ID.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.message || 'Authentication failed. Please check credentials.');
      }
    } catch {
      setErrorMsg('A system error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'nagar_nigam_officer':
        return <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'fleet_manager':
        return <Truck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      case 'workshop_manager':
        return <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'mechanic':
        return <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'driver':
        return <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'super_admin':
        return <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <UserCheck className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Municipal Branding Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-lg shadow-emerald-600/30">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black uppercase tracking-wider text-white">
                Nagar Nigam Aligarh
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                SBM (Urban)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              नगर निगम अलीगढ़ • Vehicle Workshop & Fleet Management System (VWFMS)
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Portal Active
          </span>
          <span className="text-slate-600">•</span>
          <span>UP Municipal Municipal Admin v1.0</span>
        </div>
      </header>

      {/* Main Authentication Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-4xl bg-slate-900/80 border border-slate-800/90 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Hero / Government Assurance Panel */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Role-Based Access Control</span>
              </div>

              <h2 className="text-2xl font-black text-white leading-tight font-heading">
                Municipal Fleet & Workshop Command
              </h2>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                Single sign-on gateway for Nagar Nigam Aligarh officers, fleet managers, workshop engineers, and municipal sanitation staff.
              </p>

              {/* Feature Highlights */}
              <div className="mt-6 space-y-3 text-xs">
                <div className="flex items-start gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Real-time municipal compactor & tipper telemetry</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Breakdown triage to job card workflow lifecycle</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>RTO fitness, insurance & preventive SLA compliance</span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Strict RBAC protocol per municipal administrative order</span>
                </div>
              </div>
            </div>

            {/* Official Support Info */}
            <div className="mt-8 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
              <p className="font-semibold text-slate-400">Authorized Personnel Only</p>
              <p className="mt-0.5">Contact Smart City Mission Helpdesk for account credentials.</p>
            </div>
          </div>

          {/* Right Login Interaction Panel */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Tab Selector: Quick Role vs Official Credentials */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">System Authentication</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Select a municipal profile or enter credentials</p>
                </div>

                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('quick')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeTab === 'quick'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Quick Roles
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('credentials')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeTab === 'credentials'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Credentials
                  </button>
                </div>
              </div>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* TAB 1: 1-Click Quick Role Sign-in */}
              {activeTab === 'quick' ? (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Select an official profile to log in with dedicated RBAC permissions:</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {PREDEFINED_USERS.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => loginAsRole(user.role)}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 transition-all text-left group shadow-xs cursor-pointer"
                      >
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-700/80 group-hover:border-emerald-500/30 transition-colors shrink-0 mt-0.5">
                          {getRoleIcon(user.role)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                              {user.full_name}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                          </div>
                          <p className="text-[11px] text-emerald-400 font-semibold truncate mt-0.5">
                            {user.designation}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {user.department}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* TAB 2: Official Credentials Form */
                <form onSubmit={handleCredentialsLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Municipal Email or Employee ID
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. commissioner@nagarnigamaligarh.in"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Password
                      </label>
                      <span className="text-[11px] text-slate-500">Default: aligarh2026</span>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Keep me signed in</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setEmail('commissioner@nagarnigamaligarh.in')}
                      className="text-emerald-400 hover:text-emerald-300 text-[11px]"
                    >
                      Fill Demo Email
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Authenticating...</span>
                    ) : (
                      <>
                        <span>Sign In to VWFMS Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Disclaimer */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500">
              Government of Uttar Pradesh • Urban Development Department • SBM (Urban)
            </div>
          </div>
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="py-3 px-6 text-center text-xs text-slate-500 border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
        Nagar Nigam Aligarh Municipal Fleet Portal • Secured by TLS 1.3 & Role-Based Access Control
      </footer>
    </div>
  );
};
