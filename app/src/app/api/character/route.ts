import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { completeWithRoute, routeRequest } from "@/lib/providers";
import { buildCharacterPrompt, CharacterSheetSchema, demoCharacter } from "@/lib/character";
import type { GenerateRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  name: z.string().min(1).max(80),
  context: z.string().max(600).default(""),
  provider: z.enum(["anthropic", "openai", "gemini", "local", "demo"]).optional(),
  apiKey: z.string().max(300).optional(),
  baseUrl: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const route = routeRequest({ provider: body.provider, apiKey: body.apiKey, baseUrl: body.baseUrl } as GenerateRequest);

  if (route.provider === "demo") {
    return NextResponse.json({
      sheet: demoCharacter(body.name, body.context),
      provider: "demo",
      note: "Demo mode — add an API key in Settings for a fully bespoke character.",
    });
  }

  try {
    const text = await completeWithRoute(route, buildCharacterPrompt(body.name, body.context), `Create the character sheet for ${body.name}.`);
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("No JSON in model output");
    const sheet = CharacterSheetSchema.parse(JSON.parse(text.slice(start, end + 1)));
    return NextResponse.json({ sheet, provider: route.provider });
  } catch (err) {
    return NextResponse.json({
      sheet: demoCharacter(body.name, body.context),
      provider: "demo",
      note: `AI provider failed (${err instanceof Error ? err.message : "unknown"}) — served a template character instead.`,
    });
  }
}
