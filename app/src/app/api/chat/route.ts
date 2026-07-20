import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { completeWithRoute, routeRequest } from "@/lib/providers";
import { demoGenerate } from "@/lib/demo";
import type { GenerateRequest } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .min(1)
    .max(40),
  provider: z.enum(["anthropic", "openai", "gemini", "local", "demo"]).optional(),
  apiKey: z.string().max(300).optional(),
  baseUrl: z.string().max(200).optional(),
});

const SYSTEM = `You are the resident naming expert of AI Naming Studio — warm, curious, and deeply knowledgeable about etymology, linguistics, cultures, and storytelling.

Your job: help the user find the perfect name through conversation.
- If their goal is vague, ask ONE focused clarifying question (tone? culture? meaning that matters?) before recommending.
- When you recommend, give 3-6 names, each on its own line as: **Name** — pronunciation · origin · one sentence on why it fits their story.
- Be factually accurate about real names' meanings and origins; say so honestly when you're inventing.
- Keep replies under 220 words. No headers, no bullet-point walls — talk like a brilliant friend.`;

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const route = routeRequest({ provider: body.provider, apiKey: body.apiKey, baseUrl: body.baseUrl } as GenerateRequest);

  if (route.provider === "demo") {
    const lastUser = [...body.messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const asked = body.messages.filter((m) => m.role === "assistant").length;
    if (asked === 0) {
      return NextResponse.json({
        reply:
          "I'd love to help you name this! Tell me a little more: what tone are you after — soft and lyrical, dark and imposing, or something modern and clean? And is there a culture, language, or meaning you want the name to carry?\n\n*(Demo mode — add an API key in Settings for the full conversational expert.)*",
        provider: "demo",
      });
    }
    const names = demoGenerate({ prompt: lastUser, category: "Character Names", filters: { styles: [] }, count: 5 } as GenerateRequest);
    const lines = names
      .slice(0, 5)
      .map((n) => `**${n.name}** — ${n.pronunciation} · ${n.origin} · ${n.whyItFits}`)
      .join("\n\n");
    return NextResponse.json({
      reply: `Based on what you've told me, here are some directions:\n\n${lines}\n\nWant me to push any of these further — softer, darker, shorter?\n\n*(Demo mode — these come from the offline composer.)*`,
      provider: "demo",
    });
  }

  const conversation = body.messages.map((m) => `${m.role === "user" ? "User" : "You"}: ${m.content}`).join("\n\n");
  try {
    const reply = await completeWithRoute(route, SYSTEM, conversation + "\n\nYou:");
    return NextResponse.json({ reply: reply.trim(), provider: route.provider });
  } catch (err) {
    return NextResponse.json(
      { error: `AI provider failed: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 502 },
    );
  }
}
