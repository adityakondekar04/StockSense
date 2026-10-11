// apps/api/src/import/routes.ts
// Express router for data import endpoints

import { Router, Request, Response } from "express";
import multer from "multer";
import { prisma } from "../db.js";
import {
  validateSalesCSV,
  validateProductsCSV,
  validatePromosCSV,
  validateLeadTimesCSV,
  RejectedRow,
} from "./validators.js";
import { generateDemoData, GENERATOR_SEED } from "../../../../data/generator.js";


export const importRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

function getCSVContent(req: Request): string | null {
  if (req.file && req.file.buffer) {
    return req.file.buffer.toString("utf8");
  }
  if (typeof req.body === "string" && req.body.trim()) {
    return req.body;
  }
  if (req.body && typeof req.body.csv === "string" && req.body.csv.trim()) {
    return req.body.csv;
  }
  if (req.body && typeof req.body.content === "string" && req.body.content.trim()) {
    return req.body.content;
  }
  return null;
}

// ---------------------------------------------------------------------------
// POST /import/sales
// ---------------------------------------------------------------------------
importRouter.post("/sales", upload.single("file"), async (req: Request, res: Response) => {
  const csvContent = getCSVContent(req);
  if (!csvContent) {
    res.status(400).json({ error: "No CSV content provided. Upload a file or send CSV text." });
    return;
  }

  const result = validateSalesCSV(csvContent);
  if (!result.ok) {
    res.status(400).json({
      error: result.error,
      missingColumn: result.missingColumn,
    });
    return;
  }

  let dbProducts: { id: string; sku: string }[] = [];
  try {
    dbProducts = await prisma.product.findMany({ select: { id: true, sku: true } });
  } catch (err: any) {
    // If DB is unreachable, still return parse/validation summary
    res.status(503).json({ error: "Database unavailable", details: err?.message });
    return;
  }

  const productMap = new Map(dbProducts.map((p) => [p.sku.toUpperCase(), p.id]));
  const rejected: RejectedRow[] = [...result.rejected];
  let importedCount = 0;

  for (const row of result.imported) {
    const productId = productMap.get(row.sku.toUpperCase());
    if (!productId) {
      rejected.push({
        row: 0,
        field: "sku",
        reason: `Product with SKU '${row.sku}' does not exist in database`,
      });
      continue;
    }

    try {
      const dateObj = new Date(row.date + "T00:00:00.000Z");
      await prisma.sale.upsert({
        where: {
          productId_date: {
            productId,
            date: dateObj,
          },
        },
        update: {
          units: row.units,
          onHand: row.onHand ?? null,
        },
        create: {
          productId,
          date: dateObj,
          units: row.units,
          onHand: row.onHand ?? null,
        },
      });
      importedCount++;
    } catch (err: any) {
      rejected.push({
        row: 0,
        field: "db",
        reason: err?.message || "Failed to persist row",
      });
    }
  }

  res.json({
    imported: importedCount,
    rejected,
  });
});

// ---------------------------------------------------------------------------
// POST /import/products
// ---------------------------------------------------------------------------
importRouter.post("/products", upload.single("file"), async (req: Request, res: Response) => {
  const csvContent = getCSVContent(req);
  if (!csvContent) {
    res.status(400).json({ error: "No CSV content provided. Upload a file or send CSV text." });
    return;
  }

  const result = validateProductsCSV(csvContent);
  if (!result.ok) {
    res.status(400).json({
      error: result.error,
      missingColumn: result.missingColumn,
    });
    return;
  }

  let importedCount = 0;
  const rejected: RejectedRow[] = [...result.rejected];

  for (const prod of result.imported) {
    try {
      await prisma.product.upsert({
        where: { sku: prod.sku },
        update: {
          name: prod.name,
          unit: prod.unit,
          unitCost: prod.unitCost,
          orderCost: prod.orderCost,
          holdingRate: prod.holdingRate,
          leadTimeMean: prod.leadTimeMean,
          leadTimeSd: prod.leadTimeSd,
          onHand: prod.onHand,
          onOrder: prod.onOrder,
          packSize: prod.packSize,
          minOrderQty: prod.minOrderQty,
          shelfLifeDays: prod.shelfLifeDays ?? null,
          shortageCost: prod.shortageCost ?? null,
        },
        create: {
          sku: prod.sku,
          name: prod.name,
          unit: prod.unit,
          unitCost: prod.unitCost,
          orderCost: prod.orderCost,
          holdingRate: prod.holdingRate,
          leadTimeMean: prod.leadTimeMean,
          leadTimeSd: prod.leadTimeSd,
          onHand: prod.onHand,
          onOrder: prod.onOrder,
          packSize: prod.packSize,
          minOrderQty: prod.minOrderQty,
          shelfLifeDays: prod.shelfLifeDays ?? null,
          shortageCost: prod.shortageCost ?? null,
        },
      });
      importedCount++;
    } catch (err: any) {
      rejected.push({
        row: 0,
        field: "sku",
        reason: err?.message || "Database persistence failed",
      });
    }
  }

  res.json({
    imported: importedCount,
    rejected,
  });
});

