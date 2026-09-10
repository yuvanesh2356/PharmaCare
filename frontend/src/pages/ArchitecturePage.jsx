import React from 'react';
import { 
  Network, ArrowRight, ShieldCheck, Database, Cpu, 
  Sparkles, AlertTriangle, Layers, FileCheck
} from 'lucide-react';

export default function ArchitecturePage() {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto font-sans">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center">
          <Network className="w-5 h-5 mr-2 text-blue-600" />
          <span>PharmaChain AI — System Architecture & Compliance Pipeline</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Technical design specification of CDSCO 2025 Reverse Logistics Governance & Risk Intelligence Engine.
        </p>
      </div>

      {/* Flowchart Diagram */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-8">
        
        {/* Tier 1: Reverse Chain Actors */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-3">
            1. Role-Based Stakeholder Handoff Nodes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
              <div className="font-bold text-emerald-800">Retail Pharmacy</div>
              <div className="text-[11px] text-slate-600 font-medium">Examines expiry dates & initiates return request with photo proof.</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
              <div className="font-bold text-blue-800">Wholesale Distributor</div>
              <div className="text-[11px] text-slate-600 font-medium">Physical count & weight verification; logs transit discrepancies.</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
              <div className="font-bold text-purple-800">Manufacturer QA</div>
              <div className="text-[11px] text-slate-600 font-medium">Receives consignment & schedules authorized PCB incineration.</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
              <div className="font-bold text-teal-800">Waste Facility</div>
              <div className="text-[11px] text-slate-600 font-medium">Executes high-temp destruction & issues cryptographic certificate.</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="w-6 h-6 text-blue-600 rotate-90" />
        </div>

        {/* Tier 2: Immutable Ledger & Central Database */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-3">
            2. Central Shared Batch Digital Twin Registry & Immutable Ledger
          </h3>
          <div className="bg-slate-50 p-5 rounded-2xl border border-blue-200 flex items-center space-x-4">
            <Database className="w-8 h-8 text-blue-600 shrink-0" />
            <div className="text-xs space-y-1">
              <div className="font-bold text-slate-900 text-sm">Batch Digital Twin Ledger (SQLite + SQLAlchemy ORM)</div>
              <p className="text-slate-600 font-medium">
                Single source of truth tracking original quantity, current quantity, return status, location movement, chain events, proof photographs, and destruction certificates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="w-6 h-6 text-blue-600 rotate-90" />
        </div>

        {/* Tier 3: Deterministic Anomaly & Risk Intelligence Engine */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800 mb-3">
            3. Deterministic Anomaly & Re-Entry Fraud Intelligence Engine
          </h3>
          <div className="bg-purple-50/60 p-5 rounded-2xl border border-purple-200 space-y-3">
            <div className="flex items-center space-x-2 text-purple-900 font-bold text-sm">
              <Cpu className="w-5 h-5 text-purple-700" />
              <span>Reverse Chain Risk Scorer (0 – 100 Score)</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[11px] font-medium">
              <div className="bg-white p-3 rounded-xl border border-purple-200">
                <span className="font-bold text-red-700 block">🚨 Re-Entry Fraud (+50 pts)</span>
                Batch scanned into billing after entering return pipeline.
              </div>
              <div className="bg-white p-3 rounded-xl border border-purple-200">
                <span className="font-bold text-amber-700 block">📜 Certificate Mismatch (+30 pts)</span>
                Certificate batch number or quantity inconsistency.
              </div>
              <div className="bg-white p-3 rounded-xl border border-purple-200">
                <span className="font-bold text-yellow-700 block">⚖️ Custody Conflict (+25 pts)</span>
                Simultaneous active inventory holding across multiple orgs.
              </div>
              <div className="bg-white p-3 rounded-xl border border-purple-200">
                <span className="font-bold text-orange-700 block">📦 Quantity Loss (+20 pts)</span>
                Declared count exceeds verified handoff count.
              </div>
              <div className="bg-white p-3 rounded-xl border border-purple-200">
                <span className="font-bold text-blue-700 block">📍 Location Anomaly (+20 pts)</span>
                Unexpected geographic route deviation.
              </div>
              <div className="bg-white p-3 rounded-xl border border-purple-200">
                <span className="font-bold text-indigo-700 block">⏱️ Timeline Speed (+15 pts)</span>
                Handoff faster than physical transport permits.
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="w-6 h-6 text-blue-600 rotate-90" />
        </div>

        {/* Tier 4: Regulatory Action & AI Assistant */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3">
            4. Regulatory Enforcement & Investigation Output
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-medium">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-1.5" />
                <span>Critical Fraud Alert & POS Block</span>
              </div>
              <p className="text-slate-600">
                Blocks retail terminal billing, locks batch status, and dispatches CDSCO Drug Inspector alert.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center">
                <Sparkles className="w-4 h-4 text-blue-600 mr-1.5" />
                <span>Explainable Natural Language Insights</span>
              </div>
              <p className="text-slate-600">
                Generates un-hallucinated explanations: "Why is this batch suspicious?" derived strictly from DB evidence.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
