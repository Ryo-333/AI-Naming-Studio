import type { Filters } from "./types";

const CATEGORY_CARDS: Record<string, string> = {
  "Baby Names":
    "Real, usable human baby names. Draw on genuine etymology and cultural origins. Meanings and origins MUST be factually accurate — if unsure, choose a name you are sure about. Include realistic popularity context.",
  "Pet Names":
    "Charming, easy-to-call pet names (1-3 syllables shine). Mix human-style names, food/nature words, and playful inventions.",
  Fantasy:
    "High-fantasy names with coherent phonetics. Invent, but follow believable linguistic patterns (Tolkien-esque elvish softness, Norse-hard dwarven stops, sibilant serpentine tongues) matched to the prompt.",
  "Sci-Fi":
    "Futuristic names: sleek phonemes, satisfying consonant clusters, occasional alphanumerics for ships/robots. Avoid tired cliches like 'Zorg'.",
  Anime:
    "Names that feel at home in anime/manga: authentic Japanese names with correct meanings and readings where fitting, or stylized invented names matching anime conventions. Respect cultural accuracy.",
  Businesses:
    "Brandable business names: short, memorable, spellable, with available-sounding coinages. Note the naming pattern used (compound, coinage, metaphor).",
  Spells:
    "Incantation-like names: rhythmic, evocative, often Latin- or Greek-flavored roots that hint at the effect.",
};

export function buildSystemPrompt(category: string, filters: Filters, count: number): string {
  const card = CATEGORY_CARDS[category] ?? `Names for the "${category}" category. Follow the genre's conventions with coherent, pronounceable phonetics.`;

  const f: string[] = [];
  if (filters.gender) f.push(`gender: ${filters.gender}`);
  if (filters.origin) f.push(`origin/culture/language: ${filters.origin}`);
  if (filters.styles.length) f.push(`style: ${filters.styles.join(", ")}`);
  if (filters.length) f.push(`length: ${filters.length}`);
  if (filters.startsWith) f.push(`must start with: "${filters.startsWith}"`);
  if (filters.endsWith) f.push(`must end with: "${filters.endsWith}"`);
  if (filters.syllables) f.push(`syllables: ${filters.syllables}`);
  if (filters.popularity) f.push(`popularity: ${filters.popularity}`);
  if (filters.sound) f.push(`sound: ${filters.sound}`);

  return `You are the naming engine of AI Naming Studio, a premium naming platform. You are an expert in etymology, linguistics, phonoaesthetics, and genre conventions.

Category: ${category}. ${card}

${f.length ? `Hard constraints (every name MUST satisfy all):\n- ${f.join("\n- ")}` : "No extra constraints beyond the user's prompt."}

Generate exactly ${count} distinct names for the user's prompt. Vary the approaches (different roots, sounds, and strategies) — no near-duplicates.

Scoring rubric for matchScore (1-100, be discriminating — use the 55-97 range, not all 90s):
prompt fit, originality, pronunciation ease, memorability. Also return those four as subscores (1-100).

For meaning/origin of real names: be factually accurate. For invented names: describe the constructed roots honestly (e.g. "invented; from Latin 'umbra', shadow").

Respond with ONLY a JSON array (no prose, no markdown fences). Each element:
{
  "name": string,
  "gender": string ("female" | "male" | "unisex" | "n/a"),
  "meaning": string,
  "origin": string,
  "pronunciation": string (friendly respelling, e.g. "ah-REE-ah"),
  "ipa": string,
  "whyItFits": string (1-2 warm, specific sentences tying the name to the prompt),
  "nicknames": string[],
  "variations": string[],
  "styles": string[] (2-4 tags like "Elegant", "Dark", "Magical"),
  "matchScore": number,
  "subscores": { "promptFit": number, "originality": number, "pronunciation": number, "memorability": number }
}`;
}
