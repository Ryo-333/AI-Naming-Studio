"use client";

import { useState } from "react";
import { useCollections } from "@/lib/store";
import type { SavedName } from "@/lib/types";
import { ScoreRing } from "@/components/ScoreRing";
import { exportCSV, exportImageCard, exportJSON, exportMarkdown } from "@/lib/export";

export default function FavoritesPage() {
  const { collections, removeName, updateName, createCollection, deleteCollection } = useCollections();
  const [activeId, setActiveId] = useState("default");
  const [newTitle, setNewTitle] = useState("");
  const [compare, setCompare] = useState<string[]>([]);

  const active = collections.find((c) => c.id === activeId) ?? collections[0];
  const compared: SavedName[] = active ? active.names.filter((n) => compare.includes(n.id)) : [];

  const toggleCompare = (id: string) =>
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c));

  return (
    <section className="section" style={{ paddingTop: 36 }}>
      <div className="container">
        <h1 style={{ fontSize: "2rem" }}>Favorites</h1>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", margin: "14px 0 22px" }}>
          {collections.map((c) => (
            <button
              key={c.id}
              className="chip"
              data-on={active?.id === c.id}
              onClick={() => {
                setActiveId(c.id);
                setCompare([]);
              }}
            >
              {c.title} ({c.names.length})
            </button>
          ))}
          <span style={{ display: "inline-flex", gap: 6, marginLeft: "auto" }}>
            <input
              type="text"
              placeholder="New collection…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ width: 170, padding: "6px 10px" }}
            />
            <button
              className="btn btn-sm"
              onClick={() => {
                if (newTitle.trim()) {
                  createCollection(newTitle.trim());
                  setNewTitle("");
                }
              }}
            >
              + Create
            </button>
          </span>
        </div>

        {active && active.names.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            <span style={{ color: "var(--text-dim)", fontSize: "0.85rem", alignSelf: "center" }}>Export:</span>
            <button className="btn btn-sm" onClick={() => exportCSV(active)}>CSV</button>
            <button className="btn btn-sm" onClick={() => exportMarkdown(active)}>Markdown</button>
            <button className="btn btn-sm" onClick={() => exportJSON(active)}>JSON</button>
          </div>
        )}

        {compared.length >= 2 && (
          <div className="card" style={{ marginBottom: 22, overflowX: "auto" }}>
            <h3>Side-by-side</h3>
            <table className="compare-table">
              <thead>
                <tr>
                  <th />
                  {compared.map((n) => <th key={n.id}>{n.name}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr><td><b>Score</b></td>{compared.map((n) => <td key={n.id}>{n.matchScore}/100</td>)}</tr>
                <tr><td><b>Meaning</b></td>{compared.map((n) => <td key={n.id}>{n.meaning}</td>)}</tr>
                <tr><td><b>Origin</b></td>{compared.map((n) => <td key={n.id}>{n.origin}</td>)}</tr>
                <tr><td><b>Pronunciation</b></td>{compared.map((n) => <td key={n.id}>{n.pronunciation}</td>)}</tr>
                <tr><td><b>Nicknames</b></td>{compared.map((n) => <td key={n.id}>{n.nicknames.join(", ") || "—"}</td>)}</tr>
                <tr><td><b>Your note</b></td>{compared.map((n) => <td key={n.id}>{n.note || "—"}</td>)}</tr>
              </tbody>
            </table>
          </div>
        )}

        {active && active.names.length > 0 ? (
          <div className="results-grid">
            {active.names.map((n) => (
              <div key={n.id} className="card name-card">
                <div className="name-row">
                  <div>
                    <div className="the-name">{n.name}</div>
                    <div className="pron">{n.category} · {n.pronunciation}</div>
                  </div>
                  <ScoreRing score={n.matchScore} />
                </div>
                <div className="meta"><b>Meaning:</b> {n.meaning}</div>
                <div>
                  <label htmlFor={`note-${n.id}`}>Note</label>
                  <textarea
                    id={`note-${n.id}`}
                    rows={1}
                    placeholder="Why you love it…"
                    defaultValue={n.note ?? ""}
                    onBlur={(e) => updateName(active.id, n.id, { note: e.target.value })}
                  />
                </div>
                <div className="actions" style={{ flexWrap: "wrap" }}>
                  <button className="btn btn-sm" data-on={compare.includes(n.id)} onClick={() => toggleCompare(n.id)}>
                    {compare.includes(n.id) ? "✓ Comparing" : "⇄ Compare"}
                  </button>
                  <button className="btn btn-sm" onClick={() => exportImageCard(n)} title="Download share card (PNG)">
                    🖼 Card
                  </button>
                  <a className="btn btn-sm" href={`/builder?name=${encodeURIComponent(n.name)}`} title="Build a full character from this name">
                    ⚒ Character
                  </a>
                  <button className="btn btn-sm btn-ghost" onClick={() => removeName(active.id, n.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "var(--text-dim)", marginTop: 40 }}>
            Nothing saved here yet — head to the <a href="/generate">Studio</a> and tap ♥ on names you love.
          </p>
        )}

        {active && active.id !== "default" && (
          <div style={{ marginTop: 28 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { deleteCollection(active.id); setActiveId("default"); }}>
              Delete this collection
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