// ---------------------------------------------------------------------------
// POST /import/promos
// ---------------------------------------------------------------------------
importRouter.post("/promos", upload.single("file"), async (req: Request, res: Response) => {
  const csvContent = getCSVContent(req);
  if (!csvContent) {
    res.status(400).json({ error: "No CSV content provided. Upload a file or send CSV text." });
    return;
  }

  const result = validatePromosCSV(csvContent);
  if (!result.ok) {
    res.status(400).json({
      error: result.error,
      missingColumn: result.missingColumn,
    });
    return;
  }

  let dbProducts: { id: string; sku: string }[] = [];
  try {
    dbProducts = await prisma.product.findMany({ select: { id: true, sku: true } });
  } catch (err: any) {
    res.status(503).json({ error: "Database unavailable", details: err?.message });
    return;
  }

  const productMap = new Map(dbProducts.map((p) => [p.sku.toUpperCase(), p.id]));
  const rejected: RejectedRow[] = [...result.rejected];
  let importedCount = 0;

  for (const promo of result.imported) {
    const productId = productMap.get(promo.sku.toUpperCase());
    if (!productId) {
      rejected.push({
        row: 0,
        field: "sku",
        reason: `Product with SKU '${promo.sku}' does not exist in database`,
      });
      continue;
    }

    try {
      const startDate = new Date(promo.startDate + "T00:00:00.000Z");
      const endDate = new Date(promo.endDate + "T00:00:00.000Z");

      await prisma.promo.create({
        data: {
          productId,
          startDate,
          endDate,
          note: promo.note ?? null,
        },
      });
      importedCount++;
    } catch (err: any) {
      rejected.push({
        row: 0,
        field: "promo",
        reason: err?.message || "Failed to create promo record",
      });
    }
  }

  res.json({
    imported: importedCount,
    rejected,
  });
});

// ---------------------------------------------------------------------------
// POST /import/lead-times
// ---------------------------------------------------------------------------
importRouter.post("/lead-times", upload.single("file"), async (req: Request, res: Response) => {
  const csvContent = getCSVContent(req);
  if (!csvContent) {
    res.status(400).json({ error: "No CSV content provided. Upload a file or send CSV text." });
    return;
  }

  const result = validateLeadTimesCSV(csvContent);
  if (!result.ok) {
    res.status(400).json({
      error: result.error,
      missingColumn: result.missingColumn,
    });
    return;
  }

  let dbProducts: { id: string; sku: string }[] = [];
  try {
    dbProducts = await prisma.product.findMany({ select: { id: true, sku: true } });
  } catch (err: any) {
    res.status(503).json({ error: "Database unavailable", details: err?.message });
    return;
  }

  const productMap = new Map(dbProducts.map((p) => [p.sku.toUpperCase(), p.id]));
  const rejected: RejectedRow[] = [...result.rejected];
  let importedCount = 0;

  for (const lt of result.imported) {
    const productId = productMap.get(lt.sku.toUpperCase());
    if (!productId) {
      rejected.push({
        row: 0,
        field: "sku",
        reason: `Product with SKU '${lt.sku}' does not exist in database`,
      });
      continue;
    }

    try {
      const orderDate = new Date(lt.orderDate + "T00:00:00.000Z");
      const receivedDate = new Date(lt.receivedDate + "T00:00:00.000Z");

      await prisma.leadTimeRecord.create({
        data: {
          productId,
          orderDate,
          receivedDate,
        },
      });
      importedCount++;
    } catch (err: any) {
      rejected.push({
        row: 0,
        field: "leadTime",
        reason: err?.message || "Failed to create lead time record",
      });
    }
  }

  res.json({
    imported: importedCount,
    rejected,
  });
});

