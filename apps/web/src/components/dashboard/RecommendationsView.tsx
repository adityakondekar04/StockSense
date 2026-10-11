// apps/web/src/components/dashboard/RecommendationsView.tsx
// Screen 4: Recommendations — Primary replenishment decision dashboard adhering to ThoughtStream design system

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  Sliders,
  LineChart,
  BarChart3,
  Package,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { calculateProductPolicy } from "../../data/inventoryData";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge, FilterChip } from "../ui/badge";

function getProductCategory(sku: string): string {
  if (sku.startsWith("ORS")) return "Electrolytes";
  if (sku.startsWith("PCM")) return "Analgesics";
  if (sku.startsWith("INS")) return "Endocrine";
  if (sku.startsWith("FLU")) return "Antivirals";
  if (sku.startsWith("BND")) return "Surgical";
  if (sku.startsWith("ANT")) return "Antibiotics";
  return "General";
}

export const RecommendationsView: React.FC = () => {
  const {
    products,
    serviceLevel,
    zValue,
    aiEnabled,
    includeUnknowns,
    setSelectedProductId,
  } = useInventory();

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
        category: getProductCategory(prod.sku),
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

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.product.sku.toLowerCase().includes(query) ||
          c.product.name.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      );
    }

    if (statusFilter === "ORDER_NOW") {
      result = result.filter((c) => c.isOrderNow);
    } else if (statusFilter === "OK") {
      result = result.filter((c) => !c.isOrderNow);
    }

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

  const handleSelectProduct = (sku: string) => {
    const p = products.find((prod) => prod.sku === sku);
    if (p) setSelectedProductId(p.id);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-[#E7E5E4] dark:border-[#292524] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#78716C] dark:text-[#A8A29E]">
            Executive Replenishment Dispatch
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9] tracking-tight mt-1">
            Replenishment Recommendations
          </h1>
          <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] mt-2 max-w-2xl font-sans">
            Calibrated replenishment triggers computed via dual-variance safety stock theory at{" "}
            <strong>{(serviceLevel * 100).toFixed(1)}% service level</strong> (z = {zValue.toFixed(3)}).
            Pure mathematical optimization strictly separates decision rules from AI advisory notes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/products">
            <Button variant="outline" size="sm" className="font-mono text-xs">
              <Package className="w-3.5 h-3.5 mr-1.5" /> All Products Directory
            </Button>
          </Link>
          <Link to="/setup">
            <Button variant="primary" size="sm" className="font-mono text-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Ingest CSV / Add SKU
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Strip - Large ink numbers, flat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card variant="elevated">
          <CardContent className="p-5">
            <div className="text-[11px] font-mono text-[#78716C] dark:text-[#A8A29E] uppercase tracking-wider">
              Total Managed SKUs
            </div>
            <div className="mt-2 font-mono text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
              {summary.totalSKUs}
            </div>
            <div className="mt-1 text-[12px] text-[#57534E] dark:text-[#A8A29E]">
              Active in catalog
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-5">
            <div className="text-[11px] font-mono text-[#DC2626] dark:text-[#FCA5A5] uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Order Now
            </div>
            <div className="mt-2 font-mono text-3xl font-bold text-[#DC2626] dark:text-[#FCA5A5]">
              {summary.orderNowCount}
            </div>
            <div className="mt-1 text-[12px] text-[#57534E] dark:text-[#A8A29E]">
              Stock below ROP
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-5">
            <div className="text-[11px] font-mono text-[#65A30D] dark:text-[#86EFAC] uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Adequate Stock
            </div>
            <div className="mt-2 font-mono text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
              {summary.okCount}
            </div>
            <div className="mt-1 text-[12px] text-[#57534E] dark:text-[#A8A29E]">
              Above reorder trigger
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-5">
            <div className="text-[11px] font-mono text-[#78716C] dark:text-[#A8A29E] uppercase tracking-wider">
              Total Safety Buffer
            </div>
            <div className="mt-2 font-mono text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
              {summary.totalSafetyUnits.toLocaleString()}
            </div>
            <div className="mt-1 text-[12px] text-[#57534E] dark:text-[#A8A29E]">
              Units reserved
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="col-span-2 lg:col-span-1">
          <CardContent className="p-5">
            <div className="text-[11px] font-mono text-[#78716C] dark:text-[#A8A29E] uppercase tracking-wider">
              Annual Inventory Cost
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
              ₹{summary.totalAnnualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="mt-1 text-[12px] text-[#57534E] dark:text-[#A8A29E]">
              Holding + Ordering
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Search, Status Filters & Sorting */}
      <Card variant="default">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#A8A29E]" />
            <Input
              placeholder="Search SKU or product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Chips & Sort Select */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5">
              <FilterChip
                selected={statusFilter === "ALL"}
                onClick={() => setStatusFilter("ALL")}
              >
                All ({calculatedCards.length})
              </FilterChip>
              <FilterChip
                selected={statusFilter === "ORDER_NOW"}
                onClick={() => setStatusFilter("ORDER_NOW")}
              >
                Order Now ({summary.orderNowCount})
              </FilterChip>
              <FilterChip
                selected={statusFilter === "OK"}
                onClick={() => setStatusFilter("OK")}
              >
                Healthy ({summary.okCount})
              </FilterChip>
            </div>

            <div className="flex items-center gap-2 border-l border-[#E7E5E4] dark:border-[#292524] pl-3">
              <span className="text-[11px] font-mono text-[#78716C] dark:text-[#A8A29E] uppercase">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white dark:bg-[#1C1917] border border-[#D6D3D1] dark:border-[#44403C] rounded-none px-2 py-1 text-xs font-mono font-medium text-[#1C1917] dark:text-[#FAFAF9] focus:outline-none"
              >
                <option value="URGENCY">Urgency First</option>
                <option value="COVER">Days Cover (Low to High)</option>
                <option value="SKU">SKU Code</option>
                <option value="NAME">Product Name</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.length === 0 ? (
          <div className="col-span-full text-center py-16 border border-[#E7E5E4] dark:border-[#292524] bg-white dark:bg-[#1C1917]">
            <p className="font-serif text-lg text-[#1C1917] dark:text-[#FAFAF9]">No products match current criteria</p>
            <p className="text-sm text-[#78716C] dark:text-[#A8A29E] mt-1">Try resetting search or status filters.</p>
          </div>
        ) : (
          filteredCards.map((card) => {
            const { product, category, rec, daysCover, stockoutDate, isOrderNow, demandShare, leadShare } = card;

            return (
              <Card
                key={product.sku}
                variant="default"
                className={`flex flex-col justify-between transition-all ${
                  isOrderNow
                    ? "border-t-2 border-t-[#DC2626] dark:border-t-[#DC2626]"
                    : "border-t-2 border-t-[#65A30D] dark:border-t-[#65A30D]"
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="p-6 border-b border-[#E7E5E4] dark:border-[#292524]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#F5F5F4] dark:bg-[#292524] text-[#1C1917] dark:text-[#FAFAF9] border border-[#E7E5E4] dark:border-[#44403C]">
                        {product.sku}
                      </span>
                      {isOrderNow ? (
                        <Badge variant="error" size="sm">
                          <AlertTriangle className="w-3 h-3 mr-0.5" /> Order Now
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3 mr-0.5" /> Healthy
                        </Badge>
                      )}
                    </div>

                    <Link
                      to={`/products/${product.sku}`}
                      onClick={() => handleSelectProduct(product.sku)}
                      className="group"
                    >
                      <h3 className="font-serif text-xl font-bold text-[#1C1917] dark:text-[#FAFAF9] group-hover:text-[#78716C] dark:group-hover:text-[#A8A29E] transition-colors leading-snug">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="text-[12px] font-mono text-[#78716C] dark:text-[#A8A29E] mt-1">
                      {category} · Lead Time: {product.leadTimeMean}d (±{product.leadTimeSd}d)
                    </div>
                  </div>

                  {/* Stock vs ROP Comparison */}
                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#E7E5E4] dark:border-[#292524]">
                      <div>
                        <span className="text-[11px] font-mono uppercase text-[#78716C] dark:text-[#A8A29E]">
                          Current Stock
                        </span>
                        <div className="font-mono text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9] mt-0.5">
                          {product.onHand}
                        </div>
                        <span className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                          {daysCover.toFixed(1)} days cover
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-mono uppercase text-[#78716C] dark:text-[#A8A29E]">
                          Reorder Point
                        </span>
                        <div className="font-mono text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9] mt-0.5">
                          {rec.rop}
                        </div>
                        <span className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                          SS: {rec.ss} units
                        </span>
                      </div>
                    </div>

                    {/* Replenishment Order Recommendation */}
                    <div className="bg-[#F5F5F4] dark:bg-[#1C1917]/70 p-4 border border-[#E7E5E4] dark:border-[#292524]">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#78716C] dark:text-[#A8A29E] uppercase font-semibold">
                          Recommended Order Q
                        </span>
                        <span className="font-bold text-[#1C1917] dark:text-[#FAFAF9] text-base">
                          {rec.q} units
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                        <span>Est. PO Value: ₹{(rec.q * product.unitCost).toLocaleString()}</span>
                        <span>Stockout by: <strong>{stockoutDate || "Buffer Safe"}</strong></span>
                      </div>
                    </div>

                    {/* Dual-Variance Uncertainty Bar */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] font-mono text-[#78716C] dark:text-[#A8A29E]">
                        <span>Demand Volatility ({demandShare}%)</span>
                        <span>Lead Uncertainty ({leadShare}%)</span>
                      </div>
                      <div className="h-2 w-full bg-[#E7E5E4] dark:bg-[#292524] flex overflow-hidden">
                        <div
                          className="bg-[#1C1917] dark:bg-[#FAFAF9] h-full"
                          style={{ width: `${demandShare}%` }}
                          title={`Demand variance: ${demandShare}%`}
                        />
                        <div
                          className="bg-[#78716C] dark:bg-[#78716C] h-full"
                          style={{ width: `${leadShare}%` }}
                          title={`Lead time variance: ${leadShare}%`}
                        />
                      </div>
                    </div>

                    {/* AI Advisory / Rules Badge */}
                    <div className="pt-2 text-[11px] font-mono text-[#78716C] dark:text-[#A8A29E] flex items-center justify-between">
                      <span>Source Basis:</span>
                      <span className="font-semibold text-[#1C1917] dark:text-[#FAFAF9]">
                        {aiEnabled ? "AI Advisory · Rules Decided" : "Deterministic Rules Only"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 border-t border-[#E7E5E4] dark:border-[#292524] bg-[#FAFAF9] dark:bg-[#12100E] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/products/${product.sku}/cleaning`}
                      onClick={() => handleSelectProduct(product.sku)}
                      className="p-1.5 border border-[#E7E5E4] dark:border-[#292524] text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#FAFAF9] hover:bg-[#F5F5F4] dark:hover:bg-[#1C1917]"
                      title="Inspect Sales Series & Anomalies"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to={`/products/${product.sku}/forecast`}
                      onClick={() => handleSelectProduct(product.sku)}
                      className="p-1.5 border border-[#E7E5E4] dark:border-[#292524] text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#FAFAF9] hover:bg-[#F5F5F4] dark:hover:bg-[#1C1917]"
                      title="Validate Holdout Forecast"
                    >
                      <LineChart className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      to={`/products/${product.sku}/scenario`}
                      onClick={() => handleSelectProduct(product.sku)}
                      className="p-1.5 border border-[#E7E5E4] dark:border-[#292524] text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#FAFAF9] hover:bg-[#F5F5F4] dark:hover:bg-[#1C1917]"
                      title="Run Stress Simulation Lab"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <Link
                    to={`/products/${product.sku}`}
                    onClick={() => handleSelectProduct(product.sku)}
                  >
                    <Button variant="outline" size="sm" className="font-mono text-xs">
                      Inspect SKU <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
