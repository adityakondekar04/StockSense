// apps/api/src/ai/llm.ts
// Robust LLM calling pipeline with timeout, retry, strict schema parsing, and deterministic fallback

import type { z } from "zod";

export interface CallLLMSuccess<T> {
  ok: true;
  value: T;
  path: "LLM";
}

export interface CallLLMFailure {
  ok: false;
  reason: string;
  path: "LLM_FAILED_RULES" | "RULES";
}

export type CallLLMResult<T> = CallLLMSuccess<T> | CallLLMFailure;

export interface CallLLMOptions {
  aiEnabled?: boolean;
  timeoutMs?: number;
  customProvider?: (prompt: string) => Promise<string>;
}

export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  // Strip markdown ```json ... ``` or ``` ... ``` code blocks
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const target = codeBlockMatch ? codeBlockMatch[1].trim() : trimmed;

  // Try parsing directly
  try {
    return JSON.parse(target);
  } catch {
    // Attempt to locate first { and last }
    const firstBrace = target.indexOf("{");
    const lastBrace = target.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = target.substring(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }
    throw new Error("No valid JSON structure found in response");
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`LLM provider timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

export async function defaultProvider(prompt: string): Promise<string> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error("LLM_API_KEY is not configured");
  }

  // Standard fetch to Gemini API or configured OpenAI-compatible endpoint
  const endpoint = process.env.LLM_ENDPOINT || `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    throw new Error(`LLM provider HTTP error: ${res.status}`);
  }

  const data: any = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error("LLM provider returned empty response");
  }
  return rawText;
}

export async function callLLM<T>(
  prompt: string,
  schema: z.ZodType<T>,
  options: CallLLMOptions = {}
): Promise<CallLLMResult<T>> {
  const aiEnabled = options.aiEnabled ?? (process.env.AI_ENABLED !== "false");
  const apiKey = process.env.LLM_API_KEY;

  if (!aiEnabled || (!apiKey && !options.customProvider)) {
    return { ok: false, reason: "AI disabled or no API key configured", path: "RULES" };
  }

  const timeoutMs = options.timeoutMs ?? Number(process.env.LLM_TIMEOUT_MS ?? 5000);
  const provider = options.customProvider ?? defaultProvider;

  // Pipeline: 1 attempt + 1 retry on error
  let lastError = "";

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const rawText = await withTimeout(provider(prompt), timeoutMs);
      const parsedJson = extractJson(rawText);
      const validated = schema.safeParse(parsedJson);

      if (!validated.success) {
        return {
          ok: false,
          reason: `Schema validation failed: ${validated.error.issues.map((i) => i.message).join("; ")}`,
          path: "LLM_FAILED_RULES",
        };
      }

      return {
        ok: true,
        value: validated.data,
        path: "LLM",
      };
    } catch (err: any) {
      lastError = err?.message || String(err);
      // If first attempt failed, retry once
      if (attempt === 1) {
        continue;
      }
    }
  }

  return {
    ok: false,
    reason: `Provider error after retry: ${lastError}`,
    path: "LLM_FAILED_RULES",
  };
}
