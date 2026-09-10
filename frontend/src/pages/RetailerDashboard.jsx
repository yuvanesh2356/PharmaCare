import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, AlertTriangle, Clock, Undo2, Plus, QrCode, Search, Store
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import BatchStatusBadge from '../components/BatchStatusBadge';
import ScannerModal from '../components/ScannerModal';
import ReturnModal from '../components/ReturnModal';

export default function RetailerDashboard() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedBatchForReturn, setSelectedBatchForReturn] = useState(null);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const bRes = await api.getBatches();
      const sRes = await api.getSummary();
      setBatches(bRes);
      setSummary(sRes);
    } catch (err) {
      console.error('Retailer load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBatches = batches.filter(
    (b) =>
      b.batch_number.toLowerCase().includes(search.toLowerCase()) ||
      b.product_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <span>Retail Pharmacy Dispensary Inventory</span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> Apollo Pharmacy Chennai
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            CDSCO 2025 Mandate: Monitor stock expiry windows and initiate verified reverse return requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/retailer/scan')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center shadow-xs transition-colors"
          >
            <QrCode className="w-4 h-4 mr-2" /> Scan / Verify Batch
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Total Active</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{summary?.total_batches || batches.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-normal">Pharmacy holdings</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold mb-1">
            <span>Near Expiry (1-60d)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{summary?.near_expiry_count || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-normal">Requires return prep</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold mb-1">
            <span>Expired Stock</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{summary?.expired_count || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-normal">Mandatory disposal return</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-blue-700 text-xs font-semibold mb-1">
            <span>Pending Returns</span>
            <Undo2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700">{summary?.pending_returns || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-normal">Awaiting pickup</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold mb-1">
            <span>Completed Returns</span>
            <Undo2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{summary?.destroyed_count || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-normal">Certified destroyed</div>
        </div>
      </div>

      {/* Inventory Table Section */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-3.5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Dispensary Batch Inventory & Expiry Monitor</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search batch or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-300/80 text-slate-900 text-xs pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-60 font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">Loading pharmacy batch twins...</div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">No batches matching search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Batch No</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Days Left</th>
                  <th className="py-3 px-4">Status / State</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{batch.product_name}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{batch.generic_name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-blue-700 font-semibold bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/60 font-mono">
                        {batch.batch_number}
                      </code>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800 font-semibold">
                      {batch.current_quantity} <span className="text-[10px] text-slate-400 font-normal">units</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{batch.expiry_date}</td>
                    <td className="py-3 px-4 font-mono">
                      <span className={batch.days_remaining < 0 ? 'text-rose-700 font-semibold' : batch.days_remaining <= 60 ? 'text-amber-700 font-semibold' : 'text-slate-600'}>
                        {batch.days_remaining < 0 ? `Expired (${Math.abs(batch.days_remaining)}d ago)` : `${batch.days_remaining} days`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <BatchStatusBadge status={batch.status} expiryState={batch.expiry_state} />
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge score={batch.risk_score} level={batch.risk_level} showLabel={false} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/batches/${batch.id}`)}
                        className="border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                      >
                        Digital Twin
                      </button>

                      {batch.status === 'ACTIVE' && (
                        <button
                          onClick={() => setSelectedBatchForReturn(batch)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-colors shadow-2xs"
                        >
                          Create Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        batches={batches}
        onSelectBatch={(batchNo) => {
          const match = batches.find((b) => b.batch_number === batchNo);
          if (match) navigate(`/batches/${match.id}`);
        }}
      />

      <ReturnModal
        isOpen={!!selectedBatchForReturn}
        onClose={() => setSelectedBatchForReturn(null)}
        batch={selectedBatchForReturn}
        onSuccess={loadData}
      />
    </div>
  );
}
