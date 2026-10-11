// packages/core/src/schemas.ts
// Single source of truth for validation and types across core, api, and web

import { z } from "zod";

// --- Date helper: validates YYYY-MM-DD string or Date instance ---
export const DateStringSchema = z.string().refine((val) => {
  const d = new Date(val);
  return !isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(val);
}, { message: "Invalid date format. Expected YYYY-MM-DD" });

// --- Product Row Schema (for CSV import and API CRUD) ---
export const ProductInputSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required"),
  name: z.string().trim().min(1, "Product name is required"),
  unit: z.string().trim().default("units"),
  unitCost: z.coerce.number().min(0, "Unit cost must be non-negative"),
  orderCost: z.coerce.number().min(0, "Order cost must be non-negative"),
  holdingRate: z.coerce.number().min(0, "Holding rate must be non-negative").default(0.2),
  leadTimeMean: z.coerce.number().min(0, "Lead time mean must be non-negative"),
  leadTimeSd: z.coerce.number().min(0, "Lead time standard deviation must be non-negative"),
  onHand: z.coerce.number().int("On hand must be an integer").min(0, "On hand must be non-negative").default(0),
  onOrder: z.coerce.number().int("On order must be an integer").min(0, "On order must be non-negative").default(0),
  packSize: z.coerce.number().int("Pack size must be an integer").min(1, "Pack size must be at least 1").default(1),
  minOrderQty: z.coerce.number().int("Min order quantity must be an integer").min(1, "Min order quantity must be at least 1").default(1),
  shelfLifeDays: z.coerce.number().int("Shelf life must be an integer").min(1, "Shelf life must be positive").optional().nullable(),
  shortageCost: z.coerce.number().min(0, "Shortage cost must be non-negative").optional().nullable(),
});

export type ProductInput = z.infer<typeof ProductInputSchema>;

// --- Sales Row Schema ---
export const SaleRowSchema = z.object({
  date: DateStringSchema,
  sku: z.string().trim().min(1, "SKU is required"),
  units: z.coerce.number().refine((n) => !isNaN(n), { message: "units must be a valid number" }),
  onHand: z.coerce.number().int("onHand must be an integer").min(0).optional().nullable(),
});

export type SaleRow = z.infer<typeof SaleRowSchema>;

// --- Promo Row Schema ---
export const PromoRowSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required"),
  startDate: DateStringSchema,
  endDate: DateStringSchema,
  note: z.string().trim().optional().nullable(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

export type PromoRow = z.infer<typeof PromoRowSchema>;

// --- Lead Time Record Schema ---
export const LeadTimeRowSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required"),
  orderDate: DateStringSchema,
  receivedDate: DateStringSchema,
}).refine((data) => new Date(data.receivedDate) >= new Date(data.orderDate), {
  message: "Received date must be on or after order date",
  path: ["receivedDate"],
});

export type LeadTimeRow = z.infer<typeof LeadTimeRowSchema>;

// --- Analysis Request Schema ---
export const AnalysisRequestSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  serviceLevel: z.coerce.number().min(0.50, "Service level must be at least 0.50").max(0.999, "Service level capped at 0.999").default(0.95),
  aiEnabled: z.boolean().default(true),
  splitRatio: z.coerce.number().min(0.5).max(0.95).default(0.8),
  includeUnknowns: z.boolean().default(true),
});

export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;

// --- Scenario Request Schemas ---
export const ScenarioParseRequestSchema = z.object({
  text: z.string().trim().min(1, "Scenario text is required"),
  aiEnabled: z.boolean().default(true),
});

export const ScenarioRunRequestSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  serviceLevel: z.coerce.number().min(0.50).max(0.999).default(0.95),
  surgePct: z.coerce.number().min(-90).max(500).default(0),
  delayDays: z.coerce.number().min(-30).max(60).default(0),
  extraLeadTimeSd: z.coerce.number().min(0).max(30).optional().default(0),
  confirmed: z.boolean(),
});

export type ScenarioRunRequest = z.infer<typeof ScenarioRunRequestSchema>;

// --- AI Enums and Decision Paths ---
export const AnomalyClassEnum = z.enum(["PROMOTION", "DATA_ERROR", "UNKNOWN"]);
export type AnomalyClass = z.infer<typeof AnomalyClassEnum>;

export const DecisionPathEnum = z.enum(["RULES", "LLM", "LLM_FAILED_RULES"]);
export type DecisionPath = z.infer<typeof DecisionPathEnum>;

// --- AI Schemas (Strict) ---
export const ClassifySchema = z.object({
  class: AnomalyClassEnum,
  adjustmentPct: z.number().min(-100).max(500),
  reason: z.string().min(3).max(240),
}).strict();

export const ScenarioSchema = z.object({
  surgePct: z.number().min(-90).max(500),
  surgeDays: z.number().int().min(0).max(365).optional().nullable(),
  delayDays: z.number().min(-30).max(60),
  referencedText: z.string().max(200),
}).strict();
