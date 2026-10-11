// apps/api/src/analysis/run.ts
// Orchestration of inventory analysis: split, detect, classify, treat, forecast, evaluate, recommend

import { prisma } from "../db.js";
import {
  timeSplit,
  detectAnomalies,
  classifyByRules,
  applyTreatment,
  weekdayMedians,
  evaluateModels,
  recommend,
  annualCost,
  inventoryPosition,
  daysOfCover,
  projectedStockoutDate,
  zeroDayShare,
  type DailyDataPoint,
  type InventoryInput,
} from "@stocksense/core";
import { sanitizeNumbers } from "../http/safeJson.js";

export interface AnalysisRunParams {
  productId: string;
  serviceLevel?: number;
  aiEnabled?: boolean;
  splitRatio?: number;
  includeUnknowns?: boolean;
}

export async function executeAnalysis(params: AnalysisRunParams) {
  const {
    productId,
    serviceLevel = 0.95,
    aiEnabled = true,
    splitRatio = 0.8,
    includeUnknowns = true,
  } = params;

  // 1. Fetch Product, Sales, Promos, Lead Times from DB
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      sales: { orderBy: { date: "asc" } },
      promos: true,
      leadTimes: true,
    },
  });

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  if (product.sales.length === 0) {
    throw new Error("NO_SALES_RECORDED");
  }

  // 2. Format series
  const salesSeries: DailyDataPoint[] = product.sales.map((s) => ({
    date: s.date.toISOString().slice(0, 10),
    value: Math.max(0, s.units), // internal calculations use non-negative units for stats
  }));

  const promoWindows = product.promos.map((p) => ({
    startDate: p.startDate.toISOString().slice(0, 10),
    endDate: p.endDate.toISOString().slice(0, 10),
    note: p.note,
  }));

  // 3. Flags and Warnings
  const warnings: string[] = [];
  const limitedInformation = salesSeries.length < 28; // T64 (< 28 days)
  if (limitedInformation) {
    warnings.push(`Limited information: based on ${salesSeries.length} days of history (<28 days). Treat as indicative.`);
  }

  const zeroShare = zeroDayShare(salesSeries);
  const intermittent = zeroShare > 0.40; // T65 (> 40% zero sales)
  if (intermittent) {
    warnings.push(`Intermittent demand: ${Math.round(zeroShare * 100)}% zero-demand days.`);
  }

  // 4. Time Split (strictly on training window)
  const effectiveSplitRatio = salesSeries.length >= 5 ? splitRatio : 1.0;
  const { train, holdout } = timeSplit(salesSeries, effectiveSplitRatio);
  const trainSeries = train.length > 0 ? train : salesSeries;

  // 5. Anomaly Detection strictly on the training window
  const rawAnomalies = detectAnomalies(trainSeries, {
    threshold: 3.5,
    trainEndIndex: trainSeries.length,
  });

  // Classify anomalies by rules
  const classifiedAnomalies = rawAnomalies.map((a) => {
    const classification = classifyByRules(a, {
      allSeries: trainSeries,
      promoWindows,
      note: null,
    });
    return {
      ...a,
      ...classification,
    };
  });

  // 6. Treatment: produce cleaned series
  const trainMedians = weekdayMedians(trainSeries);
  const treatment = applyTreatment(trainSeries, classifiedAnomalies, trainMedians);

  const activeCleanedSeries = includeUnknowns
    ? treatment.cleanedSeries
    : treatment.withoutUnknowns;

  // Compute cleaned demand statistics from training window
  const sumCleaned = activeCleanedSeries.reduce((acc, p) => acc + p.value, 0);
  const meanDemand = activeCleanedSeries.length > 0 ? sumCleaned / activeCleanedSeries.length : 0;
  const varCleaned =
    activeCleanedSeries.length > 0
      ? activeCleanedSeries.reduce((acc, p) => acc + (p.value - meanDemand) ** 2, 0) /
        activeCleanedSeries.length
      : 0;
  const sdDemand = Math.sqrt(Math.max(0, varCleaned));

  // Without unknowns statistics (for comparison)
  const sumWithoutUnknowns = treatment.withoutUnknowns.reduce((acc, p) => acc + p.value, 0);
  const meanWithoutUnknowns =
    treatment.withoutUnknowns.length > 0
      ? sumWithoutUnknowns / treatment.withoutUnknowns.length
      : 0;
  const varWithoutUnknowns =
    treatment.withoutUnknowns.length > 0
      ? treatment.withoutUnknowns.reduce((acc, p) => acc + (p.value - meanWithoutUnknowns) ** 2, 0) /
        treatment.withoutUnknowns.length
      : 0;
  const sdWithoutUnknowns = Math.sqrt(Math.max(0, varWithoutUnknowns));

  // 7. Forecast and Holdout Evaluation
  let evaluationResult: any = null;
  if (holdout.length >= 1) {
    evaluationResult = evaluateModels(salesSeries, effectiveSplitRatio);
  } else {
    // Fallback evaluation if holdout is empty
    evaluationResult = {
      baseline: { mae: 0, wape: 0, bias: 0 },
      model: { mae: 0, wape: 0, bias: 0 },
      selected: "baseline",
      baselineWins: true,
      holdoutDays: 0,
    };
  }

  // 8. Inventory Recommendation
  const inventoryInput: InventoryInput = {
    meanDemand,
    sdDemand,
    leadTimeMean: product.leadTimeMean,
    leadTimeSd: product.leadTimeSd,
    serviceLevel,
    orderCost: product.orderCost,
    unitCost: product.unitCost,
    holdingRate: product.holdingRate,
    shortageCost: product.shortageCost ?? undefined,
    packSize: product.packSize,
    minOrderQty: product.minOrderQty,
  };

  const rec = recommend(inventoryInput);
  const costs = annualCost(inventoryInput, rec);

  // Position, order now, and days of cover
  const invPosition = inventoryPosition(product.onHand, product.onOrder);
  const orderNow = invPosition <= rec.rop;
  const coverDays = daysOfCover(product.onHand, meanDemand);
  const stockoutDate = orderNow ? projectedStockoutDate(new Date(), coverDays) : null;

  // Decision path counts
  const decisionPaths = {
    rules: classifiedAnomalies.length,
    llm: 0,
    llm_failed_rules: 0,
  };

  // Upsert detected anomalies into database for this product
  for (const anom of classifiedAnomalies) {
    const anomDate = new Date(anom.date + "T00:00:00.000Z");
    await prisma.anomaly.upsert({
      where: {
        productId_date: {
          productId: product.id,
          date: anomDate,
        },
      },
      update: {
        value: anom.value,
        modifiedZ: anom.modifiedZ,
        class: anom.class,
        reason: anom.reason,
        decisionPath: anom.decisionPath,
        imputedValue: anom.imputedValue ?? null,
      },
      create: {
        productId: product.id,
        date: anomDate,
        value: anom.value,
        modifiedZ: anom.modifiedZ,
        class: anom.class,
        reason: anom.reason,
        decisionPath: anom.decisionPath,
        imputedValue: anom.imputedValue ?? null,
      },
    });
  }

  // 9. Prepare response payload
  const resultPayload = {
    productId: product.id,
    sku: product.sku,
    name: product.name,
    limitedInformation,
    warnings,
    service: {
      level: serviceLevel,
      z: rec.z,
      type: "cycle",
    },
    demand: {
      mean: Math.round(meanDemand * 100) / 100,
      sd: Math.round(sdDemand * 100) / 100,
      basis: "training window, cleaned",
      withoutUnknowns: {
        mean: Math.round(meanWithoutUnknowns * 100) / 100,
        sd: Math.round(sdWithoutUnknowns * 100) / 100,
      },
    },
    recommendation: {
      ss: Math.round(rec.ss * 10) / 10,
      rop: Math.ceil(rec.rop),
      eoq: Math.round(rec.eoq * 10) / 10,
      q: rec.q,
      fillRate: Math.round(rec.fillRate * 1000) / 1000,
      orderNow,
      daysOfCover: coverDays !== null ? Math.round(coverDays * 10) / 10 : null,
      projectedStockoutDate: stockoutDate,
      split: {
        demand: Math.round(rec.split.demand * 100) / 100,
        leadTime: Math.round(rec.split.leadTime * 100) / 100,
      },
    },
    position: {
      onHand: product.onHand,
      onOrder: product.onOrder,
      inventoryPosition: invPosition,
    },
    cost: {
      annual: Math.round(costs.totalAnnualCost * 100) / 100,
      purchase: Math.round(costs.purchaseCost * 100) / 100,
      ordering: Math.round(costs.orderingCost * 100) / 100,
      holding: Math.round(costs.holdingCost * 100) / 100,
      shortage: Math.round(costs.shortageCost * 100) / 100,
    },
    evaluation: {
      baseline: {
        mae: Math.round(evaluationResult.baseline.mae * 100) / 100,
        wape: evaluationResult.baseline.wape !== null ? Math.round(evaluationResult.baseline.wape * 1000) / 1000 : null,
        bias: Math.round(evaluationResult.baseline.bias * 100) / 100,
      },
      model: {
        mae: Math.round(evaluationResult.model.mae * 100) / 100,
        wape: evaluationResult.model.wape !== null ? Math.round(evaluationResult.model.wape * 1000) / 1000 : null,
        bias: Math.round(evaluationResult.model.bias * 100) / 100,
      },
      selected: evaluationResult.selected,
      baselineWins: evaluationResult.baselineWins,
      holdoutDays: evaluationResult.holdoutDays,
    },
    anomalies: classifiedAnomalies.map((a) => ({
      date: a.date,
      value: a.value,
      modifiedZ: Math.round(a.modifiedZ * 10) / 10,
      class: a.class,
      reason: a.reason,
      decisionPath: a.decisionPath,
      imputedValue: a.imputedValue !== undefined ? Math.round(a.imputedValue) : null,
    })),
    decisionPaths,
  };

  // 10. Record AnalysisRun in DB
  await prisma.analysisRun.create({
    data: {
      productId: product.id,
      serviceLevel,
      zValue: rec.z,
      aiEnabled,
      inputsJson: sanitizeNumbers(params) as any,
      resultJson: sanitizeNumbers(resultPayload) as any,
    },
  });

  return sanitizeNumbers(resultPayload);
}
