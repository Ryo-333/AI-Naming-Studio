"use client";

import type { Collection, SavedName } from "./types";

function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const csvEscape = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;

export function exportCSV(col: Collection) {
  const header = ["Name", "Category", "Score", "Meaning", "Origin", "Pronunciation", "IPA", "Nicknames", "Variations", "Styles", "Note"];
  const rows = col.names.map((n) =>
    [n.name, n.category, String(n.matchScore), n.meaning, n.origin, n.pronunciation, n.ipa ?? "", n.nicknames.join("; "), n.variations.join("; "), n.styles.join("; "), n.note ?? ""]
      .map(csvEscape)
      .join(","),
  );
  download(`${col.title}.csv`, new Blob([header.join(",") + "\n" + rows.join("\n")], { type: "text/csv" }));
}

export function exportMarkdown(col: Collection) {
  const md = [
    `# ${col.title}`,
    "",
    `*Exported from AI Naming Studio · ${new Date().toLocaleDateString()}*`,
    "",
    ...col.names.flatMap((n) => [
      `## ${n.name} — ${n.matchScore}/100`,
      "",
      `- **Category:** ${n.category}`,
      `- **Meaning:** ${n.meaning}`,
      `- **Origin:** ${n.origin}`,
      `- **Pronunciation:** ${n.pronunciation}${n.ipa ? ` (${n.ipa})` : ""}`,
      n.nicknames.length ? `- **Nicknames:** ${n.nicknames.join(", ")}` : "",
      n.variations.length ? `- **Variations:** ${n.variations.join(", ")}` : "",
      n.whyItFits ? `- **Why it fits:** ${n.whyItFits}` : "",
      n.note ? `- **My note:** ${n.note}` : "",
      "",
    ]),
  ]
    .filter((l) => l !== "")
    .join("\n");
  download(`${col.title}.md`, new Blob([md], { type: "text/markdown" }));
}

export function exportJSON(col: Collection) {
  download(`${col.title}.json`, new Blob([JSON.stringify(col, null, 2)], { type: "application/json" }));
}

// Renders a share-ready 1080×1350 (4:5, Instagram-friendly) name card as PNG.
export function exportImageCard(n: SavedName) {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#151322");
  bg.addColorStop(1, "#0c0b14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const aurora = ctx.createLinearGradient(0, 0, W, 300);
  aurora.addColorStop(0, "#8b5cf6");
  aurora.addColorStop(0.55, "#ec4899");
  aurora.addColorStop(1, "#f59e0b");

  ctx.fillStyle = aurora;
  ctx.beginPath();
  ctx.arc(W / 2, 150, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#ece9f7";
  ctx.font = "600 110px Georgia, serif";
  ctx.fillText(n.name, W / 2, 420, W - 120);

  ctx.fillStyle = "#9a94b8";
  ctx.font = "400 40px Georgia, serif";
  ctx.fillText(n.pronunciation || "", W / 2, 490, W - 160);

  ctx.fillStyle = aurora;
  ctx.font = "600 46px Georgia, serif";
  ctx.fillText(`${n.matchScore}/100`, W / 2, 580);

  const wrap = (text: string, y: number, font: string, color: string, lineHeight: number, maxLines: number) => {
    ctx.font = font;
    ctx.fillStyle = color;
    const words = text.split(" ");
    let line = "";
    let lines = 0;
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width > W - 200 && line) {
        ctx.fillText(line, W / 2, y + lines * lineHeight);
        line = w;
        lines++;
        if (lines >= maxLines) return y + lines * lineHeight;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, W / 2, y + lines * lineHeight);
      lines++;
    }
    return y + lines * lineHeight;
  };

  let y = wrap(`${n.meaning}`, 700, "400 42px Georgia, serif", "#ece9f7", 58, 4);
  y = wrap(`Origin: ${n.origin}`, y + 50, "400 36px Georgia, serif", "#9a94b8", 50, 2);
  if (n.whyItFits) wrap(`“${n.whyItFits}”`, y + 70, "italic 400 38px Georgia, serif", "#c9c3e6", 54, 5);

  ctx.fillStyle = "#9a94b8";
  ctx.font = "500 30px Arial, sans-serif";
  ctx.fillText("✦ AI Naming Studio — every name has a story", W / 2, H - 70);

  canvas.toBlob((blob) => {
    if (blob) download(`${n.name}-card.png`, blob);
  }, "image/png");
}
