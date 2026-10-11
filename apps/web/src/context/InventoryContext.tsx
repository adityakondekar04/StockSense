// apps/web/src/context/InventoryContext.tsx
// Central React State for StockSense Dashboard

import React, { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from "react";
import { inverseNormalCDF } from "@stocksense/core";
import { apiClient } from "../api/client";
import {
  OFFICIAL_DEMO_PRODUCTS,
  INITIAL_AUDIT_LOG,
  generateProductSalesHistory,
  type ProductRecord,
  type DailySalePoint,
  type AnomalyRecord,
  type AnomalyClass,
  type AuditRecord,
} from "../data/inventoryData";

interface InventoryContextType {
  products: ProductRecord[];
  selectedProduct: ProductRecord;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  serviceLevel: number;
  setServiceLevel: (level: number) => void;
  zValue: number;
  aiEnabled: boolean;
  setAiEnabled: (enabled: boolean) => void;
  includeUnknowns: Record<string, boolean>;
  toggleIncludeUnknowns: (sku: string) => void;
  salesHistory: DailySalePoint[];
  getSalesForProduct: (productId: string) => DailySalePoint[];
  anomalies: AnomalyRecord[];
  confirmAnomaly: (id: string) => void;
  overrideAnomaly: (id: string, newClass: AnomalyClass) => void;
  addAnomalyNote: (id: string, note: string) => void;
  auditLog: AuditRecord[];
  addAuditLog: (entry: Omit<AuditRecord, "id" | "at">) => void;
  loadDemoData: () => Promise<void> | void;
  addProduct: (product: Omit<ProductRecord, "id" | "historyDays">, dailyDemands?: number[]) => ProductRecord;
  serverOnline: boolean;
  serverError: string | null;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load persisted service level & AI toggle from localStorage if present
  const [serviceLevel, setServiceLevelState] = useState<number>(() => {
    const saved = localStorage.getItem("stocksense_service_level");
    return saved ? Number(saved) : 0.95;
  });

  const [aiEnabled, setAiEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem("stocksense_ai_enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [products, setProducts] = useState<ProductRecord[]>(OFFICIAL_DEMO_PRODUCTS);
  const [selectedProductId, setSelectedProductIdState] = useState<string>(() => {
    return OFFICIAL_DEMO_PRODUCTS[0]?.id || "";
  });

  // Track unknown inclusion per SKU (default: true)
  const [includeUnknowns, setIncludeUnknowns] = useState<Record<string, boolean>>({
    "PCM-02": true,
  });

  // Pre-generate sales histories and collect anomalies
  const [salesMap, setSalesMap] = useState<Record<string, DailySalePoint[]>>(() => {
    const map: Record<string, DailySalePoint[]> = {};
    OFFICIAL_DEMO_PRODUCTS.forEach((p) => {
      map[p.id] = generateProductSalesHistory(p);
    });
    return map;
  });

  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>(() => {
    const list: AnomalyRecord[] = [];
    OFFICIAL_DEMO_PRODUCTS.forEach((p) => {
      const history = generateProductSalesHistory(p);
      history.forEach((pt) => {
        if (pt.anomaly) list.push(pt.anomaly);
      });
    });
    return list;
  });

  const [auditLog, setAuditLog] = useState<AuditRecord[]>(INITIAL_AUDIT_LOG);
  const [serverOnline, setServerOnline] = useState<boolean>(true);
  const [serverError, setServerError] = useState<string | null>(null);

  // Sync products with API on mount, with graceful fallback
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const remoteProds = await apiClient.getProducts();
        if (!cancelled && Array.isArray(remoteProds) && remoteProds.length > 0) {
          setProducts((prev) => {
            return remoteProds.map((rp: any) => {
              const local = prev.find((p) => p.sku === rp.sku);
              return {
                id: rp.id,
                sku: rp.sku,
                name: rp.name,
                unit: rp.unit || "units",
                unitCost: rp.unitCost,
                orderCost: rp.orderCost,
                holdingRate: rp.holdingRate,
                leadTimeMean: rp.leadTimeMean,
                leadTimeSd: rp.leadTimeSd,
                onHand: rp.onHand,
                onOrder: rp.onOrder,
                packSize: rp.packSize,
                minOrderQty: rp.minOrderQty,
                shortageCost: rp.shortageCost || 20,
                meanDailyDemand: local?.meanDailyDemand || 100,
                sdDemand: local?.sdDemand || 20,
                historyDays: local?.historyDays || 150,
                isIntermittent: local?.isIntermittent || rp.sku === "ANT-06",
              };
            });
          });
          setServerOnline(true);
          setServerError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setServerOnline(false);
          setServerError(err?.message || "Cannot reach the server.");
        }
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Compute z from packages/core
  const zValue = useMemo(() => {
    try {
      return inverseNormalCDF(serviceLevel);
    } catch {
      return 1.645;
    }
  }, [serviceLevel]);

  const setServiceLevel = (level: number) => {
    const clamped = Math.min(0.999, Math.max(0.80, level));
    setServiceLevelState(clamped);
    localStorage.setItem("stocksense_service_level", String(clamped));
  };

  const setAiEnabled = (enabled: boolean) => {
    setAiEnabledState(enabled);
    localStorage.setItem("stocksense_ai_enabled", String(enabled));

    // Log the toggle change in the audit log (FR-18)
    const newEntry: AuditRecord = {
      id: `audit-${Date.now()}`,
      at: new Date().toISOString(),
      kind: "classification",
      decisionPath: enabled ? "LLM" : "RULES",
      summary: enabled ? "Switched to AI Advisory mode (active)" : "Switched to Rules-Only mode (AI disabled)",
      details: {
        aiEnabled: enabled,
        action: "GLOBAL_AI_TOGGLE",
      },
    };
    setAuditLog((prev) => [newEntry, ...prev]);
  };

  const setSelectedProductId = (id: string) => {
    setSelectedProductIdState(id);
  };

  const toggleIncludeUnknowns = (sku: string) => {
    setIncludeUnknowns((prev) => {
      const next = !prev[sku];
      // Add audit log
      const newEntry: AuditRecord = {
        id: `audit-${Date.now()}`,
        at: new Date().toISOString(),
        kind: "override",
        sku,
        decisionPath: "CONFIRMED",
        summary: `${next ? "Included" : "Excluded"} unknown anomalies in baseline for ${sku}`,
        details: { sku, includeUnknowns: next },
      };
      setAuditLog((a) => [newEntry, ...a]);
      return { ...prev, [sku]: next };
    });
  };

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0] || OFFICIAL_DEMO_PRODUCTS[0];
  }, [products, selectedProductId]);

  const getSalesForProduct = (productId: string) => {
    return salesMap[productId] || [];
  };

  const salesHistory = useMemo(() => {
    return getSalesForProduct(selectedProduct.id);
  }, [selectedProduct.id, salesMap]);

  // Actions for Anomaly Review
  const confirmAnomaly = (id: string) => {
    setAnomalies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, userConfirmed: true, decisionPath: "CONFIRMED" } : a))
    );
    const target = anomalies.find((a) => a.id === id);
    if (target) {
      addAuditLog({
        kind: "override",
        sku: target.sku,
        decisionPath: "CONFIRMED",
        summary: `User confirmed classification ${target.class} for ${target.sku} on ${target.date}`,
        details: { anomalyId: id, confirmed: true },
      });
    }
  };

  const overrideAnomaly = (id: string, newClass: AnomalyClass) => {
    setAnomalies((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              class: newClass,
              decisionPath: "CONFIRMED",
              userConfirmed: true,
              reason: `User manually reclassified to ${newClass}`,
            }
          : a
      )
    );
    const target = anomalies.find((a) => a.id === id);
    if (target) {
      addAuditLog({
        kind: "override",
        sku: target.sku,
        decisionPath: "CONFIRMED",
        summary: `User overrode anomaly classification from ${target.class} to ${newClass} for ${target.sku}`,
        details: { anomalyId: id, oldClass: target.class, newClass },
      });
    }
  };

  const addAnomalyNote = (id: string, note: string) => {
    setAnomalies((prev) => prev.map((a) => (a.id === id ? { ...a, note } : a)));
    const target = anomalies.find((a) => a.id === id);
    if (target) {
      addAuditLog({
        kind: "classification",
        sku: target.sku,
        decisionPath: aiEnabled ? "LLM" : "RULES",
        summary: `Added review note on anomaly for ${target.sku}: "${note}"`,
        details: { anomalyId: id, note },
      });
    }
  };

  const addAuditLog = (entry: Omit<AuditRecord, "id" | "at">) => {
    const fullEntry: AuditRecord = {
      ...entry,
      id: `audit-${Date.now()}`,
      at: new Date().toISOString(),
    };
    setAuditLog((prev) => [fullEntry, ...prev]);
  };

  const loadDemoData = async () => {
    try {
      await apiClient.importDemo();
      setServerOnline(true);
      setServerError(null);
    } catch {
      // Fallback cleanly to local mock if server unreachable
    }

    setProducts(OFFICIAL_DEMO_PRODUCTS);
    setSelectedProductIdState(OFFICIAL_DEMO_PRODUCTS[0].id);

    const map: Record<string, DailySalePoint[]> = {};
    const anomList: AnomalyRecord[] = [];
    OFFICIAL_DEMO_PRODUCTS.forEach((p) => {
      const history = generateProductSalesHistory(p);
      map[p.id] = history;
      history.forEach((pt) => {
        if (pt.anomaly) anomList.push(pt.anomaly);
      });
    });
    setSalesMap(map);
    setAnomalies(anomList);

    addAuditLog({
      kind: "import",
      decisionPath: "RULES",
      summary: "Reloaded official seeded demo catalogue (6 SKUs, 900 records, seed: 20261011)",
      details: { seed: 20261011 },
    });
  };

  const addProduct = (
    data: Omit<ProductRecord, "id" | "historyDays">,
    dailyDemands?: number[]
  ): ProductRecord => {
    const newId = `prod-${data.sku.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const newProduct: ProductRecord = {
      ...data,
      id: newId,
      historyDays: dailyDemands?.length || 30,
    };

    setProducts((prev) => [...prev.filter((p) => p.sku !== newProduct.sku), newProduct]);
    setSelectedProductIdState(newId);

    // Build synthetic or provided history
    const historyPoints: DailySalePoint[] = [];
    const count = dailyDemands?.length || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - count);

    for (let i = 0; i < count; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const val = dailyDemands ? dailyDemands[i] : Math.round(data.meanDailyDemand);
      historyPoints.push({
        date: d.toISOString().split("T")[0],
        dayIndex: i,
        demand: val,
        isHoldout: i >= Math.floor(count * 0.8),
      });
    }

    setSalesMap((prev) => ({ ...prev, [newId]: historyPoints }));

    addAuditLog({
      kind: "import",
      sku: newProduct.sku,
      decisionPath: "RULES",
      summary: `Manual product added: ${newProduct.sku} (${newProduct.name}) with ${count} days of demand`,
      details: { sku: newProduct.sku, name: newProduct.name },
    });

    return newProduct;
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        selectedProduct,
        selectedProductId,
        setSelectedProductId,
        serviceLevel,
        setServiceLevel,
        zValue,
        aiEnabled,
        setAiEnabled,
        includeUnknowns,
        toggleIncludeUnknowns,
        salesHistory,
        getSalesForProduct,
        anomalies,
        confirmAnomaly,
        overrideAnomaly,
        addAnomalyNote,
        auditLog,
        addAuditLog,
        loadDemoData,
        addProduct,
        serverOnline,
        serverError,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
