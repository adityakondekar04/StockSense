// apps/api/src/analysis/routes.ts
// REST routes for Analysis, Anomalies, and Sales time series

import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { AnalysisRequestSchema } from "@stocksense/core";
import { executeAnalysis } from "./run.js";

export const analysisRouter = Router();

// POST /api/analysis/run (or /analysis/run)
analysisRouter.post("/run", async (req: Request, res: Response) => {
  const parseResult = AnalysisRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parseResult.error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  try {
    const result = await executeAnalysis(parseResult.data);
    res.json(result);
  } catch (err: any) {
    if (err.message === "PRODUCT_NOT_FOUND") {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    if (err.message === "NO_SALES_RECORDED") {
      res.status(422).json({ error: "Insufficient data: no sales recorded for this product" });
      return;
    }
    console.error("Analysis execution error:", err);
    res.status(500).json({ error: "Failed to execute analysis" });
  }
});

// GET /api/products/:id/sales
export const salesRouter = Router({ mergeParams: true });
salesRouter.get("/:id/sales", async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      sales: { orderBy: { date: "asc" } },
    },
  });

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const series = product.sales.map((s) => ({
    date: s.date.toISOString().slice(0, 10),
    units: s.units,
    onHand: s.onHand,
  }));

  res.json({
    productId: product.id,
    sku: product.sku,
    sales: series,
  });
});

// GET /api/products/:id/anomalies
export const anomaliesRouter = Router({ mergeParams: true });
anomaliesRouter.get("/:id/anomalies", async (req: Request, res: Response) => {
  const { id } = req.params;
  const anomalies = await prisma.anomaly.findMany({
    where: { productId: id },
    orderBy: { date: "asc" },
  });

  res.json({
    productId: id,
    anomalies: anomalies.map((a) => ({
      id: a.id,
      date: a.date.toISOString().slice(0, 10),
      value: a.value,
      modifiedZ: a.modifiedZ,
      class: a.class,
      reason: a.reason,
      decisionPath: a.decisionPath,
      imputedValue: a.imputedValue,
      userConfirmed: a.userConfirmed,
      note: a.note,
    })),
  });
});

// POST /api/anomalies/:id/confirm
export const anomalyActionsRouter = Router();
anomalyActionsRouter.post("/:id/confirm", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { class: overrideClass, note } = req.body;

  const existing = await prisma.anomaly.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Anomaly not found" });
    return;
  }

  const updated = await prisma.anomaly.update({
    where: { id },
    data: {
      class: overrideClass ? overrideClass : existing.class,
      note: note !== undefined ? note : existing.note,
      userConfirmed: true,
    },
  });

  // Log in AuditLog
  await prisma.auditLog.create({
    data: {
      kind: "classification",
      productId: updated.productId,
      decisionPath: "RULES",
      detailJson: {
        action: "confirm_override",
        anomalyId: updated.id,
        newClass: updated.class,
        previousClass: existing.class,
        userConfirmed: true,
      },
    },
  });

  res.json({
    id: updated.id,
    date: updated.date.toISOString().slice(0, 10),
    class: updated.class,
    userConfirmed: updated.userConfirmed,
    note: updated.note,
  });
});
