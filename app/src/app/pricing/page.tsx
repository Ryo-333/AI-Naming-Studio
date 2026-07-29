"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchEntitlement, startCheckout, type Entitlement } from "@/lib/billing";

type PlanKey = "premium_monthly" | "premium_yearly" | "lifetime" | "credits";

const PLANS: {
  name: string;
  price: string;
  per: string;
  featured: boolean;
  plan?: PlanKey;
  cta: string;
  items: string[];
}[] = [
  {
    name: "Free",
    price: "$0",
    per: "",
    featured: false,
    cta: "Try the Studio",
    items: ["10 AI generations / day", "Full name explanations", "3 collections", "Demo mode — unlimited", "Bring your own API key — unlimited"],
  },
  {
    name: "Premium",
    price: "$7.99",
    per: "/mo",
    featured: true,
    plan: "premium_monthly",
    cta: "Go Premium",
    items: ["Unlimited AI generation", "AI naming chat expert", "Character & Baby modes", "All exports (PDF, cards, CSV)", "Unlimited collections"],
  },
  {
    name: "Premium Yearly",
    price: "$49",
    per: "/yr — save 49%",
    featured: false,
    plan: "premium_yearly",
    cta: "Go Premium Yearly",
    items: ["Everything in Premium", "Two months on us", "Best for writers mid-project"],
  },
  {
    name: "Lifetime",
    price: "$129",
    per: "once",
    featured: false,
    plan: "lifetime",
    cta: "Own it forever",
    items: ["Everything in Premium, forever", "Early access to new tools", "Made for writers & GMs"],
  },
  {
    name: "Credits",
    price: "$4.99",
    per: "/ 200 generations",
    featured: false,
    plan: "credits",
    cta: "Buy credits",
    items: ["No subscription needed", "Never expires", "Perfect for naming one baby", "Stack packs anytime"],
  },
];

function PricingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [ent, setEnt] = useState<Entitlement | null>(null);
  const [busy, setBusy] = useState<PlanKey | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    void fetchEntitlement().then(setEnt);
    if (params.get("checkout") === "cancelled") setMsg("Checkout cancelled — no charge was made.");
  }, [params]);

  const buy = async (plan: PlanKey) => {
    setBusy(plan);
    setMsg("");
    const r = await startCheckout(plan);
    setBusy(null);
    if (r.url) {
      window.location.href = r.url;
    } else if (r.error === "sign-in-required") {
      setMsg("Create a free account first — redirecting…");
      setTimeout(() => router.push("/account"), 1200);
    } else if (r.error) {
      setMsg(`⚠️ ${r.error}`);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h1 style={{ textAlign: "center" }}>Simple, honest pricing</h1>
        <p style={{ textAlign: "center", color: "var(--text-dim)", marginBottom: 12 }}>
          Start free. Upgrade when the names matter.
          {ent && ent.plan !== "free" && (
            <span className="chip chip-static" style={{ marginLeft: 8 }}>
              Current plan: {ent.plan === "lifetime" ? "Lifetime ✦" : "Premium"}
            </span>
          )}
        </p>
        {msg && <div className="note-banner" style={{ maxWidth: 560, margin: "0 auto 20px", textAlign: "center" }}>{msg}</div>}
        <div className="pricing-grid">
          {PLANS.map((p) => {
            const owned = Boolean(
              (ent?.plan === "lifetime" && (p.plan === "lifetime" || p.plan?.startsWith("premium"))) ||
                (ent?.plan === "premium" && p.plan?.startsWith("premium")),
            );
            return (
              <div key={p.name} className={`card ${p.featured ? "plan-featured" : ""}`}>
                <h3>{p.name}</h3>
                <div className="price">
                  {p.price} <small>{p.per}</small>
                </div>
                <ul style={{ paddingLeft: 18, color: "var(--text-dim)", fontSize: "0.9rem" }}>
                  {p.items.map((i) => (
                    <li key={i} style={{ margin: "6px 0" }}>{i}</li>
                  ))}
                </ul>
                {p.plan ? (
                  <button
                    className={`btn ${p.featured ? "btn-aurora" : ""}`}
                    style={{ width: "100%" }}
                    disabled={busy !== null || owned}
                    onClick={() => buy(p.plan!)}
                  >
                    {owned ? "✓ Included in your plan" : busy === p.plan ? <span className="spin" /> : p.cta}
                  </button>
                ) : (
                  <a href="/generate" className="btn" style={{ width: "100%" }}>
                    {p.cta}
                  </a>
                )}
              </div>
            );
          })}
        </div>
        <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.85rem", marginTop: 24 }}>
          Payments are processed by Stripe. Subscriptions can be cancelled anytime from your Account page.
        </p>
      </div>
    </section>
  );
}

export default function Pricing() {
  return (
    <Suspense>
      <PricingInner />
    </Suspense>
  );
}
