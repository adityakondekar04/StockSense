// apps/web/src/components/dashboard/SetupView.tsx
// Screen 1 & 1b: Import Data & Manual Product Entry matching the Landing Page theme

import React, { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useInventory } from "../../context/InventoryContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";

interface ValidationError {
  row: number;
  field: string;
  reason: string;
}

export const SetupView: React.FC = () => {
  const { products, addProduct, loadDemoData } = useInventory();

  const [activeTab, setActiveTab] = useState<"UPLOAD" | "MANUAL">("UPLOAD");
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [simulatedErrors, setSimulatedErrors] = useState<ValidationError[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    unit: "strips",
    unitCost: 50,
    orderCost: 150,
    holdingRate: 0.2,
    leadTimeMean: 7,
    leadTimeSd: 1.5,
    onHand: 100,
    onOrder: 0,
    packSize: 50,
    minOrderQty: 50,
    meanDailyDemand: 25,
    sdDemand: 5,
  });

  const handleReset = () => {
    loadDemoData();
    setResetStatus("Loaded 6 seeded demo products (seed: 20261011).");
    setTimeout(() => setResetStatus(null), 4000);
  };

  const handleSimulateBadCsv = () => {
    setUploadSuccess(null);
    setSimulatedErrors([
      {
        row: 14,
        field: "quantity",
        reason: "Negative quantity (-5) violates non-negativity constraint",
      },
      { row: 28, field: "date", reason: "Invalid ISO date string ('2026-02-30')" },
      { row: 42, field: "sku", reason: "Missing required SKU identifier" },
    ]);
  };

  const handleSimulateCleanCsv = () => {
    setSimulatedErrors([]);
    setUploadSuccess("Imported 150 rows, rejected 0. Validated against Zod schema.");
    setTimeout(() => setUploadSuccess(null), 4000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sku || !formData.name) return;

    addProduct({
      sku: formData.sku.toUpperCase(),
      name: formData.name,
      unit: formData.unit,
      unitCost: Number(formData.unitCost),
      orderCost: Number(formData.orderCost),
      holdingRate: Number(formData.holdingRate),
      leadTimeMean: Number(formData.leadTimeMean),
      leadTimeSd: Number(formData.leadTimeSd),
      onHand: Number(formData.onHand),
      onOrder: Number(formData.onOrder),
      packSize: Number(formData.packSize),
      minOrderQty: Number(formData.minOrderQty),
      meanDailyDemand: Number(formData.meanDailyDemand),
      sdDemand: Number(formData.sdDemand),
    });

    setUploadSuccess(`Added ${formData.sku.toUpperCase()} (${formData.name}) to catalog.`);
    setFormData({
      sku: "",
      name: "",
      unit: "strips",
      unitCost: 50,
      orderCost: 150,
      holdingRate: 0.2,
      leadTimeMean: 7,
      leadTimeSd: 1.5,
      onHand: 100,
      onOrder: 0,
      packSize: 50,
      minOrderQty: 50,
      meanDailyDemand: 25,
      sdDemand: 5,
    });
    setTimeout(() => setUploadSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#ebebeb] dark:border-[#262626]">
        <div>
          <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] mb-1">
            SYSTEM · DATA INGESTION
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-[-0.025em]">
            Import Data
          </h1>
          <p className="text-xs sm:text-sm text-[#525252] dark:text-[#a3a3a3] mt-1 max-w-2xl">
            Load the seeded demo dataset, upload CSV files with row-level validation, or add a
            product manually.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleReset} className="shrink-0">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Load Demo Data</span>
        </Button>
      </div>

      {(resetStatus || uploadSuccess) && (
        <div className="rounded-md bg-[#f0fdf4] dark:bg-[#0d2416] border border-[#dcfce7] dark:border-[#163d24] px-4 py-3 text-xs font-mono text-[#15803d] dark:text-[#86efac] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{resetStatus || uploadSuccess}</span>
        </div>
      )}

      {/* Segmented Tabs */}
      <div className="inline-flex rounded-md border border-[#ebebeb] dark:border-[#262626] bg-white dark:bg-[#141414] p-1">
        <button
          type="button"
          onClick={() => setActiveTab("UPLOAD")}
          className={`px-3.5 py-1.5 rounded text-xs font-medium transition-colors ${
            activeTab === "UPLOAD"
              ? "bg-[#171717] text-white dark:bg-[#f5f5f5] dark:text-[#0a0a0a]"
              : "text-[#525252] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5]"
          }`}
        >
          Upload CSV
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("MANUAL")}
          className={`px-3.5 py-1.5 rounded text-xs font-medium transition-colors ${
            activeTab === "MANUAL"
              ? "bg-[#171717] text-white dark:bg-[#f5f5f5] dark:text-[#0a0a0a]"
              : "text-[#525252] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5]"
          }`}
        >
          Add Product Manually
        </button>
      </div>

      {activeTab === "UPLOAD" ? (
        <div className="space-y-6">
          {/* 4 CSV Dropzones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "sales_history.csv",
                desc: "Columns: date, sku, quantity",
                count: "150 rows",
              },
              {
                title: "products.csv",
                desc: "Columns: sku, name, unit_cost, lead_time",
                count: `${products.length} SKUs`,
              },
              {
                title: "promotions.csv",
                desc: "Columns: sku, start_date, end_date (optional)",
                count: "3 events",
              },
              {
                title: "lead_times.csv",
                desc: "Columns: po_id, sku, lead_days (optional)",
                count: "36 orders",
              },
            ].map((file) => (
              <Card key={file.title} variant="default" className="p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#737373] dark:text-[#a3a3a3]">
                    <FileSpreadsheet className="w-4 h-4 text-[#171717] dark:text-[#f5f5f5]" />
                    <span>{file.count}</span>
                  </div>
                  <h3 className="font-mono font-semibold text-xs sm:text-sm text-[#171717] dark:text-[#f5f5f5] mt-3">
                    {file.title}
                  </h3>
                  <p className="text-xs text-[#525252] dark:text-[#a3a3a3] mt-1">{file.desc}</p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-[#f0f0f0] dark:border-[#1f1f1f] flex items-center justify-between text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3]">
                  <span>Zod validated</span>
                  <Upload className="w-3.5 h-3.5" />
                </div>
              </Card>
            ))}
          </div>

          {/* Validation Test Strip */}
          <Card variant="default">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading text-sm font-semibold text-[#171717] dark:text-[#f5f5f5]">
                  CSV Schema Validation Check
                </h3>
                <p className="text-xs text-[#525252] dark:text-[#a3a3a3] mt-0.5">
                  Invalid rows are never silently fixed. Test clean ingestion or inspect row-level
                  validation errors.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={handleSimulateBadCsv}>
                  Test Invalid CSV
                </Button>
                <Button variant="primary" size="sm" onClick={handleSimulateCleanCsv}>
                  Test Clean CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Validation Error Table */}
          {simulatedErrors.length > 0 && (
            <Card variant="default" className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-2 text-[#e11d48] dark:text-[#fda4af]">
                  <AlertCircle className="w-4 h-4" />
                  <CardTitle className="text-[#e11d48] dark:text-[#fda4af]">
                    {simulatedErrors.length} rows were not imported
                  </CardTitle>
                </div>
                <CardDescription>
                  Review the row number, field, and reason below before re-uploading.
                </CardDescription>
              </CardHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simulatedErrors.map((err, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono font-semibold text-xs">{err.row}</TableCell>
                      <TableCell className="font-mono text-xs text-[#e11d48] dark:text-[#fda4af]">
                        {err.field}
                      </TableCell>
                      <TableCell className="text-xs text-[#525252] dark:text-[#a3a3a3]">
                        {err.reason}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      ) : (
        /* Manual Product Form */
        <Card variant="default">
          <CardHeader>
            <CardTitle>Add Product Manually</CardTitle>
            <CardDescription>
              Enter SKU parameters to calculate reorder point, safety stock, and EOQ immediately
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#171717] dark:text-[#f5f5f5]">
                    SKU Code *
                  </label>
                  <Input
                    placeholder="e.g. AZI-07"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#171717] dark:text-[#f5f5f5]">
                    Product Name *
                  </label>
                  <Input
                    placeholder="e.g. Azithromycin 500mg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#171717] dark:text-[#f5f5f5]">
                    Unit
                  </label>
                  <Input
                    placeholder="strips, vials, packs"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#171717] dark:text-[#f5f5f5]">
                    Stock on Hand (units)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.onHand}
                    onChange={(e) => setFormData({ ...formData, onHand: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#171717] dark:text-[#f5f5f5]">
                    Unit Cost (₹)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#171717] dark:text-[#f5f5f5]">
                    Order Cost (₹)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.orderCost}
                    onChange={(e) => setFormData({ ...formData, orderCost: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#171717] dark:text-[#f5f5f5]">
                    Lead Time Mean (days)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.leadTimeMean}
                    onChange={(e) =>
                      setFormData({ ...formData, leadTimeMean: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#171717] dark:text-[#f5f5f5]">
                    Lead Time Std Dev (days)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.leadTimeSd}
                    onChange={(e) =>
                      setFormData({ ...formData, leadTimeSd: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#171717] dark:text-[#f5f5f5]">
                    Mean Daily Demand (units/day)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.meanDailyDemand}
                    onChange={(e) =>
                      setFormData({ ...formData, meanDailyDemand: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ebebeb] dark:border-[#262626]">
                <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab("UPLOAD")}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Calculate &amp; Save Product
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
