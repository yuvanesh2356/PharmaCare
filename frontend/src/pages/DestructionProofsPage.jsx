import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, Factory } from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import BatchStatusBadge from '../components/BatchStatusBadge';
import CertificateUploadModal from '../components/CertificateUploadModal';

export default function DestructionProofsPage() {
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
      console.error('Failed to load destruction proofs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter batches in destruction workflow or completed destruction
  const destructionWorkflowBatches = batches.filter(
    (b) =>
      b.status === 'MANUFACTURER_RECEIVED' ||
      b.status === 'DESTRUCTION_PENDING' ||
      b.status === 'DESTROYED' ||
      b.status === 'CERTIFICATE_VERIFIED'
  );

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3">
          <span>Authorized Destruction Proofs & Certificate Registry</span>
          <span className="text-xs font-semibold text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5" /> PCB-Authorized Facility Evidence
          </span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Record authorized incineration, upload PCB destruction certificates, and cryptographically link proof of disposal to batch digital twins.
        </p>
      </div>

      {/* Destruction & Proofs Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-3.5 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Disposal & Certificate Registry ({destructionWorkflowBatches.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Cryptographic Compliance Ledger</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">Loading destruction records...</div>
        ) : destructionWorkflowBatches.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">No batches awaiting destruction or certified destroyed.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                  <th className="py-3 px-4">Verified Quantity</th>
                  <th className="py-3 px-4">Certificate ID & Facility</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {destructionWorkflowBatches.map((b) => {
                  const cert = b.certificates && b.certificates.length > 0 ? b.certificates[0] : null;
                  const isCompleted = b.status === 'CERTIFICATE_VERIFIED' || b.status === 'DESTROYED';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <code className="text-purple-700 font-semibold bg-purple-50/80 px-2 py-0.5 rounded border border-purple-200/60 font-mono">
                          {b.batch_number}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{b.product_name}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{b.generic_name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <BatchStatusBadge status={b.status} expiryState={b.expiry_state} />
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800 font-semibold">
                        {b.current_quantity} <span className="text-[10px] text-slate-400 font-normal">units</span>
                      </td>
                      <td className="py-3 px-4">
                        {cert ? (
                          <div>
                            <code className="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/80">
                              #{cert.certificate_id}
                            </code>
                            <div className="text-[11px] text-slate-500 mt-0.5">{cert.waste_facility_name}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Pending Upload</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge score={b.risk_score} level={b.risk_level} showLabel={false} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/batches/${b.id}`)}
                          className="border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                        >
                          Inspect Twin
                        </button>

                        {!isCompleted ? (
                          <button
                            onClick={() => setSelectedBatchForCert(b)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-colors shadow-2xs"
                          >
                            Record Destruction
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate(`/batches/${b.id}`)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                          >
                            View Certificate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
