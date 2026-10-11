// apps/web/src/components/landing/DashboardPreview.tsx
import React, { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { PREVIEW_PRODUCTS, PreviewProduct } from "../../data/landingData";

export const DashboardPreview: React.FC = () => {
  const [selectedSku, setSelectedSku] = useState<string>("PCM-02");

  const activeProduct: PreviewProduct =
    PREVIEW_PRODUCTS.find((p) => p.sku === selectedSku) || PREVIEW_PRODUCTS[0];

  const getStatusTag = (status: PreviewProduct["status"]) => {
    switch (status) {
      case "Order now":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#ee0000] bg-red-50/80 border border-red-200/80 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ee0000]" />
            Order now
          </span>
        );
      case "Reorder soon":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#ab570a] bg-amber-50/80 border border-amber-200/80 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623]" />
            Reorder soon
          </span>
        );
      case "Healthy":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#0070f3] bg-blue-50/80 border border-blue-200/80 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3]" />
            Healthy
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-[#ebebeb] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden text-[#171717]">
      {/* Top Console Bar */}
      <div className="bg-[#fafafa] border-b border-[#ebebeb] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e2e2e2]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#e2e2e2]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#e2e2e2]" />
          </div>
          <span className="text-xs font-mono text-[#8f8f8f] pl-2 border-l border-[#ebebeb]">
            replenishment-console (s, Q)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#4d4d4d] bg-white border border-[#ebebeb] px-2 py-0.5 rounded">
            Service level 95% · z = 1.645
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* KPI Strip */}
        <div className="grid grid-cols-3 gap-2.5 border-b border-[#f2f2f2] pb-4">
          <div className="p-2.5 rounded-lg bg-[#fafafa] border border-[#ebebeb]">
            <div className="text-[11px] font-mono text-[#8f8f8f]">Tracked SKUs</div>
            <div className="text-lg font-semibold text-[#171717] mt-0.5">4 Products</div>
            <div className="text-[10px] text-[#4d4d4d] mt-0.5 font-mono">Continuous review</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#fafafa] border border-[#ebebeb]">
            <div className="text-[11px] font-mono text-[#8f8f8f]">Action Required</div>
            <div className="text-lg font-semibold text-[#ee0000] mt-0.5">1 SKU below ROP</div>
            <div className="text-[10px] text-[#8f8f8f] mt-0.5 font-mono">Immediate reorder</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#fafafa] border border-[#ebebeb]">
            <div className="text-[11px] font-mono text-[#8f8f8f]">Cycle Fill Rate</div>
            <div className="text-lg font-semibold text-[#171717] mt-0.5">99.8%</div>
            <div className="text-[10px] text-[#8f8f8f] mt-0.5 font-mono">Target calibrated</div>
          </div>
        </div>

        {/* Interactive SKU Grid */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#8f8f8f] px-0.5">
            <span className="font-mono text-[11px] uppercase tracking-wider">Inventory Status</span>
            <span className="text-[11px] text-[#8f8f8f]">Select SKU to inspect</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PREVIEW_PRODUCTS.map((prod) => {
              const isSelected = prod.sku === selectedSku;
              return (
                <button
                  key={prod.sku}
                  type="button"
                  onClick={() => setSelectedSku(prod.sku)}
                  className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    isSelected
                      ? "border-[#171717] bg-[#fafafa] ring-1 ring-[#171717]"
                      : "border-[#ebebeb] hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 w-full">
                    <div>
                      <span className="font-mono text-[10px] text-[#8f8f8f] block">
                        {prod.sku}
                      </span>
                      <h4 className="font-semibold text-[#171717] line-clamp-1">{prod.name}</h4>
                    </div>
                    {getStatusTag(prod.status)}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#f2f2f2] text-[11px] text-[#4d4d4d] w-full font-mono">
                    <span>
                      On Hand: <strong className="text-[#171717]">{prod.currentStock}</strong>
                    </span>
                    <span>
                      ROP: <strong className="text-[#171717]">{prod.rop} units</strong>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Product Detail Panel */}
        <div className="bg-[#fafafa] border border-[#ebebeb] rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-[#171717]">
                  {activeProduct.sku}
                </span>
                <span className="text-sm font-semibold text-[#171717]">
                  {activeProduct.name}
                </span>
              </div>
              <p className="text-xs text-[#4d4d4d] mt-1">
                {activeProduct.statusReason}
              </p>
            </div>
            {getStatusTag(activeProduct.status)}
          </div>

          {/* Core Numbers */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#ebebeb] text-center font-mono">
            <div className="bg-white p-2 rounded-lg border border-[#ebebeb]">
              <div className="text-[10px] text-[#8f8f8f] uppercase">On Hand</div>
              <div className="text-base font-semibold text-[#171717] mt-0.5">
                {activeProduct.currentStock}
              </div>
              <div className="text-[10px] text-[#8f8f8f]">{activeProduct.unit}</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-[#ebebeb]">
              <div className="text-[10px] text-[#8f8f8f] uppercase">Reorder Point (ROP)</div>
              <div className="text-base font-semibold text-[#171717] mt-0.5">
                {activeProduct.rop.toLocaleString()} units
              </div>
              <div className="text-[10px] text-[#8f8f8f]">trigger</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-[#ebebeb]">
              <div className="text-[10px] text-[#8f8f8f] uppercase">Safety Stock</div>
              <div className="text-base font-semibold text-[#171717] mt-0.5">
                {activeProduct.safetyStock}
              </div>
              <div className="text-[10px] text-[#8f8f8f]">buffer</div>
            </div>
            <div className="bg-white p-2 rounded-lg border border-[#ebebeb]">
              <div className="text-[10px] text-[#8f8f8f] uppercase">Order Qty (Q)</div>
              <div className="text-base font-semibold text-[#171717] mt-0.5">
                {activeProduct.orderQty}
              </div>
              <div className="text-[10px] text-[#8f8f8f]">pack size 50</div>
            </div>
          </div>

          {/* Mini Recharts Trend Chart */}
          <div className="bg-white p-3 rounded-lg border border-[#ebebeb] space-y-1">
            <div className="flex items-center justify-between text-xs text-[#8f8f8f] font-mono">
              <span>14-Day Demand Pattern ({activeProduct.unit}/day)</span>
              <span>D̄ = {activeProduct.avgDailyDemand}/d</span>
            </div>
            <div className="h-20 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activeProduct.history}
                  margin={{ top: 2, right: 2, left: -28, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="consoleDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#171717" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#171717" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 9, fill: "#8f8f8f" }}
                    tickLine={false}
                    axisLine={{ stroke: "#ebebeb" }}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#8f8f8f" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171717",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "11px",
                      padding: "4px 8px",
                      border: "none",
                    }}
                    labelStyle={{ color: "#a1a1a1" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="demand"
                    stroke="#171717"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#consoleDemand)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="flex items-center justify-between text-[11px] text-[#8f8f8f] font-mono pt-1">
          <span>Deterministic replenishment policy</span>
          <span>Fictional demonstration data</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
