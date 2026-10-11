// apps/web/src/components/dashboard/PrintReportView.tsx
// Screen 8: 1-Page Printable Report adhering to ThoughtStream design system

import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Printer, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { calculateProductPolicy } from "../../data/inventoryData";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";

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

  const isUnknownIncluded = includeUnknowns[product.sku] ?? true;
  const policy = useMemo(() => {
    return calculateProductPolicy(product, serviceLevel, isUnknownIncluded);
  }, [product, serviceLevel, isUnknownIncluded]);

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const category = getProductCategory(product.sku);

  return (
    <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#0C0A09] text-[#1C1917] dark:text-[#FAFAF9] font-sans p-6 sm:p-12 print:p-0 print:bg-white print:text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between border-b border-[#E7E5E4] dark:border-[#292524] pb-4 print:hidden">
          <Link
            to={`/products/${product.sku}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAFAF9]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Product Details
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#78716C] dark:text-[#A8A29E]">
              Print-optimized 1-page layout
            </span>
            <Button variant="primary" size="sm" onClick={handlePrint} className="font-mono text-xs">
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Dispatch Report
            </Button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="border border-[#E7E5E4] dark:border-[#292524] bg-white dark:bg-[#12100E] p-8 sm:p-12 space-y-8 print:border-0 print:p-0">
          {/* Header */}
          <div className="border-b border-[#1C1917] dark:border-[#FAFAF9] pb-6 flex items-start justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#78716C] dark:text-[#A8A29E]">
                Official Inventory Replenishment Dispatch
              </span>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1C1917] dark:text-[#FAFAF9] mt-1">
                StockSense Replenishment Order
              </h1>
              <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1">
                Generated: {currentDate} · S-02 VORTEXA Production Engine
              </p>
            </div>
            <div className="text-right font-mono text-xs text-[#78716C] dark:text-[#A8A29E]">
              <div className="font-bold text-[#1C1917] dark:text-[#FAFAF9] text-base">{product.sku}</div>
              <div>{category}</div>
            </div>
          </div>

          {/* Product Overview Card */}
          <div className="border border-[#E7E5E4] dark:border-[#292524] p-6 bg-[#FAFAF9] dark:bg-[#1C1917]/50 flex flex-col sm:flex-row justify-between gap-6">
            <div>
              <div className="text-xs font-mono text-[#78716C] dark:text-[#A8A29E] uppercase">Product Name</div>
              <div className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9] mt-0.5">
                {product.name}
              </div>
              <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1 font-mono">
                Lead Time: {product.leadTimeMean} days (±{product.leadTimeSd}d) · Unit Cost: ₹{product.unitCost}
              </div>
            </div>
            <div className="text-left sm:text-right font-mono">
              <div className="text-xs text-[#78716C] dark:text-[#A8A29E] uppercase">Replenishment Status</div>
              <div className="mt-1">
                {policy.isOrderNow ? (
                  <Badge variant="error" size="md">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Reorder Triggered (Order Now)
                  </Badge>
                ) : (
                  <Badge variant="success" size="md">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Adequate Stock
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Recommendation Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
            <div className="border border-[#E7E5E4] dark:border-[#292524] p-4">
              <span className="text-[11px] text-[#78716C] dark:text-[#A8A29E] uppercase">Current Stock</span>
              <div className="text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9] mt-1">
                {product.onHand}
              </div>
              <span className="text-[10px] text-[#57534E] dark:text-[#A8A29E]">{policy.daysCover.toFixed(1)} days cover</span>
            </div>

            <div className="border border-[#E7E5E4] dark:border-[#292524] p-4">
              <span className="text-[11px] text-[#78716C] dark:text-[#A8A29E] uppercase">Reorder Point</span>
              <div className="text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9] mt-1">
                {policy.rec.ropOperational.toLocaleString()} units
              </div>
              <span className="text-[10px] text-[#57534E] dark:text-[#A8A29E]">Safety Stock: {Math.ceil(policy.rec.ss).toLocaleString()} units</span>
            </div>

            <div className="border border-[#E7E5E4] dark:border-[#292524] p-4">
              <span className="text-[11px] text-[#78716C] dark:text-[#A8A29E] uppercase">Order Quantity (Q)</span>
              <div className="text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9] mt-1">
                {policy.rec.q.toLocaleString()} units
              </div>
              <span className="text-[10px] text-[#57534E] dark:text-[#A8A29E]">Economic lot size</span>
            </div>

            <div className="border border-[#E7E5E4] dark:border-[#292524] p-4">
              <span className="text-[11px] text-[#78716C] dark:text-[#A8A29E] uppercase">Estimated PO Value</span>
              <div className="text-2xl font-bold text-[#1C1917] dark:text-[#FAFAF9] mt-1">
                ₹{(policy.rec.q * product.unitCost).toLocaleString()}
              </div>
              <span className="text-[10px] text-[#57534E] dark:text-[#A8A29E]">Excl. shipping</span>
            </div>
          </div>

          {/* Mathematical Audit Table */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-[#1C1917] dark:text-[#FAFAF9]">
              Mathematical Audit Parameters
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Definition &amp; Derivation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold text-xs">Target Cycle Service Level (CSL)</TableCell>
                  <TableCell className="font-mono text-xs font-bold">{(serviceLevel * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                    Standard normal inverse quantile z = {zValue.toFixed(3)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-xs">Uncertainty Variance Split</TableCell>
                  <TableCell className="font-mono text-xs font-bold">D: {policy.demandShare}% / L: {policy.leadShare}%</TableCell>
                  <TableCell className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                    Dual-variance decomposition of lead-time demand
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-xs">Projected Stockout Date</TableCell>
                  <TableCell className="font-mono text-xs font-bold">{policy.stockoutDate || "Buffer Safe"}</TableCell>
                  <TableCell className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                    Based on current stock and daily consumption rate
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-xs">Total Annual Inventory Cost</TableCell>
                  <TableCell className="font-mono text-xs font-bold">₹{policy.cost.totalAnnualCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TableCell>
                  <TableCell className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                    Holding cost ₹{policy.cost.holdingCost.toFixed(0)} + Ordering cost ₹{policy.cost.orderingCost.toFixed(0)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Authorization Footer */}
          <div className="pt-12 border-t border-[#E7E5E4] dark:border-[#292524] grid grid-cols-2 gap-8 text-xs font-mono">
            <div>
              <div className="border-b border-[#1C1917] dark:border-[#FAFAF9] pb-12"></div>
              <div className="mt-2 text-[#78716C] dark:text-[#A8A29E]">Storekeeper / Pharmacy Officer Signature</div>
            </div>
            <div>
              <div className="border-b border-[#1C1917] dark:border-[#FAFAF9] pb-12"></div>
              <div className="mt-2 text-[#78716C] dark:text-[#A8A29E]">Procurement Authority Verification</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
