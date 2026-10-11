// apps/web/src/components/dashboard/RecommendationsView.tsx
// Screen 4: Recommendations — Minimalist replenishment dashboard matching Landing Page theme

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
  Upload,
  Plus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { calculateProductPolicy } from "../../data/inventoryData";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge, FilterChip } from "../ui/badge";
import { EmptyState } from "../ui/empty-state";
import { Skeleton } from "../ui/skeleton";

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
    isLoading,
    loadDemoData,
    serverError,
    refreshProducts,
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
    const totalSafetyUnits = calculatedCards.reduce((acc, c) => acc + Math.ceil(c.rec.ss), 0);
    const totalAnnualCost = calculatedCards.reduce((acc, c) => acc + c.cost.totalAnnualCost, 0);

    return {
      totalSKUs,
      orderNowCount,
      okCount: totalSKUs - orderNowCount,
      totalSafetyUnits,
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#ebebeb] dark:border-[#262626]">
        <div>
          <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] mb-1">
            REPLENISHMENT OVERVIEW
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-[-0.025em]">
            Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-[#525252] dark:text-[#a3a3a3] mt-1 max-w-2xl">
            When to reorder and how much, calculated at{" "}
            <span className="font-mono font-medium text-[#171717] dark:text-[#f5f5f5]">
              Service level {(serviceLevel * 100).toFixed(1)}% · z = {zValue.toFixed(3)}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link to="/products">
            <Button variant="outline" size="sm">
              <Package className="w-3.5 h-3.5" />
              <span>All Products</span>
            </Button>
          </Link>
          <Link to="/setup">
            <Button variant="primary" size="sm">
              <Upload className="w-3.5 h-3.5" />
              <span>Import Data</span>
            </Button>
          </Link>
        </div>
      </div>

      {serverError && (
        <div className="p-4 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs font-mono text-[#e11d48] dark:text-[#fda4af] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Connection error: {serverError}. Operating in local cache fallback mode.</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void refreshProducts()}>
            Retry Connection
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-5 rounded-lg border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] space-y-2"
              >
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-14" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-5 rounded-lg border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] space-y-4"
              >
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty Database State */}
      {!isLoading && products.length === 0 && (
        <EmptyState
          icon={Package}
          title="Inventory Catalog is Empty"
          description="No products exist in your database. Load the official benchmark dataset or ingest CSV files to begin computing replenishment policies."
          action={{
            label: "Load Official Demo Dataset",
            onClick: () => loadDemoData(),
            icon: Plus,
          }}
          secondaryAction={{
            label: "Go to Setup & Upload CSV",
            to: "/setup",
          }}
          className="my-8"
        />
      )}

      {/* Unified Calm KPI Summary Panel */}
      <div className="rounded-lg border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#ebebeb] dark:divide-[#262626]">
        <div className="p-4 sm:p-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] flex items-center justify-between">
            <span>Action Needed</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#e11d48] dark:text-[#fda4af]" />
          </div>
          <div className="mt-1.5 font-mono text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5]">
            {summary.orderNowCount}
          </div>
          <div className="mt-0.5 text-xs text-[#525252] dark:text-[#a3a3a3]">
            SKUs at or below reorder point
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] flex items-center justify-between">
            <span>Healthy Stock</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d] dark:text-[#86efac]" />
          </div>
          <div className="mt-1.5 font-mono text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5]">
            {summary.okCount}
          </div>
          <div className="mt-0.5 text-xs text-[#525252] dark:text-[#a3a3a3]">
            SKUs above reorder point
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3]">
            Safety Buffer
          </div>
          <div className="mt-1.5 font-mono text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5]">
            {summary.totalSafetyUnits.toLocaleString()}{" "}
            <span className="text-xs font-normal text-[#737373] dark:text-[#a3a3a3]">units</span>
          </div>
          <div className="mt-0.5 text-xs text-[#525252] dark:text-[#a3a3a3]">
            Reserved across {summary.totalSKUs} SKUs
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3]">
            Est. Annual Cost
          </div>
          <div className="mt-1.5 font-mono text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5]">
            ₹{summary.totalAnnualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="mt-0.5 text-xs text-[#525252] dark:text-[#a3a3a3]">
            Holding + ordering total
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Status Filters & Sorting */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#a3a3a3]" />
          <Input
            placeholder="Search SKU or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2">
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
              Order now ({summary.orderNowCount})
            </FilterChip>
            <FilterChip
              selected={statusFilter === "OK"}
              onClick={() => setStatusFilter("OK")}
            >
              Healthy ({summary.okCount})
            </FilterChip>
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-[#ebebeb] dark:border-[#262626]">
            <span className="text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3]">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "URGENCY" | "SKU" | "NAME" | "COVER")}
              className="h-9 rounded-md bg-white dark:bg-[#141414] border border-[#ebebeb] dark:border-[#262626] px-2.5 text-xs font-medium text-[#171717] dark:text-[#f5f5f5] focus:outline-none"
              aria-label="Sort products"
            >
              <option value="URGENCY">Urgency first</option>
              <option value="COVER">Days cover</option>
              <option value="SKU">SKU code</option>
              <option value="NAME">Product name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCards.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Search}
              title="No Products Match Current Criteria"
              description={`No catalog items match your search "${searchQuery || statusFilter}". Try adjusting your keywords or clearing the status filter.`}
              action={{
                label: "Clear All Filters",
                onClick: () => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                },
              }}
            />
          </div>
        ) : (
          filteredCards.map((card) => {
            const {
              product,
              category,
              rec,
              daysCover,
              stockoutDate,
              isOrderNow,
              demandShare,
              leadShare,
            } = card;

            return (
              <Card
                key={product.sku}
                variant="default"
                className="flex flex-col justify-between hover:border-[#d4d4d4] dark:hover:border-[#383838]"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-5 border-b border-[#ebebeb] dark:border-[#262626]">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-[#f5f5f5] dark:bg-[#1f1f1f] text-[#171717] dark:text-[#f5f5f5] border border-[#ebebeb] dark:border-[#262626]">
                          {product.sku}
                        </span>
                        <span className="text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3]">
                          {category}
                        </span>
                      </div>

                      {isOrderNow ? (
                        <Badge variant="error" size="sm">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Order now</span>
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Healthy</span>
                        </Badge>
                      )}
                    </div>

                    <Link
                      to={`/products/${product.sku}`}
                      onClick={() => handleSelectProduct(product.sku)}
                      className="group block"
                    >
                      <h3 className="font-heading text-base font-semibold text-[#171717] dark:text-[#f5f5f5] group-hover:underline leading-snug">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3]">
                      <span>
                        SL {(serviceLevel * 100).toFixed(0)}% · z = {zValue.toFixed(3)}
                      </span>
                      <span>
                        Lead {product.leadTimeMean}d (±{product.leadTimeSd}d)
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Key Numbers */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-3 pb-4 border-b border-[#f0f0f0] dark:border-[#1f1f1f]">
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono uppercase text-[#737373] dark:text-[#a3a3a3]">
                          On Hand
                        </div>
                        <div className="font-mono text-lg font-semibold text-[#171717] dark:text-[#f5f5f5] mt-0.5 truncate">
                          {product.onHand.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-[#737373] dark:text-[#a3a3a3] truncate">
                          {daysCover.toFixed(1)}d cover
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="text-[10px] font-mono uppercase text-[#737373] dark:text-[#a3a3a3]">
                          Reorder Point
                        </div>
                        <div className="font-mono text-lg font-semibold text-[#171717] dark:text-[#f5f5f5] mt-0.5 truncate">
                          {rec.ropOperational.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-[#737373] dark:text-[#a3a3a3] truncate">
                          SS: {Math.ceil(rec.ss).toLocaleString()} u
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="text-[10px] font-mono uppercase text-[#737373] dark:text-[#a3a3a3]">
                          Order Qty
                        </div>
                        <div className="font-mono text-lg font-semibold text-[#171717] dark:text-[#f5f5f5] mt-0.5 truncate">
                          {rec.q.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-[#737373] dark:text-[#a3a3a3] truncate">
                          ₹{(rec.q * product.unitCost).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Variance Split & Stockout Line */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3]">
                        <span>Demand var {demandShare}%</span>
                        <span>Lead var {leadShare}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#ebebeb] dark:bg-[#262626] flex overflow-hidden">
                        <div
                          className="bg-[#171717] dark:bg-[#f5f5f5] h-full"
                          style={{ width: `${demandShare}%` }}
                          title={`Demand variability: ${demandShare}%`}
                        />
                        <div
                          className="bg-[#a3a3a3] dark:bg-[#525252] h-full"
                          style={{ width: `${leadShare}%` }}
                          title={`Lead time variability: ${leadShare}%`}
                        />
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#737373] dark:text-[#a3a3a3]">
                          {isOrderNow && stockoutDate
                            ? `Runs out around ${stockoutDate}`
                            : "Stock buffer healthy"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[#525252] dark:text-[#a3a3a3]">
                          {aiEnabled ? (
                            <>
                              <Sparkles className="w-3 h-3" />
                              <span>AI + Rules</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3 h-3" />
                              <span>Rules</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Quick Navigation */}
                <div className="px-5 py-3 border-t border-[#ebebeb] dark:border-[#262626] bg-[#fafafa]/60 dark:bg-[#0f0f0f]/60 rounded-b-lg flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/products/${product.sku}/cleaning`}
                      onClick={() => handleSelectProduct(product.sku)}
                      className="px-2 py-1 rounded text-[11px] font-mono text-[#525252] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5] hover:bg-[#ebebeb]/60 dark:hover:bg-[#1f1f1f] transition-colors inline-flex items-center gap-1"
                      title="Review sales history & anomalies"
                    >
                      <BarChart3 className="w-3 h-3" />
                      <span>Anomalies</span>
                    </Link>
                    <Link
                      to={`/products/${product.sku}/forecast`}
                      onClick={() => handleSelectProduct(product.sku)}
                      className="px-2 py-1 rounded text-[11px] font-mono text-[#525252] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5] hover:bg-[#ebebeb]/60 dark:hover:bg-[#1f1f1f] transition-colors inline-flex items-center gap-1"
                      title="Check demand forecast"
                    >
                      <LineChart className="w-3 h-3" />
                      <span>Forecast</span>
                    </Link>
                    <Link
                      to={`/products/${product.sku}/scenario`}
                      onClick={() => handleSelectProduct(product.sku)}
                      className="px-2 py-1 rounded text-[11px] font-mono text-[#525252] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5] hover:bg-[#ebebeb]/60 dark:hover:bg-[#1f1f1f] transition-colors inline-flex items-center gap-1"
                      title="Run What-If Scenario Lab"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>What if?</span>
                    </Link>
                  </div>

                  <Link
                    to={`/products/${product.sku}`}
                    onClick={() => handleSelectProduct(product.sku)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#171717] dark:text-[#f5f5f5] hover:underline"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
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
