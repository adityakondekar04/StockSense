// apps/api/src/import/validators.ts
// Pure CSV parsers and row-level validators for StockSense imports

import Papa from "papaparse";
import type { ProductInput, SaleRow, PromoRow, LeadTimeRow } from "@stocksense/core";

export interface RejectedRow {
  row: number;
  field: string;
  reason: string;
}

export interface ParseResult<T> {
  ok: boolean;
  error?: string;
  missingColumn?: string;
  imported: T[];
  rejected: RejectedRow[];
}

// Helper to normalize keys to lowercase and trimmed
function normalizeKeys(row: Record<string, any>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, val] of Object.entries(row)) {
    if (!key) continue;
    const cleanKey = key.trim().toLowerCase().replace(/[\s_-]+/g, "");
    normalized[cleanKey] = typeof val === "string" ? val.trim() : val != null ? String(val).trim() : "";
  }
  return normalized;
}

// Parse raw CSV string safely using PapaParse
export function parseRawCSV(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  if (!csvText || !csvText.trim()) {
    return { headers: [], rows: [] };
  }

  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });

  const headers = result.meta.fields ? result.meta.fields.map((f) => f.trim()) : [];
  return { headers, rows: result.data };
}

// Check for missing required columns
function checkMissingColumn(headers: string[], requiredGroups: { field: string; aliases: string[] }[]): string | null {
  const normalizedHeaders = new Set(headers.map((h) => h.trim().toLowerCase().replace(/[\s_-]+/g, "")));
  for (const group of requiredGroups) {
    const found = group.aliases.some((alias) => normalizedHeaders.has(alias.toLowerCase().replace(/[\s_-]+/g, "")));
    if (!found) {
      return group.field;
    }
  }
  return null;
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
function isValidDate(dateStr: string): boolean {
  if (!DATE_REGEX.test(dateStr)) return false;
  const d = new Date(dateStr + "T00:00:00.000Z");
  return !isNaN(d.getTime());
}

// ---------------------------------------------------------------------------
// 1. Validate Sales CSV
// ---------------------------------------------------------------------------
export function validateSalesCSV(csvText: string): ParseResult<SaleRow> {
  const { headers, rows } = parseRawCSV(csvText);

  if (headers.length === 0 && rows.length === 0) {
    return {
      ok: false,
      error: "CSV is empty",
      imported: [],
      rejected: [],
    };
  }

  const requiredGroups = [
    { field: "date", aliases: ["date", "sale_date", "saledate"] },
    { field: "sku", aliases: ["sku", "product_sku", "productsku", "product_id"] },
    { field: "units", aliases: ["units", "unit", "quantity", "qty"] },
  ];

  const missing = checkMissingColumn(headers, requiredGroups);
  if (missing) {
    return {
      ok: false,
      error: `Missing required column: ${missing}`,
      missingColumn: missing,
      imported: [],
      rejected: [],
    };
  }

  const imported: SaleRow[] = [];
  const rejected: RejectedRow[] = [];
  const seenSkuDate = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const fileRowNumber = i + 2; // Line 1 is header, data starts at line 2
    const raw = rows[i];
    const norm = normalizeKeys(raw);

    const sku = norm["sku"] || norm["productsku"] || norm["productid"] || "";
    const dateStr = norm["date"] || norm["saledate"] || "";
    const unitsStr = norm["units"] || norm["unit"] || norm["quantity"] || norm["qty"] || "";
    const onHandStr = norm["onhand"] || norm["stock"] || "";

    // 1. SKU validation
    if (!sku) {
      rejected.push({
        row: fileRowNumber,
        field: "sku",
        reason: "SKU is required and cannot be empty",
      });
      continue;
    }

    // 2. Date validation
    if (!isValidDate(dateStr)) {
      rejected.push({
        row: fileRowNumber,
        field: "date",
        reason: `Invalid date format: '${dateStr}'. Expected YYYY-MM-DD`,
      });
      continue;
    }

    // 3. Units validation
    if (unitsStr === "" || isNaN(Number(unitsStr))) {
      rejected.push({
        row: fileRowNumber,
        field: "units",
        reason: `not a number: '${unitsStr}'`,
      });
      continue;
    }
    const units = Number(unitsStr);

    // 4. On-hand validation (optional)
    let onHand: number | null = null;
    if (onHandStr !== "") {
      const oh = Number(onHandStr);
      if (isNaN(oh) || !Number.isInteger(oh) || oh < 0) {
        rejected.push({
          row: fileRowNumber,
          field: "onHand",
          reason: `onHand must be a non-negative integer: '${onHandStr}'`,
        });
        continue;
      }
      onHand = oh;
    }

    // 5. Duplicate (sku, date) check in file
    const dedupeKey = `${sku.toUpperCase()}_${dateStr}`;
    if (seenSkuDate.has(dedupeKey)) {
      rejected.push({
        row: fileRowNumber,
        field: "sku,date",
        reason: `Duplicate sale entry for SKU '${sku}' on date '${dateStr}'`,
      });
      continue;
    }
    seenSkuDate.add(dedupeKey);

    imported.push({
      sku,
      date: dateStr,
      units,
      onHand: onHand ?? undefined,
    });
  }

  return {
    ok: true,
    imported,
    rejected,
  };
}

