import { z } from "zod";
import type { GeneratedName, GenerateRequest, ProviderId } from "./types";
import { buildSystemPrompt } from "./prompts";
import { demoGenerate } from "./demo";

const NameSchema = z.object({
  name: z.string().min(1).max(80),
  gender: z.string().optional().default("n/a"),
  meaning: z.string().default(""),
  origin: z.string().default(""),
  pronunciation: z.string().default(""),
  ipa: z.string().optional().default(""),
  whyItFits: z.string().default(""),
  nicknames: z.array(z.string()).default([]),
  variations: z.array(z.string()).default([]),
  styles: z.array(z.string()).default([]),
  matchScore: z.number().min(1).max(100).default(75),
  subscores: z
    .object({
      promptFit: z.number().default(75),
      originality: z.number().default(75),
      pronunciation: z.number().default(75),
      memorability: z.number().default(75),
    })
    .default({ promptFit: 75, originality: 75, pronunciation: 75, memorability: 75 }),
});

function extractJsonArray(text: string): unknown {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) throw new Error("No JSON array in model output");
  return JSON.parse(text.slice(start, end + 1));
}

export function parseNames(text: string, category: string): GeneratedName[] {
  const raw = extractJsonArray(text);
  const arr = z.array(NameSchema).parse(raw);
  return arr.map((n) => ({ ...n, id: crypto.randomUUID(), category }));
}

async function callAnthropic(apiKey: string, system: string, user: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 8000,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.content?.map((b: { text?: string }) => b.text ?? "").join("") ?? "";
}

async function callOpenAICompatible(apiKey: string, system: string, user: string, baseUrl = "https://api.openai.com", model = "gpt-4o-mini"): Promise<string> {
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Provider ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGemini(apiKey: string, system: string, user: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text: user }] }],
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
}

export interface Route {
  provider: ProviderId;
  apiKey?: string;
  baseUrl?: string;
}

// Generic completion against a resolved route. Throws if provider === "demo" —
// callers supply their own offline fallback.
export async function completeWithRoute(route: Route, system: string, user: string): Promise<string> {
  if (route.provider === "anthropic") return callAnthropic(route.apiKey!, system, user);
  if (route.provider === "gemini") return callGemini(route.apiKey!, system, user);
  if (route.provider === "local")
    return callOpenAICompatible(route.apiKey ?? "", system, user, route.baseUrl || "http://localhost:11434", "llama3.1");
  if (route.provider === "openai") return callOpenAICompatible(route.apiKey!, system, user);
  throw new Error("No AI provider configured");
}

// BYO key wins; then server env keys; then offline demo mode.
export function routeRequest(req: GenerateRequest): Route {
  if (req.provider && req.provider !== "demo" && (req.apiKey || req.provider === "local")) {
    return { provider: req.provider, apiKey: req.apiKey, baseUrl: req.baseUrl };
  }
  if (process.env.ANTHROPIC_API_KEY) return { provider: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY };
  if (process.env.OPENAI_API_KEY) return { provider: "openai", apiKey: process.env.OPENAI_API_KEY };
  if (process.env.GOOGLE_API_KEY) return { provider: "gemini", apiKey: process.env.GOOGLE_API_KEY };
  return { provider: "demo" };
}

export async function generateNames(req: GenerateRequest): Promise<{ names: GeneratedName[]; provider: ProviderId; note?: string }> {
  const count = Math.min(Math.max(req.count ?? 12, 1), 24);
  const route = routeRequest(req);

  if (route.provider === "demo") {
    return {
      names: demoGenerate(req),
      provider: "demo",
      note: "Demo mode — add an API key in Settings (or server env) for full AI generation.",
    };
  }

  const system = buildSystemPrompt(req.category, req.filters, count);
  const user = req.prompt.trim() || `Generate ${count} great ${req.category} names.`;

  try {
    const text = await completeWithRoute(route, system, user);
    return { names: parseNames(text, req.category), provider: route.provider };
  } catch (err) {
    return {
      names: demoGenerate(req),
      provider: "demo",
      note: `AI provider failed (${err instanceof Error ? err.message : "unknown error"}) — served demo results instead.`,
    };
  }
}
