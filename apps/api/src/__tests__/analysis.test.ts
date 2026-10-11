import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Server } from "http";
import type { AddressInfo } from "net";
import app from "../server.js";
import { prisma } from "../db.js";

describe("Phase 4: Analysis API (Steps 30 - 32, T64, T65, T67)", () => {
  let server: Server;
  let baseUrl: string;
  let pcmId: string;
  let antId: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });

    // Find demo products
    const pcm = await prisma.product.findUnique({ where: { sku: "PCM-02" } });
    const ant = await prisma.product.findUnique({ where: { sku: "ANT-06" } });

    if (pcm) pcmId = pcm.id;
    if (ant) antId = ant.id;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  describe("Step 30: POST /api/analysis/run for PCM-02", () => {
    it("returns service level 0.95, z = 1.6449, recommendation, cost, and evaluation", async () => {
      const res = await fetch(`${baseUrl}/api/analysis/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: pcmId,
          serviceLevel: 0.95,
          aiEnabled: true,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.service.level).toBe(0.95);
      expect(data.service.z).toBeCloseTo(1.6449, 3);
      expect(data.recommendation).toBeDefined();
      expect(data.recommendation.ss).toBeGreaterThan(0);
      expect(data.recommendation.rop).toBeGreaterThan(0);
      expect(data.recommendation.eoq).toBeGreaterThan(0);
      expect(data.recommendation.q).toBeGreaterThanOrEqual(data.recommendation.eoq);
      expect(data.cost.annual).toBeGreaterThan(0);
      expect(data.evaluation).toBeDefined();
      expect(data.evaluation.baseline).toBeDefined();
      expect(data.evaluation.model).toBeDefined();
    });

    it("T64: returns limitedInformation: true when product history is under 28 days", async () => {
      // Create temporary product with only 14 days of history
      const tempProd = await prisma.product.create({
        data: {
          sku: "TEMP-SHORT-01",
          name: "Short History Product",
          unitCost: 20,
          orderCost: 100,
          leadTimeMean: 3,
          leadTimeSd: 1,
        },
      });

      const today = new Date("2026-10-01T00:00:00.000Z");
      for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setUTCDate(d.getUTCDate() - i);
        await prisma.sale.create({
          data: {
            productId: tempProd.id,
            date: d,
            units: 50,
          },
        });
      }

      const res = await fetch(`${baseUrl}/api/analysis/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: tempProd.id,
          serviceLevel: 0.95,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.limitedInformation).toBe(true);
      expect(data.warnings.some((w: string) => w.toLowerCase().includes("limited information"))).toBe(true);

      // Clean up
      await prisma.product.delete({ where: { id: tempProd.id } });
    });

    it("T65: returns intermittent warning on products with >40% zero sales (ANT-06)", async () => {
      const res = await fetch(`${baseUrl}/api/analysis/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: antId,
          serviceLevel: 0.95,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.warnings.some((w: string) => w.toLowerCase().includes("intermittent"))).toBe(true);
    });
  });

  describe("Step 31: Order status, Days of Cover, and Safety-stock Split", () => {
    it("sets orderNow = true when on-hand is at or below ROP", async () => {
      // Temporary product with onHand = 10, ROP will be > 10
      const tempProd = await prisma.product.create({
        data: {
          sku: "TEMP-LOW-STOCK",
          name: "Low Stock Item",
          unitCost: 10,
          orderCost: 50,
          leadTimeMean: 5,
          leadTimeSd: 1,
          onHand: 10,
          onOrder: 0,
        },
      });

      for (let i = 0; i < 30; i++) {
        const d = new Date("2026-10-01T00:00:00.000Z");
        d.setUTCDate(d.getUTCDate() - i);
        await prisma.sale.create({
          data: {
            productId: tempProd.id,
            date: d,
            units: 50,
          },
        });
      }

      const res = await fetch(`${baseUrl}/api/analysis/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: tempProd.id,
          serviceLevel: 0.95,
        }),
      });

      const data = await res.json();
      expect(data.recommendation.orderNow).toBe(true);
      expect(data.recommendation.daysOfCover).toBeDefined();
      expect(data.recommendation.projectedStockoutDate).not.toBeNull();

      // Clean up
      await prisma.product.delete({ where: { id: tempProd.id } });
    });

    it("ensures safety stock split shares add up to 1.0", async () => {
      const res = await fetch(`${baseUrl}/api/analysis/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: pcmId,
          serviceLevel: 0.95,
        }),
      });

      const data = await res.json();
      const { demand, leadTime } = data.recommendation.split;
      expect(demand + leadTime).toBeCloseTo(1.0, 2);
    });
  });

  describe("Step 32 & T67: API Guard Against NaN and Infinity", () => {
    it("handles zero demand and single-row products with zero NaN or Infinity", async () => {
      const zeroProd = await prisma.product.create({
        data: {
          sku: "TEMP-ZERO-DEMAND",
          name: "Zero Demand Item",
          unitCost: 10,
          orderCost: 50,
          holdingRate: 0,
          leadTimeMean: 0,
          leadTimeSd: 0,
          onHand: 0,
          onOrder: 0,
        },
      });

      await prisma.sale.create({
        data: {
          productId: zeroProd.id,
          date: new Date("2026-10-01T00:00:00.000Z"),
          units: 0,
        },
      });

      const res = await fetch(`${baseUrl}/api/analysis/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: zeroProd.id,
          serviceLevel: 0.95,
        }),
      });

      expect(res.status).toBe(200);
      const jsonStr = await res.text();
      expect(jsonStr.includes("NaN")).toBe(false);
      expect(jsonStr.includes("Infinity")).toBe(false);

      const parsed = JSON.parse(jsonStr);
      expect(parsed.recommendation.ss).toBe(0);
      expect(parsed.recommendation.rop).toBe(0);

      // Clean up
      await prisma.product.delete({ where: { id: zeroProd.id } });
    });
  });

  describe("Sales and Anomalies Endpoints", () => {
    it("GET /api/products/:id/sales returns chronological sales list", async () => {
      const res = await fetch(`${baseUrl}/api/products/${pcmId}/sales`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.sales.length).toBeGreaterThanOrEqual(100);
    });

    it("GET /api/products/:id/anomalies returns flagged anomaly days", async () => {
      const res = await fetch(`${baseUrl}/api/products/${pcmId}/anomalies`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.anomalies)).toBe(true);
    });
  });
});