// ---------------------------------------------------------------------------
// POST /import/demo
// ---------------------------------------------------------------------------
importRouter.post("/demo", async (_req: Request, res: Response) => {
  try {
    const data = generateDemoData(GENERATOR_SEED);

    // 1. Upsert Products
    for (const prod of data.products) {
      await prisma.product.upsert({
        where: { sku: prod.sku },
        update: {
          name: prod.name,
          unit: prod.unit,
          unitCost: prod.unitCost,
          orderCost: prod.orderCost,
          holdingRate: prod.holdingRate,
          leadTimeMean: prod.leadTimeMean,
          leadTimeSd: prod.leadTimeSd,
          onHand: prod.onHand,
          onOrder: prod.onOrder,
          packSize: prod.packSize,
          minOrderQty: prod.minOrderQty,
          shelfLifeDays: prod.shelfLifeDays ?? null,
          shortageCost: prod.shortageCost ?? null,
        },
        create: {
          sku: prod.sku,
          name: prod.name,
          unit: prod.unit,
          unitCost: prod.unitCost,
          orderCost: prod.orderCost,
          holdingRate: prod.holdingRate,
          leadTimeMean: prod.leadTimeMean,
          leadTimeSd: prod.leadTimeSd,
          onHand: prod.onHand,
          onOrder: prod.onOrder,
          packSize: prod.packSize,
          minOrderQty: prod.minOrderQty,
          shelfLifeDays: prod.shelfLifeDays ?? null,
          shortageCost: prod.shortageCost ?? null,
        },
      });
    }

    const dbProducts = await prisma.product.findMany();
    const productMap = new Map(dbProducts.map((p: any) => [p.sku, p.id]));


    // 2. Upsert Sales
    for (const sale of data.sales) {
      const productId = productMap.get(sale.sku);
      if (!productId) continue;

      const dateObj = new Date(sale.date + "T00:00:00.000Z");
      await prisma.sale.upsert({
        where: {
          productId_date: {
            productId,
            date: dateObj,
          },
        },
        update: {
          units: sale.units,
          onHand: sale.onHand ?? null,
        },
        create: {
          productId,
          date: dateObj,
          units: sale.units,
          onHand: sale.onHand ?? null,
        },
      });
    }

    // 3. Promos
    for (const promo of data.promos) {
      const productId = productMap.get(promo.sku);
      if (!productId) continue;

      const startDate = new Date(promo.startDate + "T00:00:00.000Z");
      const endDate = new Date(promo.endDate + "T00:00:00.000Z");

      await prisma.promo.deleteMany({
        where: { productId, startDate, endDate },
      });

      await prisma.promo.create({
        data: {
          productId,
          startDate,
          endDate,
          note: promo.note ?? null,
        },
      });
    }

    // 4. Lead Times
    for (const lt of data.leadTimes) {
      const productId = productMap.get(lt.sku);
      if (!productId) continue;

      const orderDate = new Date(lt.orderDate + "T00:00:00.000Z");
      const receivedDate = new Date(lt.receivedDate + "T00:00:00.000Z");

      await prisma.leadTimeRecord.deleteMany({
        where: { productId, orderDate, receivedDate },
      });

      await prisma.leadTimeRecord.create({
        data: {
          productId,
          orderDate,
          receivedDate,
        },
      });
    }

    const counts = {
      products: await prisma.product.count(),
      sales: await prisma.sale.count(),
      promos: await prisma.promo.count(),
      leadTimes: await prisma.leadTimeRecord.count(),
    };

    res.json({
      ok: true,
      message: "Demo dataset loaded successfully",
      counts,
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to load demo data",
      details: err?.message,
    });
  }
});
