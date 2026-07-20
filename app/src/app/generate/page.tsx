"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, STYLE_TAGS, type Filters, type GeneratedName, type GenerateResponse } from "@/lib/types";
import { loadSettings } from "@/lib/store";
import { useCollections } from "@/lib/store";
import { NameCard } from "@/components/NameCard";

const EMPTY_FILTERS: Filters = { styles: [] };

function Studio() {
  const params = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState<string>("Fantasy");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [provider, setProvider] = useState("");
  const [results, setResults] = useState<GeneratedName[]>([]);
  const { saveName, isSaved } = useCollections();

  useEffect(() => {
    const p = params.get("prompt");
    if (p) setPrompt(p);
    const c = params.get("category");
    if (c && (CATEGORIES as readonly string[]).includes(c)) setCategory(c);
  }, [params]);

  const toggleStyle = (s: string) =>
    setFilters((f) => ({
      ...f,
      styles: f.styles.includes(s) ? f.styles.filter((x) => x !== s) : f.styles.length < 6 ? [...f.styles, s] : f.styles,
    }));

  const generate = useCallback(async () => {
    setLoading(true);
    setError("");
    setNote("");
    try {
      const s = loadSettings();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt,
          category,
          filters,
          count: 12,
          ...(s.provider !== "auto" && (s.apiKey || s.provider === "local")
            ? { provider: s.provider, apiKey: s.apiKey || undefined, baseUrl: s.baseUrl || undefined }
            : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }
      const data: GenerateResponse = await res.json();
      setResults(data.names);
      setProvider(data.provider);
      if (data.note) setNote(data.note);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [prompt, category, filters]);

  return (
    <section className="section" style={{ paddingTop: 36 }}>
      <div className="container">
        <h1 style={{ fontSize: "2rem" }}>The Studio</h1>
        <p style={{ color: "var(--text-dim)", marginBottom: 20 }}>
          Describe who — or what — needs a name. The more feeling you give, the better the names.
        </p>

        <div className="card" style={{ display: "grid", gap: 14 }}>
          <div>
            <label htmlFor="prompt">Your prompt</label>
            <textarea
              id="prompt"
              rows={2}
              placeholder={'e.g. "I need a powerful female dragon queen" or "a Japanese-American baby boy"'}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate();
              }}
            />
          </div>

          <div>
            <label>Category</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CATEGORIES.map((c) => (
                <button key={c} type="button" className="chip" data-on={category === c} onClick={() => setCategory(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? "▾ Hide filters" : "▸ Filters"}
              {filters.styles.length + (filters.gender ? 1 : 0) + (filters.startsWith ? 1 : 0) > 0 &&
                ` (${filters.styles.length + (filters.gender ? 1 : 0) + (filters.startsWith ? 1 : 0)} active)`}
            </button>

            {showFilters && (
              <div style={{ display: "grid", gap: 14, marginTop: 12 }}>
                <div>
                  <label>Style</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {STYLE_TAGS.map((s) => (
                      <button key={s} type="button" className="chip" data-on={filters.styles.includes(s)} onClick={() => toggleStyle(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
                  <div>
                    <label htmlFor="f-gender">Gender</label>
                    <select id="f-gender" value={filters.gender ?? ""} onChange={(e) => setFilters({ ...filters, gender: e.target.value || undefined })}>
                      <option value="">Any</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="f-origin">Origin / culture</label>
                    <input id="f-origin" type="text" placeholder="e.g. Japanese, Norse" value={filters.origin ?? ""} onChange={(e) => setFilters({ ...filters, origin: e.target.value || undefined })} />
                  </div>
                  <div>
                    <label htmlFor="f-length">Length</label>
                    <select id="f-length" value={filters.length ?? ""} onChange={(e) => setFilters({ ...filters, length: e.target.value || undefined })}>
                      <option value="">Any</option>
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="f-start">Starts with</label>
                    <input id="f-start" type="text" maxLength={3} value={filters.startsWith ?? ""} onChange={(e) => setFilters({ ...filters, startsWith: e.target.value || undefined })} />
                  </div>
                  <div>
                    <label htmlFor="f-end">Ends with</label>
                    <input id="f-end" type="text" maxLength={3} value={filters.endsWith ?? ""} onChange={(e) => setFilters({ ...filters, endsWith: e.target.value || undefined })} />
                  </div>
                  <div>
                    <label htmlFor="f-syll">Syllables</label>
                    <select id="f-syll" value={filters.syllables ?? ""} onChange={(e) => setFilters({ ...filters, syllables: e.target.value || undefined })}>
                      <option value="">Any</option>
                      <option value="1-2">1–2</option>
                      <option value="2-3">2–3</option>
                      <option value="3+">3+</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="f-pop">Popularity</label>
                    <select id="f-pop" value={filters.popularity ?? ""} onChange={(e) => setFilters({ ...filters, popularity: e.target.value || undefined })}>
                      <option value="">Any</option>
                      <option value="common">Common</option>
                      <option value="uncommon">Uncommon</option>
                      <option value="rare">Rare / unique</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="f-sound">Sound</label>
                    <select id="f-sound" value={filters.sound ?? ""} onChange={(e) => setFilters({ ...filters, sound: e.target.value || undefined })}>
                      <option value="">Any</option>
                      <option value="soft">Soft</option>
                      <option value="strong">Strong</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn btn-aurora" onClick={generate} disabled={loading}>
              {loading ? <span className="spin" /> : "✨"} {loading ? "Summoning names…" : "Generate names"}
            </button>
            {results.length > 0 && !loading && (
              <button className="btn" onClick={generate}>↻ Regenerate</button>
            )}
            <span style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginLeft: "auto" }}>
              {provider && `via ${provider}`}
            </span>
          </div>
        </div>

        {error && <div className="note-banner" style={{ marginTop: 16 }}>⚠️ {error}</div>}
        {note && <div className="note-banner" style={{ marginTop: 16 }}>{note}</div>}

        {results.length > 0 && (
          <div className="results-grid" style={{ marginTop: 24 }}>
            {results.map((n, i) => (
              <div key={n.id} style={{ animationDelay: `${i * 45}ms` }}>
                <NameCard item={n} saved={isSaved(n)} onSave={(x) => saveName(x)} />
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && !loading && (
          <p style={{ textAlign: "center", color: "var(--text-dim)", marginTop: 48 }}>
            Your generated names will appear here — each with meaning, origin, pronunciation, and a match score.
          </p>
        )}
      </div>
    </section>
  );
}

export default function GeneratePage() {
  return (
    <Suspense>
      <Studio />
    </Suspense>
  );
}
