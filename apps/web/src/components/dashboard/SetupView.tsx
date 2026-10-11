// apps/web/src/components/dashboard/SetupView.tsx
// Screen 1 & 1b: Import Data & Smart CSV Ingestion Engine with Live DB Sync

import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Download,
  Database,
  ArrowRight,
  FileText,
} from "lucide-react";
import { useInventory, type CsvImportResult } from "../../context/InventoryContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";

const SAMPLE_CSV_TEMPLATES: Record<
  "sales" | "products" | "promos" | "lead_times",
  { fileName: string; content: string; desc: string }
> = {
  sales: {
    fileName: "sales_history.csv",
    desc: "Columns: date, sku, units, on_hand (optional)",
    content: [
      "date,sku,units,on_hand",
      "2026-09-01,PCM-02,52,290",
      "2026-09-02,PCM-02,48,242",
      "2026-09-03,PCM-02,55,187",
      "2026-09-04,PCM-02,49,138",
      "2026-09-05,PCM-02,310,120",
      "2026-09-06,PCM-02,51,269",
      "2026-09-07,PCM-02,47,222",
      "2026-09-08,PCM-02,53,169",
      "2026-09-09,PCM-02,50,119",
      "2026-09-10,PCM-02,54,265",
      "2026-09-01,ORS-01,44,780",
      "2026-09-02,ORS-01,47,733",
      "2026-09-03,ORS-01,45,688",
      "2026-09-04,ORS-01,49,639",
      "2026-09-05,ORS-01,145,494",
      "2026-09-06,ORS-01,46,448",
    ].join("\n"),
  },
  products: {
    fileName: "products.csv",
    desc: "Columns: sku, name, unit, unit_cost, order_cost, lead_time_mean, lead_time_sd, on_hand",
    content: [
      "sku,name,unit,unit_cost,order_cost,holding_rate,lead_time_mean,lead_time_sd,on_hand,pack_size,min_order_qty,mean_daily_demand,sd_demand",
      "AZI-07,Azithromycin 500mg Tablets,strips,110,220,0.2,6,1.2,95,20,40,28,6.5",
      "MET-08,Metformin 850mg Sustained Release,strips,38,140,0.2,8,1.5,410,50,100,42,8.0",
      "PCM-02,Paracetamol 500 mg (Strips),strips,50,200,0.2,10,2.0,265,50,100,52,10.5",
    ].join("\n"),
  },
  promos: {
    fileName: "promotions.csv",
    desc: "Columns: sku, start_date, end_date, note",
    content: [
      "sku,start_date,end_date,note",
      "ORS-01,2026-07-15,2026-07-19,Monsoon & Heatwave Hydration Drive",
      "PCM-02,2026-09-04,2026-09-06,Community Fever Screening Camp",
    ].join("\n"),
  },
  lead_times: {
    fileName: "lead_times.csv",
    desc: "Columns: sku, order_date, received_date",
    content: [
      "sku,order_date,received_date",
      "PCM-02,2026-07-01,2026-07-10",
      "PCM-02,2026-07-20,2026-08-01",
      "PCM-02,2026-08-10,2026-08-19",
      "ORS-01,2026-07-05,2026-07-12",
      "ORS-01,2026-08-01,2026-08-07",
      "INS-03,2026-08-05,2026-08-14",
    ].join("\n"),
  },
};

