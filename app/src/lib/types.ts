export interface Subscores {
  promptFit: number;
  originality: number;
  pronunciation: number;
  memorability: number;
}

export interface GeneratedName {
  id: string;
  name: string;
  category: string;
  gender?: string;
  meaning: string;
  origin: string;
  pronunciation: string;
  ipa?: string;
  whyItFits: string;
  nicknames: string[];
  variations: string[];
  styles: string[];
  matchScore: number;
  subscores: Subscores;
}

export interface Filters {
  gender?: string;
  origin?: string;
  styles: string[];
  length?: string;
  startsWith?: string;
  endsWith?: string;
  syllables?: string;
  popularity?: string;
  sound?: string;
}

export type ProviderId = "anthropic" | "openai" | "gemini" | "local" | "demo";

export interface GenerateRequest {
  prompt: string;
  category: string;
  filters: Filters;
  count?: number;
  provider?: ProviderId;
  apiKey?: string;
  baseUrl?: string;
}

export interface GenerateResponse {
  names: GeneratedName[];
  provider: ProviderId;
  model?: string;
  note?: string;
}

export interface SavedName extends GeneratedName {
  savedAt: number;
  note?: string;
  tags: string[];
  rating?: number;
}

export interface Collection {
  id: string;
  title: string;
  names: SavedName[];
}

export const CATEGORIES = [
  "Baby Names",
  "Character Names",
  "Fantasy",
  "Sci-Fi",
  "Anime",
  "Historical",
  "Mythology",
  "Royal",
  "Modern",
  "Pet Names",
  "Cities",
  "Kingdoms",
  "Weapons",
  "Spells",
  "Guilds",
  "Businesses",
  "Planets",
  "Aliens",
  "Robots",
  "Superheroes",
  "Villains",
] as const;

export const STYLE_TAGS = [
  "Elegant",
  "Cute",
  "Dark",
  "Heroic",
  "Royal",
  "Magical",
  "Funny",
  "Ancient",
  "Futuristic",
  "Unique",
  "Soft",
  "Strong",
  "Unisex",
] as const;
