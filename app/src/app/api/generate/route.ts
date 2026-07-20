import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateNames } from "@/lib/providers";
import type { GenerateRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const RequestSchema = z.object({
  prompt: z.string().max(600).default(""),
  category: z.string().min(1).max(40),
  filters: z
    .object({
      gender: z.string().max(20).optional(),
      origin: z.string().max(60).optional(),
      styles: z.array(z.string().max(20)).max(6).default([]),
      length: z.string().max(10).optional(),
      startsWith: z.string().max(5).optional(),
      endsWith: z.string().max(5).optional(),
      syllables: z.string().max(10).optional(),
      popularity: z.string().max(20).optional(),
      sound: z.string().max(20).optional(),
    })
    .default({ styles: [] }),
  count: z.number().int().min(1).max(24).optional(),
  provider: z.enum(["anthropic", "openai", "gemini", "local", "demo"]).optional(),
  apiKey: z.string().max(300).optional(),
  baseUrl: z.string().max(200).optional(),
});

// Simple in-memory rate limit (per instance). Replaced by Redis in Phase 4.
const hits = new Map<string, { n: number; reset: number }>();
const LIMIT = 30; // requests per 5 minutes per IP

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || rec.reset < now) {
    hits.set(ip, { n: 1, reset: now + 5 * 60_000 });
    return false;
  }
  rec.n += 1;
  return rec.n > LIMIT;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded — try again in a few minutes." }, { status: 429 });
  }

  let body: GenerateRequest;
  try {
    body = RequestSchema.parse(await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = await generateNames(body);
  return NextResponse.json(result);
}
