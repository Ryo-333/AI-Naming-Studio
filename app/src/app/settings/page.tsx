"use client";

import { useEffect, useState } from "react";
import { loadSettings, saveSettings, type ProviderSettings } from "@/lib/store";

export default function SettingsPage() {
  const [s, setS] = useState<ProviderSettings>({ provider: "auto", apiKey: "", baseUrl: "" });
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => setS(loadSettings()), []);

  const save = () => {
    saveSettings(s);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  };

  return (
    <section className="section" style={{ paddingTop: 36 }}>
      <div className="container" style={{ maxWidth: 640 }}>
        <h1 style={{ fontSize: "2rem" }}>Settings</h1>
        <p style={{ color: "var(--text-dim)" }}>
          Bring your own AI. Your key is stored <b>only in this browser</b> and sent per-request over TLS — never
          logged or saved on our servers.
        </p>

        <div className="card" style={{ display: "grid", gap: 14, marginTop: 16 }}>
          <div>
            <label htmlFor="provider">AI provider</label>
            <select
              id="provider"
              value={s.provider}
              onChange={(e) => setS({ ...s, provider: e.target.value as ProviderSettings["provider"] })}
            >
              <option value="auto">Auto (server default / demo mode)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
              <option value="local">Local / Ollama (OpenAI-compatible)</option>
            </select>
          </div>

          {s.provider !== "auto" && s.provider !== "local" && (
            <div>
              <label htmlFor="apikey">API key</label>
              <input
                id="apikey"
                type="password"
                placeholder="sk-…"
                value={s.apiKey}
                onChange={(e) => setS({ ...s, apiKey: e.target.value })}
              />
            </div>
          )}

          {s.provider === "local" && (
            <div>
              <label htmlFor="baseurl">Base URL</label>
              <input
                id="baseurl"
                type="text"
                placeholder="http://localhost:11434"
                value={s.baseUrl}
                onChange={(e) => setS({ ...s, baseUrl: e.target.value })}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn btn-primary" onClick={save}>Save settings</button>
            {savedFlash && <span style={{ color: "var(--primary)", fontSize: "0.9rem" }}>✓ Saved</span>}
          </div>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h3>Demo mode</h3>
          <p style={{ color: "var(--text-dim)", fontSize: "0.92rem" }}>
            With no key configured anywhere, the Studio runs on a curated offline dataset and phonetic composer —
            great for trying the product, and it works with zero network access.
          </p>
        </div>
      </div>
    </section>
  );
}
