"use client";

import { getSupabase } from "./supabase";

export interface Entitlement {
  plan: "free" | "premium" | "lifetime";
  credits: number;
  hasBilling: boolean;
  currentPeriodEnd: string | null;
}

export async function fetchEntitlement(): Promise<Entitlement | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) return null;
  const { data } = await sb.from("entitlements").select("*").maybeSingle();
  if (!data) return { plan: "free", credits: 0, hasBilling: false, currentPeriodEnd: null };
  return {
    plan: (data.plan as Entitlement["plan"]) ?? "free",
    credits: data.credits ?? 0,
    hasBilling: Boolean(data.stripe_customer_id),
    currentPeriodEnd: data.current_period_end ?? null,
  };
}

async function authedPost(path: string, body?: unknown): Promise<{ url?: string; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: "Cloud accounts are not configured." };
  const { data } = await sb.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { error: "sign-in-required" };
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : "{}",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return { error: json.error ?? `Request failed (${res.status})` };
  return json;
}

// Both return a URL to redirect the browser to (Stripe-hosted pages).
export function startCheckout(plan: "premium_monthly" | "premium_yearly" | "lifetime" | "credits") {
  return authedPost("/api/stripe/checkout", { plan });
}

export function openBillingPortal() {
  return authedPost("/api/stripe/portal");
}
