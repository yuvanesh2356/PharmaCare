import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Building2, Store, Truck, Factory, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password || 'demo123');
      navigate(`/dashboard/${user.role.toLowerCase()}`);
    } catch (err) {
      console.error(err);
    }
  };

  const demoAccounts = [
    {
      role: 'RETAILER',
      title: 'Retailer Demo',
      name: 'Apollo Pharmacy',
      email: 'retailer@pharmachain.demo',
      icon: Store,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      badgeBg: 'bg-emerald-100 text-emerald-800'
    },
    {
      role: 'DISTRIBUTOR',
      title: 'Distributor Demo',
      name: 'Southern Med Logistics',
      email: 'distributor@pharmachain.demo',
      icon: Truck,
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      badgeBg: 'bg-blue-100 text-blue-800'
    },
    {
      role: 'MANUFACTURER',
      title: 'Manufacturer Demo',
      name: 'MedLife Pharma Ltd',
      email: 'manufacturer@pharmachain.demo',
      icon: Factory,
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      badgeBg: 'bg-purple-100 text-purple-800'
    },
    {
      role: 'INVESTIGATOR',
      title: 'Investigator Demo',
      name: 'CDSCO Controller Cell',
      email: 'investigator@pharmachain.demo',
      icon: Shield,
      color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
      badgeBg: 'bg-amber-100 text-amber-900'
    }
  ];

  const handleQuickDemo = async (acc) => {
    setEmail(acc.email);
    setPassword('demo123');
    try {
      const user = await login(acc.email, 'demo123');
      navigate(`/dashboard/${user.role.toLowerCase()}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-md mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          PharmaChain AI
        </h2>
        <p className="mt-2 text-sm text-slate-600 font-medium">
          CDSCO 2025 Reverse Chain Compliance & Fraud Intelligence Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl border border-slate-200 rounded-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Work Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@pharmachain.demo"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                ⚡ Quick Demo Accounts
              </span>
              <span className="text-xs text-slate-400">Click to Auto-Login</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoAccounts.map((acc) => {
                const IconComp = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickDemo(acc)}
                    className={`flex items-start p-3 rounded-xl border transition-all text-left group ${acc.color}`}
                  >
                    <div className="p-2 rounded-lg bg-white/80 shadow-xs mr-3 mt-0.5 group-hover:scale-105 transition-transform">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">{acc.title}</span>
                      </div>
                      <p className="text-[11px] opacity-80 line-clamp-1">{acc.name}</p>
                      <p className="text-[10px] opacity-60 mt-0.5">{acc.email}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          PharmaChain AI System • Compliance Enforcement Engine • Confidential Audit Trail
        </p>
      </div>
    </div>
  );
}
