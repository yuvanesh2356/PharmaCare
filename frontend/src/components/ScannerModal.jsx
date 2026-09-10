import React, { useState } from 'react';
import { X, QrCode, Search, CheckCircle } from 'lucide-react';

export default function ScannerModal({ isOpen, onClose, onSelectBatch, batches = [] }) {
  const [selectedBatchNo, setSelectedBatchNo] = useState('');
  const [manualInput, setManualInput] = useState('');

  if (!isOpen) return null;

  const handleScan = (batchNo) => {
    setSelectedBatchNo(batchNo);
    setTimeout(() => {
      onSelectBatch(batchNo);
      onClose();
    }, 600);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onSelectBatch(manualInput.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-blue-700 mb-2">
          <QrCode className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">Batch Barcode / QR Digital Twin Scanner</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 font-medium">
          Scan batch digital twin QR code or select registered batch for instant verification.
        </p>

        {/* Simulated Camera Viewfinder */}
        <div className="relative bg-slate-50 border-2 border-dashed border-blue-300 rounded-2xl h-44 flex flex-col items-center justify-center mb-5 overflow-hidden group">
          <div className="w-32 h-32 border-2 border-blue-600 rounded-xl relative flex items-center justify-center shadow-xs">
            <div className="w-full h-0.5 bg-blue-600 shadow-xs animate-bounce" />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 z-10 font-mono font-medium">
            [ Simulating Camera Lens Feed... ]
          </p>
        </div>

        {/* Quick Select Buttons */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-700 block mb-2">
            Quick Scan Registered Batches:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {batches.map((b) => (
              <button
                key={b.id}
                onClick={() => handleScan(b.batch_number)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  selectedBatchNo === b.batch_number
                    ? 'bg-blue-600 border-blue-700 text-white font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800 font-medium'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Batch {b.batch_number}</span>
                  {selectedBatchNo === b.batch_number && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="text-[10px] text-slate-500 truncate">{b.product_name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Fallback Entry */}
        <form onSubmit={handleManualSubmit} className="pt-3 border-t border-slate-200">
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Manual Barcode / Lot Number Entry:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. P7788, P1001, A4421"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center shadow-xs transition-colors"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" /> Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
