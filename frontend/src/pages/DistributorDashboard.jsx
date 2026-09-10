import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import HandoffModal from '../components/HandoffModal';

export default function DistributorDashboard() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [returns, setReturns] = useState([]);
  const [handoffs, setHandoffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatchForHandoff, setSelectedBatchForHandoff] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const bRes = await api.getBatches();
      const rRes = await api.getReturns();
      const hRes = await api.getHandoffs();
      setBatches(bRes);
      setReturns(rRes);
      setHandoffs(hRes);
    } catch (err) {
      console.error('Distributor load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingPickups = batches.filter((b) => b.status === 'RETURN_REQUESTED');
  const discrepancies = handoffs.filter((h) => h.discrepancy_count > 0);

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3">
          <span>Wholesale Distributor Reverse Logistics Hub</span>
          <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> Southern Med Distributors (Chennai Hub)
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Perform strict physical count & weight verification during pharmacy pickups. Auto-flag transit quantity loss.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 text-xs font-bold mb-1">
            <span>Pending Pharmacy Pickups</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{pendingPickups.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-normal">Requires physical handoff scan</div>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold mb-1">
            <span>Discrepancies Flagged</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{discrepancies.length}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-normal">Declared vs received count mismatch</div>
        </div>

        <div className="bg-white border border-emerald-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold mb-1">
            <span>Total Verified Handoffs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{handoffs.length}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-normal font-mono">Logged to immutable chain</div>
        </div>
      </div>

      {/* Pending Pickups Operational Workspace */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-3.5 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Pending Retail Pharmacy Pickups & Incoming Returns ({pendingPickups.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Single Source of Truth Audit Log</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">Loading pickups...</div>
        ) : pendingPickups.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">No pending retailer pickups.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Return ID</th>
                  <th className="py-3 px-4">Batch No</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Pharmacy Origin</th>
                  <th className="py-3 px-4">Declared Quantity</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pendingPickups.map((batch) => {
                  const matchingReturn = returns.find((r) => r.batch_id === batch.id);
                  const returnCode = matchingReturn?.return_code || `RET-${batch.id}`;

                  return (
                    <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-800">
                        <code className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                          {returnCode}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-blue-700 font-semibold bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/60 font-mono">
                          {batch.batch_number}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{batch.product_name}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{batch.generic_name}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        📍 {batch.current_owner_name} ({batch.current_location_city})
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800 font-semibold">
                        {batch.return_quantity || batch.current_quantity} <span className="text-[10px] text-slate-400 font-normal">units</span>
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge score={batch.risk_score} level={batch.risk_level} showLabel={false} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/batches/${batch.id}`)}
                          className="border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                        >
                          Inspect Twin
                        </button>
                        <button
                          onClick={() => setSelectedBatchForHandoff(batch)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-colors shadow-2xs"
                        >
                          Confirm Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <HandoffModal
        isOpen={!!selectedBatchForHandoff}
        onClose={() => setSelectedBatchForHandoff(null)}
        batch={selectedBatchForHandoff}
        onSuccess={loadData}
      />
    </div>
  );
}
