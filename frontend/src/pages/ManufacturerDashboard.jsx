import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, FileCheck, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import BatchStatusBadge from '../components/BatchStatusBadge';
import CertificateUploadModal from '../components/CertificateUploadModal';

export default function ManufacturerDashboard() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatchForCert, setSelectedBatchForCert] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getBatches();
      setBatches(res);
    } catch (err) {
      console.error('Manufacturer load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Batches awaiting manufacturer action (receipt or destruction prep)
  const pendingManufacturerActions = batches.filter(
    (b) => b.status === 'DISTRIBUTOR_RECEIVED' || b.status === 'MANUFACTURER_RECEIVED'
  );

  // Fully certified destroyed batches
  const certifiedDestroyed = batches.filter(
    (b) => b.status === 'DESTROYED' || b.status === 'CERTIFICATE_VERIFIED'
  );

  const hasOpenReturns = pendingManufacturerActions.length > 0;

  const handleReceive = async (batchId) => {
    try {
      await api.manufacturerReceive(batchId);
      loadData();
    } catch (err) {
      alert(err.message || 'Receive failed');
    }
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3">
          <span>Pharmaceutical Manufacturer Compliance Portal</span>
          <span className="text-xs font-semibold text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1">
            <Factory className="w-3.5 h-3.5" /> MedLife Pharma Ltd (QA Division)
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Log returned stock, schedule incineration with PCB-authorized waste facilities, and link cryptographic certificates.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-purple-700 text-xs font-bold mb-1">
            <span>Pending Manufacturer Receipts</span>
            <Factory className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">{pendingManufacturerActions.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-normal">Awaiting receipt confirmation or destruction</div>
        </div>

        <div className="bg-white border border-emerald-200/80 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold mb-1">
            <span>Certified Destroyed Batches</span>
            <FileCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{certifiedDestroyed.length}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-normal">Lifecycle closed & verified</div>
        </div>

        <div className={`bg-white border rounded-xl p-4 shadow-2xs ${hasOpenReturns ? 'border-amber-200/80' : 'border-blue-200/80'}`}>
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className={hasOpenReturns ? 'text-amber-800' : 'text-blue-700'}>Compliance Audit Trace</span>
            <ShieldAlert className={`w-4 h-4 ${hasOpenReturns ? 'text-amber-600' : 'text-blue-600'}`} />
          </div>
          <div className={`text-2xl font-bold ${hasOpenReturns ? 'text-amber-700' : 'text-blue-700'}`}>
            {hasOpenReturns ? `Pending Actions: ${pendingManufacturerActions.length}` : '100% CDSCO Compliant'}
          </div>
          <div className={`text-[11px] mt-1 font-normal ${hasOpenReturns ? 'text-amber-700' : 'text-blue-600'}`}>
            {hasOpenReturns ? 'Compliance Status: Attention Required' : 'Incineration proofing active'}
          </div>
        </div>
      </div>

      {/* Operational Workspace Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-3.5 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Incoming & Pending Returns Operational Queue ({pendingManufacturerActions.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Awaiting Manufacturer Action</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">Loading returns...</div>
        ) : pendingManufacturerActions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">No pending manufacturer returns requiring action.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Batch No</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Verified Quantity</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {pendingManufacturerActions.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <code className="text-purple-700 font-semibold bg-purple-50/80 px-2 py-0.5 rounded border border-purple-200/60 font-mono">
                        {batch.batch_number}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{batch.product_name}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{batch.generic_name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <BatchStatusBadge status={batch.status} expiryState={batch.expiry_state} />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800 font-semibold">
                      {batch.current_quantity} <span className="text-[10px] text-slate-400 font-normal">units</span>
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

                      {batch.status === 'DISTRIBUTOR_RECEIVED' && (
                        <button
                          onClick={() => handleReceive(batch.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-colors shadow-2xs"
                        >
                          Confirm Receipt
                        </button>
                      )}

                      {batch.status === 'MANUFACTURER_RECEIVED' && (
                        <button
                          onClick={() => setSelectedBatchForCert(batch)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-colors shadow-2xs"
                        >
                          Record Destruction
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

      <CertificateUploadModal
        isOpen={!!selectedBatchForCert}
        onClose={() => setSelectedBatchForCert(null)}
        batch={selectedBatchForCert}
        onSuccess={loadData}
      />
    </div>
  );
}
