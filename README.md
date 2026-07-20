# AI Naming Studio

A premium AI-powered naming platform for parents, writers, game developers, and worldbuilders — generate names for babies, characters, pets, kingdoms, spaceships, and brands, with meaning, origin, pronunciation, and the story behind every name.

> **Status:** Phases 1–4 (research → PRD/architecture → MVP → power features) built and verified. Remaining for launch: Supabase auth/sync, Stripe billing, and deployment — blocked on account credentials (see docs/00-project-log.md).

## Quick start

```bash
cd app
npm install
npm run dev        # http://localhost:3000 — runs in demo mode with no keys
```

Optional: set `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY` / `GOOGLE_API_KEY`) to enable real AI generation server-side — or add a bring-your-own key in the app's Settings page. See `app/.env.example`.

**Deploy (Vercel):** import this repo, set the project root directory to `app/`, add an AI provider env var, deploy. Full guide in `docs/03-architecture.md` §6.

## What's inside

| Route | Feature |
|---|---|
| `/generate` | The Studio — prompt + 21 categories + 20+ filters → names with meaning, origin, IPA, "why it fits", and a 1–100 match score |
| `/inspiration` | Infinite swipe deck — right to save, left to pass, tap for details |
| `/chat` | Conversational AI naming expert |
| `/baby` | Baby Mode — rhythm/flow/rhyme analysis, monogram safety, nicknames, sibling compatibility |
| `/builder` | Character Builder — full character sheet + portrait prompt from any name |
| `/favorites` | Collections, notes, side-by-side compare, CSV/Markdown/JSON export, PNG share cards |
| `/generators/*` | 21 statically generated SEO landing pages |
| `/settings` | Provider choice + bring-your-own API key (Anthropic / OpenAI / Gemini / local) |

## Documents

| # | Document | Status |
|---|---|---|
| 00 | [Project log & decisions](docs/00-project-log.md) | Living |
| 01 | [Market research report](docs/01-market-research.md) | ✅ |
| 02 | [PRD, personas, MVP scope, roadmap](docs/02-prd.md) | ✅ |
| 03 | [Architecture: stack, IA, DB schema, AI prompts, testing, deployment, growth](docs/03-architecture.md) | ✅ |
| 04 | [Brand identity](docs/04-brand-identity.md) | ✅ |