// ---------------------------------------------------------------------------
// 2. Validate Products CSV
// ---------------------------------------------------------------------------
export function validateProductsCSV(csvText: string): ParseResult<ProductInput> {
  const { headers, rows } = parseRawCSV(csvText);

  if (headers.length === 0 && rows.length === 0) {
    return {
      ok: false,
      error: "CSV is empty",
      imported: [],
      rejected: [],
    };
  }

  const requiredGroups = [
    { field: "sku", aliases: ["sku"] },
    { field: "name", aliases: ["name", "product_name", "productname"] },
    { field: "unitCost", aliases: ["unitcost", "unit_cost", "cost"] },
    { field: "orderCost", aliases: ["ordercost", "order_cost"] },
    { field: "leadTimeMean", aliases: ["leadtimemean", "lead_time_mean", "leadtime"] },
    { field: "leadTimeSd", aliases: ["leadtimesd", "lead_time_sd"] },
  ];

  const missing = checkMissingColumn(headers, requiredGroups);
  if (missing) {
    return {
      ok: false,
      error: `Missing required column: ${missing}`,
      missingColumn: missing,
      imported: [],
      rejected: [],
    };
  }

  const imported: ProductInput[] = [];
  const rejected: RejectedRow[] = [];
  const seenSkus = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const fileRowNumber = i + 2;
    const raw = rows[i];
    const norm = normalizeKeys(raw);

    const sku = norm["sku"] || "";
    const name = norm["name"] || norm["productname"] || "";
    const unit = norm["unit"] || "units";
    const unitCostStr = norm["unitcost"] || norm["cost"] || "";
    const orderCostStr = norm["ordercost"] || "";
    const holdingRateStr = norm["holdingrate"] || "0.2";
    const leadTimeMeanStr = norm["leadtimemean"] || norm["leadtime"] || "";
    const leadTimeSdStr = norm["leadtimesd"] || "";
    const onHandStr = norm["onhand"] || "0";
    const onOrderStr = norm["onorder"] || "0";
    const packSizeStr = norm["packsize"] || "1";
    const minOrderQtyStr = norm["minorderqty"] || "1";
    const shelfLifeDaysStr = norm["shelflifedays"] || "";
    const shortageCostStr = norm["shortagecost"] || "";

    if (!sku) {
      rejected.push({ row: fileRowNumber, field: "sku", reason: "SKU is required" });
      continue;
    }
    if (seenSkus.has(sku.toUpperCase())) {
      rejected.push({ row: fileRowNumber, field: "sku", reason: `Duplicate SKU in file: '${sku}'` });
      continue;
    }
    seenSkus.add(sku.toUpperCase());

    if (!name) {
      rejected.push({ row: fileRowNumber, field: "name", reason: "Product name is required" });
      continue;
    }

    const unitCost = Number(unitCostStr);
    if (unitCostStr === "" || isNaN(unitCost) || unitCost < 0) {
      rejected.push({ row: fileRowNumber, field: "unitCost", reason: `Unit cost must be non-negative: '${unitCostStr}'` });
      continue;
    }

    const orderCost = Number(orderCostStr);
    if (orderCostStr === "" || isNaN(orderCost) || orderCost < 0) {
      rejected.push({ row: fileRowNumber, field: "orderCost", reason: `Order cost must be non-negative: '${orderCostStr}'` });
      continue;
    }

    const holdingRate = Number(holdingRateStr);
    if (holdingRateStr === "" || isNaN(holdingRate) || holdingRate < 0) {
      rejected.push({ row: fileRowNumber, field: "holdingRate", reason: `Holding rate must be non-negative: '${holdingRateStr}'` });
      continue;
    }

    const leadTimeMean = Number(leadTimeMeanStr);
    if (leadTimeMeanStr === "" || isNaN(leadTimeMean) || leadTimeMean < 0) {
      rejected.push({ row: fileRowNumber, field: "leadTimeMean", reason: `Lead time mean must be non-negative: '${leadTimeMeanStr}'` });
      continue;
    }

    const leadTimeSd = Number(leadTimeSdStr);
    if (leadTimeSdStr === "" || isNaN(leadTimeSd) || leadTimeSd < 0) {
      rejected.push({ row: fileRowNumber, field: "leadTimeSd", reason: `Lead time standard deviation must be non-negative: '${leadTimeSdStr}'` });
      continue;
    }

    const onHand = Number(onHandStr);
    if (isNaN(onHand) || !Number.isInteger(onHand) || onHand < 0) {
      rejected.push({ row: fileRowNumber, field: "onHand", reason: `On hand must be a non-negative integer: '${onHandStr}'` });
      continue;
    }

    const onOrder = Number(onOrderStr);
    if (isNaN(onOrder) || !Number.isInteger(onOrder) || onOrder < 0) {
      rejected.push({ row: fileRowNumber, field: "onOrder", reason: `On order must be a non-negative integer: '${onOrderStr}'` });
      continue;
    }

    const packSize = Number(packSizeStr);
    if (isNaN(packSize) || !Number.isInteger(packSize) || packSize < 1) {
      rejected.push({ row: fileRowNumber, field: "packSize", reason: `Pack size must be an integer >= 1: '${packSizeStr}'` });
      continue;
    }

    const minOrderQty = Number(minOrderQtyStr);
    if (isNaN(minOrderQty) || !Number.isInteger(minOrderQty) || minOrderQty < 1) {
      rejected.push({ row: fileRowNumber, field: "minOrderQty", reason: `Min order quantity must be an integer >= 1: '${minOrderQtyStr}'` });
      continue;
    }

    let shelfLifeDays: number | undefined;
    if (shelfLifeDaysStr !== "") {
      const sld = Number(shelfLifeDaysStr);
      if (isNaN(sld) || !Number.isInteger(sld) || sld < 1) {
        rejected.push({ row: fileRowNumber, field: "shelfLifeDays", reason: `Shelf life must be a positive integer: '${shelfLifeDaysStr}'` });
        continue;
      }
      shelfLifeDays = sld;
    }

    let shortageCost: number | undefined;
    if (shortageCostStr !== "") {
      const sc = Number(shortageCostStr);
      if (isNaN(sc) || sc < 0) {
        rejected.push({ row: fileRowNumber, field: "shortageCost", reason: `Shortage cost must be non-negative: '${shortageCostStr}'` });
        continue;
      }
      shortageCost = sc;
    }

    imported.push({
      sku,
      name,
      unit,
      unitCost,
      orderCost,
      holdingRate,
      leadTimeMean,
      leadTimeSd,
      onHand,
      onOrder,
      packSize,
      minOrderQty,
      shelfLifeDays,
      shortageCost,
    });
  }

  return {
    ok: true,
    imported,
    rejected,
  };
}

