// apps/web/src/components/dashboard/PrintReportView.tsx
// Screen 8: 1-Page Printable Summary matching the Landing Page minimalist theme

import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { calculateProductPolicy } from "../../data/inventoryData";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";

function getProductCategory(sku: string): string {
  if (sku.startsWith("ORS")) return "Electrolytes";
  if (sku.startsWith("PCM")) return "Analgesics";
  if (sku.startsWith("INS")) return "Endocrine";
  if (sku.startsWith("FLU")) return "Antivirals";
  if (sku.startsWith("BND")) return "Surgical";
  if (sku.startsWith("ANT")) return "Antibiotics";
  return "General";
}

export const PrintReportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, selectedProduct, serviceLevel, zValue, includeUnknowns } = useInventory();

  const product = useMemo(() => {
    if (!id) return selectedProduct;
    return products.find((p) => p.sku === id) || selectedProduct;
  }, [id, products, selectedProduct]);

  const isUnknownIncluded = product ? (includeUnknowns[product.sku] ?? true) : true;
  const policy = useMemo(() => {
    if (!product) return null;
    return calculateProductPolicy(product, serviceLevel, isUnknownIncluded);
  }, [product, serviceLevel, isUnknownIncluded]);

  const handlePrint = () => {
    window.print();
  };

  if (!product || !policy) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-[#171717] dark:text-[#f5f5f5] p-6 flex flex-col items-center justify-center space-y-4">
        <p className="text-sm font-medium">No product selected or found in catalog.</p>
        <Link to="/products">
          <Button variant="outline" size="sm">
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const category = getProductCategory(product.sku);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-[#171717] dark:text-[#f5f5f5] font-sans p-6 sm:p-10 print:p-0 print:bg-white print:text-black transition-colors">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between border-b border-[#ebebeb] dark:border-[#262626] pb-4 print:hidden">
          <Link
            to={`/products/${product.sku}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#525252] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {product.sku}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/recommendations">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
            <Button variant="primary" size="sm" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </Button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="rounded-xl border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] p-6 sm:p-10 space-y-6 print:border-0 print:p-0 print:rounded-none">
          {/* Header */}
          <div className="border-b border-[#ebebeb] dark:border-[#262626] pb-5 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="StockSense" className="w-5 h-5 rounded" />
                <span className="font-heading text-xs font-semibold tracking-tight">
                  StockSense
                </span>
              </div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                Replenishment Order Summary
              </h1>
              <p className="text-xs text-[#737373] dark:text-[#a3a3a3] font-mono">
                Date: {currentDate} · Service level {(serviceLevel * 100).toFixed(1)}% · z ={" "}
                {zValue.toFixed(3)}
              </p>
            </div>

            <div className="text-right font-mono">
              <div className="text-base font-semibold">{product.sku}</div>
              <div className="text-xs text-[#737373] dark:text-[#a3a3a3]">{category}</div>
            </div>
          </div>

          {/* Product Summary */}
          <div className="rounded-lg border border-[#ebebeb] dark:border-[#262626] p-4 bg-[#fafafa] dark:bg-[#0f0f0f] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono uppercase text-[#737373] dark:text-[#a3a3a3]">
                Product
              </div>
              <div className="font-heading text-lg font-semibold mt-0.5">{product.name}</div>
              <div className="text-xs text-[#525252] dark:text-[#a3a3a3] font-mono mt-0.5">
                Lead time: {product.leadTimeMean}d (±{product.leadTimeSd}d) · Unit cost: ₹
                {product.unitCost}
              </div>
            </div>

            <div>
              {policy.isOrderNow ? (
                <Badge variant="error" size="md">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Order now</span>
                </Badge>
              ) : (
                <Badge variant="success" size="md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Healthy</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Key Numbers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="rounded-lg border border-[#ebebeb] dark:border-[#262626] p-4">
              <div className="text-[10px] uppercase text-[#737373] dark:text-[#a3a3a3]">
                On Hand
              </div>
              <div className="text-xl font-semibold mt-1">
                {product.onHand.toLocaleString()} {product.unit}
              </div>
              <div className="text-[11px] text-[#737373] dark:text-[#a3a3a3]">
                {policy.daysCover.toFixed(1)}d cover
              </div>
            </div>

            <div className="rounded-lg border border-[#ebebeb] dark:border-[#262626] p-4">
              <div className="text-[10px] uppercase text-[#737373] dark:text-[#a3a3a3]">
                Reorder Point
              </div>
              <div className="text-xl font-semibold mt-1">
                {policy.rec.ropOperational.toLocaleString()} {product.unit}
              </div>
              <div className="text-[11px] text-[#737373] dark:text-[#a3a3a3]">
                SS: {Math.ceil(policy.rec.ss).toLocaleString()}
              </div>
            </div>

            <div className="rounded-lg border border-[#ebebeb] dark:border-[#262626] p-4">
              <div className="text-[10px] uppercase text-[#737373] dark:text-[#a3a3a3]">
                Order Qty (EOQ)
              </div>
              <div className="text-xl font-semibold mt-1">
                {policy.rec.q.toLocaleString()} {product.unit}
              </div>
              <div className="text-[11px] text-[#737373] dark:text-[#a3a3a3]">
                Optimal lot size
              </div>
            </div>

            <div className="rounded-lg border border-[#ebebeb] dark:border-[#262626] p-4">
              <div className="text-[10px] uppercase text-[#737373] dark:text-[#a3a3a3]">
                Est. PO Value
              </div>
              <div className="text-xl font-semibold mt-1">
                ₹{(policy.rec.q * product.unitCost).toLocaleString()}
              </div>
              <div className="text-[11px] text-[#737373] dark:text-[#a3a3a3]">
                Excl. shipping
              </div>
            </div>
          </div>

          {/* Parameters Table */}
          <div className="rounded-lg border border-[#ebebeb] dark:border-[#262626] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Basis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-xs">Service Level</TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    {(serviceLevel * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-xs text-[#525252] dark:text-[#a3a3a3]">
                    z = {zValue.toFixed(3)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-xs">Variance Split</TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    Demand {policy.demandShare}% / Lead {policy.leadShare}%
                  </TableCell>
                  <TableCell className="text-xs text-[#525252] dark:text-[#a3a3a3]">
                    Dual-variance safety stock formula
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-xs">Expected Stockout</TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    {policy.stockoutDate || "Buffer safe"}
                  </TableCell>
                  <TableCell className="text-xs text-[#525252] dark:text-[#a3a3a3]">
                    At current daily demand ({product.meanDailyDemand} {product.unit}/d)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-xs">Annual Inventory Cost</TableCell>
                  <TableCell className="font-mono text-xs font-semibold">
                    ₹{policy.cost.totalAnnualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="text-xs text-[#525252] dark:text-[#a3a3a3]">
                    Holding ₹{policy.cost.holdingCost.toFixed(0)} + Ordering ₹
                    {policy.cost.orderingCost.toFixed(0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Disclaimer Footer */}
          <div className="pt-4 border-t border-[#ebebeb] dark:border-[#262626] flex items-center justify-between text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3]">
            <span>Rules decide, AI advises · @stocksense/core</span>
            <span>Decision support using fictional demo data · Not a guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};
