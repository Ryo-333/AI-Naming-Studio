import type { Filters, GeneratedName, GenerateRequest, Subscores } from "./types";

// Demo mode: works fully offline with a small curated corpus plus a phonetic
// composer, so the product is usable (and testable) without any API key.

interface CuratedEntry {
  name: string;
  gender: string;
  meaning: string;
  origin: string;
  pronunciation: string;
  ipa: string;
  nicknames: string[];
  variations: string[];
  styles: string[];
}

const CURATED: Record<string, CuratedEntry[]> = {
  "Baby Names": [
    { name: "Aria", gender: "female", meaning: "Air; a solo melody", origin: "Italian / Hebrew", pronunciation: "AH-ree-ah", ipa: "/ˈɑːriə/", nicknames: ["Ari", "Ria"], variations: ["Arya", "Ariah"], styles: ["Elegant", "Soft"] },
    { name: "Kaito", gender: "male", meaning: "Ocean flying; sea and soar", origin: "Japanese", pronunciation: "KYE-toh", ipa: "/kaito/", nicknames: ["Kai"], variations: ["Kaitou"], styles: ["Modern", "Strong"] },
    { name: "Amara", gender: "female", meaning: "Grace, mercy; eternal", origin: "Igbo / Sanskrit", pronunciation: "ah-MAH-rah", ipa: "/əˈmɑːrə/", nicknames: ["Mara", "Ama"], variations: ["Amarachi", "Amora"], styles: ["Elegant", "Unique"] },
    { name: "Elowen", gender: "female", meaning: "Elm tree", origin: "Cornish", pronunciation: "eh-LOH-wen", ipa: "/ɛˈloʊwɛn/", nicknames: ["Elo", "Wen"], variations: ["Elowyn"], styles: ["Magical", "Rare"] },
    { name: "Theo", gender: "male", meaning: "Gift of God", origin: "Greek", pronunciation: "THEE-oh", ipa: "/ˈθiːoʊ/", nicknames: ["T"], variations: ["Theodore", "Teo"], styles: ["Classic", "Cute"] },
    { name: "Zuri", gender: "unisex", meaning: "Beautiful, good", origin: "Swahili", pronunciation: "ZOO-ree", ipa: "/ˈzuːri/", nicknames: ["Zu"], variations: ["Zurie"], styles: ["Modern", "Unique"] },
    { name: "Soren", gender: "male", meaning: "Stern; from Severus", origin: "Danish", pronunciation: "SOR-en", ipa: "/ˈsɔːrən/", nicknames: ["Sor"], variations: ["Søren", "Soeren"], styles: ["Strong", "Elegant"] },
    { name: "Imara", gender: "female", meaning: "Firm, resolute", origin: "Swahili", pronunciation: "ee-MAH-rah", ipa: "/iˈmɑːrə/", nicknames: ["Ima"], variations: ["Imarah"], styles: ["Strong", "Rare"] },
  ],
  "Pet Names": [
    { name: "Mochi", gender: "unisex", meaning: "Japanese rice cake — soft and sweet", origin: "Japanese", pronunciation: "MOH-chee", ipa: "/ˈmoʊtʃi/", nicknames: ["Mo"], variations: ["Mochee"], styles: ["Cute", "Funny"] },
    { name: "Biscuit", gender: "unisex", meaning: "Warm, golden baked treat", origin: "English", pronunciation: "BIS-kit", ipa: "/ˈbɪskɪt/", nicknames: ["Bisky"], variations: ["Biscotti"], styles: ["Cute", "Funny"] },
    { name: "Nimbus", gender: "unisex", meaning: "Halo; rain cloud", origin: "Latin", pronunciation: "NIM-bus", ipa: "/ˈnɪmbəs/", nicknames: ["Nim"], variations: ["Nimbo"], styles: ["Magical", "Unique"] },
    { name: "Juno", gender: "female", meaning: "Roman queen of the gods", origin: "Latin", pronunciation: "JOO-noh", ipa: "/ˈdʒuːnoʊ/", nicknames: ["Ju"], variations: ["Juneau"], styles: ["Royal", "Strong"] },
  ],
  Businesses: [
    { name: "Emberline", gender: "n/a", meaning: "Coinage: ember + line — warmth with direction", origin: "Invented (English roots)", pronunciation: "EM-ber-line", ipa: "/ˈɛmbərlaɪn/", nicknames: [], variations: ["Emberlane"], styles: ["Elegant", "Modern"] },
    { name: "Northloom", gender: "n/a", meaning: "Compound: north + loom — craft with a compass", origin: "Invented (English roots)", pronunciation: "NORTH-loom", ipa: "/ˈnɔːrθluːm/", nicknames: [], variations: ["Nordloom"], styles: ["Strong", "Modern"] },
    { name: "Solvana", gender: "n/a", meaning: "Coinage from Latin 'sol' (sun) — bright, restorative", origin: "Invented (Latin roots)", pronunciation: "sol-VAH-nah", ipa: "/sɒlˈvɑːnə/", nicknames: [], variations: ["Solvane"], styles: ["Elegant", "Futuristic"] },
  ],
};

