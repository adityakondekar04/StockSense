// apps/api/prisma/seed.ts
// Comprehensive, idempotent seeding script for all 16 StockSense PostgreSQL tables

import { PrismaClient } from "@prisma/client";
import { generateDemoData, GENERATOR_SEED } from "../../../data/generator";
import { hashPassword, createAuthToken, hashToken } from "../src/auth/service";
import { executeAnalysis } from "../src/analysis/run";

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log(`Starting comprehensive StockSense DB seed (seed=${GENERATOR_SEED})...`);
  const data = generateDemoData(GENERATOR_SEED);

  // ---------------------------------------------------------------------------
  // 1. Upsert Facilities
  // ---------------------------------------------------------------------------
  console.log("1. Seeding Facilities...");
  const facilitiesData = [
    {
      code: "FAC-CITYCARE-01",
      name: "CityCare Community Pharmacy",
      facilityType: "Community Pharmacy",
      location: "Sector 14, Pune Central",
      defaultServiceLevel: 0.95,
      aiEnabled: true,
      includeUnknowns: false,
    },
    {
      code: "FAC-REGIONAL-02",
      name: "Regional Health Network Store",
      facilityType: "Hospital Supply Store",
      location: "Metro Medical Hub, Block B",
      defaultServiceLevel: 0.99,
      aiEnabled: true,
      includeUnknowns: false,
    },
    {
      code: "FAC-PHC-04",
      name: "Primary Healthcare Centre #4",
      facilityType: "Primary Health Centre",
      location: "North District Rural Health Zone",
      defaultServiceLevel: 0.95,
      aiEnabled: true,
      includeUnknowns: true,
    },
    {
      code: "FAC-OVERSIGHT-09",
      name: "State Health Oversight Board",
      facilityType: "Regulatory Authority",
      location: "Directorate of Medical Services",
      defaultServiceLevel: 0.95,
      aiEnabled: false,
      includeUnknowns: false,
    },
  ];

  const facilityMap = new Map<string, string>();
  for (const fac of facilitiesData) {
    const record = await prisma.facility.upsert({
      where: { code: fac.code },
      update: fac,
      create: fac,
    });
    facilityMap.set(fac.name, record.id);
  }

  // ---------------------------------------------------------------------------
  // 2. Upsert Users & Active UserSessions
  // ---------------------------------------------------------------------------
  console.log("2. Seeding Users & Sessions...");
  const usersData = [
    {
      id: "usr_storekeeper_01",
      email: "storekeeper@stocksense.health",
      passwordHash: hashPassword("inventory2026"),
      name: "Dr. Aditi Sharma",
      role: "STOREKEEPER" as const,
      facilityName: "CityCare Community Pharmacy",
      facilityType: "Community Pharmacy",
    },
    {
      id: "usr_admin_01",
      email: "admin@stocksense.health",
      passwordHash: hashPassword("admin2026"),
      name: "Marcus Vance",
      role: "ADMIN" as const,
      facilityName: "Regional Health Network Store",
      facilityType: "Hospital Supply Store",
    },
    {
      id: "usr_analyst_01",
      email: "analyst@stocksense.health",
      passwordHash: hashPassword("analyst2026"),
      name: "Elena Rostova",
      role: "ANALYST" as const,
      facilityName: "Primary Healthcare Centre #4",
      facilityType: "Primary Health Centre",
    },
    {
      id: "usr_auditor_01",
      email: "auditor@stocksense.health",
      passwordHash: hashPassword("auditor2026"),
      name: "Inspection Officer Patel",
      role: "VIEWER" as const,
      facilityName: "State Health Oversight Board",
      facilityType: "Regulatory Authority",
    },
    {
      id: "usr_pharmacist_02",
      email: "rohan.deshmukh@stocksense.health",
      passwordHash: hashPassword("pharmacy2026"),
      name: "Rohan Deshmukh",
      role: "STOREKEEPER" as const,
      facilityName: "CityCare Community Pharmacy",
      facilityType: "Community Pharmacy",
    },
  ];

  for (const u of usersData) {
    const facilityId = facilityMap.get(u.facilityName) ?? null;
    const userRecord = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        facilityName: u.facilityName,
        facilityType: u.facilityType,
        facilityId,
        isActive: true,
        lastLoginAt: new Date(),
      },
      create: {
        id: u.id,
        email: u.email,
        passwordHash: u.passwordHash,
        name: u.name,
        role: u.role,
        facilityName: u.facilityName,
        facilityType: u.facilityType,
        facilityId,
        isActive: true,
        lastLoginAt: new Date(),
      },
    });

    // Seed an active session for the primary demo users
    const sampleToken = createAuthToken({
      id: userRecord.id,
      email: userRecord.email,
      role: userRecord.role,
      name: userRecord.name,
    });
    const tokenHash = hashToken(sampleToken);

    await prisma.userSession.upsert({
      where: { tokenHash },
      update: {
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
      create: {
        userId: userRecord.id,
        tokenHash,
        ipAddress: "127.0.0.1",
        userAgent: "StockSense Web Client / Seed Session",
        expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Upsert Suppliers
  // ---------------------------------------------------------------------------
  console.log("3. Seeding Suppliers...");
  const suppliersData = [
    {
      code: "SUP-APEX-BIO",
      name: "Apex BioPharma Distributors",
      contactEmail: "orders@apexbiopharma.example",
      phone: "+91-20-4100-8801",
      reliabilityScore: 0.96,
      avgLeadTimeDays: 5.0,
      leadTimeSdDays: 1.5,
    },
    {
      code: "SUP-MEDLINE-COLD",
      name: "MedLine Cold-Chain Logistics",
      contactEmail: "coldchain@medline.example",
      phone: "+91-22-6720-1920",
      reliabilityScore: 0.91,
      avgLeadTimeDays: 7.0,
      leadTimeSdDays: 2.0,
    },
    {
      code: "SUP-NOVA-SURG",
      name: "NovaCare Consumables & Diagnostics",
      contactEmail: "dispatch@novacare.example",
      phone: "+91-80-3391-4402",
      reliabilityScore: 0.98,
      avgLeadTimeDays: 3.5,
      leadTimeSdDays: 0.8,
    },
    {
      code: "SUP-LIFECARE-GEN",
      name: "LifeCare Generics Supply Co.",
      contactEmail: "supply@lifecare.example",
      phone: "+91-40-2980-5510",
      reliabilityScore: 0.89,
      avgLeadTimeDays: 6.0,
      leadTimeSdDays: 1.5,
    },
  ];

  const supplierList = [];
  for (const sup of suppliersData) {
    const rec = await prisma.supplier.upsert({
      where: { code: sup.code },
      update: sup,
      create: sup,
    });
    supplierList.push(rec);
  }

  // ---------------------------------------------------------------------------
  // 4. Upsert Products
  // ---------------------------------------------------------------------------
  console.log("4. Seeding Products...");
  const defaultFacilityId = facilityMap.get("CityCare Community Pharmacy") ?? null;

  for (let i = 0; i < data.products.length; i++) {
    const prod = data.products[i];
    const supplier = supplierList[i % supplierList.length];
    const category =
      prod.sku.includes("INS")
        ? "Cold-Chain Biologics"
        : prod.sku.includes("AMX") || prod.sku.includes("AZI")
        ? "Antibiotics"
        : prod.sku.includes("GLV") || prod.sku.includes("MASK")
        ? "Medical Consumables"
        : "Essential Medicine";

    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        category,
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
        supplierId: supplier.id,
        facilityId: defaultFacilityId,
      },
      create: {
        sku: prod.sku,
        name: prod.name,
        category,
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
        supplierId: supplier.id,
        facilityId: defaultFacilityId,
      },
    });
  }

  const dbProducts = await prisma.product.findMany();
  const productMap = new Map(dbProducts.map((p) => [p.sku, p.id]));

  // ---------------------------------------------------------------------------
  // 5. Upsert Sales
  // ---------------------------------------------------------------------------
  console.log(`5. Upserting ${data.sales.length} daily Sales rows...`);
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

  // ---------------------------------------------------------------------------
  // 6. Upsert Promos
  // ---------------------------------------------------------------------------
  console.log("6. Seeding Promotional Windows...");
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

  // ---------------------------------------------------------------------------
  // 7. Upsert LeadTimeRecords
  // ---------------------------------------------------------------------------
  console.log("7. Seeding Lead Time Delivery Records...");
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

  // ---------------------------------------------------------------------------
  // 8. Execute Analysis Runs & Populate Anomalies Table
  // ---------------------------------------------------------------------------
  console.log("8. Running Analysis & Populating Anomalies and AnalysisRuns...");
  for (const prod of dbProducts) {
    try {
      await executeAnalysis({
        productId: prod.id,
        serviceLevel: 0.95,
        aiEnabled: false,
        includeUnknowns: false,
        windowDays: 90,
        horizonDays: 14,
      });
    } catch (err) {
      console.warn(`Analysis seed skipped for ${prod.sku}:`, err);
    }
  }

  // ---------------------------------------------------------------------------
  // 9. Seed Purchase Orders & Inventory Transactions
  // ---------------------------------------------------------------------------
  console.log("9. Seeding Purchase Orders & Inventory Transactions...");
  await prisma.purchaseOrder.deleteMany({});
  await prisma.inventoryTransaction.deleteMany({});

  for (let i = 0; i < Math.min(dbProducts.length, 6); i++) {
    const prod = dbProducts[i];
    const orderNumber = `PO-2026-${String(1001 + i)}`;
    const qty = Math.max(prod.minOrderQty, prod.packSize * 15);
    const statuses = ["ORDERED", "IN_TRANSIT", "RECEIVED", "PENDING_APPROVAL"] as const;
    const status = statuses[i % statuses.length];

    await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        productId: prod.id,
        supplierId: prod.supplierId,
        orderedByUserId: "usr_storekeeper_01",
        status,
        quantityUnits: qty,
        unitCost: prod.unitCost,
        totalCost: Number((qty * prod.unitCost).toFixed(2)),
        reorderPointAtOrder: Math.round(prod.leadTimeMean * 45 + 65),
        safetyStockAtOrder: 65,
        eoqAtOrder: qty,
        expectedDeliveryDate: new Date(Date.now() + Math.round(prod.leadTimeMean) * 86400000),
        receivedAt: status === "RECEIVED" ? new Date(Date.now() - 2 * 86400000) : null,
        notes: `Automated EOQ replenishment order for ${prod.sku} (${prod.name})`,
      },
    });

    await prisma.inventoryTransaction.create({
      data: {
        productId: prod.id,
        userId: "usr_storekeeper_01",
        type: status === "RECEIVED" ? "RESTOCK_RECEIVED" : "INITIAL_SEED",
        quantityDelta: qty,
        onHandBefore: Math.max(0, prod.onHand - qty),
        onHandAfter: prod.onHand,
        referenceId: orderNumber,
        note: `Stock ledger entry linked to ${orderNumber}`,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 10. Seed Scenarios, CsvImportBatches, PolicySettings & AuditLogs
  // ---------------------------------------------------------------------------
  console.log("10. Seeding Scenarios, CsvImportBatches, PolicySettings & AuditLogs...");
  await prisma.scenario.deleteMany({});
  if (dbProducts[0]) {
    await prisma.scenario.createMany({
      data: [
        {
          productId: dbProducts[0].id,
          surgePct: 35,
          delayDays: 3,
          source: "manual",
          rawText: "Monsoon fever surge +35% demand with 3-day supplier transit delay",
          confirmed: true,
          resultJson: {
            beforeRop: 410,
            afterRop: 742,
            oldPolicyStockoutProbability: 0.412,
          },
        },
        {
          productId: dbProducts[1]?.id || dbProducts[0].id,
          surgePct: 50,
          delayDays: 4,
          source: "text_llm",
          rawText: "Regional cold-chain bottleneck delaying deliveries by 4 days during 50% demand spike",
          confirmed: true,
          resultJson: {
            beforeRop: 295,
            afterRop: 580,
            oldPolicyStockoutProbability: 0.538,
          },
        },
      ],
    });
  }

  await prisma.csvImportBatch.deleteMany({});
  await prisma.csvImportBatch.createMany({
    data: [
      {
        schemaType: "PRODUCTS",
        fileName: "products_master_catalog.csv",
        uploadedByUserId: "usr_admin_01",
        totalRows: dbProducts.length,
        importedRows: dbProducts.length,
        rejectedRows: 0,
        anomaliesDetected: 0,
        status: "COMPLETED",
      },
      {
        schemaType: "SALES",
        fileName: "sales_90day_telemetry.csv",
        uploadedByUserId: "usr_storekeeper_01",
        totalRows: data.sales.length,
        importedRows: data.sales.length,
        rejectedRows: 0,
        anomaliesDetected: 6,
        status: "COMPLETED",
      },
      {
        schemaType: "PROMOS",
        fileName: "health_camp_promotions.csv",
        uploadedByUserId: "usr_analyst_01",
        totalRows: data.promos.length,
        importedRows: data.promos.length,
        rejectedRows: 0,
        anomaliesDetected: 0,
        status: "COMPLETED",
      },
      {
        schemaType: "LEAD_TIMES",
        fileName: "supplier_delivery_logs.csv",
        uploadedByUserId: "usr_storekeeper_01",
        totalRows: data.leadTimes.length,
        importedRows: data.leadTimes.length,
        rejectedRows: 0,
        anomaliesDetected: 0,
        status: "COMPLETED",
      },
    ],
  });

  const defaultPolicies = [
    {
      key: "target_service_level",
      valueJson: { default: 0.95, allowed: [0.9, 0.95, 0.99], zScores: { "0.90": 1.2816, "0.95": 1.6449, "0.99": 2.3263 } },
      description: "Target cycle service level (CSL) and normal quantile Z mapping",
      updatedByUserId: "usr_admin_01",
    },
    {
      key: "anomaly_detection_threshold",
      valueJson: { method: "MODIFIED_Z_SCORE_MAD", threshold: 3.5, scaleConstant: 0.6745, fitWindow: "training_only" },
      description: "Iglewicz & Hoaglin (1993) Modified Z-Score anomaly firewall configuration",
      updatedByUserId: "usr_admin_01",
    },
    {
      key: "ai_guardrail_policy",
      valueJson: { aiEnabled: true, maxAdjustmentClampPct: 30, fallbackMode: "RULES" },
      description: "AI suggestion clamping bounds and deterministic fallback policy",
      updatedByUserId: "usr_admin_01",
    },
  ];

  for (const pol of defaultPolicies) {
    await prisma.policySetting.upsert({
      where: { key: pol.key },
      update: {
        valueJson: pol.valueJson,
        description: pol.description,
        updatedByUserId: pol.updatedByUserId,
      },
      create: pol,
    });
  }

  await prisma.auditLog.create({
    data: {
      kind: "import",
      userId: "usr_admin_01",
      decisionPath: "RULES",
      detailJson: {
        action: "database_seed_completed",
        seed: GENERATOR_SEED,
        productsCount: dbProducts.length,
        salesCount: data.sales.length,
      },
    },
  });

  const counts = {
    facilities: await prisma.facility.count(),
    users: await prisma.user.count(),
    userSessions: await prisma.userSession.count(),
    suppliers: await prisma.supplier.count(),
    products: await prisma.product.count(),
    sales: await prisma.sale.count(),
    promos: await prisma.promo.count(),
    leadTimes: await prisma.leadTimeRecord.count(),
    anomalies: await prisma.anomaly.count(),
    analysisRuns: await prisma.analysisRun.count(),
    purchaseOrders: await prisma.purchaseOrder.count(),
    inventoryTransactions: await prisma.inventoryTransaction.count(),
    scenarios: await prisma.scenario.count(),
    csvImportBatches: await prisma.csvImportBatch.count(),
    policySettings: await prisma.policySetting.count(),
    auditLogs: await prisma.auditLog.count(),
  };

  console.log("Seeding complete! Current DB table row counts:", counts);
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
