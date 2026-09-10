import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShieldAlert, Building2, Calendar, Package, Factory, 
  MapPin, Undo2, FileCheck, FileText, AlertTriangle, ExternalLink, Camera
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import BatchStatusBadge from '../components/BatchStatusBadge';
import QuantityFlowVisualizer from '../components/QuantityFlowVisualizer';
import BatchTimeline from '../components/BatchTimeline';

export default function BatchDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBatch = async () => {
    setLoading(true);
    try {
      const res = await api.getBatchDetail(id);
      setBatch(res);
    } catch (err) {
      setError(err.message || 'Failed to load batch twin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatch();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 text-xs font-medium">Loading Batch Digital Twin...</div>;
  }

  if (error || !batch) {
    return (
      <div className="p-8 text-center text-red-600 text-xs font-bold">
        {error || 'Batch not found.'}
        <div className="mt-4">
          <button onClick={() => navigate('/batches')} className="bg-slate-100 text-slate-700 font-bold px-4 py-2 rounded-xl">
            Back to Batches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Overview
      </button>

      {/* HEADER BANNER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-black text-slate-900">{batch.product_name}</h1>
              <code className="text-sm font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                Batch {batch.batch_number}
              </code>
              <BatchStatusBadge status={batch.status} expiryState={batch.expiry_state} />
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Generic: <span className="text-slate-800 font-bold">{batch.generic_name}</span> | Manufacturer: <span className="text-slate-800 font-bold">{batch.product?.manufacturer_name}</span>
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <RiskBadge score={batch.risk_score} level={batch.risk_level} />
          </div>
        </div>
      </div>

      {/* "WHY IS THIS BATCH SUSPICIOUS?" SECTION */}
      {batch.suspicious_reasons && batch.suspicious_reasons.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs risk-glow-critical">
          <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-sm mb-3">
            <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
            <span>Why is this batch suspicious? (Risk Score: {batch.risk_score}/100)</span>
          </div>

          <div className="space-y-2 text-xs text-slate-800 font-medium">
            {batch.suspicious_reasons.map((r, idx) => (
              <div key={idx} className="flex items-start bg-white p-3 rounded-xl border border-amber-200">
                <span className="text-red-600 font-bold mr-2 text-sm">✓</span>
                <span className="leading-relaxed">{r}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-amber-200 flex flex-wrap items-center justify-between text-xs text-slate-700">
            <div>
              <span className="font-bold text-amber-900">Mandatory Action:</span> Immediate State Drug Inspector Audit Required.
            </div>
            <div className="text-[11px] font-mono text-amber-900 font-bold">
              CDSCO Alert Code: {batch.alerts?.[0]?.alert_code || 'ALT-P7788-REENTRY'}
            </div>
          </div>
        </div>
      )}

      {/* QUANTITY FLOW VISUALIZATION */}
      <QuantityFlowVisualizer flow={batch.quantity_flow} />

      {/* MAIN TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Batch Digital Twin Specifications
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-medium">
              <div>
                <span className="text-slate-400 block">Manufacturing Date</span>
                <span className="font-mono text-slate-900 font-bold">{batch.mfg_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Expiry Date</span>
                <span className="font-mono text-slate-900 font-bold">{batch.expiry_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Days Remaining</span>
                <span className={`font-mono font-bold ${batch.days_remaining < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {batch.days_remaining} days
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Pack Size</span>
                <span className="text-slate-900 font-bold">{batch.pack_size}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Original Quantity</span>
                <span className="font-mono text-slate-900 font-bold">{batch.original_quantity} units</span>
              </div>
              <div>
                <span className="text-slate-400 block">Current Verified Quantity</span>
                <span className="font-mono text-slate-900 font-bold">{batch.current_quantity} units</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 block mb-1">Current Owner / Location</span>
              <div className="flex items-center text-slate-900 font-bold">
                <MapPin className="w-4 h-4 text-blue-600 mr-1.5" />
                <span>{batch.current_owner_name} ({batch.current_location_city})</span>
              </div>
            </div>
          </div>

          {/* Compliance Status Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              CDSCO Compliance Checklist
            </h3>

            <div className="space-y-2 text-xs font-medium">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span>Return Request Initiated:</span>
                <span className="font-bold text-emerald-700">✓ {batch.compliance_summary?.return_compliance}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span>Distributor Handoff Audit:</span>
                <span className={batch.compliance_summary?.handoff_compliance?.includes('WARNING') ? 'font-bold text-amber-600' : 'font-bold text-emerald-700'}>
                  {batch.compliance_summary?.handoff_compliance}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span>Authorized Disposal Executed:</span>
                <span className="font-bold text-emerald-700">✓ {batch.compliance_summary?.destruction_compliance}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span>Certificate Cryptographically Linked:</span>
                <span className={batch.certificates?.length > 0 ? 'font-bold text-purple-700' : 'font-bold text-slate-500'}>
                  {batch.certificates?.length > 0 ? `✓ Linked (#${batch.certificates[0].certificate_id})` : 'Pending Certificate'}
                </span>
              </div>
            </div>
          </div>

          {/* Destruction Certificate Card */}
          {batch.certificates && batch.certificates.length > 0 && (
            <div className="bg-white border border-purple-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-purple-800 font-bold text-xs border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-1.5">
                  <FileCheck className="w-4 h-4 text-purple-600" />
                  <span>Destruction Certificate #{batch.certificates[0].certificate_id}</span>
                </div>
                <span className="bg-purple-50 text-purple-700 text-[10px] px-2.5 py-0.5 rounded-full border border-purple-200 font-extrabold">
                  {batch.certificates[0].verification_status}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600 font-medium">
                <div>Waste Facility: <span className="font-bold text-slate-900">{batch.certificates[0].waste_facility_name}</span></div>
                <div>Destroyed Quantity: <span className="font-mono text-slate-900 font-bold">{batch.certificates[0].quantity_destroyed} units</span></div>
                <div>Destruction Date: <span className="font-mono text-slate-900">{batch.certificates[0].destruction_date}</span></div>
              </div>

              {batch.certificates[0].certificate_file_url && (
                <a
                  href={batch.certificates[0].certificate_file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs text-purple-700 hover:text-purple-900 font-bold underline pt-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Official Incineration Certificate PDF →
                </a>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Visual Chain-of-Custody Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Chain-of-Custody Immutable Audit Ledger</span>
            <span className="text-xs text-slate-500 font-mono font-medium">Total Events: {batch.events?.length || 0}</span>
          </h3>

          <BatchTimeline events={batch.events} />
        </div>

      </div>
    </div>
  );
}
