import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle, Filter } from 'lucide-react';
import { api } from '../services/api';

export default function RetailerAlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.getAlerts({ role: 'RETAILER' });
      setAlerts(res);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleResolve = async (id) => {
    try {
      await api.resolveAlert(id);
      loadAlerts();
    } catch (err) {
      alert('Failed to resolve alert');
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  return (
    <div className="p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>Pharmacy Dispensary Alert Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Risk and compliance alerts active for this retail pharmacy dispensary.
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold shadow-xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                severityFilter === sev
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 text-xs font-medium">Loading pharmacy alerts...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs font-medium">No alerts matching filter.</div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all shadow-xs ${
                  isCritical
                    ? 'bg-amber-50/70 border-amber-300'
                    : isHigh
                    ? 'bg-red-50/50 border-red-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                        isCritical
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : isHigh
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}
                    >
                      {alert.severity} • {alert.alert_type}
                    </span>

                    <code className="text-xs font-mono text-slate-700 font-bold">
                      {alert.alert_code}
                    </code>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 font-medium">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1.5">{alert.title}</h3>
                <p className="text-xs text-slate-700 mb-3 leading-relaxed font-medium">{alert.reason}</p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
                  <div>
                    <span className="text-slate-500 font-bold">Recommended Action: </span>
                    <span className="text-slate-900 font-semibold">{alert.recommended_action}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/batches/${alert.batch_id}`)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      Inspect Twin →
                    </button>

                    {alert.status === 'OPEN' ? (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold flex items-center text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
