"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Tolerate imperfect env values: stray whitespace, trailing slashes, or a
// pasted endpoint path like https://xyz.supabase.co/rest/v1/ — only the
// origin matters.
function normalize(raw?: string): string | undefined {
  const t = raw?.trim();
  if (!t) return undefined;
  try {
    return new URL(t).origin;
  } catch {
    return undefined;
  }
}

const url = normalize(process.env.NEXT_PUBLIC_SUPABASE_URL);
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const supabaseConfigured = Boolean(url && anon);
export const supabaseHost = url ? new URL(url).host : null;

let client: SupabaseClient | null = null;

// Null when Supabase env vars are absent — the app then runs local-only.
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!client) client = createClient(url!, anon!);
  return client;
}
