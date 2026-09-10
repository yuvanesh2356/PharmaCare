import React from 'react';
import { 
  Building2, Truck, Factory, Flame, ShieldAlert, 
  FileCheck, AlertOctagon, PackageCheck, AlertTriangle
} from 'lucide-react';

export default function BatchTimeline({ events = [] }) {
  if (!events || events.length === 0) {
    return <div className="text-slate-500 text-sm py-4 font-medium">No chain events recorded yet.</div>;
  }

  const getIcon = (code) => {
    switch (code) {
      case 'BATCH_CREATED':
        return <Factory className="w-4 h-4 text-blue-600" />;
      case 'INVENTORY_RECEIVED':
        return <Building2 className="w-4 h-4 text-emerald-600" />;
      case 'RETURN_REQUESTED':
        return <PackageCheck className="w-4 h-4 text-sky-600" />;
      case 'DISTRIBUTOR_RECEIVED':
        return <Truck className="w-4 h-4 text-indigo-600" />;
      case 'QUANTITY_DISCREPANCY_DETECTED':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'MANUFACTURER_RECEIVED':
        return <Factory className="w-4 h-4 text-purple-600" />;
      case 'DESTROYED':
        return <Flame className="w-4 h-4 text-orange-600" />;
      case 'CERTIFICATE_UPLOADED':
        return <FileCheck className="w-4 h-4 text-teal-600" />;
      case 'REENTRY_DETECTED':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      default:
        return <AlertOctagon className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 font-sans">
      {events.map((event, index) => {
        const isFraud = event.event_code === 'REENTRY_DETECTED' || event.is_suspicious;

        return (
          <div key={event.id || index} className="relative group">
            {/* Dot / Icon */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                isFraud
                  ? 'bg-amber-100 border-amber-400 text-amber-900 ring-4 ring-amber-200 animate-pulse'
                  : 'bg-white border-slate-300 text-slate-700 shadow-xs'
              }`}
            >
              {getIcon(event.event_code)}
            </div>

            {/* Card Content */}
            <div
              className={`p-4 rounded-xl border text-sm transition-all shadow-xs ${
                isFraud
                  ? 'bg-amber-50/80 border-amber-300 text-slate-900'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className={`font-bold text-xs uppercase tracking-wide ${isFraud ? 'text-amber-900' : 'text-slate-900'}`}>
                  {event.action_title}
                </span>
                <span className="text-[11px] text-slate-500 font-mono font-medium">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-700 mb-2 leading-relaxed font-medium">
                {event.details}
              </p>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-100 gap-2 font-medium">
                <div>
                  👤 <span className="text-slate-900 font-bold">{event.actor_name}</span> ({event.actor_role})
                </div>
                <div>
                  📍 <span className="text-slate-900 font-bold">{event.organization_name}</span>, {event.location_city}
                </div>
                <div>
                  📦 Quantity: <span className="font-mono text-slate-900 font-bold">{event.quantity}</span>
                </div>
              </div>

              {event.evidence_url && (
                <div className="mt-2">
                  <a
                    href={event.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-[11px] text-blue-700 hover:text-blue-900 font-bold underline"
                  >
                    View Attached Proof Photo / Document →
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
