import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Search, ShieldAlert, CheckCircle, AlertTriangle, Building2, Package, MapPin } from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import BatchStatusBadge from '../components/BatchStatusBadge';

export default function RetailerScanPage() {
  const navigate = useNavigate();
  const [batchNoInput, setBatchNoInput] = useState('P7788');
  const [pharmacyName, setPharmacyName] = useState('Apollo Pharmacy Chennai');
  const [city, setCity] = useState('Chennai');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [foundBatch, setFoundBatch] = useState(null);

  const handleScanSubmit = async (e) => {
    e.preventDefault();
    if (!batchNoInput.trim()) return;

    setLoading(true);
    setScanResult(null);
    setFoundBatch(null);

    try {
      // 1. Fetch batch details
      const batches = await api.getBatches({ search: batchNoInput.trim() });
      const match = batches.find((b) => b.batch_number.toUpperCase() === batchNoInput.trim().toUpperCase());
      
      if (match) {
        setFoundBatch(match);
      }

      // 2. Perform Re-entry verification API call
      const res = await api.scanReentry({
        batch_number: batchNoInput.trim(),
        scanning_pharmacy_name: pharmacyName,
        scanning_city: city,
      });

      setScanResult(res);
    } catch (err) {
      setScanResult({ status: 'ERROR', message: err.message || 'Scan lookup failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-blue-600" />
          <span>Dispensary Barcode & Digital Twin Scanner</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Scan or look up pharmaceutical batch numbers at billing/inventory intake to verify active status and block illegal re-entry fraud.
        </p>
      </div>

      {/* Scanner Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Batch Barcode Intake Verification</h3>

        <form onSubmit={handleScanSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Enter / Scan Batch Number:</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={batchNoInput}
                onChange={(e) => setBatchNoInput(e.target.value)}
                placeholder="e.g. P7788, P1001, C2045, A4421"
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Scanning Pharmacy:</label>
              <input
                type="text"
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Dispensary City:</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying Central Registry...' : '🔍 Scan & Verify Batch Status'}
            </button>
            
            {/* Quick Demo Pre-fill triggers */}
            <button
              type="button"
              onClick={() => {
                setBatchNoInput('P7788');
                setPharmacyName('City Healthcare Pharmacy');
                setCity('Madurai');
              }}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs px-3 py-2.5 rounded-xl font-bold transition-colors"
            >
              Test Fraud P7788
            </button>
          </div>
        </form>

        {/* RE-ENTRY FRAUD ALERT CRITICAL OUTPUT */}
        {scanResult && scanResult.status === 'BLOCKED' && (
          <div className="p-5 bg-red-50 border-2 border-red-500 rounded-2xl text-red-900 space-y-3 font-medium shadow-md">
            <div className="flex items-center text-red-700 font-extrabold text-sm">
              <ShieldAlert className="w-6 h-6 mr-2 text-red-600 animate-pulse shrink-0" />
              <span>🚨 CRITICAL RE-ENTRY FRAUD DETECTED — POS BILLING BLOCKED!</span>
            </div>

            <p className="text-xs text-red-800 leading-relaxed font-semibold">
              {scanResult.message}
            </p>

            <div className="bg-white p-3 rounded-xl border border-red-200 flex flex-wrap justify-between items-center text-xs gap-2">
              <div>
                <span className="text-slate-500 font-bold">Alert Code: </span>
                <code className="text-red-700 font-mono font-bold">{scanResult.alert_code}</code>
              </div>
              <div className="flex items-center space-x-2">
                <RiskBadge score={scanResult.risk_score || 94} level="CRITICAL" />
              </div>
            </div>

            <div className="text-[11px] text-red-700 font-bold pt-1">
              Action Required: Immediately isolate physical stock and notify State CDSCO Drug Inspector.
            </div>
          </div>
        )}

        {/* VALID SCAN OUTPUT */}
        {scanResult && scanResult.status === 'NORMAL' && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center font-bold">
            <CheckCircle className="w-5 h-5 mr-2 text-emerald-600 shrink-0" />
            <span>{scanResult.message}</span>
          </div>
        )}

        {/* DISPLAY BATCH METADATA IF FOUND */}
        {foundBatch && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Digital Twin Record Overview
              </h4>
              <button
                onClick={() => navigate(`/batches/${foundBatch.id}`)}
                className="text-blue-600 hover:text-blue-800 font-bold text-xs underline"
              >
                Open Complete Digital Twin →
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-medium">
              <div>
                <span className="text-slate-400 block text-[10px]">Product</span>
                <span className="font-bold text-slate-900">{foundBatch.product_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Batch Number</span>
                <code className="font-bold text-blue-700 font-mono">{foundBatch.batch_number}</code>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Expiry Date</span>
                <span className="font-mono text-slate-900">{foundBatch.expiry_date} ({foundBatch.days_remaining}d)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Current Status</span>
                <BatchStatusBadge status={foundBatch.status} expiryState={foundBatch.expiry_state} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
