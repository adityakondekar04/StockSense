-- CreateEnum
CREATE TYPE "AnomalyClass" AS ENUM ('PROMOTION', 'DATA_ERROR', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "DecisionPath" AS ENUM ('RULES', 'LLM', 'LLM_FAILED_RULES');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'units',
    "unitCost" DOUBLE PRECISION NOT NULL,
    "orderCost" DOUBLE PRECISION NOT NULL,
    "holdingRate" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "leadTimeMean" DOUBLE PRECISION NOT NULL,
    "leadTimeSd" DOUBLE PRECISION NOT NULL,
    "onHand" INTEGER NOT NULL DEFAULT 0,
    "onOrder" INTEGER NOT NULL DEFAULT 0,
    "packSize" INTEGER NOT NULL DEFAULT 1,
    "minOrderQty" INTEGER NOT NULL DEFAULT 1,
    "shelfLifeDays" INTEGER,
    "shortageCost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "units" DOUBLE PRECISION NOT NULL,
    "onHand" INTEGER,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promo" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "note" TEXT,

    CONSTRAINT "Promo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadTimeRecord" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderDate" DATE NOT NULL,
    "receivedDate" DATE NOT NULL,

    CONSTRAINT "LeadTimeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anomaly" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "modifiedZ" DOUBLE PRECISION NOT NULL,
    "class" "AnomalyClass" NOT NULL,
    "reason" TEXT NOT NULL,
    "decisionPath" "DecisionPath" NOT NULL,
    "note" TEXT,
    "proposedAdjPct" DOUBLE PRECISION,
    "appliedAdjPct" DOUBLE PRECISION,
    "clamped" BOOLEAN NOT NULL DEFAULT false,
    "imputedValue" DOUBLE PRECISION,
    "userConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Anomaly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisRun" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "serviceLevel" DOUBLE PRECISION NOT NULL,
    "zValue" DOUBLE PRECISION NOT NULL,
    "aiEnabled" BOOLEAN NOT NULL,
    "inputsJson" JSONB NOT NULL,
    "resultJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "surgePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "delayDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "source" TEXT NOT NULL,
    "rawText" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "resultJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" TEXT NOT NULL,
    "productId" TEXT,
    "decisionPath" "DecisionPath" NOT NULL,
    "detailJson" JSONB NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Sale_productId_date_idx" ON "Sale"("productId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_productId_date_key" ON "Sale"("productId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Anomaly_productId_date_key" ON "Anomaly"("productId", "date");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promo" ADD CONSTRAINT "Promo_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadTimeRecord" ADD CONSTRAINT "LeadTimeRecord_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anomaly" ADD CONSTRAINT "Anomaly_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisRun" ADD CONSTRAINT "AnalysisRun_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
