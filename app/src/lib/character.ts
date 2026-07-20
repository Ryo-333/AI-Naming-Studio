import { z } from "zod";

export const CharacterSheetSchema = z.object({
  name: z.string(),
  tagline: z.string().default(""),
  appearance: z.string().default(""),
  clothing: z.string().default(""),
  personality: z.string().default(""),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  fears: z.array(z.string()).default([]),
  secrets: z.string().default(""),
  goals: z.string().default(""),
  backstory: z.string().default(""),
  arc: z.string().default(""),
  dialogueStyle: z.string().default(""),
  dialogueExamples: z.array(z.string()).default([]),
  combatStyle: z.string().default(""),
  weapons: z.string().default(""),
  magic: z.string().default(""),
  relationships: z.array(z.string()).default([]),
  alignment: z.string().default(""),
  powerLevel: z.number().min(1).max(100).default(60),
  portraitPrompt: z.string().default(""),
});

export type CharacterSheet = z.infer<typeof CharacterSheetSchema>;

export function buildCharacterPrompt(name: string, context: string): string {
  return `You are the character engine of AI Naming Studio. Create a rich, internally consistent character sheet for a character named "${name}". Creator's context: ${context || "none given — infer a fitting genre from the name's sound"}.

Make it specific and usable by writers and artists: concrete images, no generic filler ("mysterious past" is banned). dialogueExamples must sound like the character, not narration. portraitPrompt should be a single richly detailed image-generation prompt (medium, lighting, mood, composition).

Respond with ONLY a JSON object (no prose, no fences):
{
  "name": "${name}",
  "tagline": string (one evocative line),
  "appearance": string, "clothing": string, "personality": string,
  "strengths": string[3], "weaknesses": string[3], "fears": string[2],
  "secrets": string, "goals": string, "backstory": string (120-180 words),
  "arc": string, "dialogueStyle": string, "dialogueExamples": string[3],
  "combatStyle": string, "weapons": string, "magic": string,
  "relationships": string[3], "alignment": string (e.g. "Chaotic Good"),
  "powerLevel": number (1-100),
  "portraitPrompt": string
}`;
}

export function demoCharacter(name: string, context: string): CharacterSheet {
  const ctx = context || "an untold story";
  return {
    name,
    tagline: `${name} — the name they whisper when the lanterns go out.`,
    appearance: `Tall and watchful, with storm-grey eyes that seem to weigh everyone they land on, and a thin scar tracing the left jaw like a closing parenthesis.`,
    clothing: `A travel-worn longcoat over practical layers; every pocket has a purpose, and one is always empty — reserved for what comes next.`,
    personality: `Patient, dry-humored, and quietly relentless. ${name} listens twice as much as they speak and forgets nothing.`,
    strengths: ["Reads people in a heartbeat", "Unshakable under pressure", "Improvises with whatever is at hand"],
    weaknesses: ["Trusts almost no one", "Carries every failure", "Will burn a plan to save a stranger"],
    fears: ["Becoming the person their mentor warned them about", "Still water at night"],
    secrets: `${name} still writes letters to someone everyone believes is dead — and mails them.`,
    goals: `To finish what happened at the start of ${ctx} — on their own terms this time.`,
    backstory: `${name} grew up on the edge of somewhere important, close enough to see its lights, far enough to know they weren't invited. An early act of quiet courage bought them a mentor, a trade, and an enemy — the same person, as it turned out. When the betrayal came it cost ${name} a home and a name they no longer use. Years of small jobs and smaller rooms taught them competence the hard way. Now the past has resurfaced wearing a new face, and ${name} has one chance to answer it. This time they are not fifteen, and they are not alone.`,
    arc: `From guarded survivor to someone who chooses, at real cost, to be responsible for other people.`,
    dialogueStyle: `Economical. Answers questions with better questions. Warmth leaks out only in understatement.`,
    dialogueExamples: [
      `"You want it done fast, or done so it stays done?"`,
      `"I don't hold grudges. I file them."`,
      `"Stay behind me. Not because you can't fight — because I can't watch two doors."`,
    ],
    combatStyle: `Ends fights early: position, leverage, and one decisive move. Avoids fair fights on principle.`,
    weapons: `A short blade kept sharper than necessary, and anything within arm's reach.`,
    magic: `A minor, deniable talent — candle-small — that ${name} pretends is luck.`,
    relationships: [
      `The mentor-turned-enemy who taught them everything, including doubt`,
      `A cheerful debt-collector who is somehow their closest friend`,
      `The letter-recipient, who may not be as dead as the world believes`,
    ],
    alignment: "Chaotic Good",
    powerLevel: 64,
    portraitPrompt: `Painterly character portrait of ${name}, storm-grey eyes and a thin jaw scar, wearing a travel-worn longcoat, lit by a single warm lantern against cold blue dusk, three-quarter view, sharp focus on the eyes, atmospheric fantasy illustration, artstation quality.`,
  };
}