// ---------------------------------------------------------------------------
// 3. Validate Promos CSV
// ---------------------------------------------------------------------------
export function validatePromosCSV(csvText: string): ParseResult<PromoRow> {
  const { headers, rows } = parseRawCSV(csvText);

  if (headers.length === 0 && rows.length === 0) {
    return { ok: false, error: "CSV is empty", imported: [], rejected: [] };
  }

  const requiredGroups = [
    { field: "sku", aliases: ["sku"] },
    { field: "startDate", aliases: ["startdate", "start_date", "start"] },
    { field: "endDate", aliases: ["enddate", "end_date", "end"] },
  ];

  const missing = checkMissingColumn(headers, requiredGroups);
  if (missing) {
    return {
      ok: false,
      error: `Missing required column: ${missing}`,
      missingColumn: missing,
      imported: [],
      rejected: [],
    };
  }

  const imported: PromoRow[] = [];
  const rejected: RejectedRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const fileRowNumber = i + 2;
    const raw = rows[i];
    const norm = normalizeKeys(raw);

    const sku = norm["sku"] || "";
    const startDate = norm["startdate"] || norm["start"] || "";
    const endDate = norm["enddate"] || norm["end"] || "";
    const note = norm["note"] || undefined;

    if (!sku) {
      rejected.push({ row: fileRowNumber, field: "sku", reason: "SKU is required" });
      continue;
    }
    if (!isValidDate(startDate)) {
      rejected.push({ row: fileRowNumber, field: "startDate", reason: `Invalid start date: '${startDate}'. Expected YYYY-MM-DD` });
      continue;
    }
    if (!isValidDate(endDate)) {
      rejected.push({ row: fileRowNumber, field: "endDate", reason: `Invalid end date: '${endDate}'. Expected YYYY-MM-DD` });
      continue;
    }
    if (new Date(endDate) < new Date(startDate)) {
      rejected.push({ row: fileRowNumber, field: "endDate", reason: "End date must be on or after start date" });
      continue;
    }

    imported.push({
      sku,
      startDate,
      endDate,
      note,
    });
  }

  return { ok: true, imported, rejected };
}

