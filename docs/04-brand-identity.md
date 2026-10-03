# Brand identity

## Current direction: Oruko (2026-10-03)

**Working name:** Oruko is confirmed.

The requested iPhone tab themes are:
- **Baby:** baby pink and powder blue; butter yellow remains a proposed accent.
- **Worlds:** stark black, white, and vivid red with cinematic sci-fi imagery.
- **Characters:** blue-gray stone, forest green, and dark earthy brown with castle and forest imagery.

Three visual mockups have been delivered for review. Three editable Figma screens are now saved and visually checked, with reusable components, draft design tokens and text styles, editable vector imagery, and cross-tab navigation. Final design approval and the end-to-end naming flow remain pending. Generation, filter choices, saves, and backend persistence are still static design concepts; this update does not change app styles or code. See the [project log](00-project-log.md#2026-10-03-oruko-design-progress) for progress and next checkpoints.

## Historical direction: "Arcane Atelier"

The earlier brand document is retained below as context for the existing app. Its previous name candidates and visual direction do not override the newer Oruko decisions above.

**Product name:** AI Naming Studio (working) — candidate consumer name **Namora** reserved for later brand decision; nothing in code hard-couples to the name.

**Tagline:** *Every name has a story. Start yours.*

**Personality:** a magical craftsman's studio — precise like a type foundry, warm like a storyteller. Premium, intelligent, a little enchanted. Never childish, never sterile.

## Visual language

| Token | Light | Dark |
|---|---|---|
| Background | warm paper `#faf8f4` | deep ink `#0c0b14` |
| Surface | `#ffffff` | `#151322` |
| Text | ink `#1c1a2e` | starlight `#ece9f7` |
| Primary | indigo `#4f46b8` | periwinkle `#8b83ff` |
| Aurora accents | violet `#8b5cf6` → rose `#ec4899` → amber `#f59e0b` gradient, used sparingly (hero, score rings, focus moments) |

- **Type:** Fraunces (display serif — headlines, generated names) + Inter (UI body). Generated names render large in Fraunces italic-adjacent optical sizes: the name itself is the hero.
- **Shape:** 12–20px radii, soft 1px borders, low-blur glassmorphism only on floating panels (one layer max per view).
- **Motion:** 150–250ms ease-out, spring on save/favorite; names fade-up staggered as they stream in; respects `prefers-reduced-motion`.
- **Iconography:** thin-stroke, slightly rounded (Lucide).
- **Voice:** confident, warm, concise. "Why it fits" copy speaks like a knowledgeable friend, not a database.

Logo direction (Phase 4): monogram "N" formed by an open book / quill negative space over a subtle aurora gradient disc.
