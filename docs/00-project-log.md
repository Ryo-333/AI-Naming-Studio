# Project log & decision record

## 2026-07-20 — Phase 1

- **Repo creation blocked:** the GitHub App token in this session cannot create repositories (`403 Resource not accessible by integration`). Work proceeds on branch `claude/ai-naming-studio-glabow` of `Ryo-333/Home_Sales`, fully contained in `ai-naming-studio/` for later extraction into a dedicated repo.
- **Semrush:** connected but out of API units; SEO volumes in the research report are directional (StatShow/Similarweb). Re-run keyword pass after topping up at https://www.semrush.com/mcp-access.
- Market research report completed (`01-market-research.md`).

## Decisions (adopted provisionally 2026-07-20)

Interactive approval could not be delivered (session ran non-interactively; the option
prompt stream closed), and the stakeholder instructed "continue" — so the recommended
option in each decision was adopted **provisionally**. All four are reversible; flag any
you want changed and the docs/code will be updated.

1. **Platform priority → Web-first PWA** (Next.js), Capacitor native wrappers in Phase 5.
2. **Tech stack → Next.js 15 + TypeScript**, custom CSS design-token system, Supabase (Phase 4), Stripe, Vercel, provider-agnostic AI layer (Anthropic/OpenAI/Gemini/local + BYO key, offline demo mode).
3. **Monetization → Hybrid freemium**: free tier · $7.99/mo · $49/yr · $129 lifetime · $4.99/200-gen credit packs · free BYO-key mode.
4. **Brand → "Arcane Atelier"**: indigo/ink + aurora gradient, Fraunces + Inter (see 04-brand-identity.md). Consumer name "Namora" parked for later.

## 2026-07-20 — Phase 2/3

- PRD, personas, IA, DB schema, AI prompt architecture, testing/deployment/growth plans written (docs 02–04).
- MVP web app scaffolded in `app/` (Next.js): generator with categories/filters, name explanations + match scores, favorites/collections (local-first), settings with BYO keys, dark/light themes, demo mode with curated dataset.

## 2026-07-20 — Phase 4 (first pass)

Shipped everything buildable without external accounts:

- **Inspiration Mode** (`/inspiration`): infinite swipe deck — drag/arrow-key left to pass, right to save, tap to flip details; auto-refills from the generate API.
- **AI Chat expert** (`/chat`): conversational naming expert with clarifying-question behavior; demo-mode scripted flow when no key.
- **Baby Mode** (`/baby`): deterministic offline analysis — first/middle/last rhythm & flow, rhyme and alliteration checks, monogram (initials) safety check, likely-nickname derivation, sibling-set compatibility.
- **Character Builder** (`/builder`): name → full sheet (appearance, personality, backstory, arc, dialogue examples, combat, relationships, alignment, power level, portrait prompt) via `/api/character`, with Markdown copy/download; reachable from any saved name.
- **Exports** on Favorites: CSV, Markdown, JSON per collection + 1080×1350 PNG share card per name (canvas-rendered).
- **Programmatic SEO**: 21 static `/generators/[category]` pages with samples, metadata, and cross-links.

**Deferred until credentials exist (need stakeholder to provision):**
- Supabase project (auth + cloud sync of collections) — schema is ready in docs/03.
- Stripe account (subscriptions/lifetime/credit packs).
- Deploy target (Vercel) + production AI provider key.

## 2026-07-20 — Migration

- Project migrated from `Ryo-333/Home_Sales` (branch `claude/ai-naming-studio-glabow`, subdirectory `ai-naming-studio/`) into its own repository `ryo-333/ai-naming-studio` at repo root. Development continues here.

## 2026-07-20 — Phase 4b: Supabase accounts + cloud sync

- Deployed to production at https://ai-naming-studio.vercel.app (Vercel, OpenAI key).
- Supabase integration shipped (stakeholder created project "Ryo Kami Studios"): email magic-link sign-in at /account, local-first favorites with debounced cloud push and pull-and-merge on sign-in, RLS-guarded `user_collections` table (migration in supabase/migrations/001_init.sql). App degrades gracefully to local-only when env vars are absent.
- Pragmatic schema note: cloud sync uses one `user_collections` table with a jsonb `names` column mirroring the client Collection shape, instead of the fully normalized collections/saved_names tables from docs/03 — revisit when community features need per-name rows.
- Known MVP sync limitation: deletions can resurrect when merging from a stale device.

## 2026-07-20 — Phase 5 (start): mobile scaffolding + store prep

- Capacitor 8 project in `mobile/` with generated native Android and iOS projects (appId com.ryokamistudios.ainamingstudio) wrapping the live deployment; offline fallback page; build guide in mobile/README.md.
- Store prep on web: /privacy policy page (footer-linked), viewport-fit=cover + safe-area header padding for notches.
- Before store submission: native touches (haptics/push/share) to clear Apple guideline 4.2, icons via @capacitor/assets, developer accounts (Apple $99/yr, Play $25).
