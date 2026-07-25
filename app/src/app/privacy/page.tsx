import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — AI Naming Studio",
  description: "How AI Naming Studio handles your data.",
};

export default function PrivacyPage() {
  return (
    <section className="section" style={{ paddingTop: 48 }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <h1>Privacy Policy</h1>
        <p style={{ color: "var(--text-dim)" }}>Last updated: July 2026</p>

        <h2 style={{ fontSize: "1.2rem", marginTop: 28 }}>What we collect</h2>
        <p>
          <b>Account data.</b> If you create an account, we store your email address and your saved
          collections (names, notes, tags) so they can sync across your devices. Accounts are optional —
          without one, favorites live only in your browser.
        </p>
        <p>
          <b>Prompts.</b> The text you type to generate names is sent to an AI provider to produce results.
          We do not use your prompts to train models, build advertising profiles, or sell to anyone.
        </p>
        <p>
          <b>Your own API keys.</b> If you add a personal AI provider key in Settings, it is stored only in
          your browser&apos;s local storage and passed through per-request. We never write it to our servers or logs.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: 28 }}>Services we rely on</h2>
        <p>
          Hosting by Vercel; authentication and database by Supabase; AI generation by the configured
          provider (OpenAI, Anthropic, or Google), which processes your prompt text under its own API terms.
          We don&apos;t run third-party advertising or tracking networks.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: 28 }}>Your choices</h2>
        <p>
          You can use the product without an account; clear saved names by clearing your browser storage;
          or delete your account data by contacting us. Sign-in uses one-time email links — we never store passwords.
        </p>

        <h2 style={{ fontSize: "1.2rem", marginTop: 28 }}>Children</h2>
        <p>The service is not directed at children under 13, and we don&apos;t knowingly collect their data.</p>

        <h2 style={{ fontSize: "1.2rem", marginTop: 28 }}>Contact</h2>
        <p>
          Questions or data requests: open an issue at{" "}
          <a href="https://github.com/Ryo-333/AI-Naming-Studio" rel="noopener">github.com/Ryo-333/AI-Naming-Studio</a>.
        </p>
      </div>
    </section>
  );
}
