import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, AlertTriangle, Search, Filter, Sparkles, Send, CheckCircle2, ChevronRight, Shield, UserCheck, Lock
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import BatchStatusBadge from '../components/BatchStatusBadge';

export default function InvestigatorDashboard() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Natural language query assistant state
  const [aiQuestion, setAiQuestion] = useState('Why is Batch P7788 suspicious?');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const bRes = await api.getBatches();
      const iRes = await api.getInvestigations();
      setBatches(bRes);
      setInvestigations(iRes);

      if (bRes.length > 0) {
        const sorted = [...bRes].sort((a, b) => b.risk_score - a.risk_score);
        setSelectedBatch(sorted[0]);
      }
    } catch (err) {
      console.error('Investigator load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAskAi = async (e) => {
    if (e) e.preventDefault();
    if (!aiQuestion.trim()) return;

    setAiLoading(true);
    try {
      const res = await api.queryAssistant({
        question: aiQuestion,
        batch_id: selectedBatch?.id
      });
      setAiAnswer(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDispatchInspector = async () => {
    if (!selectedBatch) return;
    try {
      const res = await api.dispatchInspector(selectedBatch.id);
      setActionMessage(res.message);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to dispatch inspector');
    }
  };

  const handleQuarantineStock = async () => {
    if (!selectedBatch) return;
    try {
      const res = await api.quarantineStock(selectedBatch.id);
      setActionMessage(res.message);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to quarantine stock');
    }
  };

  const filteredBatches = batches.filter((b) => {
    if (riskFilter === 'CRITICAL') return b.risk_score >= 75;
    if (riskFilter === 'HIGH') return b.risk_score >= 50 && b.risk_score < 75;
    if (riskFilter === 'REENTRY') return b.status === 'RE_ENTRY_DETECTED' || b.risk_score >= 90;
    if (riskFilter === 'DISCREPANCY') return b.suspicious_reasons.some((r) => r.includes('Discrepancy') || r.includes('Quantity'));
    return true;
  });

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <span>State CDSCO Drug Inspectorate & Anti-Fraud Center</span>
            <span className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-700" /> CDSCO Controller Cell
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time CDSCO reverse chain risk intelligence: Detect illegal re-entries, stolen stock diversions, and certificate fraud.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Risk Queue (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <ShieldAlert className="w-4 h-4 text-amber-600 mr-2" />
              <span>Risk Queue ({filteredBatches.length})</span>
            </h3>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-white text-slate-700 text-xs px-2.5 py-1 rounded-xl border border-slate-300 focus:outline-none font-medium"
            >
              <option value="ALL">All Batches</option>
              <option value="CRITICAL">Critical Risk (75-100)</option>
              <option value="HIGH">High Risk (50-74)</option>
              <option value="REENTRY">🚨 Re-Entry Fraud</option>
              <option value="DISCREPANCY">Quantity Discrepancy</option>
            </select>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px] flex-1">
            {filteredBatches.map((b) => {
              const isSelected = selectedBatch?.id === b.id;

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBatch(b)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <code className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {b.batch_number}
                      </code>
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">{b.product_name}</span>
                    </div>
                    <RiskBadge score={b.risk_score} level={b.risk_level} showLabel={false} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2 font-medium">
                    <span>📍 {b.current_location_city} ({b.current_owner_name})</span>
                    <BatchStatusBadge status={b.status} expiryState={b.expiry_state} />
                  </div>

                  {b.suspicious_reasons && b.suspicious_reasons.length > 0 && (
                    <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded-lg border border-red-200 truncate font-semibold">
                      ⚠️ {b.suspicious_reasons[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Batch Inspection & Main Actions */}
        <div className="lg:col-span-7 space-y-6">
          
          {selectedBatch ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-bold text-slate-900">{selectedBatch.product_name}</h2>
                    <code className="text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      Batch {selectedBatch.batch_number}
                    </code>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Generic: {selectedBatch.generic_name} | Manufacturer: {selectedBatch.product?.manufacturer_name}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <RiskBadge score={selectedBatch.risk_score} level={selectedBatch.risk_level} />
                  <button
                    onClick={() => navigate(`/batches/${selectedBatch.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center shadow-xs transition-colors"
                  >
                    Investigate Batch <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>

              {/* WHY IS THIS BATCH SUSPICIOUS? */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center mb-2">
                  <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-700" />
                  Why is this batch suspicious? (Risk Score: {selectedBatch.risk_score}/100)
                </h4>

                <ul className="space-y-1.5 text-xs text-slate-800 font-medium">
                  {selectedBatch.suspicious_reasons?.map((reason, idx) => (
                    <li key={idx} className="flex items-start text-red-700">
                      <span className="text-red-600 mr-2 font-bold">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>

                {/* Main Action Buttons */}
                <div className="mt-4 pt-3 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-600 font-bold">Enforcement Actions:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDispatchInspector}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                    >
                      Dispatch Inspector
                    </button>
                    <button
                      onClick={handleQuarantineStock}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                    >
                      Quarantine Stock
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-500 text-xs font-medium">
              Select a batch from the queue to inspect risk parameters.
            </div>
          )}

          {/* AI NATURAL LANGUAGE INVESTIGATION TOOL */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-blue-800 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Ask AI Investigator (Deterministic DB Evidence)</span>
            </div>

            <form onSubmit={handleAskAi} className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask e.g. Why is Batch P7788 suspicious?"
                className="flex-1 bg-white border border-slate-300 text-slate-900 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center shadow-xs transition-colors"
              >
                {aiLoading ? 'Analyzing DB...' : <><Send className="w-3.5 h-3.5 mr-1.5" /> Query DB</>}
              </button>
            </form>

            {aiAnswer && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed font-sans space-y-2 whitespace-pre-line font-medium">
                {aiAnswer.answer}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
