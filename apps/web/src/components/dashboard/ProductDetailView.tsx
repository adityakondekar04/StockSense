// apps/web/src/components/dashboard/ProductDetailView.tsx
// Dedicated Product 360° Detail View for deep inspection and direct action

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
  } = useInventory();

  // Find product by SKU or ID from route param
  const activeProduct = useMemo(() => {
    if (!id) return selectedProduct;
    const found = products.find((p) => p.sku === id || p.id === id);
    return found || selectedProduct;
  }, [id, products, selectedProduct]);

  // Sync selectedProductId with context
  useEffect(() => {
    if (activeProduct && activeProduct.id !== selectedProduct.id) {
      setSelectedProductId(activeProduct.id);
    }
  }, [activeProduct, selectedProduct.id, setSelectedProductId]);

  const isUnknownIncluded = includeUnknowns[activeProduct.sku] ?? true;
  const policy = useMemo(() => {
    return calculateProductPolicy(activeProduct, serviceLevel, isUnknownIncluded);
  }, [activeProduct, serviceLevel, isUnknownIncluded]);

  const category = getProductCategory(activeProduct.sku);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Navigation & Back Link */}
      <div className="flex items-center justify-between border-b border-[#E7E5E4] dark:border-[#292524] pb-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-mono text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAFAF9] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Products Directory
        </Link>
        <div className="flex items-center gap-2">
          <Link to={`/products/${activeProduct.sku}/cleaning`}>
            <Button variant="outline" size="sm" className="font-mono text-xs">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Data Cleaning
            </Button>
          </Link>
          <Link to={`/products/${activeProduct.sku}/forecast`}>
            <Button variant="outline" size="sm" className="font-mono text-xs">
              <LineChart className="w-3.5 h-3.5 mr-1.5" /> Forecast Check
            </Button>
          </Link>
          <Link to={`/products/${activeProduct.sku}/scenario`}>
            <Button variant="outline" size="sm" className="font-mono text-xs">
              <Sliders className="w-3.5 h-3.5 mr-1.5" /> Scenario Lab
            </Button>
          </Link>
          <Link to={`/report/${activeProduct.sku}`}>
            <Button variant="primary" size="sm" className="font-mono text-xs">
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print 1-Page Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Product Card */}
      <Card variant="default">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#F5F5F4] dark:bg-[#292524] text-[#1C1917] dark:text-[#FAFAF9] border border-[#E7E5E4] dark:border-[#44403C]">
                  {activeProduct.sku}
                </span>
                <span className="font-mono text-xs text-[#78716C] dark:text-[#A8A29E] uppercase tracking-wider">
                  {category}
                </span>
                {policy.isOrderNow ? (
                  <Badge variant="error" size="sm">
                    <AlertTriangle className="w-3 h-3 mr-0.5" /> Order Now
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Healthy
                  </Badge>
                )}
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9] tracking-tight mt-2">
                {activeProduct.name}
              </h1>
              <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] mt-2 font-sans max-w-xl">
                Replenishment policy calibrated at <strong>{(serviceLevel * 100).toFixed(1)}% service level</strong> (z = {zValue.toFixed(3)}) across a 150-day observation window.
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-start md:items-end justify-between border-t md:border-t-0 md:border-l border-[#E7E5E4] dark:border-[#292524] pt-4 md:pt-0 md:pl-8">
              <div className="text-left md:text-right">
                <div className="text-[11px] font-mono text-[#78716C] dark:text-[#A8A29E] uppercase">Current Stock</div>
                <div className="font-mono text-4xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
                  {activeProduct.onHand}
                </div>
                <div className="text-[12px] text-[#57534E] dark:text-[#A8A29E]">units on hand</div>
              </div>
              <div className="text-right mt-3 font-mono text-xs text-[#78716C] dark:text-[#A8A29E]">
                {policy.daysCover.toFixed(1)} days cover remaining
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4-KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardContent className="p-5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
              Reorder Point (ROP)
            </span>
            <div className="mt-2 font-mono text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
              {policy.rec.rop}
            </div>
            <p className="mt-1 text-[12px] text-[#57534E] dark:text-[#A8A29E]">
              Trigger purchase order when stock drops below this level.
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
              Safety Stock (SS)
            </span>
            <div className="mt-2 font-mono text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
              {policy.rec.ss}
            </div>
            <p className="mt-1 text-[12px] text-[#57534E] dark:text-[#A8A29E]">
              Buffer to absorb demand surges and supplier delays.
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
              Economic Order Q (EOQ)
            </span>
            <div className="mt-2 font-mono text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
              {policy.rec.q}
            </div>
            <p className="mt-1 text-[12px] text-[#57534E] dark:text-[#A8A29E]">
              Optimal lot size minimizing holding + ordering costs.
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
              Stockout Date
            </span>
            <div className="mt-2 font-mono text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9] truncate">
              {policy.stockoutDate || "Buffer Safe"}
            </div>
            <p className="mt-1 text-[12px] text-[#57534E] dark:text-[#A8A29E]">
              {policy.isOrderNow ? "Action required immediately" : "Sufficient buffer maintained"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deep-Dive Grid: Variance Breakdown & Cost Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dual-Variance Analysis Card */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Dual-Variance Uncertainty Split</CardTitle>
            <CardDescription>
              Lead-time variance formula: <code className="font-mono text-xs bg-[#F5F5F4] dark:bg-[#292524] px-1 py-0.5">σ_LT² = L·σ_d² + d²·σ_L²</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#1C1917] dark:text-[#FAFAF9] font-medium">
                  Demand Volatility: {policy.demandShare}%
                </span>
                <span className="text-[#78716C] dark:text-[#A8A29E]">
                  Lead Time Uncertainty: {policy.leadShare}%
                </span>
              </div>
              <div className="h-3 w-full bg-[#E7E5E4] dark:bg-[#292524] flex overflow-hidden">
                <div
                  className="bg-[#1C1917] dark:bg-[#FAFAF9] h-full transition-all duration-300"
                  style={{ width: `${policy.demandShare}%` }}
                  title={`Demand variance: ${policy.demandShare}%`}
                />
                <div
                  className="bg-[#78716C] dark:bg-[#78716C] h-full transition-all duration-300"
                  style={{ width: `${policy.leadShare}%` }}
                  title={`Lead time variance: ${policy.leadShare}%`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E7E5E4] dark:border-[#292524] text-xs font-mono">
              <div>
                <span className="text-[#78716C] dark:text-[#A8A29E]">Mean Daily Demand (d̄):</span>
                <div className="text-base font-bold text-[#1C1917] dark:text-[#FAFAF9] mt-0.5">
                  {activeProduct.meanDailyDemand.toFixed(2)} units/day
                </div>
              </div>
              <div>
                <span className="text-[#78716C] dark:text-[#A8A29E]">Demand Std Dev (σ_d):</span>
                <div className="text-base font-bold text-[#1C1917] dark:text-[#FAFAF9] mt-0.5">
                  {activeProduct.sdDemand.toFixed(2)}
                </div>
              </div>
              <div>
                <span className="text-[#78716C] dark:text-[#A8A29E]">Lead Time Mean (L̄):</span>
                <div className="text-base font-bold text-[#1C1917] dark:text-[#FAFAF9] mt-0.5">
                  {activeProduct.leadTimeMean} days
                </div>
              </div>
              <div>
                <span className="text-[#78716C] dark:text-[#A8A29E]">Lead Time Std Dev (σ_L):</span>
                <div className="text-base font-bold text-[#1C1917] dark:text-[#FAFAF9] mt-0.5">
                  {activeProduct.leadTimeSd} days
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Annual Inventory Cost Structure */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Total Annual Inventory Costs</CardTitle>
            <CardDescription>
              Economic trade-off between holding stock and batch reordering overhead.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border border-[#E7E5E4] dark:border-[#292524] p-4 bg-[#F5F5F4] dark:bg-[#1C1917]/50 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#78716C] dark:text-[#A8A29E]">
                  Total Annual Cost (Q*)
                </span>
                <div className="font-mono text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9]">
                  ₹{policy.cost.totalAnnualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="text-right text-xs font-mono text-[#57534E] dark:text-[#A8A29E]">
                <span>Unit Cost: ₹{activeProduct.unitCost}</span>
                <br />
                <span>Holding Rate: {(activeProduct.holdingRate * 100).toFixed(0)}%/yr</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="border border-[#E7E5E4] dark:border-[#292524] p-3">
                <span className="text-[#78716C] dark:text-[#A8A29E]">Holding Cost:</span>
                <div className="text-lg font-bold text-[#1C1917] dark:text-[#FAFAF9] mt-1">
                  ₹{policy.cost.holdingCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="border border-[#E7E5E4] dark:border-[#292524] p-3">
                <span className="text-[#78716C] dark:text-[#A8A29E]">Ordering Cost:</span>
                <div className="text-lg font-bold text-[#1C1917] dark:text-[#FAFAF9] mt-1">
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
