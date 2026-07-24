"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

let client: SupabaseClient | null = null;

// Null when Supabase env vars are absent — the app then runs local-only.
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!client) client = createClient(url!, anon!);
  return client;
}
