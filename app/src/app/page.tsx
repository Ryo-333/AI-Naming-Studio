import Link from "next/link";

const FEATURES = [
  { icon: "✨", title: "Prompt-to-name AI", body: "Describe anyone or anything — “a powerful female dragon queen”, “a Japanese-American baby boy”, “a cozy coffee shop” — and get names you instantly love." },
  { icon: "📖", title: "Every name explained", body: "Meaning, origin, pronunciation with IPA, nicknames, variations — and why the AI chose it for your prompt." },
  { icon: "🎯", title: "AI Match Score", body: "Every name scored 1–100 on prompt fit, originality, pronunciation, and memorability, so the best rise to the top." },
  { icon: "🗂️", title: "Collections", body: "Save favorites into collections, add notes and tags, and compare candidates side by side." },
  { icon: "🎛️", title: "21 categories, 20+ filters", body: "Baby names to villains, spells to spaceships. Filter by gender, culture, syllables, style, letters, and popularity." },
  { icon: "🔑", title: "Your AI, your key", body: "Runs on Anthropic, OpenAI, Gemini, or a local model. Bring your own API key — or try demo mode free, no account needed." },
];

const PROMPTS = [
  "A powerful female dragon queen",
  "A cyberpunk hacker",
  "A prince from an underwater kingdom",
  "A modern baby girl",
  "A magical forest",
  "A vampire clan",
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="halo" aria-hidden />
        <div className="container">
          <h1>
            Every name has a story.
            <br />
            <span className="grad-text">Start yours.</span>
          </h1>
          <p className="lede">
            The premium AI naming studio for parents, writers, and worldbuilders. Generate names for babies,
            characters, kingdoms, spaceships, and brands — and understand exactly why they fit.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/generate" className="btn btn-aurora">Open the Studio →</Link>
            <Link href="/pricing" className="btn">See pricing</Link>
          </div>
          <div style={{ marginTop: 34, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {PROMPTS.map((p) => (
              <Link key={p} className="chip" href={`/generate?prompt=${encodeURIComponent(p)}`}>
                {p}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{ textAlign: "center", marginBottom: 28 }}>One studio. Every kind of name.</h2>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="card">
                <div style={{ fontSize: "1.6rem" }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p style={{ color: "var(--text-dim)", fontSize: "0.92rem" }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