// Phonetic banks for composed names, keyed by vibe.
const BANKS: Record<string, { starts: string[]; mids: string[]; ends: string[] }> = {
  fantasy: {
    starts: ["Ael", "Thal", "Mor", "Syl", "Er", "Vael", "Kael", "Lir", "Ny", "Or"],
    mids: ["a", "e", "ia", "o", "y", "ae", "i"],
    ends: ["wyn", "dor", "riel", "mir", "thas", "lian", "dris", "vane", "noth", "ra"],
  },
  scifi: {
    starts: ["Vex", "Kor", "Zar", "Nyx", "Ax", "Cy", "Or", "Hel", "Tau", "Ves"],
    mids: ["a", "e", "i", "o", "u"],
    ends: ["ion", "ex", "ara", "is", "on", "ix", "ea", "os", "un", "ir"],
  },
  dark: {
    starts: ["Mal", "Dra", "Noc", "Vor", "Umb", "Grim", "Sable", "Rav", "Mor", "Bel"],
    mids: ["a", "o", "e", "u"],
    ends: ["thor", "gath", "wraith", "mora", "dane", "kesh", "noir", "veil", "os", "ath"],
  },
  soft: {
    starts: ["Lu", "Mi", "Sera", "Ala", "Ne", "Li", "Ava", "El", "Isa", "Ona"],
    mids: ["a", "e", "i", "o"],
    ends: ["la", "na", "elle", "ari", "lie", "mi", "ra", "wen", "ia", "lyn"],
  },
};

const VIBE_BY_CATEGORY: Record<string, keyof typeof BANKS> = {
  Fantasy: "fantasy", Kingdoms: "fantasy", Guilds: "fantasy", Spells: "fantasy",
  Mythology: "fantasy", Royal: "fantasy", Weapons: "dark", Villains: "dark",
  "Sci-Fi": "scifi", Planets: "scifi", Aliens: "scifi", Robots: "scifi",
  Superheroes: "scifi", Cities: "fantasy", Anime: "soft", Historical: "fantasy",
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

function clamp(n: number) {
  return Math.max(55, Math.min(97, Math.round(n)));
}

function makeSubscores(r: () => number): Subscores {
  return {
    promptFit: clamp(70 + r() * 27),
    originality: clamp(60 + r() * 37),
    pronunciation: clamp(65 + r() * 32),
    memorability: clamp(62 + r() * 35),
  };
}

function scoreOf(s: Subscores): number {
  return Math.round(s.promptFit * 0.4 + s.originality * 0.2 + s.pronunciation * 0.2 + s.memorability * 0.2);
}

function matchesFilters(e: CuratedEntry, f: Filters): boolean {
  if (f.gender && e.gender !== "unisex" && e.gender !== "n/a" && e.gender !== f.gender.toLowerCase()) return false;
  if (f.startsWith && !e.name.toLowerCase().startsWith(f.startsWith.toLowerCase())) return false;
  if (f.endsWith && !e.name.toLowerCase().endsWith(f.endsWith.toLowerCase())) return false;
  return true;
}

export function demoGenerate(req: GenerateRequest): GeneratedName[] {
  const count = Math.min(req.count ?? 12, 24);
  const seed = hash(`${req.prompt}|${req.category}|${JSON.stringify(req.filters)}`);
  const r = rng(seed);
  const out: GeneratedName[] = [];
  const seen = new Set<string>();

  const curated = (CURATED[req.category] ?? []).filter((e) => matchesFilters(e, req.filters));
  for (const e of curated) {
    if (out.length >= count) break;
    const sub = makeSubscores(r);
    seen.add(e.name);
    out.push({
      id: crypto.randomUUID(),
      category: req.category,
      whyItFits: `${e.name} carries the feeling of "${req.prompt.slice(0, 60)}" — ${e.meaning.toLowerCase()}, with a sound that is easy to love and hard to forget.`,
      matchScore: scoreOf(sub),
      subscores: sub,
      ...e,
    });
  }

  const vibe = req.filters.styles.includes("Dark")
    ? "dark"
    : req.filters.styles.includes("Cute") || req.filters.styles.includes("Soft")
      ? "soft"
      : VIBE_BY_CATEGORY[req.category] ?? "fantasy";
  const bank = BANKS[vibe];

  let guard = 0;
  while (out.length < count && guard++ < 200) {
    const start = bank.starts[Math.floor(r() * bank.starts.length)];
    const mid = r() > 0.5 ? bank.mids[Math.floor(r() * bank.mids.length)] : "";
    const end = bank.ends[Math.floor(r() * bank.ends.length)];
    let name = `${start}${mid}${end}`;
    name = name[0].toUpperCase() + name.slice(1);
    if (req.filters.startsWith) {
      const p = req.filters.startsWith;
      name = p[0].toUpperCase() + p.slice(1).toLowerCase() + name.slice(p.length).toLowerCase();
    }
    if (seen.has(name)) continue;
    seen.add(name);
    const sub = makeSubscores(r);
    out.push({
      id: crypto.randomUUID(),
      name,
      category: req.category,
      gender: req.filters.gender ?? "unisex",
      meaning: `Invented; composed from the roots "${start.toLowerCase()}" and "${end}" for a ${vibe === "dark" ? "shadowed, formidable" : vibe === "soft" ? "gentle, melodic" : vibe === "scifi" ? "sleek, futuristic" : "mythic, storied"} sound.`,
      origin: "Constructed (AI Naming Studio demo composer)",
      pronunciation: name.replace(/([aeiouy]+)/gi, "$1·").replace(/·$/, ""),
      ipa: "",
      whyItFits: `Built to match "${req.prompt.slice(0, 60)}": its ${vibe} phonetics land the tone, and at ${name.length} letters it stays memorable.`,
      nicknames: [name.slice(0, Math.max(2, Math.ceil(name.length / 2)))],
      variations: [`${name}a`, `${name.slice(0, -1)}is`],
      styles: req.filters.styles.length ? req.filters.styles : [vibe === "dark" ? "Dark" : vibe === "soft" ? "Cute" : vibe === "scifi" ? "Futuristic" : "Magical", "Unique"],
      matchScore: scoreOf(sub),
      subscores: sub,
    });
  }

  return out.sort((a, b) => b.matchScore - a.matchScore);
}
