// data/generator.ts
// Seeded fictional dataset generator for StockSense (seed: 20261011)

import * as fs from "fs";
import * as path from "path";
import { mulberry32, boxMuller } from "../packages/core/src/simulate";
import type { ProductInput, SaleRow, PromoRow, LeadTimeRow } from "../packages/core/src/schemas";

export const GENERATOR_SEED = 20261011;
export const TOTAL_DAYS = 150;
export const END_DATE_STR = "2026-10-10";

export interface DemoDataset {
  products: ProductInput[];
  sales: SaleRow[];
  promos: PromoRow[];
  leadTimes: LeadTimeRow[];
}

export function generateDemoData(seed = GENERATOR_SEED): DemoDataset {
  const rng = mulberry32(seed);
  const nextNormal = boxMuller(rng);

  // 1. Products Definition (from docs/10-DEMO-AND-PITCH.md)
  const products: ProductInput[] = [
    {
      sku: "ORS-01",
      name: "ORS sachets",
      unit: "sachets",
      unitCost: 8,
      orderCost: 150,
      holdingRate: 0.2,
      leadTimeMean: 4,
      leadTimeSd: 0.5,
      onHand: 350,
      onOrder: 0,
      packSize: 50,
      minOrderQty: 100,
      shortageCost: 20,
      shelfLifeDays: 730,
    },
    {
      sku: "PCM-02",
      name: "Paracetamol strips",
      unit: "strips",
      unitCost: 50,
      orderCost: 200,
      holdingRate: 0.2,
      leadTimeMean: 5,
      leadTimeSd: 1.0,
      onHand: 300,
      onOrder: 0,
      packSize: 50,
      minOrderQty: 100,
      shortageCost: 50,
      shelfLifeDays: 730,
    },
    {
      sku: "INS-03",
      name: "Insulin vials",
      unit: "vials",
      unitCost: 450,
      orderCost: 300,
      holdingRate: 0.25,
      leadTimeMean: 7,
      leadTimeSd: 3.0,
      onHand: 60,
      onOrder: 0,
      packSize: 10,
      minOrderQty: 20,
      shortageCost: 500,
      shelfLifeDays: 365,
    },
    {
      sku: "FLU-04",
      name: "Flu syrup",
      unit: "bottles",
      unitCost: 85,
      orderCost: 180,
      holdingRate: 0.2,
      leadTimeMean: 5,
      leadTimeSd: 1.0,
      onHand: 110,
      onOrder: 0,
      packSize: 25,
      minOrderQty: 50,
      shortageCost: 100,
      shelfLifeDays: 540,
    },
    {
      sku: "BND-05",
      name: "Bandage rolls",
      unit: "rolls",
      unitCost: 25,
      orderCost: 120,
      holdingRate: 0.2,
      leadTimeMean: 3,
      leadTimeSd: 0.5,
      onHand: 150,
      onOrder: 0,
      packSize: 20,
      minOrderQty: 40,
      shortageCost: 30,
      shelfLifeDays: 1095,
    },
    {
      sku: "ANT-06",
      name: "Rare antidote",
      unit: "ampoules",
      unitCost: 1200,
      orderCost: 400,
      holdingRate: 0.3,
      leadTimeMean: 10,
      leadTimeSd: 2.0,
      onHand: 15,
      onOrder: 0,
      packSize: 1,
      minOrderQty: 5,
      shortageCost: 2000,
      shelfLifeDays: 365,
    },
  ];

  // 2. Generate Dates (150 days ending 2026-10-10)
  const endDate = new Date("2026-10-10T00:00:00Z");
  const dates: string[] = [];
  for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  // Weekday multipliers: Sun=1.15, Mon=0.95, Tue=0.90, Wed=0.95, Thu=1.00, Fri=1.10, Sat=1.25
  const weekdayFactors = [1.15, 0.95, 0.9, 0.95, 1.0, 1.1, 1.25];

  const sales: SaleRow[] = [];

  // Generate sales per product
  for (const prod of products) {
    let baseMean = 40;
    let baseSd = 8;
    if (prod.sku === "PCM-02") {
      baseMean = 100;
      baseSd = 20;
    } else if (prod.sku === "INS-03") {
      baseMean = 12;
      baseSd = 3;
    } else if (prod.sku === "FLU-04") {
      baseMean = 25;
      baseSd = 5;
    } else if (prod.sku === "BND-05") {
      baseMean = 30;
      baseSd = 6;
    } else if (prod.sku === "ANT-06") {
      baseMean = 1.5;
      baseSd = 1.2;
    }

    for (let dayIdx = 0; dayIdx < dates.length; dayIdx++) {
      const dateStr = dates[dayIdx];
      const dayDate = new Date(dateStr + "T00:00:00Z");
      const dayOfWeek = dayDate.getUTCDay(); // 0 is Sunday
      const factor = weekdayFactors[dayOfWeek];

      let units = 0;

      if (prod.sku === "ANT-06") {
        // Intermittent demand: ~70% zeros
        const isZero = rng() < 0.7;
        if (!isZero) {
          units = Math.max(1, Math.round(1 + Math.abs(nextNormal()) * 2));
        } else {
          units = 0;
        }
      } else {
        // Mild trend over 150 days (slight rise for flu)
        const trend = prod.sku === "FLU-04" ? 1 + (dayIdx / 150) * 0.3 : 1;
        const expected = baseMean * factor * trend;
        const sample = expected + baseSd * nextNormal();
        units = Math.max(0, Math.round(sample));
      }

      // Planted Events (docs/10-DEMO-AND-PITCH.md)
      // ORS-01: 5-day Monsoon health camp promo (2026-07-15 to 2026-07-19) -> 2.5x
      if (prod.sku === "ORS-01" && dateStr >= "2026-07-15" && dateStr <= "2026-07-19") {
        units = Math.round(units * 2.5);
      }

      // BND-05: digit-slip error (1000 instead of 100 on 2026-08-14)
      if (prod.sku === "BND-05" && dateStr === "2026-08-14") {
        units = 1000;
      }

      // PCM-02: negative value (-40 on 2026-08-20)
      if (prod.sku === "PCM-02" && dateStr === "2026-08-20") {
        units = -40;
      }

      // PCM-02: unexplained 3x spike (300 on 2026-09-05) -> UNKNOWN
      if (prod.sku === "PCM-02" && dateStr === "2026-09-05") {
        units = 300;
      }

      // FLU-04: 8-day ramp-up surge (2026-08-01 to 2026-08-08) -> ~2.2x
      if (prod.sku === "FLU-04" && dateStr >= "2026-08-01" && dateStr <= "2026-08-08") {
        units = Math.round(units * 2.2);
      }

      sales.push({
        date: dateStr,
        sku: prod.sku,
        units,
        onHand: null,
      });
    }
  }

  // 3. Promos
  const promos: PromoRow[] = [
    {
      sku: "ORS-01",
      startDate: "2026-07-15",
      endDate: "2026-07-19",
      note: "Monsoon health camp: subsidized sachets",
    },
  ];

  // 4. Lead Times (sample past replenishment orders)
  const leadTimes: LeadTimeRow[] = [
    { sku: "ORS-01", orderDate: "2026-06-01", receivedDate: "2026-06-05" },
    { sku: "ORS-01", orderDate: "2026-07-01", receivedDate: "2026-07-05" },
    { sku: "PCM-02", orderDate: "2026-06-05", receivedDate: "2026-06-10" },
    { sku: "PCM-02", orderDate: "2026-07-10", receivedDate: "2026-07-15" },
    { sku: "INS-03", orderDate: "2026-06-01", receivedDate: "2026-06-09" },
    { sku: "INS-03", orderDate: "2026-07-01", receivedDate: "2026-07-07" },
    { sku: "FLU-04", orderDate: "2026-06-15", receivedDate: "2026-06-20" },
    { sku: "BND-05", orderDate: "2026-06-12", receivedDate: "2026-06-15" },
    { sku: "ANT-06", orderDate: "2026-05-20", receivedDate: "2026-05-30" },
  ];

  return { products, sales, promos, leadTimes };
}

