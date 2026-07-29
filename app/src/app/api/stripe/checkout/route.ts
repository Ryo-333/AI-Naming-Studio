import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getEntitlement,
  getStripe,
  isSubscription,
  priceIdFor,
  stripeEnabled,
  userFromToken,
  type PlanKey,
} from "@/lib/billing-server";

export const runtime = "nodejs";

const Body = z.object({
  plan: z.enum(["premium_monthly", "premium_yearly", "lifetime", "credits"]),
});

export async function POST(req: NextRequest) {
  if (!stripeEnabled()) {
    return NextResponse.json({ error: "Billing is not enabled on this deployment yet." }, { status: 501 });
  }

  const user = await userFromToken(req.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Sign in first to purchase." }, { status: 401 });
  }

  let plan: PlanKey;
  try {
    plan = Body.parse(await req.json()).plan;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const price = priceIdFor(plan);
  if (!price) {
    return NextResponse.json({ error: `Price for "${plan}" is not configured.` }, { status: 501 });
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const existing = await getEntitlement(user.id);

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: isSubscription(plan) ? "subscription" : "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/account?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan },
      ...(isSubscription(plan) ? { subscription_data: { metadata: { user_id: user.id, plan } } } : {}),
      ...(existing?.stripe_customer_id
        ? { customer: existing.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
      allow_promotion_codes: true,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: `Could not start checkout: ${err instanceof Error ? err.message : "unknown error"}` },
      { status: 502 },
    );
  }
}
