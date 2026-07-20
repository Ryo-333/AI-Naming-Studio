"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORIES, type GeneratedName, type GenerateResponse } from "@/lib/types";
import { loadSettings, useCollections } from "@/lib/store";
import { ScoreRing } from "@/components/ScoreRing";

export default function InspirationPage() {
  const [category, setCategory] = useState<string>("Fantasy");
  const [prompt, setPrompt] = useState("");
  const [deck, setDeck] = useState<GeneratedName[]>([]);
  const [loading, setLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [drag, setDrag] = useState({ x: 0, active: false });
  const [stats, setStats] = useState({ kept: 0, passed: 0 });
  const startX = useRef(0);
  const fetching = useRef(false);
  const { saveName, isSaved } = useCollections();

  const fetchMore = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true;
    setLoading(true);
    try {
      const s = loadSettings();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: prompt || `Endlessly inspiring ${category.toLowerCase()} names, varied and surprising`,
          category,
          filters: { styles: [] },
          count: 12,
          ...(s.provider !== "auto" && (s.apiKey || s.provider === "local")
            ? { provider: s.provider, apiKey: s.apiKey || undefined, baseUrl: s.baseUrl || undefined }
            : {}),
        }),
      });
      if (res.ok) {
        const data: GenerateResponse = await res.json();
        setDeck((d) => {
          const seen = new Set(d.map((n) => n.name));
          return [...d, ...data.names.filter((n) => !seen.has(n.name))];
        });
      }
    } finally {
      fetching.current = false;
      setLoading(false);
    }
  }, [category, prompt]);

  useEffect(() => {
    setDeck([]);
    setStats({ kept: 0, passed: 0 });
  }, [category, prompt]);

  useEffect(() => {
    if (deck.length < 4) void fetchMore();
  }, [deck.length, fetchMore]);

  const top = deck[0];

  const swipe = (dir: "left" | "right") => {
    if (!top) return;
    if (dir === "right") {
      saveName(top);
      setStats((s) => ({ ...s, kept: s.kept + 1 }));
    } else {
      setStats((s) => ({ ...s, passed: s.passed + 1 }));
    }
    setFlipped(false);
    setDrag({ x: 0, active: false });
    setDeck((d) => d.slice(1));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    setDrag({ x: 0, active: true });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (drag.active) setDrag({ x: e.clientX - startX.current, active: true });
  };
  const onPointerUp = () => {
    if (!drag.active) return;
    if (drag.x > 90) swipe("right");
    else if (drag.x < -90) swipe("left");
    else setDrag({ x: 0, active: false });
  };

  return (
    <section className="section" style={{ paddingTop: 36 }}>
      <div className="container" style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: "2rem" }}>Inspiration</h1>
        <p style={{ color: "var(--text-dim)" }}>
          Swipe right (or →) to save, left (or ←) to pass. Tap the card for details. The deck never runs out.
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0" }}>
          {CATEGORIES.slice(0, 10).map((c) => (
            <button key={c} className="chip" data-on={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Optional vibe — e.g. “names for a sky-pirate crew”"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ marginBottom: 18 }}
        />

        <div
          className="swipe-zone"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") swipe("right");
            if (e.key === "ArrowLeft") swipe("left");
          }}
        >
          {top ? (
            <div
              className="card swipe-card"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              onClick={() => Math.abs(drag.x) < 8 && setFlipped(!flipped)}
              style={{
                transform: `translateX(${drag.x}px) rotate(${drag.x / 18}deg)`,
                transition: drag.active ? "none" : "transform 0.25s ease",
              }}
            >
              <div className="swipe-hint" data-dir="right" style={{ opacity: Math.max(0, drag.x / 120) }}>♥ SAVE</div>
              <div className="swipe-hint" data-dir="left" style={{ opacity: Math.max(0, -drag.x / 120) }}>✕ PASS</div>
              <div className="name-row">
                <div>
                  <div className="the-name" style={{ fontSize: "2.3rem" }}>{top.name}</div>
                  <div className="pron">{top.pronunciation}{top.ipa ? ` · ${top.ipa}` : ""}</div>
                </div>
                <ScoreRing score={top.matchScore} size={60} />
              </div>
              {!flipped ? (
                <>
                  <div className="meta"><b>Meaning:</b> {top.meaning}</div>
                  <div className="chips">
                    {top.styles.slice(0, 4).map((s) => <span key={s} className="chip chip-static">{s}</span>)}
                  </div>
                  <p style={{ color: "var(--text-dim)", fontSize: "0.8rem", margin: 0 }}>tap for details</p>
                </>
              ) : (
                <>
                  <div className="meta"><b>Origin:</b> {top.origin}</div>
                  {top.whyItFits && <div className="why">{top.whyItFits}</div>}
                  {top.nicknames.length > 0 && <div className="meta"><b>Nicknames:</b> {top.nicknames.join(", ")}</div>}
                  {top.variations.length > 0 && <div className="meta"><b>Variations:</b> {top.variations.join(", ")}</div>}
                </>
              )}
            </div>
          ) : (
            <div className="card swipe-card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="spin" style={{ width: 26, height: 26 }} />
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 18 }}>
          <button className="btn" style={{ width: 110 }} onClick={() => swipe("left")} disabled={!top}>✕ Pass</button>
          <button className="btn btn-aurora" style={{ width: 110 }} onClick={() => swipe("right")} disabled={!top || isSaved(top)}>♥ Save</button>
        </div>
        <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.85rem", marginTop: 12 }}>
          {stats.kept} saved · {stats.passed} passed{loading ? " · conjuring more…" : ""}
        </p>
      </div>
    </section>
  );
}
