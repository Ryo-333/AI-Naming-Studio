// Baby Mode — deterministic name-fit analysis. Works fully offline.

export function syllableCount(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  const groups = w.match(/[aeiouy]+/g) ?? [];
  let n = groups.length;
  if (w.endsWith("e") && !w.endsWith("le") && n > 1) n -= 1;
  return Math.max(1, n);
}

const RISKY_INITIALS = new Set([
  "ASS", "BAD", "BUM", "DIE", "DUD", "FAT", "GAS", "HAG", "PEE", "PIG",
  "POO", "PUS", "RAT", "ROT", "SAD", "STD", "TIT", "WTF", "FML", "ZIT", "EWW", "UGH",
]);

export interface CheckItem {
  ok: boolean;
  label: string;
  detail: string;
}

function lastSound(w: string): string {
  return w.toLowerCase().replace(/[^a-z]/g, "").slice(-2);
}

function firstSound(w: string): string {
  return w.toLowerCase().replace(/[^a-z]/g, "").slice(0, 1);
}

export function analyzePairing(first: string, middle: string, last: string): CheckItem[] {
  const items: CheckItem[] = [];
  const f = first.trim();
  const m = middle.trim();
  const l = last.trim();
  if (!f || !l) return items;

  const sf = syllableCount(f);
  const sl = syllableCount(l);
  items.push({
    ok: sf !== sl || sf > 2,
    label: "Rhythm",
    detail:
      sf !== sl
        ? `${sf}-syllable first + ${sl}-syllable last gives a pleasing contrast (${f} ${l}).`
        : sf > 2
          ? `Equal syllables (${sf}/${sl}), but longer names carry their own rhythm.`
          : `Both names are ${sf} syllable(s) — short-short pairings can sound clipped. A longer middle name smooths it.`,
  });

  const collide = lastSound(f).slice(-1) === firstSound(l);
  items.push({
    ok: !collide,
    label: "Flow",
    detail: collide
      ? `"${f} ${l}" — the first name ends with the sound the surname starts with, which can blur together when spoken.`
      : `"${f} ${l}" transitions cleanly between sounds when said aloud.`,
  });

  const rhyme = lastSound(f) === lastSound(l) && f.toLowerCase() !== l.toLowerCase();
  items.push({
    ok: !rhyme,
    label: "Rhyme check",
    detail: rhyme
      ? `${f} and ${l} share an ending sound ("-${lastSound(f)}") — rhyming first/last names can sound sing-song.`
      : "No unintended rhyme between first and last name.",
  });

  const allit = firstSound(f) === firstSound(l);
  items.push({
    ok: true,
    label: "Alliteration",
    detail: allit
      ? `${f} ${l} alliterates — memorable and storybook-like (think comic-book heroes); a matter of taste.`
      : "No alliteration — a neutral, classic pairing.",
  });

  const initials = (f[0] + (m ? m[0] : "") + l[0]).toUpperCase();
  const risky = RISKY_INITIALS.has(initials);
  items.push({
    ok: !risky,
    label: `Initials: ${initials}`,
    detail: risky
      ? `The monogram "${initials}" spells something your kid may not thank you for. Consider a different middle name.`
      : m
        ? `The monogram "${initials}" is safe for backpacks and towels.`
        : `Initials "${initials}" so far — add a middle name to check the full monogram.`,
  });

  return items;
}

export function analyzeSiblings(name: string, siblings: string[]): CheckItem[] {
  const items: CheckItem[] = [];
  const sibs = siblings.map((s) => s.trim()).filter(Boolean);
  if (!name.trim() || sibs.length === 0) return items;

  const sn = syllableCount(name);
  for (const sib of sibs) {
    const shareInitial = firstSound(name) === firstSound(sib);
    const rhymes = lastSound(name) === lastSound(sib);
    const sylDiff = Math.abs(sn - syllableCount(sib));
    let detail: string;
    let ok = true;
    if (rhymes) {
      ok = false;
      detail = `${name} & ${sib} rhyme ("-${lastSound(name)}") — cute at three, confusing at thirteen.`;
    } else if (shareInitial) {
      detail = `${name} & ${sib} share an initial — a deliberate "matched set" feel, but mail and monograms will collide.`;
    } else if (sylDiff <= 1) {
      detail = `${name} & ${sib} have a balanced rhythm (${sn} vs ${syllableCount(sib)} syllables) — they sound like a set without being matchy.`;
    } else {
      detail = `${name} & ${sib} differ in length (${sn} vs ${syllableCount(sib)} syllables) — distinct, with a looser sibling echo.`;
    }
    items.push({ ok, label: `${name} + ${sib}`, detail });
  }
  return items;
}

export function deriveNicknames(name: string): string[] {
  const n = name.trim();
  if (n.length < 3) return [];
  const out = new Set<string>();
  out.add(n.slice(0, Math.min(4, Math.ceil(n.length / 2))));
  out.add(n.slice(0, 2) + n.slice(1, 2));
  const vowelIdx = n.slice(1).search(/[aeiouy]/i);
  if (vowelIdx >= 0) out.add(n.slice(0, vowelIdx + 2));
  if (/[aeiou]$/i.test(n.slice(0, 3))) out.add(n.slice(0, 3));
  out.add(n.slice(0, 1) + (n.match(/[aeiouy]/gi)?.[1] ?? "") + (n.slice(-1) === "e" ? "ey" : "ie"));
  return [...out].map((s) => s[0].toUpperCase() + s.slice(1).toLowerCase()).filter((s) => s.length >= 2 && s.toLowerCase() !== n.toLowerCase()).slice(0, 4);
}
