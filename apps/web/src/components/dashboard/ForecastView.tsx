// apps/web/src/components/dashboard/ForecastView.tsx
// Screen 3: Forecast Check - Model vs Baseline on holdout evaluation

import React, { useMemo } from "react";
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
} from "recharts";
import {
  Award,
  ShieldCheck,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { generateForecastData } from "../../data/inventoryData";

export const ForecastView: React.FC = () => {
  const { products, selectedProduct, setSelectedProductId, salesHistory } = useInventory();

  // Generate forecast comparison series and evaluation metrics
  const { points: forecastPoints, metrics } = useMemo(() => {
    return generateForecastData(selectedProduct, salesHistory);
  }, [selectedProduct, salesHistory]);

  const isBaselineWinner = metrics.winner === "baseline";

  return (
    <div className="space-y-6">
      {/* 1. Header & SKU Context Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              {selectedProduct.sku}
            </span>
            <span className="text-xs text-slate-500">Holdout Forecast Validation</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedProduct.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict chronological 80/20 train/holdout split. The forecast model competed against a simple 7-day moving average baseline.
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

      {/* 2. Winner Announcement & KPI Comparison Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Model Selection Card */}
        <div className={`rounded-2xl border p-5 shadow-sm flex items-center justify-between ${
          isBaselineWinner
            ? "bg-amber-50/60 border-amber-200"
            : "bg-indigo-50/60 border-indigo-200"
        }`}>
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
              Selected Champion
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-extrabold ${isBaselineWinner ? "text-amber-800" : "text-indigo-800"}`}>
                {isBaselineWinner ? "Baseline (Simple MA)" : "Weekday-Seasonal Smoothing"}
              </span>
            </div>
            <span className="text-[11px] text-slate-600 block">
              {isBaselineWinner
                ? "Intermittent demand: simple baseline achieved lower MAE."
                : "Captures weekend volume uplift with lower forecast error."}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isBaselineWinner ? "bg-amber-100 text-amber-700" : "bg-indigo-600 text-white"
          }`}>
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* MAE Comparison Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
          <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
            Mean Absolute Error (MAE)
          </span>
          <div className="flex items-baseline gap-3 pt-1">
            <div>
              <span className="text-[10px] text-slate-500 block">Model</span>
              <span className={`text-2xl font-black ${!isBaselineWinner ? "text-emerald-600" : "text-slate-800"}`}>
                {metrics.maeModel}
              </span>
            </div>
            <span className="text-slate-300 text-lg">vs</span>
            <div>
              <span className="text-[10px] text-slate-500 block">Baseline</span>
              <span className={`text-2xl font-black ${isBaselineWinner ? "text-emerald-600" : "text-slate-800"}`}>
                {metrics.maeBaseline}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Lower is better (evaluated over {metrics.holdoutDays} holdout days)
          </span>
        </div>

        {/* WAPE & Bias Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-1">
          <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
            Holdout Bias & WAPE
          </span>
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Model WAPE</span>
              <strong className="text-slate-900">{metrics.wapeModel}%</strong>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg">
              <span className="text-[10px] text-slate-500 block">Baseline WAPE</span>
              <strong className="text-slate-900">{metrics.wapeBaseline}%</strong>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Model Bias: {metrics.biasModel > 0 ? `+${metrics.biasModel}` : metrics.biasModel} units/day
          </span>
        </div>
      </div>

      {/* 3. Recharts Holdout Time Series Visualisation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Forecast Evaluation: Holdout Actuals vs Candidate Models</span>
            </h3>
            <p className="text-xs text-slate-500">
              Left: 120-day training history · Right shaded: 30-day out-of-sample holdout test window.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-0.5 bg-slate-400 inline-block" /> Actual Demand
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-0.5 bg-slate-400 border-t border-dashed inline-block" /> Baseline (MA)
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600">
              <span className="w-3 h-0.5 bg-indigo-600 inline-block" /> Seasonal Model
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastPoints} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
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
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white rounded-xl p-3 shadow-lg text-xs space-y-1">
                        <div className="font-semibold text-slate-300">{d.date}</div>
                        <div className="text-white">Actual Demand: <strong>{d.actual}</strong></div>
                        <div className="text-indigo-300">Model Forecast: <strong>{d.model}</strong></div>
                        <div className="text-slate-400">Baseline Forecast: <strong>{d.baseline}</strong></div>
                        {d.isHoldout && (
                          <div className="pt-1 border-t border-slate-700 text-amber-300 text-[10px]">
                            Out-of-sample Holdout Window
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Shaded holdout window */}
              <ReferenceArea
                x1={forecastPoints[120]?.date}
                x2={forecastPoints[forecastPoints.length - 1]?.date}
                fill="#f8fafc"
                fillOpacity={0.8}
              />
              <ReferenceLine
                x={forecastPoints[120]?.date}
                stroke="#6366f1"
                strokeDasharray="4 4"
                label={{ value: "Holdout Split (80/20)", position: "top", fontSize: 10, fill: "#4f46e5" }}
              />

              {/* Lines */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#94a3b8"
                strokeWidth={1.5}
                dot={false}
                name="Actual"
              />
              <Line
                type="stepAfter"
                dataKey="baseline"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="Baseline"
              />
              <Line
                type="monotone"
                dataKey="model"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
                name="Model"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Holdout Metrics Evaluation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Holdout Validation Metrics (30 Out-of-Sample Days)</h3>
          <p className="text-xs text-slate-500">
            Parameters fitted exclusively on the 120-day training set. Evaluated against unseen holdout days.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4">Candidate Forecast Model</th>
                <th className="py-3 px-4">Architecture</th>
                <th className="py-3 px-4 text-right">MAE</th>
                <th className="py-3 px-4 text-right">WAPE (%)</th>
                <th className="py-3 px-4 text-right">Forecast Bias</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className={!isBaselineWinner ? "bg-indigo-50/40" : ""}>
                <td className="py-3 px-4 font-bold text-slate-900">
                  Weekday-Seasonal Smoothing
                </td>
                <td className="py-3 px-4 text-slate-600">
                  Adaptive exponential smoothing with weekday empirical indices
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-indigo-700">
                  {metrics.maeModel}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {metrics.wapeModel}%
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">
                  {metrics.biasModel > 0 ? `+${metrics.biasModel}` : metrics.biasModel}
                </td>
                <td className="py-3 px-4 text-center">
                  {!isBaselineWinner ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Selected Winner
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Candidate</span>
                  )}
                </td>
              </tr>

              <tr className={isBaselineWinner ? "bg-amber-50/50" : ""}>
                <td className="py-3 px-4 font-bold text-slate-900">
                  Simple Baseline (Moving Average)
                </td>
                <td className="py-3 px-4 text-slate-600">
                  7-day rolling arithmetic mean
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                  {metrics.maeBaseline}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {metrics.wapeBaseline}%
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-600">
                  {metrics.biasBaseline > 0 ? `+${metrics.biasBaseline}` : metrics.biasBaseline}
                </td>
                <td className="py-3 px-4 text-center">
                  {isBaselineWinner ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      <CheckCircle2 className="w-3 h-3 text-amber-600" /> Selected Winner
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Baseline Benchmark</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Honesty & Anti-Leakage Disclosures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Honesty Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Info className="w-4 h-4 text-indigo-600" />
            <span>Honesty in Holdout Selection</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Selecting the winning model on the same holdout window slightly flatters the winner. Holdout period is exactly {metrics.holdoutDays} days. On noisy intermittent demand series (e.g. ANT-06), the simple baseline rightfully prevails.
          </p>
        </div>

        {/* Leakage Protection Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strict Zero Lookahead Leakage</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            All anomaly thresholds, medians, weekday indices, and sigma estimates were fitted exclusively on the training window. No future holdout points were accessed during model fitting.
          </p>
        </div>
      </div>
    </div>
  );
};
