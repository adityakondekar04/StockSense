// apps/web/src/components/dashboard/RecommendationsView.tsx
// Screen 4: Recommendations - The primary replenishment decision dashboard

import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Sliders,
  LineChart,
  Package,
  Layers,
  IndianRupee,
  Calendar,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { calculateProductPolicy } from "../../data/inventoryData";

export const RecommendationsView: React.FC = () => {
  const {
    products,
    serviceLevel,
    zValue,
    aiEnabled,
    includeUnknowns,
    setSelectedProductId,
  } = useInventory();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ORDER_NOW" | "OK">("ALL");
  const [sortBy, setSortBy] = useState<"URGENCY" | "SKU" | "NAME" | "COVER">("URGENCY");

  // Calculate policies for each product using packages/core
  const calculatedCards = useMemo(() => {
    return products.map((prod) => {
      const isUnknownIncluded = includeUnknowns[prod.sku] ?? true;
      const policy = calculateProductPolicy(prod, serviceLevel, isUnknownIncluded);
      return {
        product: prod,
        ...policy,
      };
    });
  }, [products, serviceLevel, includeUnknowns]);

  // Aggregate KPI summary
  const summary = useMemo(() => {
    const totalSKUs = calculatedCards.length;
    const orderNowCount = calculatedCards.filter((c) => c.isOrderNow).length;
    const totalSafetyUnits = calculatedCards.reduce((acc, c) => acc + c.rec.ss, 0);
    const totalHoldingCost = calculatedCards.reduce((acc, c) => acc + c.cost.holdingCost, 0);
    const totalAnnualCost = calculatedCards.reduce((acc, c) => acc + c.cost.totalAnnualCost, 0);

    return {
      totalSKUs,
      orderNowCount,
      okCount: totalSKUs - orderNowCount,
      totalSafetyUnits,
      totalHoldingCost,
      totalAnnualCost,
    };
  }, [calculatedCards]);

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let result = [...calculatedCards];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.product.sku.toLowerCase().includes(query) ||
          c.product.name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter === "ORDER_NOW") {
      result = result.filter((c) => c.isOrderNow);
    } else if (statusFilter === "OK") {
      result = result.filter((c) => !c.isOrderNow);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "URGENCY") {
        if (a.isOrderNow && !b.isOrderNow) return -1;
        if (!a.isOrderNow && b.isOrderNow) return 1;
        return a.daysCover - b.daysCover;
      }
      if (sortBy === "SKU") {
        return a.product.sku.localeCompare(b.product.sku);
      }
      if (sortBy === "NAME") {
        return a.product.name.localeCompare(b.product.name);
      }
      if (sortBy === "COVER") {
        return a.daysCover - b.daysCover;
      }
      return 0;
    });

    return result;
  }, [calculatedCards, searchQuery, statusFilter, sortBy]);

  const handleCardNavigate = (sku: string, subpage: "cleaning" | "forecast" | "scenario") => {
    const p = products.find((prod) => prod.sku === sku);
    if (p) setSelectedProductId(p.id);
    navigate(`/products/${sku}/${subpage}`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Hero & Executive KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Urgent Reorder Alert */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
              Urgent Reorders
            </span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-extrabold ${summary.orderNowCount > 0 ? "text-red-600" : "text-slate-900"}`}>
                {summary.orderNowCount}
              </span>
              <span className="text-xs text-slate-500">of {summary.totalSKUs} SKUs</span>
            </div>
            <span className="text-[11px] text-slate-500 block">
              {summary.orderNowCount > 0 ? "Position below reorder point" : "All inventories adequate"}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            summary.orderNowCount > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
          }`}>
            {summary.orderNowCount > 0 ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
        </div>

        {/* KPI 2: Total Safety Stock Buffer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
              Total Safety Stock
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-indigo-700">
                {summary.totalSafetyUnits.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">buffer units</span>
            </div>
            <span className="text-[11px] text-slate-500 block">
              Dual variance (demand + lead time)
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Target Service Level & z */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
              Service Level Target
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {(serviceLevel * 100).toFixed(1)}%
              </span>
              <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                z = {zValue.toFixed(3)}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block">
              Probability of no stockout in cycle
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Holding Capital */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
              Holding Capital
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-semibold text-slate-400">₹</span>
              <span className="text-2xl font-extrabold text-slate-900">
                {Math.round(summary.totalHoldingCost).toLocaleString()}
              </span>
              <span className="text-xs text-slate-500">/year</span>
            </div>
            <span className="text-[11px] text-slate-500 block">
              Holding rate: 20–30% of unit cost
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU (e.g. PCM-02) or product name..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors"
          />
        </div>

        {/* Right: Filter pills and Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter pills */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                statusFilter === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({summary.totalSKUs})
            </button>
            <button
              onClick={() => setStatusFilter("ORDER_NOW")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                statusFilter === "ORDER_NOW" ? "bg-red-50 text-red-700 shadow-sm border border-red-200" : "text-slate-600 hover:text-red-700"
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-red-600" />
              <span>Order now ({summary.orderNowCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter("OK")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                statusFilter === "OK" ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200" : "text-slate-600 hover:text-emerald-700"
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>OK ({summary.okCount})</span>
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Sort product cards"
            >
              <option value="URGENCY">Sort: Urgency (Order now first)</option>
              <option value="COVER">Sort: Days of Cover (Lowest first)</option>
              <option value="SKU">Sort: SKU Code</option>
              <option value="NAME">Sort: Product Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Product Cards Grid (Screen 4 Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((item) => {
          const { product, rec, cost, inventoryPosition, isOrderNow, daysCover, stockoutDate, demandShare, leadShare } = item;

          return (
            <div
              key={product.sku}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                isOrderNow
                  ? "border-red-300 ring-1 ring-red-200 hover:shadow-md"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <div className="space-y-4">
                {/* 1. Header: SKU + Name + Status Chip */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {product.sku}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1" title={product.name}>
                      {product.name}
                    </h3>
                  </div>
                  {isOrderNow ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      Order now
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      OK
                    </span>
                  )}
                </div>

                {/* 2. Service Line: Service level 95% -> z = 1.645 (always visible!) */}
                <div className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 flex items-center justify-between">
                  <span className="font-medium">
                    Service level <strong>{(serviceLevel * 100).toFixed(0)}%</strong> → <span className="font-mono font-bold text-indigo-700">z = {rec.z.toFixed(3)}</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    aiEnabled
                      ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                      : "bg-slate-200 text-slate-700 border border-slate-300"
                  }`}>
                    {aiEnabled ? "AI (suggestion)" : "Rules"}
                  </span>
                </div>

                {/* 3. Hero Numbers Grid */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                      Reorder Point (ROP)
                    </span>
                    <div className="text-xl font-black text-indigo-700 mt-0.5">
                      {rec.rop.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-500">{product.unit} trigger</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                      Order Quantity (Q)
                    </span>
                    <div className="text-xl font-black text-slate-900 mt-0.5">
                      {rec.q.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-500">Pack of {product.packSize}</span>
                  </div>
                </div>

                {/* 4. Position & Stockout Warning */}
                <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>
                      On hand: <strong>{product.onHand}</strong> + On order: <strong>{product.onOrder}</strong>
                    </span>
                    <span className="font-semibold">
                      Position: <strong className="text-slate-900">{inventoryPosition} {product.unit}</strong>
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 pt-1.5 border-t border-slate-100">
                    <span>Safety Stock: <strong>{rec.ss.toLocaleString()} {product.unit}</strong></span>
                    <span>Days Cover: <strong className={daysCover < 4 ? "text-red-600" : "text-slate-800"}>{daysCover} days</strong></span>
                  </div>

                  {/* Stockout Warning Date if Order Now */}
                  {isOrderNow && stockoutDate && (
                    <div className="bg-red-50 text-red-800 border border-red-200 rounded-lg p-2 text-[11px] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>
                        At current demand ({product.meanDailyDemand}/day), stock is projected to run out around <strong>{stockoutDate}</strong>.
                      </span>
                    </div>
                  )}
                </div>

                {/* 5. Safety Stock Split Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                      Demand variability ({demandShare}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      Supplier delay ({leadShare}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${demandShare}%` }}
                      className="bg-indigo-600 h-full transition-all"
                      title={`Demand Variance Share: ${demandShare}%`}
                    />
                    <div
                      style={{ width: `${leadShare}%` }}
                      className="bg-amber-500 h-full transition-all"
                      title={`Lead Time Variance Share: ${leadShare}%`}
                    />
                  </div>
                </div>

                {/* 6. Annual Cost Breakdown */}
                <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/80 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Holding: ₹{Math.round(cost.holdingCost).toLocaleString()}</span>
                    <span>Ordering: ₹{Math.round(cost.orderingCost).toLocaleString()}</span>
                    <span>Fill Rate: <strong>{(rec.fillRate * 100).toFixed(1)}%</strong></span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-semibold pt-1 border-t border-slate-200">
                    <span>Total Cost (incl. shortage):</span>
                    <span>₹{Math.round(cost.totalAnnualCost).toLocaleString()}/yr</span>
                  </div>
                </div>

                {/* Special Flags for Intermittent / Anomalies */}
                {product.isIntermittent && (
                  <div className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Intermittent demand (&gt;40% zeroes). Treat buffer as indicative.</span>
                  </div>
                )}
              </div>

              {/* Card Footer: Quick Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCardNavigate(product.sku, "scenario")}
                    className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors"
                    title="Simulate surge or supplier delays in Scenario Lab"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>What-if?</span>
                  </button>
                  <button
                    onClick={() => handleCardNavigate(product.sku, "cleaning")}
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                    title="Review detected demand anomalies and treatments"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span>Cleaning</span>
                  </button>
                  <button
                    onClick={() => handleCardNavigate(product.sku, "forecast")}
                    className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                    title="Compare forecast model against baseline on holdout"
                  >
                    <LineChart className="w-3 h-3 text-slate-500" />
                    <span>Forecast</span>
                  </button>
                </div>

                <Link
                  to="/methodology#reorder-point"
                  className="text-[11px] text-slate-400 hover:text-indigo-600 underline"
                  title="View formula in Methodology"
                >
                  Formula?
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State when filter yields 0 items */}
      {filteredCards.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No matching products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No products matched your search "{searchQuery}" or selected status filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("ALL");
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
