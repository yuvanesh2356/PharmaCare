import React from 'react';
import { AlertTriangle, ShieldCheck, AlertCircle, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ score = 0, level = 'LOW', showLabel = true }) {
  let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200/80";
  let icon = <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />;

  if (score >= 81 || level === 'CRITICAL') {
    badgeStyle = "bg-rose-50 text-rose-700 border-rose-200/80 font-semibold";
    icon = <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600 shrink-0" />;
  } else if (score >= 61 || level === 'HIGH') {
    badgeStyle = "bg-orange-50 text-orange-700 border-orange-200/80 font-semibold";
    icon = <AlertTriangle className="w-3.5 h-3.5 mr-1 text-orange-600 shrink-0" />;
  } else if (score >= 31 || level === 'MEDIUM') {
    badgeStyle = "bg-amber-50 text-amber-700 border-amber-200/80 font-semibold";
    icon = <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600 shrink-0" />;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border leading-none whitespace-nowrap ${badgeStyle}`}>
      {icon}
      <span>{score} / 100</span>
      {showLabel && <span className="ml-1 opacity-80 font-normal">({level})</span>}
    </span>
  );
}
