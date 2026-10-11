// apps/web/src/components/landing/DashboardPreview.tsx
import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { PREVIEW_PRODUCTS, PreviewProduct } from "../../data/landingData";

export const DashboardPreview: React.FC = () => {
  const [selectedSku, setSelectedSku] = useState<string>("PCM-02");

  const activeProduct: PreviewProduct =
    PREVIEW_PRODUCTS.find((p) => p.sku === selectedSku) || PREVIEW_PRODUCTS[0];

  const getStatusBadge = (status: PreviewProduct["status"]) => {
    switch (status) {
      case "Order now":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            Order now
          </span>
        );
      case "Reorder soon":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Reorder soon
          </span>
        );
      case "Healthy":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Healthy
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden text-slate-800">
      {/* Top chrome bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          </div>
          <span className="text-xs font-medium text-slate-500 pl-2 border-l border-slate-200">
            StockSense Replenishment Console
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
            <Sparkles className="w-3 h-3" />
            SL 95% → z = 1.645
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            Live Preview
          </span>
        </div>
      </div>

      {/* Main preview container */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Quick Health Summary Metrics */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 sm:p-3">
            <div className="text-[11px] font-medium text-slate-500">Tracked Items</div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">4 SKUs</div>
            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Layers className="w-2.5 h-2.5 text-indigo-500" />
              Continuous review
            </div>
          </div>
          <div className="bg-red-50/60 border border-red-200/70 rounded-xl p-2.5 sm:p-3">
            <div className="text-[11px] font-medium text-red-800">Action Required</div>
            <div className="text-lg sm:text-xl font-bold text-red-700 mt-0.5">1 SKU</div>
            <div className="text-[10px] text-red-700 font-medium mt-0.5 flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
              Stock below ROP
            </div>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-2.5 sm:p-3">
            <div className="text-[11px] font-medium text-emerald-800">Expected Fill Rate</div>
            <div className="text-lg sm:text-xl font-bold text-emerald-700 mt-0.5">99.8%</div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
              Optimal cycle level
            </div>
          </div>
        </div>

        {/* Interactive SKU selector list */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>Items Needing Attention & Monitored</span>
            <span className="text-[11px] text-indigo-600 font-medium">Click to inspect</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PREVIEW_PRODUCTS.map((prod) => {
              const isSelected = prod.sku === selectedSku;
              return (
                <button
                  key={prod.sku}
                  type="button"
                  onClick={() => setSelectedSku(prod.sku)}
                  className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-500"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 w-full">
                    <div>
                      <span className="font-mono text-[10px] font-semibold text-slate-500">
                        {prod.sku}
                      </span>
                      <h4 className="font-semibold text-slate-900 line-clamp-1">{prod.name}</h4>
                    </div>
                    {getStatusBadge(prod.status)}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[11px] text-slate-600 w-full">
                    <span>
                      On Hand: <strong className="text-slate-900">{prod.currentStock}</strong>
                    </span>
                    <span>
                      ROP: <strong className="text-slate-900">{prod.rop} units</strong>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Product Detailed Card */}
        <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-600">{activeProduct.sku}</span>
                <span className="text-sm font-semibold text-slate-900">{activeProduct.name}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{activeProduct.statusReason}</p>
            </div>
            {getStatusBadge(activeProduct.status)}
          </div>

          {/* Key replenishment metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200/70 text-center">
            <div className="bg-white rounded-lg p-2 border border-slate-200/80">
              <span className="text-[10px] uppercase font-medium text-slate-500">Current Stock</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {activeProduct.currentStock.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">{activeProduct.unit}</span>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-200/80">
              <span className="text-[10px] uppercase font-medium text-slate-500">Reorder Point (ROP)</span>
              <div className="text-base font-bold text-indigo-700 mt-0.5">
                {activeProduct.rop.toLocaleString()} units
              </div>
              <span className="text-[10px] text-indigo-600">Trigger level</span>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-200/80">
              <span className="text-[10px] uppercase font-medium text-slate-500">Safety Stock (SS)</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {activeProduct.safetyStock.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">Demand buffer</span>
            </div>
            <div className="bg-white rounded-lg p-2 border border-slate-200/80">
              <span className="text-[10px] uppercase font-medium text-slate-500">Order Qty (EOQ)</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {activeProduct.orderQty.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">Batch size</span>
            </div>
          </div>

          {/* Mini Demand Sparkline Chart */}
          <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <div className="flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>14-Day Demand Trend ({activeProduct.unit}/day)</span>
              </div>
              <span className="text-[10px] text-slate-400">Mean: {activeProduct.avgDailyDemand}/day</span>
            </div>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activeProduct.history}
                  margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "11px",
                      padding: "4px 8px",
                      border: "none",
                    }}
                    labelStyle={{ color: "#cbd5e1" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="demand"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#demandGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Demo caveat footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" />
            Fictional demo data · Decision support only
          </span>
          <span className="font-medium text-indigo-600">
            Rules Decide · AI Advises
          </span>
        </div>
      </div>
    </div>
  );
};
