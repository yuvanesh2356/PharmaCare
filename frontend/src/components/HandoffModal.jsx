import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function HandoffModal({ isOpen, onClose, batch, onSuccess }) {
  if (!isOpen || !batch) return null;

  const declared = batch.return_quantity || batch.current_quantity || 500;
  const [received, setReceived] = useState(declared);
  const [weight, setWeight] = useState((declared * 0.025).toFixed(1));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDiscrepancy = parseInt(received) !== parseInt(declared);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.verifyHandoff({
        batch_id: batch.id,
        received_quantity: parseInt(received),
        weight_kg: parseFloat(weight),
        receipt_photo_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&q=80"
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Handoff verification failed.');
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

        <h3 className="text-lg font-bold text-slate-900 mb-1">Distributor Pickup & Quantity Verification</h3>
        <p className="text-xs text-slate-500 mb-4 font-medium">
          Batch: <span className="text-blue-700 font-mono font-bold">{batch.batch_number}</span> ({batch.product_name})
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="text-slate-600 font-bold">Retailer Declared Return Quantity:</span>
            <span className="font-mono text-slate-900 font-bold text-sm">{declared} units</span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Distributor Physically Verified Quantity:</label>
            <input
              type="number"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Consignment Gross Weight (kg):</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isDiscrepancy && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-extrabold text-xs">QUANTITY DISCREPANCY WARNING</div>
                <div className="text-[11px] mt-0.5 font-medium">
                  Physical count ({received} units) differs from retailer declaration ({declared} units). Loss of{' '}
                  <span className="font-bold">{declared - received} units</span> will be flagged on chain!
                </div>
              </div>
            </div>
          )}

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
              {loading ? 'Verifying...' : <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Confirm Receipt</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
