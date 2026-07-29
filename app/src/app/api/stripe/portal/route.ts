import { NextRequest, NextResponse } from "next/server";
import { getEntitlement, getStripe, stripeEnabled, userFromToken } from "@/lib/billing-server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!stripeEnabled()) {
    return NextResponse.json({ error: "Billing is not enabled on this deployment yet." }, { status: 501 });
  }

  const user = await userFromToken(req.headers.get("authorization"));
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const ent = await getEntitlement(user.id);
  if (!ent?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing history yet." }, { status: 404 });
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: ent.stripe_customer_id,
      return_url: `${origin}/account`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: `Could not open billing portal: ${err instanceof Error ? err.message : "unknown error"}` },
      { status: 502 },
    );
  }
}
