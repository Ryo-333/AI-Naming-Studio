import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    per: "",
    featured: false,
    items: ["10 AI generations / day", "Full name explanations", "3 collections", "Demo mode — unlimited", "Bring your own API key — unlimited"],
  },
  {
    name: "Premium",
    price: "$7.99",
    per: "/mo · $49/yr",
    featured: true,
    items: ["Unlimited AI generation", "AI naming chat expert", "Character & Baby modes", "Audio pronunciation", "All exports (PDF, cards, CSV)", "Unlimited collections"],
  },
  {
    name: "Lifetime",
    price: "$129",
    per: "once",
    featured: false,
    items: ["Everything in Premium", "Forever — no subscription", "Early access to new tools", "Made for writers & GMs"],
  },
  {
    name: "Credits",
    price: "$4.99",
    per: "/ 200 generations",
    featured: false,
    items: ["No subscription needed", "Never expires", "Perfect for naming one baby", "Stack packs anytime"],
  },
];

export default function Pricing() {
  return (
    <section className="section">
      <div className="container">
        <h1 style={{ textAlign: "center" }}>Simple, honest pricing</h1>
        <p style={{ textAlign: "center", color: "var(--text-dim)", marginBottom: 36 }}>
          Billing launches with cloud accounts in Phase 4 — today everything below the paywall is free to explore.
        </p>
        <div className="pricing-grid">
          {PLANS.map((p) => (
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
              <Link href="/generate" className={`btn ${p.featured ? "btn-aurora" : ""}`} style={{ width: "100%" }}>
                {p.featured ? "Start free" : "Try the Studio"}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
