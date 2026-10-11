// apps/api/src/__tests__/auth.test.ts
// Tests for Authentication and Role-Based Access Control (RBAC)

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Server } from "http";
import type { AddressInfo } from "net";
import app from "../server.js";

describe("Authentication & RBAC API (/api/auth)", () => {
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

  it("GET /api/auth/roles returns the 4 system roles, permissions matrix, and demo accounts", async () => {
    const res = await fetch(`${baseUrl}/api/auth/roles`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.roles).toEqual(["ADMIN", "STOREKEEPER", "ANALYST", "VIEWER"]);
    expect(data.permissionsMatrix.ADMIN.canConfirmOrders).toBe(true);
    expect(data.permissionsMatrix.VIEWER.canConfirmOrders).toBe(false);
    expect(data.demoAccounts.length).toBeGreaterThanOrEqual(4);
  });

  it("POST /api/auth/login successfully logs in demo storekeeper account", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "storekeeper@stocksense.health",
        password: "inventory2026",
      }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.user.email).toBe("storekeeper@stocksense.health");
    expect(data.user.role).toBe("STOREKEEPER");
    expect(data.permissions.canConfirmOrders).toBe(true);
    expect(typeof data.token).toBe("string");
    expect(data.token.split(".").length).toBe(3);
  });

  it("POST /api/auth/login fails on incorrect password", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "storekeeper@stocksense.health",
        password: "wrong-password",
      }),
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("INVALID_CREDENTIALS");
  });

  it("POST /api/auth/register registers a new user with requested role", async () => {
    const uniqueEmail = `pharmacist_${Date.now()}@healthcenter.org`;
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: uniqueEmail,
        password: "securepassword2026",
        name: "Devi Raman",
        role: "STOREKEEPER",
        facilityName: "Sunrise Primary Clinic",
        facilityType: "Primary Health Centre",
      }),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.user.email).toBe(uniqueEmail);
    expect(data.user.role).toBe("STOREKEEPER");
    expect(data.user.name).toBe("Devi Raman");
    expect(typeof data.token).toBe("string");
  });

  it("POST /api/auth/register rejects duplicate email", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "storekeeper@stocksense.health",
        password: "password123",
        name: "Duplicate User",
        role: "STOREKEEPER",
      }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("REGISTRATION_FAILED");
  });

  it("GET /api/auth/me returns authenticated user details when token is valid", async () => {
    // First login as admin
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@stocksense.health",
        password: "admin2026",
      }),
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    // Verify me endpoint
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(meRes.status).toBe(200);
    const meData = await meRes.json();
    expect(meData.ok).toBe(true);
    expect(meData.user.email).toBe("admin@stocksense.health");
    expect(meData.user.role).toBe("ADMIN");
    expect(meData.permissions.canManageUsers).toBe(true);
  });

  it("GET /api/auth/me rejects requests without token or with malformed token", async () => {
    const noTokenRes = await fetch(`${baseUrl}/api/auth/me`);
    expect(noTokenRes.status).toBe(401);

    const badTokenRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: "Bearer bogus-token-data" },
    });
    expect(badTokenRes.status).toBe(401);
  });
});
