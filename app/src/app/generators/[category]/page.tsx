import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/types";
import { demoGenerate } from "@/lib/demo";

export const dynamic = "force-static";

const slugOf = (c: string) => c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const BY_SLUG = new Map(CATEGORIES.map((c) => [slugOf(c), c]));

const BLURBS: Record<string, string> = {
  "Baby Names": "Find a baby name with real meaning — searchable by origin, style, syllables, and sound, each with pronunciation and nickname ideas.",
  Fantasy: "Lore-ready fantasy names with coherent phonetics for characters, elves, dwarves, dragons, and everything beyond the map's edge.",
  "Sci-Fi": "Sleek, futuristic names for pilots, androids, colonies, and starships — built from satisfying phonemes, not keyboard mashing.",
  "Pet Names": "Names your pet will actually come to — short, charming, and full of personality.",
  Businesses: "Brandable, spellable business names with the naming strategy explained, so you know why each one works.",
};

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: slugOf(c) }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const name = BY_SLUG.get(category);
  if (!name) return {};
  return {
    title: `${name} Generator — AI Naming Studio`,
    description: `Generate ${name.toLowerCase()} with AI: meaning, origin, pronunciation, and a match score for every name. Free to try, no account needed.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = BY_SLUG.get(category);
  if (!cat) notFound();

  const samples = demoGenerate({
    prompt: `excellent ${cat.toLowerCase()}`,
    category: cat,
    filters: { styles: [] },
    count: 8,
  });

  return (
    <section className="section" style={{ paddingTop: 48 }}>
      <div className="container">
        <h1>{cat} Generator</h1>
        <p style={{ color: "var(--text-dim)", maxWidth: 640 }}>
          {BLURBS[cat] ?? `Generate ${cat.toLowerCase()} with AI — every name comes with meaning, origin, pronunciation, and a 1–100 match score, and can be saved to collections.`}
        </p>
        <Link href={`/generate?category=${encodeURIComponent(cat)}`} className="btn btn-aurora" style={{ margin: "16px 0 32px" }}>
          ✨ Generate {cat.toLowerCase()} →
        </Link>

        <h2 style={{ fontSize: "1.3rem" }}>Sample {cat.toLowerCase()}</h2>
        <div className="results-grid" style={{ marginTop: 12 }}>
          {samples.map((n) => (
            <div key={n.id} className="card">
              <div className="the-name display" style={{ fontSize: "1.5rem", fontFamily: "var(--font-display)", fontWeight: 600 }}>{n.name}</div>
              <div style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>{n.pronunciation}</div>
              <p style={{ fontSize: "0.9rem" }}>{n.meaning}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: "1.3rem", marginTop: 40 }}>More generators</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {CATEGORIES.filter((c) => c !== cat).map((c) => (
            <Link key={c} href={`/generators/${slugOf(c)}`} className="chip">
              {c}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
