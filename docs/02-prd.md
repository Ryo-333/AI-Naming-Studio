# AI Naming Studio — Product Requirements Document

*v1.0 · Phase 2 deliverable*

## 1. Vision

The premium AI naming platform: generate names you instantly love — for babies, characters, worlds, pets, and brands — and understand *why* they fit. Every name ships with meaning, origin, pronunciation, and story context, and can grow into a full character or world.

**North-star metric:** names saved to collections per weekly active user.

## 2. User personas

| Persona | Profile | Core job | Key features | Willingness to pay |
|---|---|---|---|---|
| **Maya, 31 — Expectant parent** | First child, names with partner over months | Find a name both partners love that "fits" their surname and heritage | Baby Mode, swipe matching with partner, meaning/origin, popularity trends, sibling/last-name compatibility, audio pronunciation | One-time purchase or small credit pack |
| **Devon, 27 — Fantasy novelist** | Drafting a trilogy, 60+ named characters/places | Names consistent with each fictional culture's sound rules | Prompt-based generation, world consistency memory, collections per project, Character Builder, export to Markdown/CSV | Monthly sub or lifetime |
| **Sam, 35 — Dungeon Master** | Preps weekly campaign nights | Dozens of throwaway-but-flavorful NPC/place names, fast | Bulk Inspiration Mode, category presets (taverns, guilds, weapons), offline saved lists, instant regenerate | Annual sub |
| **Rin, 22 — Anime/webcomic creator** | Building an original cast for social audiences | Distinctive, culturally-grounded names + shareable character cards | Character Builder, portrait prompts, image-card export to IG/TikTok/Pinterest, community gallery | Monthly sub |
| **Alex, 40 — Indie founder** | Naming products and a company | Brandable, available, memorable names | Business category, uniqueness scoring, domain-style checks (later), CSV export | Credit packs |

## 3. Feature set and MVP scoping (MoSCoW)

### MVP (Must) — Phase 3
- **AI Name Generator**: free-text prompt + category + filters → 12–24 names per run
- **Categories**: Baby, Character, Fantasy, Sci-Fi, Anime, Historical, Mythology, Royal, Modern, Pet, Cities, Kingdoms, Weapons, Spells, Guilds, Businesses, Planets, Aliens, Robots, Superheroes, Villains
- **Filters**: gender, origin/culture, style tags (elegant, cute, dark, heroic, royal, magical, funny, ancient, futuristic), length, starting/ending letter, syllables, popularity (common↔rare), soft↔strong
- **Name Explanation** on every result: meaning, origin, pronunciation (respelled + IPA), "why it fits", nicknames, variations
- **AI Match Score** (1–100) with sub-scores (prompt fit, originality, memorability, pronunciation ease)
- **Favorites**: save, collections, tags, notes, side-by-side compare (local-first; syncs when auth lands)
- **Dark/Light mode**, responsive premium UI, PWA installable
- **Provider-agnostic AI** with BYO API key (Anthropic, OpenAI, Gemini, local/Ollama) + built-in demo mode with a curated offline dataset

### Should — Phase 4
- Auth + cloud sync (Supabase), Stripe billing (free/premium/lifetime/credits)
- Inspiration Mode (infinite scroll, swipe left/right, double-tap details)
- AI Chat naming expert
- Baby Mode (trend prediction, sibling/last-name/initials/nickname checkers, middle names)
- Character Builder (appearance, backstory, dialogue, portrait prompt, power level)
- Export: PDF, image cards, Markdown, CSV
- Programmatic SEO pages (category + individual name pages)

### Could — Phase 5
- World Builder (kingdoms, religions, languages, currencies, magic systems, artifacts…)
- Personality Generator (bio, fears, secrets, arc, alignment…)
- Pronunciation audio (TTS, multiple accents)
- Partner/party swipe matching; community gallery (like, bookmark, remix, follow)
- Native iOS/Android via Capacitor; push notifications
- Admin dashboard, API access, white-label

### Won't (v1)
- Sponsored content (brand risk), user-to-user DMs, real-money marketplace

## 4. Monetization (approved model: hybrid freemium)

| Tier | Price | Includes |
|---|---|---|
| Free | $0 | 10 AI generations/day, full name database & SEO pages, 3 collections, demo mode unlimited |
| Premium | $7.99/mo · $49/yr | Unlimited generation*, AI chat, Character/World Builder, Baby Mode, audio, all exports, unlimited collections |
| Lifetime | $129 | Everything in Premium, forever; creator-targeted |
| Credit packs | $4.99 / 200 gens | For casual users; also tops up past fair-use caps |
| BYO API key | Free | Unlimited generation via user's own provider key |

*Fair-use cap with credit top-up. Later: affiliate (registries, writing tools), API access, white-label.

## 5. Success metrics

- Activation: % of new visitors who generate ≥1 run (target 40%)
- Save rate: names saved per generation run (target ≥1.5)
- D7 retention ≥ 20% (creators), conversion to paid ≥ 3% of WAU
- SEO: 10k indexed pages by month 3; organic ≥ 50% of traffic by month 6

## 6. Non-functional requirements

- P95 time-to-first-name < 4s (streaming results begin < 1.5s)
- Cost: < $0.01 average AI cost per generation run (small-model routing + caching)
- Accessibility WCAG 2.1 AA; full keyboard nav
- Privacy: prompts not used for training; BYO keys stored client-side only, never persisted server-side
- Cultural sensitivity: origin/cultural claims sourced from curated dataset where possible; AI-generated claims labeled; in-product "report inaccuracy" flag

## 7. Roadmap

| Phase | Scope | Exit criteria |
|---|---|---|
| 1 ✅ | Market research | Report approved |
| 2 ✅ | PRD, IA, schema, brand, prompt architecture | This document set |
| 3 | MVP web app (this repo, `app/`) | Deployed preview; generation + favorites work end-to-end in demo and BYO-key modes |
| 4 | Accounts, billing, SEO pages, Inspiration Mode, Baby Mode, Character Builder, exports | First paying customers |
| 5 | World Builder, community, audio, native mobile, admin | Store launches |
| 6 | Growth: content engine, affiliates, API | Organic > 50% traffic |
