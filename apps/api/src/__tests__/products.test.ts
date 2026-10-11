// apps/api/src/__tests__/products.test.ts
// Unit and integration tests for Product CRUD endpoints

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { Server } from "http";
import type { AddressInfo } from "net";

// In-memory products store for mocking Prisma in unit/integration tests
const mockProducts = new Map<string, any>();

vi.mock("../db", () => {
  return {
    prisma: {
      product: {
        findMany: vi.fn(async () => Array.from(mockProducts.values())),
        findFirst: vi.fn(async ({ where }: { where: { OR: Array<{ id?: string; sku?: string }> } }) => {
          const target = where.OR[0]?.id || where.OR[1]?.sku;
          for (const p of mockProducts.values()) {
            if (p.id === target || p.sku === target) return p;
          }
          return null;
        }),
        findUnique: vi.fn(async ({ where }: { where: { sku?: string; id?: string } }) => {
          if (where.sku) {
            for (const p of mockProducts.values()) {
              if (p.sku === where.sku) return p;
            }
          }
          if (where.id) return mockProducts.get(where.id) || null;
          return null;
        }),
        create: vi.fn(async ({ data }: { data: any }) => {
          const id = "prod_" + Math.random().toString(36).substring(2, 9);
          const record = { id, createdAt: new Date(), ...data };
          mockProducts.set(id, record);
          return record;
        }),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: any }) => {
          const existing = mockProducts.get(where.id);
          if (!existing) throw new Error("Record to update not found.");
          const updated = { ...existing, ...data };
          mockProducts.set(where.id, updated);
          return updated;
        }),
        delete: vi.fn(async ({ where }: { where: { id: string } }) => {
          const existing = mockProducts.get(where.id);
          if (!existing) throw new Error("Record to delete not found.");
          mockProducts.delete(where.id);
          return existing;
        }),
      },
    },
  };
});

// Import server after mocking db
import app from "../server.js";


describe("Products API Endpoints (CRUD)", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    mockProducts.clear();
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

  it("POST /api/products returns 400 on missing or invalid fields", async () => {
    const invalidBody = {
      sku: "",
      name: "Missing required fields",
      unitCost: -10, // Invalid: negative
    };

    const res = await fetch(`${baseUrl}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidBody),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Validation error");
    expect(Array.isArray(data.details)).toBe(true);
  });

  it("POST /api/products creates a product successfully (201)", async () => {
    const newProduct = {
      sku: "TEST-01",
      name: "Test Syringe",
      unit: "pcs",
      unitCost: 15,
      orderCost: 50,
      holdingRate: 0.2,
      leadTimeMean: 5,
      leadTimeSd: 1,
      onHand: 100,
      onOrder: 0,
      packSize: 10,
      minOrderQty: 20,
    };

    const res = await fetch(`${baseUrl}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });

    expect(res.status).toBe(201);
    const created = await res.json();
    expect(created.sku).toBe("TEST-01");
    expect(created.id).toBeDefined();
    expect(created.leadTimeMean).toBe(5);
  });

  it("POST /api/products rejects duplicate SKU (400)", async () => {
    const duplicateProduct = {
      sku: "TEST-01",
      name: "Duplicate Syringe",
      unitCost: 15,
      orderCost: 50,
      leadTimeMean: 5,
      leadTimeSd: 1,
    };

    const res = await fetch(`${baseUrl}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(duplicateProduct),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("already exists");
  });

  it("GET /api/products lists all products", async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    expect(res.status).toBe(200);
    const list = await res.json();
    expect(Array.isArray(list)).toBe(true);
    expect(list.some((p: any) => p.sku === "TEST-01")).toBe(true);
  });

  it("GET /api/products/:id finds product by SKU or ID", async () => {
    const res = await fetch(`${baseUrl}/api/products/TEST-01`);
    expect(res.status).toBe(200);
    const prod = await res.json();
    expect(prod.sku).toBe("TEST-01");
  });

  it("GET /api/products/:id returns 404 for unknown product", async () => {
    const res = await fetch(`${baseUrl}/api/products/NON_EXISTENT_SKU_12345`);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("not found");
  });

  it("PUT /api/products/:id updates an existing product", async () => {
    const res = await fetch(`${baseUrl}/api/products/TEST-01`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Syringe Name", onHand: 250 }),
    });

    expect(res.status).toBe(200);
    const updated = await res.json();
    expect(updated.name).toBe("Updated Syringe Name");
    expect(updated.onHand).toBe(250);
  });

  it("PUT /api/products/:id returns 404 for unknown product", async () => {
    const res = await fetch(`${baseUrl}/api/products/NON_EXISTENT_SKU_12345`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Name" }),
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("not found");
  });

  it("DELETE /api/products/:id removes a product", async () => {
    const res = await fetch(`${baseUrl}/api/products/TEST-01`, {
      method: "DELETE",
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);

    // Verify it is gone
    const checkRes = await fetch(`${baseUrl}/api/products/TEST-01`);
    expect(checkRes.status).toBe(404);
  });

  it("DELETE /api/products/:id returns 404 for unknown product", async () => {
    const res = await fetch(`${baseUrl}/api/products/NON_EXISTENT_SKU_12345`, {
      method: "DELETE",
    });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("not found");
  });
});
