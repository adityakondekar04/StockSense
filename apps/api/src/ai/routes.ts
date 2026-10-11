// apps/api/src/ai/routes.ts
// AI endpoints: anomaly classification, adjustment suggestion, and audit log inspection

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { safeJson } from "../http/safeJson.js";
import { classifyAnomalyWithPrecedence } from "./classifier.js";
import { clampAdjustment } from "./clamp.js";

export const aiRouter = Router();
export const auditRouter = Router();

const ClassifyRequestSchema = z.object({
  anomalyId: z.string().optional(),
  productId: z.string().optional(),
  productName: z.string().optional(),
  date: z.string().optional(),
  value: z.number().optional(),
  weekdayMedian: z.number().optional(),
  note: z.string().optional(),
  aiEnabled: z.boolean().default(true),
});

aiRouter.post("/classify", async (req, res) => {
  const parsed = ClassifyRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return safeJson(res, 400, {
      error: "Invalid classification request",
      details: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  const { anomalyId, aiEnabled, note } = parsed.data;

  // If anomalyId is provided, look up anomaly from DB
  if (anomalyId) {
    const anomaly = await prisma.anomaly.findUnique({
      where: { id: anomalyId },
      include: { product: true },
    });

    if (!anomaly) {
      return safeJson(res, 404, { error: `Anomaly ${anomalyId} not found` });
    }

    const result = await classifyAnomalyWithPrecedence(
      {
        productId: anomaly.productId,
        productName: anomaly.product.name,
        date: anomaly.date.toISOString().split("T")[0],
        value: anomaly.value,
        weekdayMedian: anomaly.imputedValue || 100,
        userNote: note || anomaly.note,
      },
      { aiEnabled }
    );

    // Update anomaly in DB
    await prisma.anomaly.update({
      where: { id: anomalyId },
      data: {
        class: result.class,
        reason: result.reason,
        decisionPath: result.decisionPath,
        proposedAdjPct: result.proposedAdjPct,
        appliedAdjPct: result.appliedAdjPct,
        clamped: result.clamped,
      },
    });

    return safeJson(res, 200, {
      id: anomaly.id,
      date: anomaly.date.toISOString().split("T")[0],
      value: anomaly.value,
      class: result.class,
      reason: result.reason,
      decisionPath: result.decisionPath,
      proposedAdjPct: result.proposedAdjPct,
      appliedAdjPct: result.appliedAdjPct,
      clamped: result.clamped,
    });
  }

  // Direct calculation from provided fields
  const result = await classifyAnomalyWithPrecedence(
    {
      productId: parsed.data.productId,
      productName: parsed.data.productName || "Product",
      date: parsed.data.date || new Date().toISOString().split("T")[0],
      value: parsed.data.value ?? 100,
      weekdayMedian: parsed.data.weekdayMedian ?? 50,
      userNote: note,
    },
    { aiEnabled }
  );

  return safeJson(res, 200, result);
});

// POST /ai/adjustment: Propose and clamp adjustment
aiRouter.post("/adjustment", async (req, res) => {
  const { proposedPct = 0, cap = 30 } = req.body;
  const clamped = clampAdjustment(Number(proposedPct), Number(cap));
  return safeJson(res, 200, clamped);
});

// GET /audit: Return recent audit logs
auditRouter.get("/", async (req, res) => {
  try {
    const limit = Math.min(100, Number(req.query.limit || 50));
    const logs = await prisma.auditLog.findMany({
      orderBy: { at: "desc" },
      take: limit,
    });
    return safeJson(res, 200, logs);
  } catch (err: any) {
    return safeJson(res, 500, { error: "Failed to fetch audit logs" });
  }
});
