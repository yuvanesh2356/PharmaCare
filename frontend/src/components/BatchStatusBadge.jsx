import React from 'react';

export default function BatchStatusBadge({ status, expiryState }) {
  let text = status || 'ACTIVE';
  let style = "bg-slate-100 text-slate-700 border-slate-200";

  switch (status) {
    case 'ACTIVE':
      if (expiryState === 'EXPIRED') {
        text = 'EXPIRED';
        style = 'bg-rose-50 text-rose-700 border-rose-200';
      } else if (expiryState === 'CRITICAL_NEAR_EXPIRY' || expiryState === 'EXPIRING_TODAY') {
        text = 'CRITICAL NEAR EXPIRY';
        style = 'bg-rose-50 text-rose-700 border-rose-200';
      } else if (expiryState === 'NEAR_EXPIRY') {
        text = 'NEAR EXPIRY';
        style = 'bg-amber-50 text-amber-700 border-amber-200';
      } else {
        text = 'NORMAL ACTIVE';
        style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      }
      break;
    case 'RETURN_REQUESTED':
      text = 'RETURN REQUESTED';
      style = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'DISTRIBUTOR_RECEIVED':
      text = 'DISTRIBUTOR PICKED UP';
      style = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case 'MANUFACTURER_RECEIVED':
      text = 'MANUFACTURER RECEIVED';
      style = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case 'DESTROYED':
    case 'CERTIFICATE_VERIFIED':
      text = 'INCINERATED & CERTIFIED';
      style = 'bg-slate-100 text-slate-700 border-slate-200';
      break;
    case 'RE_ENTRY_DETECTED':
    case 'QUARANTINED':
      text = 'RE-ENTRY FRAUD DETECTED';
      style = 'bg-rose-50 text-rose-800 border-rose-300 font-bold';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border leading-none whitespace-nowrap ${style}`}>
      {text}
    </span>
  );
}
