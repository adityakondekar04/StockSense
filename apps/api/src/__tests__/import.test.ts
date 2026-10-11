// apps/api/src/__tests__/import.test.ts
// Unit and route tests for T60-T63 and CSV import validation

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Server } from "http";
import type { AddressInfo } from "net";
import app from "../server.js";
import {
  validateSalesCSV,
  validateProductsCSV,
  validatePromosCSV,
  validateLeadTimesCSV,
} from "../import/validators.js";


describe("CSV Validators (Unit)", () => {
  // T60: CSV missing a column -> naming the column
  it("T60: rejects CSV missing a required column with its name", () => {
    const csvMissingUnits = "date,sku\n2026-08-01,PCM-02\n";
    const result = validateSalesCSV(csvMissingUnits);
    expect(result.ok).toBe(false);
    expect(result.missingColumn).toBe("units");
    expect(result.error).toContain("Missing required column: units");

    const csvMissingDate = "sku,units\nPCM-02,50\n";
    const result2 = validateSalesCSV(csvMissingDate);
    expect(result2.ok).toBe(false);
    expect(result2.missingColumn).toBe("date");
  });

  // T61: Row with bad date and row with text units -> both rejected with row numbers; valid rows reported
  it("T61: rejects row with bad date and row with text units with row numbers", () => {
    const csv = [
      "date,sku,units",
      "2026-08-01,PCM-02,100", // Row 2: Valid
      "bad-date,PCM-02,50",    // Row 3: Bad date
      "2026-08-03,PCM-02,abc", // Row 4: Text units ("not a number: 'abc'")
      "2026-08-04,PCM-02,25",  // Row 5: Valid
    ].join("\n");

    const result = validateSalesCSV(csv);
    expect(result.ok).toBe(true);
    expect(result.imported).toHaveLength(2);
    expect(result.imported[0].units).toBe(100);
    expect(result.imported[1].units).toBe(25);

    expect(result.rejected).toHaveLength(2);
    expect(result.rejected[0]).toEqual({
      row: 3,
      field: "date",
      reason: "Invalid date format: 'bad-date'. Expected YYYY-MM-DD",
    });
    expect(result.rejected[1]).toEqual({
      row: 4,
      field: "units",
      reason: "not a number: 'abc'",
    });
  });

  // T62: Duplicate (sku, date) -> rejected with reason
  it("T62: rejects duplicate (sku, date) with specific reason and keeps first occurrence", () => {
    const csv = [
      "date,sku,units",
      "2026-08-01,PCM-02,100", // Row 2: first occurrence
      "2026-08-01,PCM-02,150", // Row 3: duplicate
      "2026-08-02,PCM-02,50",  // Row 4: distinct date
    ].join("\n");

    const result = validateSalesCSV(csv);
    expect(result.ok).toBe(true);
    expect(result.imported).toHaveLength(2);
    expect(result.imported[0].units).toBe(100);
    expect(result.imported[1].units).toBe(50);

    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].row).toBe(3);
    expect(result.rejected[0].field).toBe("sku,date");
    expect(result.rejected[0].reason).toContain("Duplicate sale entry for SKU 'PCM-02'");
  });

  // T63: Negative lead time in products CSV -> rejected
  it("T63: rejects negative lead time in products CSV with specific row and field", () => {
    const csv = [
      "sku,name,unit,unit_cost,order_cost,holding_rate,lead_time_mean,lead_time_sd",
      "VALID-01,Valid Drug,units,10,100,0.2,4,1",
      "BAD-LT,Bad Lead Time,units,10,100,0.2,-5,1",
    ].join("\n");

    const result = validateProductsCSV(csv);
    expect(result.ok).toBe(true);
    expect(result.imported).toHaveLength(1);
    expect(result.imported[0].sku).toBe("VALID-01");

    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].row).toBe(3);
    expect(result.rejected[0].field).toBe("leadTimeMean");
    expect(result.rejected[0].reason).toContain("Lead time mean must be non-negative");
  });

  it("validates promos CSV: rejects end date before start date", () => {
    const csv = [
      "sku,start_date,end_date,note",
      "PCM-02,2026-08-10,2026-08-05,Reversed dates",
    ].join("\n");

    const result = validatePromosCSV(csv);
    expect(result.ok).toBe(true);
    expect(result.imported).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].field).toBe("endDate");
    expect(result.rejected[0].reason).toContain("End date must be on or after start date");
  });

  it("validates lead times CSV: rejects received date before order date", () => {
    const csv = [
      "sku,order_date,received_date",
      "PCM-02,2026-08-10,2026-08-02",
    ].join("\n");

    const result = validateLeadTimesCSV(csv);
    expect(result.ok).toBe(true);
    expect(result.imported).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].field).toBe("receivedDate");
    expect(result.rejected[0].reason).toContain("Received date must be on or after order date");
  });
});

describe("Import API Endpoints (Integration)", () => {
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

  it("POST /api/import/sales returns 400 when CSV is missing a required column (T60)", async () => {
    const res = await fetch(`${baseUrl}/api/import/sales`, {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: "date,sku\n2026-08-01,PCM-02\n",
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.missingColumn).toBe("units");
    expect(data.error).toContain("Missing required column: units");
  });

  it("POST /api/import/products validates input and reports rejected rows (T63)", async () => {
    const csv = [
      "sku,name,unit,unit_cost,order_cost,holding_rate,lead_time_mean,lead_time_sd",
      "NEG-01,Negative LT,units,10,100,0.2,-3,1",
    ].join("\n");

    const res = await fetch(`${baseUrl}/api/import/products`, {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: csv,
    });

    // Should return 200 with 0 imported and 1 rejected (or 503 if DB offline)
    if (res.status === 200) {
      const data = await res.json();
      expect(data.imported).toBe(0);
      expect(data.rejected).toHaveLength(1);
      expect(data.rejected[0].field).toBe("leadTimeMean");
    } else {
      expect([200, 503]).toContain(res.status);
    }
  });
});
