// apps/web/src/components/dashboard/ProductDetailView.tsx
// Minimalist Product Detail View matching Landing Page theme

import React, { useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  LineChart,
  Sliders,
  Printer,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { calculateProductPolicy } from "../../data/inventoryData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
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

export const ProductDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    products,
    selectedProduct,
    setSelectedProductId,
    serviceLevel,
    zValue,
    includeUnknowns,
    isLoading,
    loadDemoData,
  } = useInventory();

  const activeProduct = useMemo(() => {
    if (!id) return selectedProduct;
    const found = products.find((p) => p.sku === id || p.id === id);
    return found || selectedProduct || null;
  }, [id, products, selectedProduct]);

  useEffect(() => {
    if (activeProduct && selectedProduct && activeProduct.id !== selectedProduct.id) {
      setSelectedProductId(activeProduct.id);
    }
  }, [activeProduct, selectedProduct, setSelectedProductId]);

  const isUnknownIncluded = activeProduct ? (includeUnknowns[activeProduct.sku] ?? true) : true;
  const policy = useMemo(() => {
    if (!activeProduct) return null;
    return calculateProductPolicy(activeProduct, serviceLevel, isUnknownIncluded);
  }, [activeProduct, serviceLevel, isUnknownIncluded]);

  const category = activeProduct ? getProductCategory(activeProduct.sku) : "General";

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <Skeleton className="h-8 w-48" />
        <div className="p-8 border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] rounded-lg space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
          <div className="grid grid-cols-4 gap-4 pt-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!activeProduct || !policy) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#525252] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Products Directory
        </Link>
        <EmptyState
          title="Product Not Found"
          description={`The requested SKU or product identifier "${id || 'N/A'}" does not exist in the active catalog.`}
          action={{
            label: "Return to Products Directory",
            to: "/products",
          }}
          secondaryAction={{
            label: "Load Demo Products",
            onClick: () => loadDemoData(),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#ebebeb] dark:border-[#262626]">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#525252] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Products</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/products/${activeProduct.sku}/cleaning`}>
            <Button variant="outline" size="sm">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Sales &amp; Anomalies</span>
            </Button>
          </Link>
          <Link to={`/products/${activeProduct.sku}/forecast`}>
            <Button variant="outline" size="sm">
              <LineChart className="w-3.5 h-3.5" />
              <span>Demand Forecast</span>
            </Button>
          </Link>
          <Link to={`/products/${activeProduct.sku}/scenario`}>
            <Button variant="outline" size="sm">
              <Sliders className="w-3.5 h-3.5" />
              <span>Scenario Lab</span>
            </Button>
          </Link>
          <Link to={`/report/${activeProduct.sku}`}>
            <Button variant="primary" size="sm">
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Product Summary Card */}
      <Card variant="default">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#f5f5f5] dark:bg-[#1f1f1f] text-[#171717] dark:text-[#f5f5f5] border border-[#ebebeb] dark:border-[#262626]">
                  {activeProduct.sku}
                </span>
                <span className="font-mono text-xs text-[#737373] dark:text-[#a3a3a3]">
                  {category}
                </span>
                {policy.isOrderNow ? (
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

              <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-[-0.025em] mt-2">
                {activeProduct.name}
              </h1>
              <p className="text-xs sm:text-sm text-[#525252] dark:text-[#a3a3a3] mt-1">
                Service level {(serviceLevel * 100).toFixed(1)}% · z = {zValue.toFixed(3)} ·{" "}
                {activeProduct.historyDays} days observation history
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-start md:items-end justify-between border-t md:border-t-0 md:border-l border-[#ebebeb] dark:border-[#262626] pt-4 md:pt-0 md:pl-8">
              <div className="text-left md:text-right">
                <div className="text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3] uppercase">
                  Stock on Hand
                </div>
                <div className="font-mono text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5]">
                  {activeProduct.onHand.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-[#737373] dark:text-[#a3a3a3]">
                    {activeProduct.unit}
                  </span>
                </div>
              </div>
              <div className="text-right mt-1 font-mono text-xs text-[#525252] dark:text-[#a3a3a3]">
                {policy.daysCover.toFixed(1)} days cover remaining
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4-Metric Hairline Strip */}
      <div className="rounded-lg border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#ebebeb] dark:divide-[#262626]">
        <div className="p-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3]">
            Reorder Point
          </div>
          <div className="mt-1.5 font-mono text-2xl font-semibold text-[#171717] dark:text-[#f5f5f5]">
            {policy.rec.ropOperational.toLocaleString()} {activeProduct.unit}
          </div>
          <div className="mt-0.5 text-xs text-[#525252] dark:text-[#a3a3a3]">
            Trigger threshold
          </div>
        </div>

        <div className="p-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3]">
            Safety Stock
          </div>
          <div className="mt-1.5 font-mono text-2xl font-semibold text-[#171717] dark:text-[#f5f5f5]">
            {Math.ceil(policy.rec.ss).toLocaleString()} {activeProduct.unit}
          </div>
          <div className="mt-0.5 text-xs text-[#525252] dark:text-[#a3a3a3]">
            Dual-variance buffer
          </div>
        </div>

        <div className="p-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3]">
            Order Quantity (EOQ)
          </div>
          <div className="mt-1.5 font-mono text-2xl font-semibold text-[#171717] dark:text-[#f5f5f5]">
            {policy.rec.q.toLocaleString()} {activeProduct.unit}
          </div>
          <div className="mt-0.5 text-xs text-[#525252] dark:text-[#a3a3a3]">
            Est. PO: ₹{(policy.rec.q * activeProduct.unitCost).toLocaleString()}
          </div>
        </div>

        <div className="p-5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3]">
            Expected Stockout
          </div>
          <div className="mt-1.5 font-mono text-2xl font-semibold text-[#171717] dark:text-[#f5f5f5]">
            {policy.stockoutDate || "Buffer safe"}
          </div>
          <div className="mt-0.5 text-xs text-[#525252] dark:text-[#a3a3a3]">
            {policy.isOrderNow ? "Place order today" : "Above reorder trigger"}
          </div>
        </div>
      </div>

      {/* Variance Breakdown & Annual Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="default">
          <CardHeader>
            <CardTitle>Safety Stock Variance Split</CardTitle>
            <CardDescription>
              Contribution of demand variability vs supplier lead-time variability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#171717] dark:text-[#f5f5f5] font-medium">
                  Demand variability: {policy.demandShare}%
                </span>
                <span className="text-[#737373] dark:text-[#a3a3a3]">
                  Lead-time variability: {policy.leadShare}%
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-[#ebebeb] dark:bg-[#262626] flex overflow-hidden">
                <div
                  className="bg-[#171717] dark:bg-[#f5f5f5] h-full"
                  style={{ width: `${policy.demandShare}%` }}
                />
                <div
                  className="bg-[#a3a3a3] dark:bg-[#525252] h-full"
                  style={{ width: `${policy.leadShare}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#ebebeb] dark:border-[#262626] text-xs font-mono">
              <div>
                <span className="text-[#737373] dark:text-[#a3a3a3]">Mean Daily Demand:</span>
                <div className="text-sm font-semibold text-[#171717] dark:text-[#f5f5f5] mt-0.5">
                  {activeProduct.meanDailyDemand.toFixed(1)} {activeProduct.unit}/day
                </div>
              </div>
              <div>
                <span className="text-[#737373] dark:text-[#a3a3a3]">Demand Std Dev:</span>
                <div className="text-sm font-semibold text-[#171717] dark:text-[#f5f5f5] mt-0.5">
                  {activeProduct.sdDemand.toFixed(1)} {activeProduct.unit}
                </div>
              </div>
              <div>
                <span className="text-[#737373] dark:text-[#a3a3a3]">Lead Time Mean:</span>
                <div className="text-sm font-semibold text-[#171717] dark:text-[#f5f5f5] mt-0.5">
                  {activeProduct.leadTimeMean} days
                </div>
              </div>
              <div>
                <span className="text-[#737373] dark:text-[#a3a3a3]">Lead Time Std Dev:</span>
                <div className="text-sm font-semibold text-[#171717] dark:text-[#f5f5f5] mt-0.5">
                  {activeProduct.leadTimeSd} days
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle>Annual Cost Breakdown</CardTitle>
            <CardDescription>
              Economic trade-off between holding inventory and placing orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-[#ebebeb] dark:border-[#262626] p-4 bg-[#fafafa] dark:bg-[#1a1a1a] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#737373] dark:text-[#a3a3a3]">
                  Total Annual Cost
                </span>
                <div className="font-mono text-2xl font-semibold text-[#171717] dark:text-[#f5f5f5]">
                  ₹{policy.cost.totalAnnualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="text-right text-xs font-mono text-[#525252] dark:text-[#a3a3a3]">
                <div>Unit cost: ₹{activeProduct.unitCost}</div>
                <div>Holding rate: {(activeProduct.holdingRate * 100).toFixed(0)}%/yr</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="rounded-md border border-[#ebebeb] dark:border-[#262626] p-3.5">
                <span className="text-[#737373] dark:text-[#a3a3a3]">Holding Cost</span>
                <div className="text-base font-semibold text-[#171717] dark:text-[#f5f5f5] mt-1">
                  ₹{policy.cost.holdingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="rounded-md border border-[#ebebeb] dark:border-[#262626] p-3.5">
                <span className="text-[#737373] dark:text-[#a3a3a3]">Ordering Cost</span>
                <div className="text-base font-semibold text-[#171717] dark:text-[#f5f5f5] mt-1">
                  ₹{policy.cost.orderingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
