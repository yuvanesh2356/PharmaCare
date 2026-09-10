import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, AlertTriangle, Search, QrCode, Undo2 } from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import BatchStatusBadge from '../components/BatchStatusBadge';
import ScannerModal from '../components/ScannerModal';
import ReturnModal from '../components/ReturnModal';

export default function RetailerInventoryPage() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('ALL');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedBatchForReturn, setSelectedBatchForReturn] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getBatches();
      setBatches(res);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.batch_number.toLowerCase().includes(search.toLowerCase()) ||
      b.product_name.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterState === 'NEAR_EXPIRY') return b.days_remaining >= 1 && b.days_remaining <= 60;
    if (filterState === 'EXPIRED') return b.days_remaining < 0;
    if (filterState === 'ACTIVE') return b.status === 'ACTIVE';
    return true;
  });

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>Dispensary Inventory & Expiry Monitor</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Monitor stock expiry windows (1–60d near expiry) and initiate verified reverse returns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScannerOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center shadow-xs transition-colors"
          >
            <QrCode className="w-4 h-4 mr-2" /> Scan Barcode Twin
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by batch number or medicine name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300/80 text-slate-900 text-xs pl-9 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center space-x-1.5 text-xs font-semibold">
          {[
            { id: 'ALL', label: 'All Holdings' },
            { id: 'NEAR_EXPIRY', label: 'Near Expiry (1-60d)' },
            { id: 'EXPIRED', label: 'Expired Stock' },
            { id: 'ACTIVE', label: 'Active Holdings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterState(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all text-xs ${
                filterState === tab.id
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">Loading inventory...</div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">No inventory batches match your filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Days Left</th>
                  <th className="py-3 px-4">Status / State</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBatches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{b.product_name}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{b.generic_name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-blue-700 font-semibold bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/60 font-mono">
                        {b.batch_number}
                      </code>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800 font-semibold">
                      {b.current_quantity} <span className="text-[10px] text-slate-400 font-normal">units</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{b.expiry_date}</td>
                    <td className="py-3 px-4 font-mono">
                      <span
                        className={
                          b.days_remaining < 0
                            ? 'text-rose-700 font-semibold'
                            : b.days_remaining <= 60
                            ? 'text-amber-700 font-semibold'
                            : 'text-slate-600'
                        }
                      >
                        {b.days_remaining < 0
                          ? `Expired (${Math.abs(b.days_remaining)}d ago)`
                          : `${b.days_remaining} days`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <BatchStatusBadge status={b.status} expiryState={b.expiry_state} />
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge score={b.risk_score} level={b.risk_level} showLabel={false} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/batches/${b.id}`)}
                        className="border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                      >
                        View Twin
                      </button>

                      {b.status === 'ACTIVE' && (
                        <button
                          onClick={() => setSelectedBatchForReturn(b)}
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
