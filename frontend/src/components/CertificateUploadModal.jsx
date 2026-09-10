import React, { useState } from 'react';
import { X, FileCheck, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function CertificateUploadModal({ isOpen, onClose, batch, onSuccess }) {
  if (!isOpen || !batch) return null;

  const [certId, setCertId] = useState(`DC-${Math.floor(10000 + Math.random() * 90000)}`);
  const [returnCode, setReturnCode] = useState(batch.returns?.[0]?.return_code || '');
  const [declaredBatch, setDeclaredBatch] = useState(batch.batch_number);
  const [quantity, setQuantity] = useState(batch.current_quantity || 470);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [facility, setFacility] = useState('GreenWaste Eco-Facility Bengaluru');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isMismatch = declaredBatch.trim().toUpperCase() !== batch.batch_number.trim().toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.uploadCertificate({
        certificate_id: certId,
        batch_id: batch.id,
        return_code: returnCode || undefined,
        declared_batch_number: declaredBatch,
        quantity_destroyed: parseInt(quantity),
        destruction_date: date,
        waste_facility_name: facility,
        certificate_file_url: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&q=80"
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Certificate upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">Link Authorized Destruction Certificate</h3>
        <p className="text-xs text-slate-500 mb-4 font-medium">
          Digital Twin Batch: <span className="text-purple-700 font-mono font-bold">{batch.batch_number}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Destruction Certificate Serial Number:</label>
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Linked Reverse Return ID (Code):</label>
            <input
              type="text"
              value={returnCode}
              onChange={(e) => setReturnCode(e.target.value)}
              placeholder="e.g. RET-P7788-01"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Declared Certificate Batch Number:</label>
            <input
              type="text"
              value={declaredBatch}
              onChange={(e) => setDeclaredBatch(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-purple-500"
              required
            />
            {isMismatch && (
              <div className="mt-1.5 p-2.5 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-xl flex items-center font-bold">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0 text-red-600" />
                <span>CERTIFICATE MISMATCH ALERT: Certificate batch ('{declaredBatch}') != Digital Twin ('{batch.batch_number}').</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Destroyed Quantity:</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Destruction Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Authorized Waste Facility:</label>
            <input
              type="text"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center shadow-xs"
            >
              {loading ? 'Linking...' : <><FileCheck className="w-3.5 h-3.5 mr-1.5" /> Upload & Verify Certificate</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
