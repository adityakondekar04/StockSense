// apps/api/src/scenarios/routes.ts
// Scenario Lab API: parse natural language scenarios, run simulation & Monte Carlo risk comparison

import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  recommend,
  annualCost,
  sigmaLT,
  applyScenario,
  oldPolicyRisk,
  monteCarloStockout,
  type InventoryInput,
} from "@stocksense/core";
import { prisma } from "../db.js";
import { safeJson } from "../http/safeJson.js";
import { parseScenarioText } from "../ai/scenarioParser.js";

export const scenarioRouter = Router();

const ScenarioParseRequestSchema = z.object({
  text: z.string().trim().default(""),
  aiEnabled: z.boolean().default(true),
});

const ScenarioRunRequestSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  serviceLevel: z.coerce.number().min(0.50).max(0.999).default(0.95),
  surgePct: z.coerce.number().min(-90).max(500).default(0),
  delayDays: z.coerce.number().min(-30).max(60).default(0),
  extraLeadTimeSd: z.coerce.number().min(0).max(30).optional().default(0),
  confirmed: z.boolean().optional(),
  fromText: z.boolean().optional(),
  rawText: z.string().optional(),
  // Optional inline overrides for direct calculation / testing
  meanDemand: z.coerce.number().min(0).optional(),
  sdDemand: z.coerce.number().min(0).optional(),
  leadTimeMean: z.coerce.number().min(0).optional(),
  leadTimeSd: z.coerce.number().min(0).optional(),
  unitCost: z.coerce.number().min(0).optional(),
  orderCost: z.coerce.number().min(0).optional(),
  holdingRate: z.coerce.number().min(0).optional(),
});

// POST /scenarios/parse: Natural language scenario parser
scenarioRouter.post("/parse", async (req: Request, res: Response) => {
  const parsed = ScenarioParseRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return safeJson(res, 400, {
      error: "Invalid scenario text request",
      details: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  const { text, aiEnabled } = parsed.data;
  const result = await parseScenarioText(text, { aiEnabled });
  return safeJson(res, 200, result);
});

// POST /scenarios/run: Run scenario simulation with Before/After, analytic risk, and Monte Carlo
scenarioRouter.post("/run", async (req: Request, res: Response) => {
  const parsed = ScenarioRunRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return safeJson(res, 400, {
      error: "Invalid scenario run request",
      details: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  const {
    productId,
    serviceLevel,
    surgePct,
    delayDays,
    extraLeadTimeSd = 0,
    confirmed,
    fromText,
    rawText,
  } = parsed.data;

  // T66: /scenarios/run from text without confirmed: true -> 400
  if ((fromText || (rawText && rawText.trim().length > 0)) && confirmed !== true) {
    return safeJson(res, 400, {
      error: "Scenarios created from text must be confirmed before running (confirmed: true required)",
    });
  }

  // Determine base input parameters
  let meanDemand = parsed.data.meanDemand;
  let sdDemand = parsed.data.sdDemand;
  let dbProduct: any = null;

  if (meanDemand == null || sdDemand == null || parsed.data.leadTimeMean == null || parsed.data.unitCost == null) {
    try {
      dbProduct = await prisma.product.findFirst({
        where: {
          OR: [{ id: productId }, { sku: productId }],
        },
        include: {
          sales: meanDemand == null || sdDemand == null ? { select: { units: true } } : false,
        },
      });

      if (dbProduct && dbProduct.sales && dbProduct.sales.length > 0) {
        const units = dbProduct.sales.map((s: any) => s.units);
        const mean = units.reduce((a: number, b: number) => a + b, 0) / units.length;
        const variance = units.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / units.length;
        meanDemand = meanDemand ?? mean;
        sdDemand = sdDemand ?? Math.sqrt(variance);
      }
    } catch {
      // Continue with defaults if DB query fails
    }
  }

  meanDemand = meanDemand ?? 100;
  sdDemand = sdDemand ?? 20;

  const baseInput: InventoryInput = {
    meanDemand,
    sdDemand,
    leadTimeMean: parsed.data.leadTimeMean ?? dbProduct?.leadTimeMean ?? 5,
    leadTimeSd: parsed.data.leadTimeSd ?? dbProduct?.leadTimeSd ?? 1,
    serviceLevel,
    unitCost: parsed.data.unitCost ?? dbProduct?.unitCost ?? 50,
    orderCost: parsed.data.orderCost ?? dbProduct?.orderCost ?? 200,
    holdingRate: parsed.data.holdingRate ?? dbProduct?.holdingRate ?? 0.2,
    packSize: dbProduct?.packSize ?? 1,
    minOrderQty: dbProduct?.minOrderQty ?? 1,
    shortageCost: dbProduct?.shortageCost ?? undefined,
  };

  // 1. Before Recommendation and Cost
  const beforeRec = recommend(baseInput);
  const beforeCost = annualCost(baseInput, beforeRec);

  // 2. After Recommendation and Cost under scenario
  const scenarioInput = applyScenario(baseInput, {
    surgePct,
    delayDays,
    extraLeadTimeSd,
  });
  const afterRec = recommend(scenarioInput);
  const afterCost = annualCost(scenarioInput, afterRec);

  // 3. Old Policy Under New Conditions (Analytic Risk)
  const newSigma = sigmaLT(scenarioInput).sigma;
  const oldRisk = oldPolicyRisk({
    oldRop: beforeRec.rop,
    newMeanDemand: scenarioInput.meanDemand,
    newLeadTimeMean: scenarioInput.leadTimeMean,
    newSigmaLT: newSigma,
  });

  // 4. Monte Carlo Simulation (10,000 trials, seed 42)
  const mcSim = monteCarloStockout({
    rop: beforeRec.rop,
    meanDemand: scenarioInput.meanDemand,
    sdDemand: scenarioInput.sdDemand,
    leadMean: scenarioInput.leadTimeMean,
    leadSd: scenarioInput.leadTimeSd,
    seed: 42,
    trials: 10000,
  });

  const agree = Math.abs(mcSim.stockoutProbability - oldRisk.stockoutProbability) < 0.03;

  // Persist scenario record asynchronously if dbProduct exists
  if (dbProduct) {
    prisma.scenario.create({
      data: {
        productId: dbProduct.id,
        surgePct,
        delayDays,
        source: fromText ? "text" : "manual",
        rawText: rawText || null,
        confirmed: Boolean(confirmed),
        resultJson: {
          beforeRop: beforeRec.rop,
          afterRop: afterRec.rop,
          oldPolicyStockoutProbability: oldRisk.stockoutProbability,
        },
      },
    }).catch(() => {});
  }

  const formatRec = (r: typeof beforeRec) => ({
    ...r,
    rop: Math.round(r.rop),
    ss: Math.round(r.ss),
    rawRop: r.rop,
  });

  return safeJson(res, 200, {
    before: formatRec(beforeRec),
    after: formatRec(afterRec),
    oldPolicyUnderNewConditions: {
      rop: Math.round(beforeRec.rop),
      zEffective: oldRisk.zEffective,
      stockoutProbability: oldRisk.stockoutProbability,
    },
    monteCarlo: {
      seed: mcSim.seed,
      trials: mcSim.trials,
      stockoutProbability: mcSim.stockoutProbability,
      analytic: oldRisk.stockoutProbability,
      agree,
    },
    cost: {
      before: beforeCost,
      after: afterCost,
    },
  });
});
