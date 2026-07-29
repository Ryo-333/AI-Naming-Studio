import Stripe from "stripe";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

// Server-side billing helpers. Everything is lazily initialized so the app
// builds and runs (with billing disabled) when Stripe env vars are absent.

export type PlanKey = "premium_monthly" | "premium_yearly" | "lifetime" | "credits";

export const CREDITS_PER_PACK = 200;

export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured");
  if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
}

export function priceIdFor(plan: PlanKey): string | undefined {
  const map: Record<PlanKey, string | undefined> = {
    premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
    premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
    lifetime: process.env.STRIPE_PRICE_LIFETIME,
    credits: process.env.STRIPE_PRICE_CREDITS,
  };
  return map[plan];
}

export function isSubscription(plan: PlanKey): boolean {
  return plan === "premium_monthly" || plan === "premium_yearly";
}

let admin: SupabaseClient | null = null;
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service role is not configured");
  if (!admin) admin = createClient(new URL(url).origin, key, { auth: { persistSession: false } });
  return admin;
}

// Resolve the signed-in user from a client-supplied access token.
export async function userFromToken(authHeader: string | null): Promise<User | null> {
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  return error ? null : data.user;
}

export interface EntitlementRow {
  user_id: string;
  plan: string;
  credits: number;
  stripe_customer_id: string | null;
  current_period_end: string | null;
}

export async function getEntitlement(userId: string): Promise<EntitlementRow | null> {
  const { data } = await getSupabaseAdmin().from("entitlements").select("*").eq("user_id", userId).maybeSingle();
  return (data as EntitlementRow) ?? null;
}

export async function upsertEntitlement(row: Partial<EntitlementRow> & { user_id: string }): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("entitlements")
    .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
}