export function writeDemoCSVs(outputDir = path.resolve(__dirname, ".")): void {
  const data = generateDemoData(GENERATOR_SEED);
  fs.mkdirSync(outputDir, { recursive: true });

  // 1. products.csv
  const prodHeader = "sku,name,unit,unit_cost,order_cost,holding_rate,lead_time_mean,lead_time_sd,on_hand,on_order,pack_size,min_order_qty,shelf_life_days,shortage_cost\n";
  const prodLines = data.products.map((p) =>
    `${p.sku},"${p.name}",${p.unit},${p.unitCost},${p.orderCost},${p.holdingRate},${p.leadTimeMean},${p.leadTimeSd},${p.onHand},${p.onOrder},${p.packSize},${p.minOrderQty},${p.shelfLifeDays ?? ""},${p.shortageCost ?? ""}`
  ).join("\n");
  fs.writeFileSync(path.join(outputDir, "products.csv"), prodHeader + prodLines + "\n", "utf8");

  // 2. sales.csv
  const salesHeader = "date,sku,units,on_hand\n";
  const salesLines = data.sales.map((s) =>
    `${s.date},${s.sku},${s.units},${s.onHand ?? ""}`
  ).join("\n");
  fs.writeFileSync(path.join(outputDir, "sales.csv"), salesHeader + salesLines + "\n", "utf8");

  // 3. promos.csv
  const promoHeader = "sku,start_date,end_date,note\n";
  const promoLines = data.promos.map((p) =>
    `${p.sku},${p.startDate},${p.endDate},"${p.note ?? ""}"`
  ).join("\n");
  fs.writeFileSync(path.join(outputDir, "promos.csv"), promoHeader + promoLines + "\n", "utf8");

  // 4. lead_times.csv
  const ltHeader = "sku,order_date,received_date\n";
  const ltLines = data.leadTimes.map((lt) =>
    `${lt.sku},${lt.orderDate},${lt.receivedDate}`
  ).join("\n");
  fs.writeFileSync(path.join(outputDir, "lead_times.csv"), ltHeader + ltLines + "\n", "utf8");
}

if (require.main === module) {
  writeDemoCSVs();
  console.log("Demo CSVs generated successfully with seed", GENERATOR_SEED);
}
