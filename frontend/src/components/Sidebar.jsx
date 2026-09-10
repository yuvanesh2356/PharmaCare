import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Layers, Undo2, Truck, FileCheck, 
  ShieldAlert, MapPin, Network, Sparkles, Building2, Store, Factory, Shield,
  Package, QrCode, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'RETAILER';

  const getDashboardPath = () => {
    switch (role) {
      case 'DISTRIBUTOR':
        return '/dashboard/distributor';
      case 'MANUFACTURER':
        return '/dashboard/manufacturer';
      case 'INVESTIGATOR':
        return '/dashboard/investigator';
      default:
        return '/dashboard/retailer';
    }
  };

  const getNavItems = () => {
    if (role === 'RETAILER') {
      return [
        { label: 'Dashboard', path: '/dashboard/retailer', icon: LayoutDashboard },
        { label: 'Inventory & Expiry', path: '/retailer/inventory', icon: Package },
        { label: 'Reverse Returns', path: '/retailer/returns', icon: Undo2 },
        { label: 'Scan / Verify Batch', path: '/retailer/scan', icon: QrCode },
        { label: 'My Alerts', path: '/retailer/alerts', icon: ShieldAlert },
        { label: 'Batch Digital Twin', path: '/batches', icon: Layers },
        { label: 'Return Tracking', path: '/retailer/return-tracking', icon: Clock },
      ];
    }

    const commonStart = [
      { label: 'Dashboard', path: getDashboardPath(), icon: LayoutDashboard },
    ];

    const roleOperational = [];
    if (role === 'MANUFACTURER') {
      roleOperational.push({ label: 'Destruction Proofs', path: '/certificates', icon: FileCheck });
    }

    const commonEnd = [
      { label: 'Batch Digital Twins', path: '/batches', icon: Layers },
      { label: 'Alert Center', path: '/alerts', icon: ShieldAlert },
      { label: 'Reverse Supply Map', path: '/map', icon: MapPin },
    ];

    if (role !== 'DISTRIBUTOR' && role !== 'MANUFACTURER' && role !== 'INVESTIGATOR') {
      commonEnd.push({ label: 'System Architecture', path: '/architecture', icon: Network });
    }

    return [...commonStart, ...roleOperational, ...commonEnd];
  };

  const navItems = getNavItems();

  const roleInfo = {
    RETAILER: { title: 'Retail Pharmacy', icon: Store, bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    DISTRIBUTOR: { title: 'Wholesale Hub', icon: Truck, bg: 'bg-blue-50 text-blue-800 border-blue-200' },
    MANUFACTURER: { title: 'Plant QA Dept', icon: Factory, bg: 'bg-purple-50 text-purple-800 border-purple-200' },
    INVESTIGATOR: { title: 'CDSCO Inspectorate', icon: Shield, bg: 'bg-amber-50 text-amber-900 border-amber-200' },
  };

  const currentRoleInfo = roleInfo[role] || roleInfo.RETAILER;
  const RoleIcon = currentRoleInfo.icon;

  return (
    <aside className="w-56 bg-slate-100/80 border-r border-slate-200/80 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] font-sans">
      <div className="p-3.5 border-b border-slate-200/60">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 px-1">
          Active Role Governance
        </div>
        <div className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border flex items-center gap-2 ${currentRoleInfo.bg}`}>
          <RoleIcon className="w-4 h-4 shrink-0" />
          <span className="truncate">{currentRoleInfo.title}</span>
        </div>
      </div>

      <nav className="p-2.5 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`
              }
            >
              <Icon className="w-4 h-4 mr-2.5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Card */}
      <div className="p-3.5 m-2.5 bg-white border border-slate-200/80 rounded-xl text-xs shadow-2xs">
        <div className="flex items-center space-x-1.5 text-blue-700 font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Risk Engine Active</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-normal font-normal">
          Automated CDSCO 2025 anomaly verification & re-entry prevention running.
        </p>
      </div>
    </aside>
  );
}
