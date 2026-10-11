// apps/web/src/pages/DashboardView.tsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { inverseNormalCDF } from "@stocksense/core";

interface ProductCardData {
  sku: string;
  name: string;
  unit: string;
  onHand: number;
  onOrder: number;
  meanDailyDemand: number;
  sdDemand: number;
  leadTimeMean: number;
  leadTimeSd: number;
  packSize: number;
  unitCost: number;
  orderCost: number;
}

const DEMO_PRODUCTS: ProductCardData[] = [
  {
    sku: "PCM-02",
    name: "Paracetamol 500 mg (Strips)",
    unit: "strips",
    onHand: 300,
    onOrder: 0,
    meanDailyDemand: 50,
    sdDemand: 10,
    leadTimeMean: 10,
    leadTimeSd: 2.0,
    packSize: 50,
    unitCost: 50,
    orderCost: 200,
  },
  {
    sku: "BND-05",
    name: "First-Aid Dressings & Bandages",
    unit: "boxes",
    onHand: 210,
    onOrder: 0,
    meanDailyDemand: 25,
    sdDemand: 6,
    leadTimeMean: 8,
    leadTimeSd: 1.5,
    packSize: 20,
    unitCost: 35,
    orderCost: 150,
  },
  {
    sku: "ORS-01",
    name: "Oral Rehydration Salts (Sachets)",
    unit: "sachets",
    onHand: 820,
    onOrder: 0,
    meanDailyDemand: 45,
    sdDemand: 8,
    leadTimeMean: 7,
    leadTimeSd: 1.0,
    packSize: 50,
    unitCost: 8,
    orderCost: 150,
  },
  {
    sku: "INS-03",
    name: "Insulin Vials (Cold Storage)",
    unit: "vials",
    onHand: 60,
    onOrder: 0,
    meanDailyDemand: 4,
    sdDemand: 1.2,
    leadTimeMean: 7,
    leadTimeSd: 2.5,
    packSize: 10,
    unitCost: 450,
    orderCost: 300,
  },
  {
    sku: "FLU-04",
    name: "Flu Syrup (Pediatric)",
    unit: "bottles",
    onHand: 140,
    onOrder: 0,
    meanDailyDemand: 12,
    sdDemand: 3.5,
    leadTimeMean: 6,
    leadTimeSd: 1.0,
    packSize: 25,
    unitCost: 85,
    orderCost: 180,
  },
  {
    sku: "SAN-03",
    name: "Hand Sanitizer 500 ml",
    unit: "bottles",
    onHand: 480,
    onOrder: 0,
    meanDailyDemand: 20,
    sdDemand: 4,
    leadTimeMean: 7,
    leadTimeSd: 1.0,
    packSize: 20,
    unitCost: 65,
    orderCost: 120,
  },
];

