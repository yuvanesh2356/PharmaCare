import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Undo2, CheckCircle2, Clock, AlertTriangle, ChevronRight, FileCheck, Truck, Factory } from 'lucide-react';
import { api } from '../services/api';

export default function RetailerReturnTrackingPage() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const rRes = await api.getReturns();
      const bRes = await api.getBatches();
      setReturns(rRes);
      setBatches(bRes);
    } catch (err) {
      console.error('Failed to load return tracking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStageStepNumber = (batch) => {
    if (!batch) return 1;
    const status = batch.status;
    if (status === 'RETURN_REQUESTED') return 1;
    if (status === 'PICKUP_SCHEDULED') return 2;
    if (status === 'PICKED_UP') return 3;
    if (status === 'DISTRIBUTOR_RECEIVED') return 4;
    if (status === 'MANUFACTURER_RECEIVED') return 5;
    if (status === 'DESTROYED' || status === 'DESTRUCTION_PENDING') return 6;
    if (status === 'CERTIFICATE_VERIFIED') return 7;
    return 1;
  };

  const stages = [
    { num: 1, label: 'Created' },
    { num: 2, label: 'Pickup Assigned' },
    { num: 3, label: 'Picked Up' },
    { num: 4, label: 'Distributor Received' },
    { num: 5, label: 'Manufacturer Received' },
    { num: 6, label: 'Destroyed' },
    { num: 7, label: 'Certificate Linked' },
  ];

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          <span>Reverse Chain Return Progress Tracker</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Track return lifecycle progress from initial pharmacy creation through distributor handoffs and authorized incineration certificate linkage.
        </p>
      </div>

      {/* Returns List with Stage Visualizer */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 text-xs font-medium">Loading return tracking...</div>
      ) : returns.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs font-medium">No reverse returns created yet.</div>
      ) : (
        <div className="space-y-6">
          {returns.map((ret) => {
            const batch = batches.find((b) => b.id === ret.batch_id);
            const currentStep = getStageStepNumber(batch);

            return (
              <div key={ret.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 font-mono">
                        {ret.return_code}
                      </code>
                      <h3 className="text-sm font-bold text-slate-900">{ret.product_name}</h3>
                      <code className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                        Batch {ret.batch_number}
                      </code>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Declared Quantity: <span className="font-bold text-slate-900 font-mono">{ret.quantity_declared} units</span> | Reason: <span className="font-semibold text-slate-800">{ret.reason}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/batches/${ret.batch_id}`)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Inspect Twin →
                  </button>
                </div>

                {/* 7-Stage Reverse Chain Progress Bar */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Reverse Chain Lifecycle Stage (Step {currentStep} of 7)
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                    {stages.map((st) => {
                      const isComplete = st.num < currentStep;
                      const isCurrent = st.num === currentStep;

                      return (
                        <div
                          key={st.num}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            isCurrent
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-400/30'
                              : isComplete
                              ? 'bg-slate-50 border-slate-200 text-slate-700 font-semibold'
                              : 'bg-white border-slate-100 text-slate-400 font-normal opacity-60'
                          }`}
                        >
                          <div className="text-[10px] font-mono mb-1">
                            {isComplete ? '✓ Step ' + st.num : isCurrent ? '⚡ Step ' + st.num : 'Step ' + st.num}
                          </div>
                          <div className="text-[11px] leading-snug">{st.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