export const SetupView: React.FC = () => {
  const { products, addProduct, loadDemoData, ingestCsv, setSelectedProductId } = useInventory();

  const [activeTab, setActiveTab] = useState<"UPLOAD" | "MANUAL">("UPLOAD");
  const [selectedSchema, setSelectedSchema] = useState<
    "auto" | "sales" | "products" | "promos" | "lead_times"
  >("auto");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);
  const [rawCsvInput, setRawCsvInput] = useState<string>(SAMPLE_CSV_TEMPLATES.products.content);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cardInputRefs = {
    sales: useRef<HTMLInputElement | null>(null),
    products: useRef<HTMLInputElement | null>(null),
    promos: useRef<HTMLInputElement | null>(null),
    lead_times: useRef<HTMLInputElement | null>(null),
  };

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

  const handleReset = async () => {
    await loadDemoData();
    setImportResult(null);
    setResetStatus("Reloaded 6 seeded demo products & 900 sales records (seed: 20261011).");
    setTimeout(() => setResetStatus(null), 5000);
  };

  const processCsvFile = async (
    file: File,
    forcedType: "auto" | "sales" | "products" | "promos" | "lead_times" = "auto"
  ) => {
    setIsProcessing(true);
    try {
      const text = await file.text();
      setRawCsvInput(text);
      const res = await ingestCsv(forcedType, text, file.name);
      setImportResult(res);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "auto" | "sales" | "products" | "promos" | "lead_times"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      void processCsvFile(file, type);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processCsvFile(file, selectedSchema);
    }
  };

  const handleIngestRawCsv = async (
    typeOverride?: "auto" | "sales" | "products" | "promos" | "lead_times",
    csvOverride?: string,
    fileLabel?: string
  ) => {
    const textToUse = csvOverride ?? rawCsvInput;
    if (!textToUse.trim()) return;
    setIsProcessing(true);
    try {
      const res = await ingestCsv(
        typeOverride ?? selectedSchema,
        textToUse,
        fileLabel || "live_editor.csv"
      );
      setImportResult(res);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSample = (type: "sales" | "products" | "promos" | "lead_times") => {
    const sample = SAMPLE_CSV_TEMPLATES[type];
    const blob = new Blob([sample.content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sample.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSimulateBadCsv = async () => {
    const badCsv = [
      "date,sku,units",
      "2026-09-01,PCM-02,-5",
      "2026-02-30,ORS-01,45",
      "2026-09-03,,60",
      "2026-09-04,PCM-02,54",
    ].join("\n");
    setRawCsvInput(badCsv);
    await handleIngestRawCsv("sales", badCsv, "invalid_sample.csv");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sku || !formData.name) return;

    const created = addProduct({
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

    setResetStatus(`Added ${created.sku} (${created.name}) to catalog and computed ROP & EOQ.`);
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
    setTimeout(() => setResetStatus(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#ebebeb] dark:border-[#262626]">
        <div>
          <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#737373] dark:text-[#a3a3a3] mb-1">
            SYSTEM · SMART DATA INGESTION
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#171717] dark:text-[#f5f5f5] tracking-[-0.025em]">
            Import Data &amp; Smart Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#525252] dark:text-[#a3a3a3] mt-1 max-w-2xl">
            Upload `.csv` files directly or use the live CSV editor. Smart Intelligence auto-detects
            schemas, fits training parameters ($\mu_d, \sigma_d, \mu_L$), flags Modified Z-Score
            anomalies, and updates the database.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => void handleReset()}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </Button>
          <Link to="/recommendations">
            <Button variant="primary" size="sm">
              <span>View Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {resetStatus && (
        <div className="rounded-md bg-[#f0fdf4] dark:bg-[#0d2416] border border-[#dcfce7] dark:border-[#163d24] px-4 py-3 text-xs font-mono text-[#15803d] dark:text-[#86efac] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{resetStatus}</span>
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
          Smart CSV Upload &amp; DB Sync
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
          {/* Primary Interactive Drag & Drop CSV File Uploader */}
          <Card variant="default" className="overflow-hidden">
            <CardContent className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => handleFileChange(e, selectedSchema)}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#171717] dark:text-[#f5f5f5]" />
                  <h2 className="font-heading text-base font-semibold text-[#171717] dark:text-[#f5f5f5]">
                    Smart CSV Ingestion Dropzone
                  </h2>
                  <Badge variant="primary" size="sm">
                    Auto Schema + Anomaly Detection
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-[#737373] dark:text-[#a3a3a3]">Target Schema:</span>
                  <select
                    value={selectedSchema}
                    onChange={(e) =>
                      setSelectedSchema(
                        e.target.value as "auto" | "sales" | "products" | "promos" | "lead_times"
                      )
                    }
                    className="rounded border border-[#ebebeb] dark:border-[#262626] bg-[#fafafa] dark:bg-[#0a0a0a] px-2.5 py-1 text-xs text-[#171717] dark:text-[#f5f5f5] focus:outline-none"
                  >
                    <option value="auto">Auto-Detect (Smart)</option>
                    <option value="products">products.csv (Catalog SKUs)</option>
                    <option value="sales">sales_history.csv (Daily Demand)</option>
                    <option value="promos">promotions.csv (Promo Windows)</option>
                    <option value="lead_times">lead_times.csv (Supplier Orders)</option>
                  </select>
                </div>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                  isDragging
                    ? "border-[#171717] dark:border-[#f5f5f5] bg-[#f5f5f5] dark:bg-[#1f1f1f]"
                    : "border-[#d4d4d4] dark:border-[#333333] hover:border-[#171717] dark:hover:border-[#737373] bg-[#fafafa]/60 dark:bg-[#0f0f0f]/60"
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-white dark:bg-[#1a1a1a] border border-[#ebebeb] dark:border-[#262626] flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Upload className="w-5 h-5 text-[#171717] dark:text-[#f5f5f5]" />
                </div>
                <p className="font-heading text-sm sm:text-base font-semibold text-[#171717] dark:text-[#f5f5f5]">
                  {isProcessing
                    ? "Running Smart Intelligence & Updating Database..."
                    : "Click to select a .CSV file from your computer, or drag and drop here"}
                </p>
                <p className="text-xs text-[#737373] dark:text-[#a3a3a3] mt-1 max-w-lg mx-auto">
                  Supports <span className="font-mono">products.csv</span>,{" "}
                  <span className="font-mono">sales_history.csv</span>,{" "}
                  <span className="font-mono">promotions.csv</span>, and{" "}
                  <span className="font-mono">lead_times.csv</span>. Automatically updates catalog
                  parameters, detects outliers, and recalculates ROP &amp; EOQ.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Browse CSV File</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      void handleIngestRawCsv(
                        "products",
                        SAMPLE_CSV_TEMPLATES.products.content,
                        "products_smart_batch.csv"
                      )
                    }
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>1-Click Import New SKUs (AZI-07, MET-08)</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      void handleIngestRawCsv(
                        "sales",
                        SAMPLE_CSV_TEMPLATES.sales.content,
                        "sales_history_batch.csv"
                      )
                    }
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>1-Click Import Sales + Spike Batch</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Intelligence Report & Validation Result */}
          {importResult && (
            <Card variant="default" className="overflow-hidden border-[#171717]/20 dark:border-[#f5f5f5]/20">
              <CardHeader className="bg-[#fafafa] dark:bg-[#0f0f0f] border-b border-[#ebebeb] dark:border-[#262626]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {importResult.importedCount > 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-[#15803d] dark:text-[#86efac]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-[#e11d48] dark:text-[#fda4af]" />
                    )}
                    <CardTitle>
                      Smart Ingestion Report — {importResult.fileName} (
                      {importResult.detectedType.toUpperCase()})
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">
                      {importResult.importedCount} Imported
                    </Badge>
                    {importResult.rejectedCount > 0 && (
                      <Badge variant="error" size="sm">
                        {importResult.rejectedCount} Rejected
                      </Badge>
                    )}
                    <Badge variant="neutral" size="sm">
                      {importResult.persistedToDb ? "PostgreSQL + State Synced" : "Live State Synced"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                {/* Smart Insights List */}
                {importResult.smartInsights.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono uppercase text-[#737373] dark:text-[#a3a3a3] font-semibold">
                      Smart Intelligence Actions Applied:
                    </div>
                    <ul className="space-y-1.5">
                      {importResult.smartInsights.map((insight, idx) => (
                        <li
                          key={idx}
                          className="text-xs font-mono text-[#171717] dark:text-[#f5f5f5] flex items-start gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#15803d] dark:text-[#86efac] shrink-0 mt-0.5" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Updated SKUs Quick Links */}
                {importResult.updatedSkus.length > 0 && (
                  <div className="pt-3 border-t border-[#ebebeb] dark:border-[#262626] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-[#737373] dark:text-[#a3a3a3]">
                        Updated SKUs in DB ({products.length} total in catalog):
                      </span>
                      {importResult.updatedSkus.map((sku) => {
                        const prod = products.find((p) => p.sku === sku);
                        return (
                          <Link
                            key={sku}
                            to={`/products/${sku}`}
                            onClick={() => prod && setSelectedProductId(prod.id)}
                            className="px-2.5 py-1 rounded bg-[#171717] dark:bg-[#f5f5f5] text-white dark:text-[#0a0a0a] font-mono text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1"
                          >
                            <span>{sku}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        );
                      })}
                    </div>
                    <Link to="/recommendations">
                      <Button variant="primary" size="sm">
                        <span>Open Live Analytics Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Row-level Validation Errors (Rule 7) */}
                {importResult.rejectedRows.length > 0 && (
                  <div className="pt-3 border-t border-[#ebebeb] dark:border-[#262626] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#e11d48] dark:text-[#fda4af]">
                      <AlertCircle className="w-4 h-4" />
                      <span>
                        {importResult.rejectedRows.length} row(s) rejected by strict Zod schema
                        validation (never silently fixed):
                      </span>
                    </div>
                    <div className="rounded-md border border-[#ebebeb] dark:border-[#262626] overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Row</TableHead>
                            <TableHead>Field</TableHead>
                            <TableHead>Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importResult.rejectedRows.map((err, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-mono font-semibold text-xs">
                                {err.row}
                              </TableCell>
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
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 4 Dedicated CSV Schema Cards with Direct File Upload & Sample Download */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(
              [
                {
                  key: "sales" as const,
                  title: "sales_history.csv",
                  desc: "Columns: date, sku, units, on_hand",
                  count: "Daily demand & stock",
                },
                {
                  key: "products" as const,
                  title: "products.csv",
                  desc: "Columns: sku, name, unit_cost, lead_time_mean",
                  count: `${products.length} Active SKUs`,
                },
                {
                  key: "promos" as const,
                  title: "promotions.csv",
                  desc: "Columns: sku, start_date, end_date, note",
                  count: "Promo uplift windows",
                },
                {
                  key: "lead_times" as const,
                  title: "lead_times.csv",
                  desc: "Columns: sku, order_date, received_date",
                  count: "Empirical lead times",
                },
              ] as const
            ).map((file) => (
              <Card key={file.title} variant="default" className="p-4 flex flex-col justify-between">
                <div>
                  <input
                    ref={cardInputRefs[file.key]}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, file.key)}
                  />
                  <div className="flex items-center justify-between text-xs font-mono text-[#737373] dark:text-[#a3a3a3]">
                    <FileSpreadsheet className="w-4 h-4 text-[#171717] dark:text-[#f5f5f5]" />
                    <span>{file.count}</span>
                  </div>
                  <h3 className="font-mono font-semibold text-xs sm:text-sm text-[#171717] dark:text-[#f5f5f5] mt-3">
                    {file.title}
                  </h3>
                  <p className="text-xs text-[#525252] dark:text-[#a3a3a3] mt-1">{file.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f0f0f0] dark:border-[#1f1f1f] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadSample(file.key)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3] hover:text-[#171717] dark:hover:text-[#f5f5f5] transition-colors"
                    title={`Download sample ${file.title}`}
                  >
                    <Download className="w-3 h-3" />
                    <span>Template</span>
                  </button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => cardInputRefs[file.key].current?.click()}
                    className="h-7 px-2.5 text-[11px]"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload CSV</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Interactive Live CSV Editor & Smart Ingest Tester */}
          <Card variant="default">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Live CSV Payload Editor &amp; Schema Validator</span>
                </CardTitle>
                <CardDescription>
                  Edit or paste raw CSV rows below and click &ldquo;Run Smart Ingest&rdquo; to
                  update the database and recompute inventory policies immediately.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(["products", "sales", "promos", "lead_times"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setSelectedSchema(k);
                      setRawCsvInput(SAMPLE_CSV_TEMPLATES[k].content);
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${
                      selectedSchema === k
                        ? "bg-[#171717] text-white dark:bg-[#f5f5f5] dark:text-[#0a0a0a] border-[#171717] dark:border-[#f5f5f5]"
                        : "bg-[#fafafa] dark:bg-[#0f0f0f] text-[#525252] dark:text-[#a3a3a3] border-[#ebebeb] dark:border-[#262626]"
                    }`}
                  >
                    Load {k}.csv
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <textarea
                value={rawCsvInput}
                onChange={(e) => setRawCsvInput(e.target.value)}
                rows={7}
                className="w-full rounded-lg border border-[#ebebeb] dark:border-[#262626] bg-[#fafafa] dark:bg-[#0a0a0a] p-3.5 font-mono text-xs text-[#171717] dark:text-[#f5f5f5] focus:outline-none focus:ring-1 focus:ring-[#171717] dark:focus:ring-[#f5f5f5]"
                placeholder="Paste CSV content with headers here..."
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-mono text-[#737373] dark:text-[#a3a3a3]">
                  Rule 7 enforced: Invalid rows produce explicit row/field/reason errors without
                  silent fixes.
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleSimulateBadCsv()}
                  >
                    Test Invalid CSV Rows
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => void handleIngestRawCsv()}
                    disabled={isProcessing}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isProcessing ? "Ingesting..." : "Run Smart Ingest & Update DB"}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
