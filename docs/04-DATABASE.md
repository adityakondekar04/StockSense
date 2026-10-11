# 04 · Database (Neon PostgreSQL + Prisma)

## 1. Setup

1. Create a free Neon project; copy the pooled connection string into `apps/api/.env` as `DATABASE_URL`.
2. `npx prisma migrate dev --schema apps/api/prisma/schema.prisma --name init`
3. `npm run seed`
4. **Fallback:** `docker compose up -d` starts local Postgres; point `DATABASE_URL` at it and re-run migrate + seed.

Neon free-tier databases can take a second to wake after idling. Hit `/api/health` before the demo.

## 2. Prisma schema

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

model Product {
  id            String   @id @default(cuid())
  sku           String   @unique
  name          String
  unit          String   @default("units")
  unitCost      Float
  orderCost     Float
  holdingRate   Float    @default(0.2)
  leadTimeMean  Float
  leadTimeSd    Float
  onHand        Int      @default(0)
  onOrder       Int      @default(0)
  packSize      Int      @default(1)
  minOrderQty   Int      @default(1)
  shelfLifeDays Int?
  shortageCost  Float?
  createdAt     DateTime @default(now())

  sales      Sale[]
  promos     Promo[]
  leadTimes  LeadTimeRecord[]
  anomalies  Anomaly[]
  runs       AnalysisRun[]
}

model Sale {
  id        String   @id @default(cuid())
  productId String
  date      DateTime @db.Date
  units     Float
  onHand    Int?
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@unique([productId, date])
  @@index([productId, date])
}

model Promo {
  id        String   @id @default(cuid())
  productId String
  startDate DateTime @db.Date
  endDate   DateTime @db.Date
  note      String?
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model LeadTimeRecord {
  id           String   @id @default(cuid())
  productId    String
  orderDate    DateTime @db.Date
  receivedDate DateTime @db.Date
  product      Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model Anomaly {
  id             String   @id @default(cuid())
  productId      String
  date           DateTime @db.Date
  value          Float
  modifiedZ      Float
  class          AnomalyClass
  reason         String
  decisionPath   DecisionPath
  note           String?
  proposedAdjPct Float?
  appliedAdjPct  Float?
  clamped        Boolean  @default(false)
  imputedValue   Float?
  userConfirmed  Boolean  @default(false)
  createdAt      DateTime @default(now())
  product        Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@unique([productId, date])
}

model AnalysisRun {
  id           String   @id @default(cuid())
  productId    String
  serviceLevel Float
  zValue       Float
  aiEnabled    Boolean
  inputsJson   Json
  resultJson   Json
  createdAt    DateTime @default(now())
  product      Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model Scenario {
  id         String   @id @default(cuid())
  productId  String
  surgePct   Float    @default(0)
  delayDays  Float    @default(0)
  source     String   // "manual" | "text_regex" | "text_llm"
  rawText    String?
  confirmed  Boolean  @default(false)
  resultJson Json?
  createdAt  DateTime @default(now())
}

model AuditLog {
  id           String   @id @default(cuid())
  at           DateTime @default(now())
  kind         String   // "classification" | "adjustment" | "scenario_parse" | "import"
  productId    String?
  decisionPath DecisionPath
  detailJson   Json
}

enum AnomalyClass { PROMOTION DATA_ERROR UNKNOWN }
enum DecisionPath { RULES LLM LLM_FAILED_RULES }
```

## 3. Design notes

- **Sales stay untouched.** Cleaning produces an in-memory cleaned series plus `Anomaly` rows. Raw data is never overwritten.
- **Anomaly rows hold both proposed and applied adjustment** so the UI can show the clamp.
- **`AnalysisRun` stores inputs and results** so a judge can reopen a prior result.
- **`AuditLog`** satisfies the "show which path produced each decision" requirement.
- No user table: auth is out of scope.

## 4. Seed strategy

`data/generator.ts` with a fixed seed (`20261011`) writes CSVs and inserts them. See `10-DEMO-AND-PITCH.md` for the products and planted events. Running the seed twice must yield identical rows (use upsert by sku/date).
