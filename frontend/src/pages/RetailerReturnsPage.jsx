import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Undo2, Plus, ArrowRight, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../services/api';
import ReturnModal from '../components/ReturnModal';

export default function RetailerReturnsPage() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const rRes = await api.getReturns();
      const bRes = await api.getBatches();
      setReturns(rRes);
      setBatches(bRes);
    } catch (err) {
      console.error('Failed to load returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeBatches = batches.filter((b) => b.status === 'ACTIVE');

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Undo2 className="w-5 h-5 text-emerald-600" />
            <span>Reverse Return Request Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Initiate CDSCO 2025 compliant reverse returns for near-expiry and expired stock.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeBatches.length > 0) {
              setSelectedBatch(activeBatches[0]);
              setModalOpen(true);
            } else {
              alert('No active batches available for return.');
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Initiate New Reverse Return
        </button>
      </div>

      {/* Active Returns Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900">Initiated Reverse Return Transactions ({returns.length})</h3>
          <span className="text-xs text-slate-500 font-medium">Single Source of Truth Audit Log</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">Loading return requests...</div>
        ) : returns.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">No reverse return requests created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Return ID Code</th>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Declared Quantity</th>
                  <th className="py-3 px-4">Reason / Trigger</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      <code className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {r.return_code}
                      </code>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{r.batch_number}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{r.product_name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-800 font-semibold">{r.quantity_declared} units</td>
                    <td className="py-3.5 px-4 text-slate-600">{r.reason}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-blue-50 text-blue-700 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200 text-[10px]">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/batches/${r.batch_id}`)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Inspect Twin
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return Modal */}
      {selectedBatch && (
        <ReturnModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedBatch(null);
          }}
          batch={selectedBatch}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
