// apps/api/src/__tests__/scenarios.test.ts
// Tests for Phase 5 Scenario Lab (Steps 41 - 43, T47, T48, T53, T66)

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Server } from "http";
import type { AddressInfo } from "net";
import app from "../server.js";

describe("Phase 5: Scenario Lab API (Steps 41 - 43, T47, T48, T53, T66)", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  describe("Step 41 & T53: POST /api/scenarios/run worked example", () => {
    it("surge 40% and delay 3 days returns ROP 680 -> 1385 and old-policy risk ~99.7%", async () => {
      const res = await fetch(`${baseUrl}/api/scenarios/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "PCM-02",
          meanDemand: 100,
          sdDemand: 20,
          leadTimeMean: 5,
          leadTimeSd: 1,
          serviceLevel: 0.95,
          unitCost: 50,
          orderCost: 200,
          surgePct: 40,
          delayDays: 3,
          confirmed: true,
        }),
      });

      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.before).toBeDefined();
      expect(data.after).toBeDefined();

      // Before: ROP should be 680
      expect(data.before.rop).toBe(680);

      // After: ROP should be 1385
      expect(data.after.rop).toBe(1385);

      // Old policy under new conditions: stockout risk around 0.997 (99.7%)
      expect(data.oldPolicyUnderNewConditions).toBeDefined();
      expect(data.oldPolicyUnderNewConditions.stockoutProbability).toBeCloseTo(0.997, 2);

      // Monte Carlo simulation agreement line
      expect(data.monteCarlo).toBeDefined();
      expect(data.monteCarlo.trials).toBe(10000);
      expect(data.monteCarlo.agree).toBe(true);
      expect(
        Math.abs(data.monteCarlo.stockoutProbability - data.oldPolicyUnderNewConditions.stockoutProbability)
      ).toBeLessThan(0.03);
    });

    it("T53: zero surge and zero delay returns identical recommendations before and after", async () => {
      const res = await fetch(`${baseUrl}/api/scenarios/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "PCM-02",
          meanDemand: 100,
          sdDemand: 20,
          leadTimeMean: 5,
          leadTimeSd: 1,
          serviceLevel: 0.95,
          surgePct: 0,
          delayDays: 0,
          confirmed: true,
        }),
      });

      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.after.rop).toBe(data.before.rop);
      expect(data.after.ss).toBe(data.before.ss);
      expect(data.after.eoq).toBe(data.before.eoq);
    });
  });

  describe("T66: Confirmation requirement for text-based scenarios", () => {
    it("rejects running a text scenario without confirmed: true", async () => {
      const res = await fetch(`${baseUrl}/api/scenarios/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "PCM-02",
          surgePct: 40,
          delayDays: 3,
          fromText: true,
          confirmed: false,
        }),
      });

      expect(res.status).toBe(400);
      const data: any = await res.json();
      expect(data.error).toContain("confirmed: true");
    });
  });

  describe("Step 47, T47 & T48: POST /api/scenarios/parse natural language parsing", () => {
    it("T47: parses 'supplier 4 days late, flu season +40%' to delay 4 and surge 40", async () => {
      const res = await fetch(`${baseUrl}/api/scenarios/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "supplier 4 days late, flu season +40%",
          aiEnabled: false, // tests regex deterministic fallback
        }),
      });

      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.delayDays).toBe(4);
      expect(data.surgePct).toBe(40);
      expect(data.decisionPath).toBe("RULES");
    });

    it("T48: text with no numbers gives an empty proposal (0, 0)", async () => {
      const res = await fetch(`${baseUrl}/api/scenarios/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "expecting severe weather conditions next month with delivery issues",
          aiEnabled: false,
        }),
      });

      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.delayDays).toBe(0);
      expect(data.surgePct).toBe(0);
    });

    it("handles negative surge e.g. 'demand drops 20%'", async () => {
      const res = await fetch(`${baseUrl}/api/scenarios/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "summer slowdown demand drops 20%",
          aiEnabled: false,
        }),
      });

      expect(res.status).toBe(200);
      const data: any = await res.json();
      expect(data.surgePct).toBe(-20);
    });
  });
});
