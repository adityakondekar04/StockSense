// apps/web/src/components/dashboard/PrintReportView.tsx
// Screen 8: Print Report - Clean, professional 1-page summary for pharmacy storekeepers

import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer, ArrowLeft, Boxes, CheckCircle2, AlertTriangle } from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { calculateProductPolicy, generateForecastData } from "../../data/inventoryData";

export const PrintReportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, serviceLevel, zValue, includeUnknowns, salesHistory, anomalies } = useInventory();

  // Find product by SKU or ID
  const product = useMemo(() => {
    return products.find((p) => p.sku === id || p.id === id) || products[0];
  }, [products, id]);

  const isUnknownIncluded = includeUnknowns[product.sku] ?? true;
  const policy = useMemo(() => {
    return calculateProductPolicy(product, serviceLevel, isUnknownIncluded);
  }, [product, serviceLevel, isUnknownIncluded]);

  const { metrics } = useMemo(() => {
    return generateForecastData(product, salesHistory);
  }, [product, salesHistory]);

  const productAnomalies = useMemo(() => {
    return anomalies.filter((a) => a.sku === product.sku);
  }, [anomalies, product.sku]);

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white text-slate-900 font-sans">
      {/* Top Action Bar (hidden in print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          to="/recommendations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded-lg shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Console</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-xs shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF (1-Page)</span>
        </button>
      </div>

      {/* Printable Sheet Container */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-8 print:border-none print:shadow-none print:p-0 space-y-6">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900">StockSense</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Replenishment Advisory
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Primary Healthcare & Pharmacy Inventory Policy Report
              </span>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div>Date Generated: <strong className="text-slate-900">{todayStr}</strong></div>
            <div>Target Service Level: <strong className="text-slate-900">{(serviceLevel * 100).toFixed(0)}%</strong> (z = {zValue.toFixed(3)})</div>
          </div>
        </div>

        {/* Product Identity & Status Strip */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs font-bold text-slate-500">{product.sku}</span>
            <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
            <div className="text-xs text-slate-600 mt-0.5">
              Unit Cost: ₹{product.unitCost} · Pack Size: {product.packSize} · Mean Daily Demand: {product.meanDailyDemand} {product.unit} (σD: {product.sdDemand})
            </div>
          </div>

          <div className="text-right">
            {policy.isOrderNow ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>ORDER NOW</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>HEALTHY / OK</span>
              </span>
            )}
            <div className="text-[11px] text-slate-500 mt-1">
              Position: <strong>{policy.inventoryPosition} {product.unit}</strong>
            </div>
          </div>
        </div>

        {/* Hero Recommendation Figures */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100">
            <span className="text-[10px] uppercase font-bold text-slate-500">Reorder Point (ROP)</span>
            <div className="text-2xl font-black text-indigo-700 mt-0.5">
              {policy.rec.rop.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">{product.unit} trigger</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">Order Quantity (Q)</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {policy.rec.q.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">Pack of {product.packSize} (MOQ {product.minOrderQty})</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">Safety Stock Buffer</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {policy.rec.ss.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">Dual variance protected</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">Days of Cover</span>
            <div className={`text-2xl font-black mt-0.5 ${policy.daysCover < 4 ? "text-red-600" : "text-slate-900"}`}>
              {policy.daysCover}d
            </div>
            <span className="text-[10px] text-slate-500">Fill Rate: {(policy.rec.fillRate * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Safety Stock Split Breakdown */}
        <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
          <div className="flex justify-between font-semibold text-slate-700">
            <span>Safety Stock Variance Split (Total SS: {policy.rec.ss} units)</span>
            <span>Total Lead-Time σLT = {Math.sqrt(policy.rec.split.demand + policy.rec.split.leadTime).toFixed(1)}</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
            <div style={{ width: `${policy.demandShare}%` }} className="bg-indigo-600 h-full" />
            <div style={{ width: `${policy.leadShare}%` }} className="bg-amber-500 h-full" />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Daily Demand Variance: <strong>{policy.demandShare}%</strong> ({Math.round(policy.rec.ss * (policy.demandShare / 100))} units)</span>
            <span>Supplier Lead-Time Variance: <strong>{policy.leadShare}%</strong> ({Math.round(policy.rec.ss * (policy.leadShare / 100))} units)</span>
          </div>
        </div>

        {/* Anomaly & Cleaning Summary */}
        <div className="border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
          <div className="font-bold text-slate-800">
            Data Quality & Cleaning Review ({productAnomalies.length} Flagged Events)
          </div>
          {productAnomalies.length > 0 ? (
            <div className="space-y-1.5">
              {productAnomalies.map((anom) => (
                <div key={anom.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-[11px]">
                  <div>
                    <strong className="font-mono">{anom.date}:</strong> {anom.value} units ({anom.class}) — {anom.reason}
                  </div>
                  <span className="font-semibold text-slate-600 font-mono">
                    {anom.decisionPath}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px]">No abnormal demand events detected in training history.</p>
          )}
        </div>

        {/* Holdout Validation & Cost Summary */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="border border-slate-200 rounded-xl p-3 space-y-1">
            <span className="font-bold text-slate-800 block">Holdout Forecast Evaluation (30 Days)</span>
            <div className="text-slate-600 text-[11px]">
              Model MAE: <strong>{metrics.maeModel}</strong> vs Baseline MAE: <strong>{metrics.maeBaseline}</strong>
            </div>
            <div className="text-indigo-700 font-semibold text-[11px]">
              Selected Model: {metrics.winner === "model" ? "Weekday-Seasonal Smoothing" : "Simple Moving Average"}
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-3 space-y-1">
            <span className="font-bold text-slate-800 block">Estimated Annual Inventory Cost</span>
            <div className="text-slate-600 text-[11px] flex justify-between">
              <span>Holding: ₹{Math.round(policy.cost.holdingCost).toLocaleString()}</span>
              <span>Ordering: ₹{Math.round(policy.cost.orderingCost).toLocaleString()}</span>
            </div>
            <div className="font-bold text-slate-900 text-[11px] pt-1 border-t border-slate-100 flex justify-between">
              <span>Total Projected Cost:</span>
              <span>₹{Math.round(policy.cost.totalAnnualCost).toLocaleString()}/yr</span>
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-center">
          <span>Decision support based on fictional demonstration data. Not a replacement for professional clinical procurement judgement.</span>
          <span className="font-mono">StockSense Engine v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
