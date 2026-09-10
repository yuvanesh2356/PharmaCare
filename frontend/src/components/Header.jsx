import React, { useState } from 'react';
import {
  ShieldAlert, Play, RefreshCw, Bell, Shield,
  LogOut, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Header({ onTriggerDemo, onOpenReentryModal, alertCount = 0 }) {
  const [loadingDemo, setLoadingDemo] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleRunDemo = async () => {
    setLoadingDemo(true);
    try {
      await api.runFraudDemo();
      if (onTriggerDemo) onTriggerDemo();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    RETAILER: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    DISTRIBUTOR: 'bg-blue-100 text-blue-800 border-blue-300',
    MANUFACTURER: 'bg-purple-100 text-purple-800 border-purple-300',
    INVESTIGATOR: 'bg-amber-100 text-amber-800 border-amber-300',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Left: Branding & Tagline */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-sm">
          PC
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>PharmaChain AI</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full font-semibold">
              CDSCO 2025
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
            Reverse Logistics Compliance & Anti-Fraud Suite
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* ONE-CLICK HACKATHON DEMO BUTTON */}
        <button
          onClick={handleRunDemo}
          disabled={loadingDemo}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs px-3 py-2 rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          title="Executes complete end-to-end fraud demo scenario in DB (Batch P7788)"
        >
          {loadingDemo ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span className="hidden sm:inline">Run Fraud Demo</span>
        </button>

        {/* RE-ENTRY SCAN BUTTON */}
        <button
          onClick={onOpenReentryModal}
          className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs px-2.5 py-2 rounded-xl font-semibold flex items-center space-x-1.5 transition-colors"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
          <span className="hidden md:inline">Test Re-Entry POS</span>
        </button>

        {/* NOTIFICATION BADGE */}
        <div className="relative p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors">
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </div>

        {/* LOGGED IN USER CHIP & LOGOUT */}
        {user && (
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl py-1 px-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {user.full_name}
                </div>
                <div className="text-[10px] text-slate-500">
                  {user.organization_name || 'System Admin'}
                </div>
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${roleColors[user.role] || 'bg-slate-100 text-slate-800'}`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
