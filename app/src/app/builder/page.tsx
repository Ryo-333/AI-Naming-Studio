"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadSettings } from "@/lib/store";
import type { CharacterSheet } from "@/lib/character";

function Field({ label, value }: { label: string; value: string | string[] }) {
  const text = Array.isArray(value) ? value : [value];
  if (text.every((t) => !t)) return null;
  return (
    <div>
      <b style={{ fontSize: "0.85rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</b>
      {text.map((t, i) => (
        <p key={i} style={{ margin: "4px 0", fontSize: "0.94rem" }}>{Array.isArray(value) ? `• ${t}` : t}</p>
      ))}
    </div>
  );
}

function sheetToMarkdown(s: CharacterSheet): string {
  return [
    `# ${s.name}`,
    `*${s.tagline}*`,
    "",
    `**Alignment:** ${s.alignment} · **Power level:** ${s.powerLevel}/100`,
    "",
    `## Appearance\n${s.appearance}\n\n**Clothing:** ${s.clothing}`,
    `## Personality\n${s.personality}`,
    `**Strengths:** ${s.strengths.join("; ")}`,
    `**Weaknesses:** ${s.weaknesses.join("; ")}`,
    `**Fears:** ${s.fears.join("; ")}`,
    `## Backstory\n${s.backstory}`,
    `## Arc\n${s.arc}`,
    `## Goals\n${s.goals}\n\n**Secret:** ${s.secrets}`,
    `## Voice\n${s.dialogueStyle}`,
    ...s.dialogueExamples.map((d) => `> ${d}`),
    `## Combat\n${s.combatStyle}\n\n**Weapons:** ${s.weapons}\n\n**Magic:** ${s.magic}`,
    `## Relationships\n${s.relationships.map((r) => `- ${r}`).join("\n")}`,
    `## Portrait prompt\n\`\`\`\n${s.portraitPrompt}\n\`\`\``,
    "",
    "*Created with AI Naming Studio*",
  ].join("\n\n");
}

function Builder() {
  const params = useSearchParams();
  const [name, setName] = useState(params.get("name") ?? "");
  const [context, setContext] = useState("");
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const build = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError("");
    setNote("");
    try {
      const s = loadSettings();
      const res = await fetch("/api/character", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          context,
          ...(s.provider !== "auto" && (s.apiKey || s.provider === "local")
            ? { provider: s.provider, apiKey: s.apiKey || undefined, baseUrl: s.baseUrl || undefined }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setSheet(data.sheet);
      if (data.note) setNote(data.note);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const copyMarkdown = async () => {
    if (sheet) await navigator.clipboard.writeText(sheetToMarkdown(sheet));
  };

  const downloadMarkdown = () => {
    if (!sheet) return;
    const blob = new Blob([sheetToMarkdown(sheet)], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${sheet.name}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <section className="section" style={{ paddingTop: 36 }}>
      <div className="container" style={{ maxWidth: 780 }}>
        <h1 style={{ fontSize: "2rem" }}>Character Builder</h1>
        <p style={{ color: "var(--text-dim)" }}>
          Turn a name into a person: appearance, voice, backstory, combat style, and a ready-to-use portrait prompt.
        </p>

        <div className="card" style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <div>
            <label htmlFor="c-name">Character name</label>
            <input id="c-name" type="text" placeholder="e.g. Vaelmira" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label htmlFor="c-ctx">Context (genre, role, world — optional but powerful)</label>
            <textarea
              id="c-ctx"
              rows={2}
              placeholder={'e.g. "exiled dragon queen reclaiming her throne in a Norse-inspired world"'}
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>
          <div>
            <button className="btn btn-aurora" onClick={build} disabled={busy || !name.trim()}>
              {busy ? <span className="spin" /> : "⚒"} {busy ? "Forging character…" : "Build character"}
            </button>
          </div>
        </div>

        {error && <div className="note-banner" style={{ marginTop: 16 }}>⚠️ {error}</div>}
        {note && <div className="note-banner" style={{ marginTop: 16 }}>{note}</div>}

        {sheet && (
          <div className="card" style={{ marginTop: 20, display: "grid", gap: 16 }}>
            <div>
              <h2 className="display" style={{ fontSize: "2rem", margin: 0 }}>{sheet.name}</h2>
              <p style={{ fontStyle: "italic", color: "var(--text-dim)", margin: "4px 0" }}>{sheet.tagline}</p>
              <div className="chips" style={{ marginTop: 8 }}>
                <span className="chip chip-static">{sheet.alignment}</span>
                <span className="chip chip-static">Power {sheet.powerLevel}/100</span>
              </div>
            </div>
            <Field label="Appearance" value={sheet.appearance} />
            <Field label="Clothing" value={sheet.clothing} />
            <Field label="Personality" value={sheet.personality} />
            <Field label="Strengths" value={sheet.strengths} />
            <Field label="Weaknesses" value={sheet.weaknesses} />
            <Field label="Fears" value={sheet.fears} />
            <Field label="Secret" value={sheet.secrets} />
            <Field label="Goals" value={sheet.goals} />
            <Field label="Backstory" value={sheet.backstory} />
            <Field label="Character arc" value={sheet.arc} />
            <Field label="Dialogue style" value={sheet.dialogueStyle} />
            <Field label="Dialogue examples" value={sheet.dialogueExamples} />
            <Field label="Combat style" value={sheet.combatStyle} />
            <Field label="Weapons" value={sheet.weapons} />
            <Field label="Magic" value={sheet.magic} />
            <Field label="Relationships" value={sheet.relationships} />
            <div>
              <b style={{ fontSize: "0.85rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Portrait prompt</b>
              <p style={{ fontSize: "0.88rem", background: "var(--surface-2)", padding: 12, borderRadius: 10 }}>{sheet.portraitPrompt}</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-sm" onClick={copyMarkdown}>Copy as Markdown</button>
              <button className="btn btn-sm" onClick={downloadMarkdown}>Download .md</button>
              <button className="btn btn-sm btn-ghost" onClick={build} disabled={busy}>↻ Reforge</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function BuilderPage() {
  return (
    <Suspense>
      <Builder />
    </Suspense>
  );
}
