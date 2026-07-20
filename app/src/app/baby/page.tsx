"use client";

import { useMemo, useState } from "react";
import { analyzePairing, analyzeSiblings, deriveNicknames, syllableCount, type CheckItem } from "@/lib/baby";

function Checks({ items }: { items: CheckItem[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {items.map((c, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.05rem" }}>{c.ok ? "✅" : "⚠️"}</span>
          <div>
            <b style={{ fontSize: "0.92rem" }}>{c.label}</b>
            <div style={{ color: "var(--text-dim)", fontSize: "0.88rem" }}>{c.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BabyPage() {
  const [first, setFirst] = useState("");
  const [middle, setMiddle] = useState("");
  const [last, setLast] = useState("");
  const [siblings, setSiblings] = useState("");

  const pairing = useMemo(() => analyzePairing(first, middle, last), [first, middle, last]);
  const sibs = useMemo(() => analyzeSiblings(first, siblings.split(",")), [first, siblings]);
  const nicknames = useMemo(() => deriveNicknames(first), [first]);

  const full = [first, middle, last].filter((s) => s.trim()).join(" ");

  return (
    <section className="section" style={{ paddingTop: 36 }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: "2rem" }}>Baby Mode</h1>
        <p style={{ color: "var(--text-dim)" }}>
          Test a name the way it will actually be used: said aloud, monogrammed, and shouted across a playground —
          alongside the siblings it will live with.
        </p>

        <div className="card" style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            <div>
              <label htmlFor="b-first">First name</label>
              <input id="b-first" type="text" placeholder="e.g. Elowen" value={first} onChange={(e) => setFirst(e.target.value)} />
            </div>
            <div>
              <label htmlFor="b-middle">Middle name (optional)</label>
              <input id="b-middle" type="text" placeholder="e.g. Mae" value={middle} onChange={(e) => setMiddle(e.target.value)} />
            </div>
            <div>
              <label htmlFor="b-last">Last name</label>
              <input id="b-last" type="text" placeholder="e.g. Carter" value={last} onChange={(e) => setLast(e.target.value)} />
            </div>
          </div>
          <div>
            <label htmlFor="b-sibs">Sibling names (comma-separated, optional)</label>
            <input id="b-sibs" type="text" placeholder="e.g. Theo, Juniper" value={siblings} onChange={(e) => setSiblings(e.target.value)} />
          </div>
        </div>

        {full && first.trim() && last.trim() && (
          <div className="card" style={{ marginTop: 18 }}>
            <h3 className="display" style={{ fontSize: "1.6rem" }}>{full}</h3>
            <p style={{ color: "var(--text-dim)", fontSize: "0.88rem", marginBottom: 14 }}>
              {syllableCount(first)}–{middle ? `${syllableCount(middle)}–` : ""}{syllableCount(last)} syllable rhythm
            </p>
            <Checks items={pairing} />
          </div>
        )}

        {nicknames.length > 0 && (
          <div className="card" style={{ marginTop: 18 }}>
            <h3>Likely nicknames</h3>
            <p style={{ color: "var(--text-dim)", fontSize: "0.88rem" }}>
              The playground will pick one whether you like it or not — make sure you can live with these:
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {nicknames.map((n) => <span key={n} className="chip chip-static" style={{ fontSize: "0.95rem", padding: "6px 14px" }}>{n}</span>)}
            </div>
          </div>
        )}

        {sibs.length > 0 && (
          <div className="card" style={{ marginTop: 18 }}>
            <h3>Sibling set</h3>
            <Checks items={sibs} />
          </div>
        )}

        {first.trim() && (
          <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", marginTop: 20 }}>
            Need middle-name or sibling ideas? Ask the <a href={`/chat`}>Naming Expert</a> or run the{" "}
            <a href={`/generate?prompt=${encodeURIComponent(`middle names that flow with ${first} ${last}`.trim())}`}>Studio</a>{" "}
            with this name.
          </p>
        )}
      </div>
    </section>
  );
}
