"use client";

import { useState } from "react";
import type { GeneratedName } from "@/lib/types";
import { ScoreRing } from "./ScoreRing";

export function NameCard({
  item,
  saved,
  onSave,
}: {
  item: GeneratedName;
  saved: boolean;
  onSave: (n: GeneratedName) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card name-card">
      <div className="name-row">
        <div>
          <div className="the-name">{item.name}</div>
          <div className="pron">
            {item.pronunciation}
            {item.ipa ? ` · ${item.ipa}` : ""}
          </div>
        </div>
        <ScoreRing score={item.matchScore} />
      </div>

      <div className="meta">
        <b>Meaning:</b> {item.meaning}
      </div>
      <div className="meta">
        <b>Origin:</b> {item.origin}
      </div>
      {item.whyItFits && <div className="why">{item.whyItFits}</div>}

      <div className="chips">
        {item.styles.slice(0, 4).map((s) => (
          <span key={s} className="chip chip-static">{s}</span>
        ))}
        {item.gender && item.gender !== "n/a" && <span className="chip chip-static">{item.gender}</span>}
      </div>

      {open && (
        <div className="meta" style={{ display: "grid", gap: 6 }}>
          {item.nicknames.length > 0 && (
            <div><b>Nicknames:</b> {item.nicknames.join(", ")}</div>
          )}
          {item.variations.length > 0 && (
            <div><b>Variations:</b> {item.variations.join(", ")}</div>
          )}
          <div>
            <b>Subscores:</b> prompt fit {item.subscores.promptFit} · originality {item.subscores.originality} ·
            pronunciation {item.subscores.pronunciation} · memorability {item.subscores.memorability}
          </div>
        </div>
      )}

      <div className="actions">
        <button className="btn btn-sm btn-primary" disabled={saved} onClick={() => onSave(item)}>
          {saved ? "✓ Saved" : "♥ Save"}
        </button>
        <button className="btn btn-sm" onClick={() => setOpen(!open)}>
          {open ? "Less" : "Details"}
        </button>
      </div>
    </div>
  );
}
