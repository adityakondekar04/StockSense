// apps/api/src/ai/clamp.ts
// Clamping function for LLM/user adjustments (±30% default cap)

export const ADJUSTMENT_CAP_PCT = 30;

export interface ClampResult {
  proposed: number;
  applied: number;
  clamped: boolean;
}

export function clampAdjustment(proposed: number, cap = ADJUSTMENT_CAP_PCT): ClampResult {
  const applied = Math.max(-cap, Math.min(cap, proposed));
  return {
    proposed,
    applied,
    clamped: applied !== proposed,
  };
}
