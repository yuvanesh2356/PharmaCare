import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Plus, Search, Filter } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RiskBadge from '../components/RiskBadge';
import BatchStatusBadge from '../components/BatchStatusBadge';

export default function BatchesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // New Batch Form Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBatch, setNewBatch] = useState({
    product_name: 'Paracetamol 500mg',
    generic_name: 'Acetaminophen',
    batch_number: `P${Math.floor(1000 + Math.random() * 9000)}`,
    manufacturer_name: 'MedLife Pharma Ltd',
    mfg_date: '2025-01-10',
    expiry_date: '2026-12-31',
    quantity: 500,
    location_city: 'Chennai'
  });

  const loadBatches = async () => {
    setLoading(true);
    try {
      const res = await api.getBatches();
      setBatches(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createBatch(newBatch);
      setShowCreateModal(false);
      loadBatches();
    } catch (err) {
      alert(err.message || 'Creation failed');
    }
  };

  const filteredBatches = batches.filter((b) => {
    const matchSearch =
      b.batch_number.toLowerCase().includes(search.toLowerCase()) ||
      b.product_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center">
            <Layers className="w-5 h-5 mr-2 text-blue-600" />
            <span>Central Batch Digital Twin Registry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Complete lifecycle digital twins registered across India's pharmaceutical supply chain.
          </p>
        </div>

        {user?.role === 'MANUFACTURER' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Register New Batch Twin
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by batch number or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-900 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-bold">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 text-slate-800 px-3 py-2 rounded-xl focus:outline-none font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Stock</option>
            <option value="RETURN_REQUESTED">Return Requested</option>
            <option value="DISTRIBUTOR_RECEIVED">Distributor Received</option>
            <option value="MANUFACTURER_RECEIVED">Manufacturer Received</option>
            <option value="DESTROYED">Destroyed</option>
            <option value="RE_ENTRY_DETECTED">Re-Entry Fraud</option>
          </select>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading batch twins...</div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No batches found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Current Owner / City</th>
                  <th className="py-3 px-4">Current Quantity</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredBatches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      <code className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {b.batch_number}
                      </code>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{b.product_name}</div>
                      <div className="text-[10px] text-slate-500">{b.generic_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">📍 {b.current_owner_name} ({b.current_location_city})</td>
                    <td className="py-3.5 px-4 font-mono text-slate-800 font-semibold">{b.current_quantity} units</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{b.expiry_date}</td>
                    <td className="py-3.5 px-4">
                      <BatchStatusBadge status={b.status} expiryState={b.expiry_state} />
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge score={b.risk_score} level={b.risk_level} showLabel={false} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/batches/${b.id}`)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                      >
                        Inspect Twin →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Register New Pharmaceutical Batch Twin</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs font-medium">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Product Name:</label>
                <input
                  type="text"
                  value={newBatch.product_name}
                  onChange={(e) => setNewBatch({ ...newBatch, product_name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Batch Number:</label>
                <input
                  type="text"
                  value={newBatch.batch_number}
                  onChange={(e) => setNewBatch({ ...newBatch, batch_number: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Quantity:</label>
                  <input
                    type="number"
                    value={newBatch.quantity}
                    onChange={(e) => setNewBatch({ ...newBatch, quantity: parseInt(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Expiry Date:</label>
                  <input
                    type="date"
                    value={newBatch.expiry_date}
                    onChange={(e) => setNewBatch({ ...newBatch, expiry_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Create Batch Twin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