// ---------------------------------------------------------------------------
// 4. Validate Lead Times CSV
// ---------------------------------------------------------------------------
export function validateLeadTimesCSV(csvText: string): ParseResult<LeadTimeRow> {
  const { headers, rows } = parseRawCSV(csvText);

  if (headers.length === 0 && rows.length === 0) {
    return { ok: false, error: "CSV is empty", imported: [], rejected: [] };
  }

  const requiredGroups = [
    { field: "sku", aliases: ["sku"] },
    { field: "orderDate", aliases: ["orderdate", "order_date"] },
    { field: "receivedDate", aliases: ["receiveddate", "received_date"] },
  ];

  const missing = checkMissingColumn(headers, requiredGroups);
  if (missing) {
    return {
      ok: false,
      error: `Missing required column: ${missing}`,
      missingColumn: missing,
      imported: [],
      rejected: [],
    };
  }

  const imported: LeadTimeRow[] = [];
  const rejected: RejectedRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const fileRowNumber = i + 2;
    const raw = rows[i];
    const norm = normalizeKeys(raw);

    const sku = norm["sku"] || "";
    const orderDate = norm["orderdate"] || "";
    const receivedDate = norm["receiveddate"] || "";

    if (!sku) {
      rejected.push({ row: fileRowNumber, field: "sku", reason: "SKU is required" });
      continue;
    }
    if (!isValidDate(orderDate)) {
      rejected.push({ row: fileRowNumber, field: "orderDate", reason: `Invalid order date: '${orderDate}'. Expected YYYY-MM-DD` });
      continue;
    }
    if (!isValidDate(receivedDate)) {
      rejected.push({ row: fileRowNumber, field: "receivedDate", reason: `Invalid received date: '${receivedDate}'. Expected YYYY-MM-DD` });
      continue;
    }
    if (new Date(receivedDate) < new Date(orderDate)) {
      rejected.push({ row: fileRowNumber, field: "receivedDate", reason: "Received date must be on or after order date" });
      continue;
    }

    imported.push({
      sku,
      orderDate,
      receivedDate,
    });
  }

  return { ok: true, imported, rejected };
}
