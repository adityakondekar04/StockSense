// apps/api/src/ai/scenarioParser.ts
// Natural language scenario parsing with regex fallback and strict schema

import { ScenarioSchema } from "@stocksense/core";
import { callLLM, type CallLLMOptions } from "./llm.js";

export interface ParsedScenarioResult {
  surgePct: number;
  delayDays: number;
  surgeDays?: number | null;
  referencedText: string;
  decisionPath: "LLM" | "RULES" | "LLM_FAILED_RULES";
}

export function parseScenarioWithRegex(text: string): { surgePct: number; delayDays: number } {
  if (!text || !text.trim()) {
    return { surgePct: 0, delayDays: 0 };
  }

  // Check if text has any numbers at all. If no numbers, return 0, 0 (T48)
  const hasNumbers = /\d+/.test(text);
  if (!hasNumbers) {
    return { surgePct: 0, delayDays: 0 };
  }

  let delayDays = 0;
  let surgePct = 0;

  // 1. Delay patterns: e.g. "4 days late", "supplier 4 days delayed", "delay of 3 days"
  const delayLateMatch = text.match(/(\d+(?:\.\d+)?)\s*days?\s*(?:late|delay(?:ed)?)/i);
  const delayOfMatch = text.match(/delay(?:ed)?\s*(?:of|by)?\s*(\d+(?:\.\d+)?)\s*days?/i);
  if (delayLateMatch) {
    delayDays = parseFloat(delayLateMatch[1]);
  } else if (delayOfMatch) {
    delayDays = parseFloat(delayOfMatch[1]);
  }

  // 2. Surge patterns: negative e.g. "demand drops 15%" or positive e.g. "flu season +40%"
  const dropMatch = text.match(/(?:down|drop|fall)[^%]*?(\d+(?:\.\d+)?)\s*%/i);
  const surgePctMatch = text.match(/([+-]?\d+(?:\.\d+)?)\s*%/);

  if (dropMatch) {
    surgePct = -parseFloat(dropMatch[1]);
  } else if (surgePctMatch) {
    surgePct = parseFloat(surgePctMatch[1]);
  }

  return {
    surgePct,
    delayDays,
  };
}

export async function parseScenarioText(
  text: string,
  options: CallLLMOptions = {}
): Promise<ParsedScenarioResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      surgePct: 0,
      delayDays: 0,
      referencedText: "",
      decisionPath: "RULES",
    };
  }

  const prompt = `Extract scenario parameters from the text. Return ONLY JSON:
{"surgePct":number,"surgeDays":integer|null,"delayDays":number,"referencedText":string}
Use 0 for anything not mentioned. Do not invent values.
Text: "${trimmed.replace(/"/g, '\\"')}"`;

  const llmResult = await callLLM(prompt, ScenarioSchema, options);

  if (llmResult.ok) {
    return {
      surgePct: llmResult.value.surgePct,
      delayDays: llmResult.value.delayDays,
      surgeDays: llmResult.value.surgeDays,
      referencedText: llmResult.value.referencedText || trimmed,
      decisionPath: "LLM",
    };
  }

  // Fallback to regex
  const regexResult = parseScenarioWithRegex(trimmed);
  return {
    surgePct: regexResult.surgePct,
    delayDays: regexResult.delayDays,
    referencedText: trimmed,
    decisionPath: llmResult.path === "LLM_FAILED_RULES" ? "LLM_FAILED_RULES" : "RULES",
  };
}
