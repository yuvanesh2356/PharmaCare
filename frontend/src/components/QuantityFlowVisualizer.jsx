import React from 'react';
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function QuantityFlowVisualizer({ flow = [] }) {
  if (!flow || flow.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs my-4 font-sans">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
        <span>Batch Quantity Chain Flow</span>
        <span className="ml-2 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 font-extrabold">
          Verified Handoff Audit
        </span>
      </h4>

      <div className="flex flex-wrap items-center gap-2 md:gap-3 overflow-x-auto pb-2">
        {flow.map((item, index) => {
          const isFlagged = item.flag;
          const isLast = index === flow.length - 1;

          return (
            <React.Fragment key={index}>
              <div
                className={`flex flex-col p-3 rounded-xl border min-w-[130px] transition-all shadow-xs ${
                  isFlagged
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span>{item.step}</span>
                  {isFlagged ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>

                <div className="text-lg font-extrabold tracking-tight flex items-baseline justify-between">
                  <span>{item.quantity}</span>
                  <span className="text-[10px] text-slate-500 font-medium">units</span>
                </div>

                <div className="text-[10px] text-slate-500 mt-1 truncate font-medium">
                  📍 {item.location}
                </div>
              </div>

              {!isLast && (
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
