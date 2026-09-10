import React, { useState } from 'react';
import { X, ShieldAlert, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export default function ReentryScannerModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const [batchNo, setBatchNo] = useState('P7788');
  const [pharmacyName, setPharmacyName] = useState('City Healthcare Pharmacy');
  const [city, setCity] = useState('Madurai');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSimulateScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await api.scanReentry({
        batch_number: batchNo,
        scanning_pharmacy_name: pharmacyName,
        scanning_city: city
      });
      setResult(res);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setResult({ status: 'ERROR', message: err.message || 'Scan failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-purple-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-purple-800 mb-2">
          <ShieldAlert className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-bold text-slate-900">Simulate Pharmacy POS Scan (Fraud Check)</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 font-medium">
          Test central CDSCO re-entry protection by attempting to scan an already-destroyed batch into a retail billing POS.
        </p>

        <form onSubmit={handleSimulateScan} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Batch Number to Scan:</label>
            <input
              type="text"
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. P7788"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Attempting Pharmacy:</label>
              <input
                type="text"
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Location City:</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
          >
            {loading ? 'Executing Central Verification...' : '🚨 Simulate Retail POS Scan Attempt'}
          </button>
        </form>

        {/* Scan Result Output */}
        {result && (
          <div className="mt-5 pt-4 border-t border-slate-200">
            {result.status === 'BLOCKED' ? (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs space-y-2 font-medium shadow-xs">
                <div className="flex items-center font-bold text-sm text-red-700">
                  <ShieldAlert className="w-5 h-5 mr-2 text-red-600 shrink-0" />
                  {result.message}
                </div>
                <div className="flex justify-between items-center text-[11px] pt-2 border-t border-amber-200">
                  <span>Alert Reference: <code className="text-purple-800 font-mono font-bold">{result.alert_code}</code></span>
                  <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full font-extrabold border border-red-200">Risk Score: {result.risk_score}/100</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center font-bold">
                <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                <span>{result.message}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