export const DashboardView: React.FC = () => {
  const [serviceLevel, setServiceLevel] = useState<number>(0.95);
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);

  // Compute z from core inverseNormalCDF
  const z = useMemo(() => {
    try {
      return inverseNormalCDF(serviceLevel);
    } catch {
      return 1.6449;
    }
  }, [serviceLevel]);

  // Compute recommendations for each product
  const cards = useMemo(() => {
    return DEMO_PRODUCTS.map((prod) => {
      // sigmaLT formula from packages/core: sqrt(meanL * sdD^2 + meanD^2 * sdL^2)
      const demandVar = prod.leadTimeMean * Math.pow(prod.sdDemand, 2);
      const leadVar = Math.pow(prod.meanDailyDemand, 2) * Math.pow(prod.leadTimeSd, 2);
      const totalVar = demandVar + leadVar;
      const sigmaLT = Math.sqrt(totalVar);

      const ssRaw = z * sigmaLT;
      const ss = Math.ceil(ssRaw);
      const leadDemand = prod.meanDailyDemand * prod.leadTimeMean;
      const rop = Math.ceil(leadDemand + ssRaw);

      // EOQ = sqrt(2 * D * S / H)
      const annualDemand = prod.meanDailyDemand * 365;
      const holdingCost = 0.2 * prod.unitCost;
      const rawEOQ = Math.sqrt((2 * annualDemand * prod.orderCost) / holdingCost);
      const q = Math.ceil(rawEOQ / prod.packSize) * prod.packSize;

      const inventoryPosition = prod.onHand + prod.onOrder;
      const isOrderNow = inventoryPosition < rop;
      const daysOfCover = (inventoryPosition / prod.meanDailyDemand).toFixed(1);

      // Variance split
      const demandShare = totalVar > 0 ? (demandVar / totalVar) * 100 : 100;
      const leadShare = totalVar > 0 ? (leadVar / totalVar) * 100 : 0;

      return {
        ...prod,
        ss,
        rop,
        q,
        inventoryPosition,
        isOrderNow,
        daysOfCover,
        demandShare: Math.round(demandShare),
        leadShare: Math.round(leadShare),
      };
    }).sort((a, b) => (b.isOrderNow ? 1 : 0) - (a.isOrderNow ? 1 : 0));
  }, [z]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Console Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
            {/* Left: Branding & Back Link */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">StockSense Console</span>
                <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded font-medium">
                  Recommendations
                </span>
              </div>
            </div>

            {/* Right Controls: Service Level + AI Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Service Level dropdown */}
              <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1.5 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-600 pl-1">Service Level:</span>
                <select
                  value={serviceLevel}
                  onChange={(e) => setServiceLevel(Number(e.target.value))}
                  aria-label="Service Level"
                  className="bg-white border border-slate-300 rounded font-semibold text-slate-900 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={0.80}>80% (z = 0.842)</option>
                  <option value={0.90}>90% (z = 1.282)</option>
                  <option value={0.95}>95% (z = 1.645)</option>
                  <option value={0.975}>97.5% (z = 1.960)</option>
                  <option value={0.99}>99% (z = 2.326)</option>
                  <option value={0.999}>99.9% (z = 3.090)</option>
                </select>
                <span className="font-mono text-indigo-700 font-bold px-1.5">
                  z = {z.toFixed(3)}
                </span>
              </div>

              {/* AI toggle */}
              <button
                type="button"
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                  aiEnabled
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-slate-100 border-slate-300 text-slate-700"
                }`}
              >
                {aiEnabled ? (
                  <>
                    <ToggleRight className="w-4 h-4 text-indigo-600" />
                    <span>AI Advisory: Active</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 text-slate-500" />
                    <span>Run Without AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Banner */}
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900">
                Replenishment Policies · Continuous Review (s, Q)
              </h1>
              <p className="text-xs text-slate-600">
                Sorted by urgency (Order now first). Every card shows exact safety stock split and
                reorder threshold.
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md self-start sm:self-auto">
            {cards.filter((c) => c.isOrderNow).length} needing reorder of {cards.length} SKUs
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((item) => (
            <div
              key={item.sku}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-shadow flex flex-col justify-between ${
                item.isOrderNow
                  ? "border-red-300 ring-1 ring-red-200 hover:shadow-md"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <div className="space-y-3.5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {item.sku}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 line-clamp-1">{item.name}</h2>
                  </div>
                  {item.isOrderNow ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      Order now
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      OK
                    </span>
                  )}
                </div>

                {/* Service Line (as required: Service level 95% → z = 1.645) */}
                <div className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1 flex items-center justify-between">
                  <span>
                    Service level {(serviceLevel * 100).toFixed(0)}% → z = {z.toFixed(3)}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-indigo-700">
                    {aiEnabled ? "AI (suggestion)" : "Rules"}
                  </span>
                </div>

                {/* Key Numbers Grid */}
                <div className="grid grid-cols-2 gap-2 text-center pt-1">
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">
                      Reorder Point (ROP)
                    </span>
                    <div className="text-xl font-extrabold text-indigo-700 mt-0.5">
                      {item.rop.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-500">{item.unit}</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70">
                    <span className="text-[10px] uppercase font-semibold text-slate-500">
                      Order Qty (Q)
                    </span>
                    <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                      {item.q.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-500">Pack of {item.packSize}</span>
                  </div>
                </div>

                {/* Inventory Position & Days of Cover */}
                <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>On hand: <strong>{item.onHand}</strong> + On order: <strong>{item.onOrder}</strong></span>
                    <span>Position: <strong className="text-slate-900">{item.inventoryPosition}</strong></span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                    <span>Safety Stock: <strong>{item.ss} {item.unit}</strong></span>
                    <span>Cover: <strong>{item.daysOfCover} days</strong></span>
                  </div>
                </div>

                {/* Safety Stock Split Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Demand var ({item.demandShare}%)</span>
                    <span>Supplier delay var ({item.leadShare}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${item.demandShare}%` }}
                      className="bg-indigo-600 h-full"
                      title={`Demand Variance: ${item.demandShare}%`}
                    />
                    <div
                      style={{ width: `${item.leadShare}%` }}
                      className="bg-amber-500 h-full"
                      title={`Lead Time Variance: ${item.leadShare}%`}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer Status */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Mean demand: {item.meanDailyDemand}/day</span>
                <span className="font-semibold text-indigo-600">
                  Lead time: {item.leadTimeMean}d
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardView;
