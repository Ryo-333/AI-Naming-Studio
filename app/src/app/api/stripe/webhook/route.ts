import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  CREDITS_PER_PACK,
  getEntitlement,
  getStripe,
  getSupabaseAdmin,
  stripeEnabled,
  upsertEntitlement,
} from "@/lib/billing-server";

export const runtime = "nodejs";

async function userIdForCustomer(customerId: string): Promise<string | null> {
  const { data } = await getSupabaseAdmin()
    .from("entitlements")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return (data?.user_id as string) ?? null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id ?? session.client_reference_id;
  const plan = session.metadata?.plan;
  if (!userId) return;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

  if (plan === "credits") {
    const current = await getEntitlement(userId);
    await upsertEntitlement({
      user_id: userId,
      credits: (current?.credits ?? 0) + CREDITS_PER_PACK,
      stripe_customer_id: customerId ?? current?.stripe_customer_id ?? null,
    });
  } else if (plan === "lifetime") {
    await upsertEntitlement({ user_id: userId, plan: "lifetime", stripe_customer_id: customerId });
  } else if (plan === "premium_monthly" || plan === "premium_yearly") {
    await upsertEntitlement({ user_id: userId, plan: "premium", stripe_customer_id: customerId });
  }
}

async function handleSubscriptionChange(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const userId = sub.metadata?.user_id ?? (await userIdForCustomer(customerId));
  if (!userId) return;

  const current = await getEntitlement(userId);
  if (current?.plan === "lifetime") return; // lifetime never downgrades

  const active = sub.status === "active" || sub.status === "trialing" || sub.status === "past_due";
  const periodEnd = sub.items.data[0]?.current_period_end;
  await upsertEntitlement({
    user_id: userId,
    plan: active ? "premium" : "free",
    stripe_customer_id: customerId,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
  });
}

export async function POST(req: NextRequest) {
  if (!stripeEnabled() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Billing not configured." }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    const payload = await req.text();
    event = getStripe().webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: `Signature verification failed: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChange(event.data.object);
        break;
      default:
        break; // unhandled event types are fine
    }
  } catch (err) {
    // Non-2xx makes Stripe retry — desirable for transient DB failures.
    return NextResponse.json(
      { error: `Handler failed: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
