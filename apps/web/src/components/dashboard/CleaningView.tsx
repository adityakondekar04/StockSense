// apps/web/src/components/dashboard/CleaningView.tsx
// Screen 2: Data Cleaning - Review unusual values, anomaly classification, treatments & ROP impact

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
  Scatter,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { calculateProductPolicy, type AnomalyClass } from "../../data/inventoryData";

export const CleaningView: React.FC = () => {
  const {
    products,
    selectedProduct,
    setSelectedProductId,
    serviceLevel,
    includeUnknowns,
    toggleIncludeUnknowns,
    salesHistory,
    anomalies,
    confirmAnomaly,
    overrideAnomaly,
    addAnomalyNote,
  } = useInventory();

  const [showTable, setShowTable] = useState(false);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const isUnknownsIncluded = includeUnknowns[selectedProduct.sku] ?? true;

  // Compute ROP with and without unknowns
  const withUnknownsPolicy = useMemo(() => {
    return calculateProductPolicy(selectedProduct, serviceLevel, true);
  }, [selectedProduct, serviceLevel]);

  const withoutUnknownsPolicy = useMemo(() => {
    return calculateProductPolicy(selectedProduct, serviceLevel, false);
  }, [selectedProduct, serviceLevel]);

  // Product specific anomalies
  const productAnomalies = useMemo(() => {
    return anomalies.filter((a) => a.sku === selectedProduct.sku);
  }, [anomalies, selectedProduct.sku]);

  // Chart data formatting
  const chartData = useMemo(() => {
    return salesHistory.map((pt) => {
      const anom = pt.anomaly || productAnomalies.find((a) => a.date === pt.date);
      return {
        date: pt.date,
        dayIndex: pt.dayIndex,
        demand: pt.demand,
        isHoldout: pt.isHoldout,
        hasAnomaly: Boolean(anom),
        anomalyValue: anom ? pt.demand : null,
        anomalyClass: anom?.class,
        anomalyReason: anom?.reason,
      };
    });
  }, [salesHistory, productAnomalies]);

  // Selected anomaly for note box
  const activeAnomaly = useMemo(() => {
    if (selectedAnomalyId) {
      return productAnomalies.find((a) => a.id === selectedAnomalyId);
    }
    return productAnomalies[0];
  }, [selectedAnomalyId, productAnomalies]);

  const handleSaveNote = () => {
    if (activeAnomaly && noteInput.trim()) {
      addAnomalyNote(activeAnomaly.id, noteInput.trim());
      setNoteInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & SKU Context Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              {selectedProduct.sku}
            </span>
            <span className="text-xs text-slate-500">Data Cleaning & Unusual Values Review</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedProduct.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            150 days of sales history (120 days training window · 30 days holdout). Unusual values are reviewed and never silently deleted.
          </p>
        </div>

        {/* Product Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Switch SKU:</label>
          <select
            value={selectedProduct.sku}
            onChange={(e) => {
              const p = products.find((prod) => prod.sku === e.target.value);
              if (p) setSelectedProductId(p.id);
            }}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {products.map((p) => (
              <option key={p.sku} value={p.sku}>
                {p.sku} · {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Interactive Time-Series Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Historical Daily Demand & Detected Anomalies</span>
              <span className="text-[11px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {productAnomalies.length} flagged events
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Training window (80%, left) vs Holdout window (20%, shaded right). Markers indicate unusual values classified by rules or AI.
            </p>
          </div>

          {/* Chart Controls & Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-[11px]">
              <span className="flex items-center gap-1 text-blue-700">
                <span className="w-2.5 h-2.5 rotate-45 bg-blue-600 inline-block" /> Promotion
              </span>
              <span className="flex items-center gap-1 text-red-700">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-none inline-block font-bold">✕</span> Data error
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Unknown
              </span>
            </div>

            <button
              onClick={() => setShowTable(!showTable)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              {showTable ? "Show Chart View" : "Show Raw Data Table"}
            </button>
          </div>
        </div>

        {!showTable ? (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  interval={18}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  label={{ value: "Units / Day", angle: -90, position: "insideLeft", fontSize: 10, fill: "#94a3b8" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white rounded-xl p-3 shadow-lg text-xs space-y-1">
                          <div className="font-semibold text-slate-300">{data.date}</div>
                          <div className="text-base font-bold text-white">
                            {data.demand} {selectedProduct.unit}
                          </div>
                          {data.isHoldout && (
                            <div className="text-[10px] text-amber-300 font-medium">Holdout Evaluation Window</div>
                          )}
                          {data.hasAnomaly && (
                            <div className="pt-1 border-t border-slate-700 mt-1">
                              <span className="font-bold text-indigo-300 uppercase tracking-wider text-[10px]">
                                {data.anomalyClass}
                              </span>
                              <div className="text-slate-300 text-[11px] max-w-xs">{data.anomalyReason}</div>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Shaded holdout window (last 30 days) */}
                <ReferenceArea
                  x1={chartData[120]?.date}
                  x2={chartData[chartData.length - 1]?.date}
                  fill="#f8fafc"
                  fillOpacity={0.8}
                />
                <ReferenceLine
                  x={chartData[120]?.date}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{ value: "Holdout Start (Day 120)", position: "top", fontSize: 10, fill: "#64748b" }}
                />

                {/* Normal daily demand line */}
                <Line
                  type="monotone"
                  dataKey="demand"
                  stroke="#6366f1"
                  strokeWidth={1.8}
                  dot={false}
                  activeDot={{ r: 4, stroke: "#4f46e5", strokeWidth: 2, fill: "#ffffff" }}
                />

                {/* Overlay Anomaly markers */}
                <Scatter
                  data={chartData.filter((d) => d.hasAnomaly)}
                  dataKey="anomalyValue"
                  fill="#ef4444"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Window</th>
                  <th className="py-2.5 px-3 text-right">Daily Demand</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chartData.map((row) => (
                  <tr key={row.date} className={row.hasAnomaly ? "bg-amber-50/50" : "hover:bg-slate-50"}>
                    <td className="py-2 px-3 font-mono">{row.date}</td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        row.isHoldout ? "bg-slate-100 text-slate-700" : "bg-indigo-50 text-indigo-700"
                      }`}>
                        {row.isHoldout ? "Holdout (20%)" : "Training (80%)"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold">{row.demand}</td>
                    <td className="py-2 px-3">
                      {row.hasAnomaly ? (
                        <span className="text-red-600 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Flagged
                        </span>
                      ) : (
                        <span className="text-slate-400">Normal</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {row.anomalyClass ? (
                        <span className="font-semibold text-slate-700">{row.anomalyClass}: {row.anomalyReason}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Treatment Summary Cards & "Include Unknowns" Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Data Errors */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span>✕</span> Data Errors
            </span>
            <span className="text-xs font-mono text-slate-500">Excluded</span>
          </div>
          <p className="text-xs text-slate-600">
            Physically impossible values (negatives or digit slips) are excluded and imputed from the weekday median. The imputed value is recorded for audit.
          </p>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Baseline treatment: <strong>Impute from weekday median</strong>
          </div>
        </div>

        {/* Card 2: Promotions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span>◆</span> Promotions
            </span>
            <span className="text-xs font-mono text-slate-500">Uplift Factor</span>
          </div>
          <p className="text-xs text-slate-600">
            Verified marketing campaigns or health drives are removed from the baseline safety stock model and recorded as reusable promo uplift multipliers.
          </p>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Baseline treatment: <strong>Removed into separate factor</strong>
          </div>
        </div>

        {/* Card 3: Unknowns with Toggle */}
        <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-sm space-y-3 bg-indigo-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span>●</span> Unknown Anomalies
            </span>
            <button
              onClick={() => toggleIncludeUnknowns(selectedProduct.sku)}
              className="text-xs font-semibold text-indigo-700 flex items-center gap-1"
              title="Toggle including unknown anomalies in safety stock baseline"
            >
              {isUnknownsIncluded ? (
                <>
                  <ToggleRight className="w-5 h-5 text-indigo-600" />
                  <span>Included</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-slate-400" />
                  <span>Excluded</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-600">
            Unexplained surges. Kept with warning; toggle to see recommendation with vs without.
          </p>

          {/* ROP Impact Comparison */}
          <div className="bg-white rounded-xl p-2.5 border border-indigo-100 text-xs flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">With Unknowns:</span>
              <span className="font-bold text-slate-900">{withUnknownsPolicy.rec.rop} {selectedProduct.unit}</span>
            </div>
            <div className="text-slate-300">|</div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Without Unknowns:</span>
              <span className="font-bold text-indigo-700">{withoutUnknownsPolicy.rec.rop} {selectedProduct.unit}</span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isUnknownsIncluded ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
            }`}>
              {isUnknownsIncluded ? "Current" : "Current"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Detailed Anomaly Review Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Flagged Events for Review</h3>
          <p className="text-xs text-slate-500">
            Every flagged value requires explicit classification. Bounded AI provides advisory suggestions; storekeepers retain full override authority.
          </p>
        </div>

        {productAnomalies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Raw Value</th>
                  <th className="py-3 px-3">Mod-Z</th>
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-3">Path</th>
                  <th className="py-3 px-3">Reason & Clinical Context</th>
                  <th className="py-3 px-3">Adjustment (Cap ±30%)</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productAnomalies.map((anom) => (
                  <tr
                    key={anom.id}
                    onClick={() => setSelectedAnomalyId(anom.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedAnomalyId === anom.id ? "bg-indigo-50/60" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-semibold">{anom.date}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {anom.value} {selectedProduct.unit}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {anom.modifiedZ > 0 ? `+${anom.modifiedZ.toFixed(2)}` : anom.modifiedZ.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        anom.class === "DATA_ERROR"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : anom.class === "PROMOTION"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {anom.class}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        anom.decisionPath === "LLM"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : anom.decisionPath === "CONFIRMED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-700 border border-slate-300"
                      }`}>
                        {anom.decisionPath === "LLM" ? "AI (suggestion)" : anom.decisionPath === "CONFIRMED" ? "Confirmed by you" : "Rules"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs">
                      <div>{anom.reason}</div>
                      {anom.note && (
                        <div className="text-[11px] text-indigo-700 font-medium mt-0.5">Note: {anom.note}</div>
                      )}
                      {anom.imputedValue !== undefined && (
                        <div className="text-[11px] text-emerald-700 mt-0.5">
                          Imputed replacement: <strong>{anom.imputedValue} {selectedProduct.unit}</strong>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {anom.proposedAdjPct !== undefined ? (
                        <div className="text-[11px] space-y-0.5">
                          <div>Proposed: {anom.proposedAdjPct > 0 ? `+${anom.proposedAdjPct}%` : `${anom.proposedAdjPct}%`}</div>
                          <div className="font-semibold text-indigo-700">
                            Applied: {(anom.appliedAdjPct ?? 0) > 0 ? `+${anom.appliedAdjPct}%` : `${anom.appliedAdjPct}%`}
                            {anom.clamped && <span className="text-[10px] text-amber-600 ml-1">(clamped)</span>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!anom.userConfirmed ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmAnomaly(anom.id);
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold px-2.5 py-1 rounded-lg transition-colors"
                          >
                            Confirm
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                          </span>
                        )}
                        <select
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => overrideAnomaly(anom.id, e.target.value as AnomalyClass)}
                          value={anom.class}
                          className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          title="Override classification"
                        >
                          <option value="DATA_ERROR">Override: Error</option>
                          <option value="PROMOTION">Override: Promo</option>
                          <option value="UNKNOWN">Override: Unknown</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="font-semibold text-slate-800">No unusual demand values detected for {selectedProduct.sku}</div>
            <p className="mt-1 text-slate-500 max-w-sm mx-auto">
              All daily sales in the training window fall within normal variation thresholds (Modified Z &lt; 3.5).
            </p>
          </div>
        )}

        {/* 5. Add Review Note Box */}
        {activeAnomaly && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                Add Context Note for {activeAnomaly.date} ({activeAnomaly.value} units):
              </span>
              <span className="text-[11px] text-slate-500 font-mono">ID: {activeAnomaly.id}</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="e.g. Local health clinic reported cholera surge or wholesaler delivery stockout..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSaveNote}
                disabled={!noteInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-xl text-xs transition-colors"
              >
                Save & Re-evaluate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
