// apps/web/src/components/dashboard/AuditView.tsx
// Screen 7: Decision Log - Complete audit trail of all AI and Rule-based decisions

import React, { useState, useMemo } from "react";
import {
  History,
  ChevronDown,
  ChevronRight,
  Download,
  Terminal,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";

export const AuditView: React.FC = () => {
  const { auditLog } = useInventory();

  const [pathFilter, setPathFilter] = useState<string>("ALL");
  const [kindFilter, setKindFilter] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredLog = useMemo(() => {
    return auditLog.filter((item) => {
      if (pathFilter !== "ALL" && item.decisionPath !== pathFilter) return false;
      if (kindFilter !== "ALL" && item.kind !== kindFilter) return false;
      return true;
    });
  }, [auditLog, pathFilter, kindFilter]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLog, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `stocksense_audit_log_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900">Decision & Audit Log</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete traceability trail. Records every anomaly classification, forecast adjustment, and scenario parse alongside its decision path.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-xl text-xs transition-colors self-start md:self-auto border border-slate-200"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Trail (JSON)</span>
        </button>
      </div>

      {/* 2. Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Path Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 border border-slate-200">
            <span className="font-semibold text-slate-500 pl-1.5">Decision Path:</span>
            <select
              value={pathFilter}
              onChange={(e) => setPathFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Paths</option>
              <option value="RULES">Rules (Deterministic)</option>
              <option value="LLM">AI (Suggestion)</option>
              <option value="LLM_FAILED_RULES">AI Failed (Rules Used)</option>
              <option value="CONFIRMED">User Confirmed / Overridden</option>
            </select>
          </div>

          {/* Kind Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 border border-slate-200">
            <span className="font-semibold text-slate-500 pl-1.5">Action Kind:</span>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Actions</option>
              <option value="classification">Anomaly Classification</option>
              <option value="adjustment">Forecast Adjustment</option>
              <option value="scenario_parse">Scenario Parse</option>
              <option value="override">User Override</option>
              <option value="import">Data Ingestion</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Showing {filteredLog.length} of {auditLog.length} audit records
        </div>
      </div>

      {/* 3. Audit Log Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Kind</th>
                <th className="py-3 px-4">Target SKU</th>
                <th className="py-3 px-4">Decision Path</th>
                <th className="py-3 px-4">Decision Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLog.map((log) => {
                const isExpanded = expandedId === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => toggleExpand(log.id)}
                      className={`cursor-pointer transition-colors ${
                        isExpanded ? "bg-indigo-50/40" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-600" /> : <ChevronRight className="w-4 h-4" />}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        <span className="text-[10px] text-slate-400 block">{log.at.split("T")[0]}</span>
                      </td>
                      <td className="py-3 px-4 uppercase font-semibold text-[10px] text-slate-600">
                        {log.kind}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {log.sku || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.decisionPath === "LLM"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : log.decisionPath === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : log.decisionPath === "LLM_FAILED_RULES"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-700 border border-slate-300"
                        }`}>
                          {log.decisionPath === "LLM"
                            ? "AI (suggestion)"
                            : log.decisionPath === "CONFIRMED"
                            ? "Confirmed by you"
                            : log.decisionPath === "LLM_FAILED_RULES"
                            ? "AI failed, rules used"
                            : "Rules"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {log.summary}
                      </td>
                    </tr>

                    {/* Expandable JSON Detail */}
                    {isExpanded && (
                      <tr className="bg-slate-900 text-slate-200 text-xs font-mono">
                        <td colSpan={6} className="p-4 pl-12 space-y-2">
                          <div className="flex items-center gap-2 text-indigo-400 font-bold text-[11px] uppercase tracking-wider">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Audit Record Technical Payload (Immutable State)</span>
                          </div>
                          <pre className="bg-slate-950 p-3 rounded-lg overflow-x-auto text-[11px] text-slate-300 border border-slate-800">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLog.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            No audit records found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};
