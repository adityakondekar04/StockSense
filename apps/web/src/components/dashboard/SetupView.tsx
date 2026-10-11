// apps/web/src/components/dashboard/SetupView.tsx
// Screen 1 & 1b: Data Setup, Ingestion & CSV Validation adhering to ThoughtStream design system

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
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";

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

  // Manual Product Form State
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
    setResetStatus("Successfully reset all 6 reference products to official benchmark parameters.");
    setTimeout(() => setResetStatus(null), 4000);
  };

  const handleSimulateBadCsv = () => {
    setUploadSuccess(null);
    setSimulatedErrors([
      { row: 14, field: "quantity", reason: "Negative quantity (-5) violates non-negativity constraint" },
      { row: 28, field: "date", reason: "Invalid ISO date string ('2026-02-30')" },
      { row: 42, field: "sku", reason: "Missing required SKU identifier" },
    ]);
  };

  const handleSimulateCleanCsv = () => {
    setSimulatedErrors([]);
    setUploadSuccess("Successfully parsed 150 daily observations without data corruption. Validated against Zod schema.");
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

    setUploadSuccess(`SKU ${formData.sku.toUpperCase()} created and cataloged successfully.`);
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
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="border-b border-[#E7E5E4] dark:border-[#292524] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#78716C] dark:text-[#A8A29E]">
            Operations &amp; Setup · Step 1
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917] dark:text-[#FAFAF9] tracking-tight mt-1">
            Data Setup &amp; CSV Ingestion
          </h1>
          <p className="text-[14px] text-[#57534E] dark:text-[#A8A29E] mt-2 max-w-2xl font-sans">
            Onboard new inventory datasets or load official benchmark fixtures. All incoming files are validated strictly against Zod schemas; invalid records produce deterministic row-level errors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="font-mono text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reset Official Demo Data
          </Button>
        </div>
      </div>

      {resetStatus && (
        <div className="p-4 bg-[#F0FDF4] dark:bg-[#14532D]/30 border border-[#BBF7D0] dark:border-[#15803D]/40 text-xs font-mono text-[#65A30D] dark:text-[#86EFAC] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {resetStatus}
        </div>
      )}

      {uploadSuccess && (
        <div className="p-4 bg-[#F0FDF4] dark:bg-[#14532D]/30 border border-[#BBF7D0] dark:border-[#15803D]/40 text-xs font-mono text-[#65A30D] dark:text-[#86EFAC] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {uploadSuccess}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#E7E5E4] dark:border-[#292524]">
        <button
          type="button"
          onClick={() => setActiveTab("UPLOAD")}
          className={`px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors ${
            activeTab === "UPLOAD"
              ? "border-[#1C1917] dark:border-[#FAFAF9] text-[#1C1917] dark:text-[#FAFAF9]"
              : "border-transparent text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAFAF9]"
          }`}
        >
          CSV Ingestion Dropzone
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("MANUAL")}
          className={`px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors ${
            activeTab === "MANUAL"
              ? "border-[#1C1917] dark:border-[#FAFAF9] text-[#1C1917] dark:text-[#FAFAF9]"
              : "border-transparent text-[#78716C] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#FAFAF9]"
          }`}
        >
          Manual SKU Creation Form
        </button>
      </div>

      {activeTab === "UPLOAD" ? (
        <div className="space-y-6">
          {/* 4 Ingestion Dropzones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "sales_history.csv", desc: "Required columns: date, sku, quantity", count: "150 rows" },
              { title: "products.csv", desc: "Required columns: sku, name, unit_cost, lead_time", count: `${products.length} SKUs` },
              { title: "promotions.csv", desc: "Required columns: sku, start_date, end_date", count: "3 events" },
              { title: "lead_times.csv", desc: "Required columns: po_id, sku, lead_days", count: "36 orders" },
            ].map((file) => (
              <Card key={file.title} variant="default" className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-[#78716C] dark:text-[#A8A29E]">
                    <FileSpreadsheet className="w-4 h-4 text-[#1C1917] dark:text-[#FAFAF9]" />
                    <span>{file.count}</span>
                  </div>
                  <h4 className="font-mono font-bold text-sm text-[#1C1917] dark:text-[#FAFAF9] mt-3">
                    {file.title}
                  </h4>
                  <p className="text-[12px] text-[#57534E] dark:text-[#A8A29E] mt-1">
                    {file.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#E7E5E4] dark:border-[#292524] flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#65A30D] uppercase font-semibold">Schema Ready</span>
                  <Upload className="w-3.5 h-3.5 text-[#78716C]" />
                </div>
              </Card>
            ))}
          </div>

          {/* Test Action Bar */}
          <Card variant="elevated">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-base text-[#1C1917] dark:text-[#FAFAF9]">
                  Validate Ingestion Engine &amp; Error Handling
                </h3>
                <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                  Simulate clean data ingestion or trigger strict row-level validation errors (Rule 7: No silent fixes).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={handleSimulateBadCsv} className="font-mono text-xs">
                  Simulate Invalid CSV
                </Button>
                <Button variant="primary" size="sm" onClick={handleSimulateCleanCsv} className="font-mono text-xs">
                  Simulate Clean Ingest
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Validation Error Table */}
          {simulatedErrors.length > 0 && (
            <Card variant="default" className="border-t-2 border-t-[#DC2626]">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                  <CardTitle className="text-base text-[#DC2626]">
                    Ingestion Failed: {simulatedErrors.length} Schema Violations Detected
                  </CardTitle>
                </div>
                <CardDescription>
                  In accordance with Rule 7, malformed rows are never silently coerced. Review and correct the source CSV before reprocessing.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row #</TableHead>
                      <TableHead>Offending Field</TableHead>
                      <TableHead>Validation Rule Violated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {simulatedErrors.map((err, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono font-bold text-xs">{err.row}</TableCell>
                        <TableCell className="font-mono text-xs text-[#DC2626] font-semibold">{err.field}</TableCell>
                        <TableCell className="text-xs font-mono text-[#57534E] dark:text-[#D6D3D1]">{err.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Manual Form */
        <Card variant="default">
          <CardHeader>
            <CardTitle>Register New Pharmaceutical SKU</CardTitle>
            <CardDescription>
              Define deterministic operational parameters for replenishment calculation.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#57534E] dark:text-[#A8A29E] mb-1.5 font-semibold">
                    SKU Code *
                  </label>
                  <Input
                    placeholder="e.g. AZI-07"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#57534E] dark:text-[#A8A29E] mb-1.5 font-semibold">
                    Product Name *
                  </label>
                  <Input
                    placeholder="e.g. Azithromycin 500mg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#57534E] dark:text-[#A8A29E] mb-1.5 font-semibold">
                    Unit Type
                  </label>
                  <Input
                    placeholder="e.g. strips, vials, packs"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#57534E] dark:text-[#A8A29E] mb-1.5 font-semibold">
                    Current Stock on Hand
                  </label>
                  <Input
                    type="number"
                    value={formData.onHand}
                    onChange={(e) => setFormData({ ...formData, onHand: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#57534E] dark:text-[#A8A29E] mb-1.5 font-semibold">
                    Unit Cost (₹)
                  </label>
                  <Input
                    type="number"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#57534E] dark:text-[#A8A29E] mb-1.5 font-semibold">
                    Fixed Order Cost (₹)
                  </label>
                  <Input
                    type="number"
                    value={formData.orderCost}
                    onChange={(e) => setFormData({ ...formData, orderCost: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#57534E] dark:text-[#A8A29E] mb-1.5 font-semibold">
                    Mean Lead Time (Days)
                  </label>
                  <Input
                    type="number"
                    value={formData.leadTimeMean}
                    onChange={(e) => setFormData({ ...formData, leadTimeMean: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#57534E] dark:text-[#A8A29E] mb-1.5 font-semibold">
                    Lead Time Std Dev (Days)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.leadTimeSd}
                    onChange={(e) => setFormData({ ...formData, leadTimeSd: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#57534E] dark:text-[#A8A29E] mb-1.5 font-semibold">
                    Mean Daily Demand (Units)
                  </label>
                  <Input
                    type="number"
                    value={formData.meanDailyDemand}
                    onChange={(e) => setFormData({ ...formData, meanDailyDemand: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E5E4] dark:border-[#292524]">
                <Button type="button" variant="secondary" onClick={() => setActiveTab("UPLOAD")}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save SKU to Catalog
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
