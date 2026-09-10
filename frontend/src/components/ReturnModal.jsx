import React, { useState } from 'react';
import { X, Send, Camera, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function ReturnModal({ isOpen, onClose, batch, onSuccess }) {
  if (!isOpen || !batch) return null;

  const [quantity, setQuantity] = useState(batch.current_quantity || 500);
  const [reason, setReason] = useState('EXPIRED_STOCK');
  const [notes, setNotes] = useState('Foil strip packaging intact. Ready for reverse pickup.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createReturn({
        batch_id: batch.id,
        quantity_declared: parseInt(quantity),
        reason: reason,
        condition_notes: notes,
        photo_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80"
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit return request.');
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

        <h3 className="text-lg font-bold text-slate-900 mb-1">Initiate CDSCO Reverse Return Request</h3>
        <p className="text-xs text-slate-500 mb-4 font-medium">
          Batch: <span className="text-blue-700 font-mono font-bold">{batch.batch_number}</span> ({batch.product_name})
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center font-semibold">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Declared Return Quantity (Units):</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Return Reason / CDSCO Trigger:</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
            >
              <option value="EXPIRED_STOCK">Expired Stock (Mandatory Recall)</option>
              <option value="NEAR_EXPIRY">Near-Expiry CDSCO 30-Day Window</option>
              <option value="DAMAGED_PACKAGING">Damaged Outer Packaging</option>
              <option value="QUALITY_RECALL">Manufacturer Batch Recall Notice</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Condition Notes & Inspection:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center text-slate-700 font-bold">
              <Camera className="w-4 h-4 mr-2 text-blue-600" />
              <span>Simulated Stock Proof Photo:</span>
            </div>
            <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono font-bold">
              Attached (foil_strip.jpg)
            </span>
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center shadow-xs"
            >
              {loading ? 'Submitting...' : <><Send className="w-3.5 h-3.5 mr-1.5" /> Submit Return Request</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
