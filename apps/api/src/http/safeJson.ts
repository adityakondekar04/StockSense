// apps/api/src/http/safeJson.ts
// Guard to ensure no API response ever contains NaN or Infinity (T67)

import type { Response } from "express";

export function sanitizeNumbers<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "number") {
    if (isNaN(obj) || !isFinite(obj)) {
      return 0 as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeNumbers(item)) as unknown as T;
  }

  if (typeof obj === "object" && !(obj instanceof Date)) {
    const res: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      res[key] = sanitizeNumbers(value);
    }
    return res as T;
  }

  return obj;
}

export function hasNonFiniteNumbers(obj: unknown): boolean {
  if (typeof obj === "number") {
    return isNaN(obj) || !isFinite(obj);
  }

  if (Array.isArray(obj)) {
    return obj.some((item) => hasNonFiniteNumbers(item));
  }

  if (typeof obj === "object" && obj !== null && !(obj instanceof Date)) {
    return Object.values(obj).some((val) => hasNonFiniteNumbers(val));
  }

  return false;
}

export function safeJson(res: Response, status: number, data: unknown): void {
  const sanitized = sanitizeNumbers(data);
  res.status(status).json(sanitized);
}
