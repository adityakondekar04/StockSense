// apps/api/prisma/seed.ts
// Idempotent seeding script for StockSense demo data

import { PrismaClient } from "@prisma/client";
import { generateDemoData, GENERATOR_SEED } from "../../../data/generator.ts";

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log(`Starting seed with seed ${GENERATOR_SEED}...`);
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

  // Load product IDs map
  const dbProducts = await prisma.product.findMany();
  const productMap = new Map(dbProducts.map((p) => [p.sku, p.id]));

  // 2. Upsert Sales
  console.log(`Upserting ${data.sales.length} sales rows...`);
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

  // 3. Promos (clear and recreate for demo consistency)
  for (const promo of data.promos) {
    const productId = productMap.get(promo.sku);
    if (!productId) continue;

    const startDate = new Date(promo.startDate + "T00:00:00.000Z");
    const endDate = new Date(promo.endDate + "T00:00:00.000Z");

    // Clean existing duplicate promos
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

  // 4. Lead Times (clear and recreate)
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

  console.log("Seeding complete! Current DB counts:", counts);
  return counts;
}

seedDatabase()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

