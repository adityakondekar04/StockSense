// apps/api/src/products/routes.ts
// Product CRUD endpoints: GET, POST, PUT, DELETE /products

import { Router, Request, Response } from "express";
import { prisma } from "../db.js";

import { ProductInputSchema } from "@stocksense/core";

export const productsRouter = Router();

// ---------------------------------------------------------------------------
// GET /products - List all products
// ---------------------------------------------------------------------------
productsRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { sku: "asc" },
      include: {
        _count: {
          select: {
            sales: true,
            promos: true,
            leadTimes: true,
            anomalies: true,
          },
        },
      },
    });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch products", details: err?.message });
  }
});

// ---------------------------------------------------------------------------
// GET /products/:id - Get product by ID or SKU
// ---------------------------------------------------------------------------
productsRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { sku: id }],
      },
      include: {
        _count: {
          select: {
            sales: true,
            promos: true,
            leadTimes: true,
            anomalies: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: `Product '${id}' not found` });
      return;
    }

    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch product", details: err?.message });
  }
});

// ---------------------------------------------------------------------------
// POST /products - Create product (Manual entry path)
// ---------------------------------------------------------------------------
productsRouter.post("/", async (req: Request, res: Response) => {
  const parseResult = ProductInputSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: "Validation error",
      details: parseResult.error.errors.map((e: any) => ({
        path: e.path.join("."),
        message: e.message,
      })),

    });
    return;
  }

  const data = parseResult.data;

  try {
    const existing = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existing) {
      res.status(400).json({
        error: `Product with SKU '${data.sku}' already exists`,
      });
      return;
    }

    const created = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        unit: data.unit,
        unitCost: data.unitCost,
        orderCost: data.orderCost,
        holdingRate: data.holdingRate,
        leadTimeMean: data.leadTimeMean,
        leadTimeSd: data.leadTimeSd,
        onHand: data.onHand,
        onOrder: data.onOrder,
        packSize: data.packSize,
        minOrderQty: data.minOrderQty,
        shelfLifeDays: data.shelfLifeDays ?? null,
        shortageCost: data.shortageCost ?? null,
      },
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create product", details: err?.message });
  }
});

// ---------------------------------------------------------------------------
// PUT /products/:id - Update product
// ---------------------------------------------------------------------------
const ProductUpdateSchema = ProductInputSchema.partial();

productsRouter.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const parseResult = ProductUpdateSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      error: "Validation error",
      details: parseResult.error.errors.map((e: any) => ({
        path: e.path.join("."),
        message: e.message,
      })),

    });
    return;
  }

  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { sku: id }] },
    });

    if (!product) {
      res.status(404).json({ error: `Product '${id}' not found` });
      return;
    }

    const data = parseResult.data;
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        ...(data.sku !== undefined ? { sku: data.sku } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.unit !== undefined ? { unit: data.unit } : {}),
        ...(data.unitCost !== undefined ? { unitCost: data.unitCost } : {}),
        ...(data.orderCost !== undefined ? { orderCost: data.orderCost } : {}),
        ...(data.holdingRate !== undefined ? { holdingRate: data.holdingRate } : {}),
        ...(data.leadTimeMean !== undefined ? { leadTimeMean: data.leadTimeMean } : {}),
        ...(data.leadTimeSd !== undefined ? { leadTimeSd: data.leadTimeSd } : {}),
        ...(data.onHand !== undefined ? { onHand: data.onHand } : {}),
        ...(data.onOrder !== undefined ? { onOrder: data.onOrder } : {}),
        ...(data.packSize !== undefined ? { packSize: data.packSize } : {}),
        ...(data.minOrderQty !== undefined ? { minOrderQty: data.minOrderQty } : {}),
        ...(data.shelfLifeDays !== undefined ? { shelfLifeDays: data.shelfLifeDays ?? null } : {}),
        ...(data.shortageCost !== undefined ? { shortageCost: data.shortageCost ?? null } : {}),
      },
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update product", details: err?.message });
  }
});

// ---------------------------------------------------------------------------
// DELETE /products/:id - Delete product (Cascades automatically)
// ---------------------------------------------------------------------------
productsRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { sku: id }] },
    });

    if (!product) {
      res.status(404).json({ error: `Product '${id}' not found` });
      return;
    }

    await prisma.product.delete({
      where: { id: product.id },
    });

    res.json({
      ok: true,
      message: `Product '${product.sku}' and associated records deleted successfully`,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete product", details: err?.message });
  }
});
