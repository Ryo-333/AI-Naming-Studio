# AI Naming Studio — Technical Architecture

*v1.0 · Phase 2 deliverable*

## 1. Stack (approved)

| Layer | Choice | Rationale |
|---|---|---|
| Web app | Next.js 15 (App Router) + React 19 + TypeScript | SSR/SSG for SEO pages, RSC for cost, one language everywhere |
| Styling | CSS custom-property design system (tokens), no runtime CSS lib | Full control for premium look, zero build risk, dark/light theming |
| Auth + DB | Supabase (Postgres, RLS, OAuth/magic-link) — Phase 4 | Managed, cheap at low volume, realtime for partner matching |
| Cache | Upstash Redis — Phase 4 | Generation caching, rate limiting |
| Search | Postgres FTS → Typesense if needed | Name database lookup |
| Payments | Stripe (subs + one-time + credit packs) | Industry default |
| AI | Provider-agnostic orchestration layer (`lib/ai/`) | Anthropic / OpenAI / Gemini / local (Ollama) + BYO key |
| Analytics | PostHog (product) + Vercel Analytics | Self-serve funnels |
| Push | Web Push (Phase 4), FCM/APNs via Capacitor (Phase 5) | |
| Hosting | Vercel (app) + Supabase cloud | Zero-ops, scales to zero cost |
| Admin | Next.js route group `/admin` behind role claim (Phase 5) | |

**Offline support:** PWA service worker caches shell + saved collections (local-first favorites in IndexedDB/localStorage, background sync to cloud once auth exists). Demo generation dataset works fully offline.

**Security:** RLS on every table; BYO keys held in memory/localStorage client-side only and sent per-request over TLS, never logged or persisted; server keys in env vars; rate limiting per IP/user; strict CSP; Zod validation on all API inputs.

## 2. Information architecture

```
/                     Landing (hero, live demo generator, pricing, SEO copy)
/generate             Studio: prompt + category + filters → results
/inspiration          Infinite swipe mode                      (Phase 4)
/chat                 AI naming expert                         (Phase 4)
/favorites            Collections, compare, notes, tags
/names/[slug]         SEO name page (meaning, origin, IPA, trends)   (Phase 4)
/generators/[category] SEO category landing pages              (Phase 4)
/baby                 Baby Mode toolkit                        (Phase 4)
/builder/[id]         Character Builder                        (Phase 4)
/world/[id]           World Builder                            (Phase 5)
/community            Public gallery                           (Phase 5)
/pricing /account /settings(providers, BYO keys, theme)
/admin                Metrics, moderation, dataset curation    (Phase 5)
```

## 3. Database schema (Postgres / Supabase)

```sql
-- Users come from Supabase auth.users; profiles extends it
create table profiles (
  id uuid primary key references auth.users,
  username text unique,
  plan text not null default 'free',        -- free|premium|lifetime
  credits int not null default 0,
  settings jsonb not null default '{}',      -- theme, default provider, etc.
  created_at timestamptz default now()
);

create table generation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  prompt text not null,
  category text not null,
  filters jsonb not null default '{}',
  provider text not null,                    -- anthropic|openai|gemini|local|demo
  model text,
  cost_usd numeric(8,5),
  created_at timestamptz default now()
);

create table names (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references generation_runs(id),
  name text not null,
  slug text,                                 -- for SEO pages (curated names)
  category text not null,
  meaning text, origin text,
  pronunciation text, ipa text,
  explanation text,                          -- "why it fits"
  nicknames text[], variations text[],
  match_score int check (match_score between 1 and 100),
  subscores jsonb,                           -- {promptFit, originality, ...}
  metadata jsonb not null default '{}',      -- gender, syllables, styles...
  created_at timestamptz default now()
);

create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  title text not null, description text,
  kind text not null default 'general',      -- general|baby|project|world
  is_public boolean not null default false,
  created_at timestamptz default now()
);

create table saved_names (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections(id) on delete cascade,
  name_id uuid references names(id),
  snapshot jsonb not null,                   -- full name payload (works w/o FK)
  tags text[] default '{}',
  note text,
  rating int check (rating between 1 and 5),
  position int,
  created_at timestamptz default now()
);

create table characters (                    -- Character Builder (Phase 4)
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  saved_name_id uuid references saved_names(id),
  sheet jsonb not null default '{}',         -- appearance, backstory, dialogue…
  portrait_prompt text,
  created_at timestamptz default now()
);

create table worlds (                        -- World Builder (Phase 5)
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  title text not null,
  bible jsonb not null default '{}',         -- cultures, languages, rules
  created_at timestamptz default now()
);

create table name_database (                 -- curated static corpus for SEO + demo
  slug text primary key,
  name text not null, category text not null,
  gender text, origin text, meaning text, ipa text,
  popularity_rank int, styles text[],
  content jsonb                              -- rich editorial content
);

create table community_posts (               -- Phase 5
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  kind text not null,                        -- character|world|list
  ref_id uuid, title text, body jsonb,
  likes int default 0,
  created_at timestamptz default now()
);
```

RLS: rows scoped to `user_id = auth.uid()`; `is_public`/`community_posts` readable by all.

## 4. AI orchestration & prompt architecture

```
lib/ai/
  provider.ts      # Provider interface: complete(messages, opts) -> json
  anthropic.ts     # fetch api.anthropic.com (claude-haiku-4-5 default; sonnet for chat)
  openai.ts        # fetch api.openai.com
  gemini.ts        # fetch generativelanguage.googleapis.com
  local.ts         # Ollama-compatible endpoint
  demo.ts          # curated offline dataset + deterministic composer (no key needed)
  router.ts        # picks provider: user BYO key > server key > demo
  schema.ts        # Zod schema for structured name output
  prompts/
    generate.ts    # name generation system prompt
    explain.ts     # deep-dive explanation
    character.ts   # character sheet
    world.ts       # world elements
    chat.ts        # naming-expert persona
```

**Principles**
1. **Structured output only.** Every generation prompt demands a strict JSON array validated by Zod; invalid output retried once with error feedback, then gracefully degraded.
2. **Small-model routing.** Bulk name generation uses fast/cheap models (Haiku-class); chat and deep character work escalate to Sonnet-class. Target < $0.01/run.
3. **Prompt = system rules + category card + filter serialization + user prompt.** Category cards encode genre conventions (phonetics, cultural references, tropes to avoid).
4. **Consistency memory (Phase 4):** a world's saved names + stated linguistic rules are summarized into a "world card" injected into subsequent runs.
5. **Caching:** identical (prompt, category, filters, seed page) tuples served from Redis; SEO name-page content generated once and stored in `name_database`.
6. **Safety/cultural care:** system prompt requires sourcing-confidence flags on meaning/origin claims; low-confidence claims render with a "verify" hint and report link.

**Match score** is computed by the model with rubric-in-prompt (prompt fit, originality, pronunciation ease, memorability, popularity fit) and lightly normalized client-side so scores spread across runs.

## 5. Testing strategy

- **Unit (Vitest):** filter serialization, Zod schemas, demo composer, score normalization
- **API (Vitest + fetch):** `/api/generate` happy path, key routing, rate-limit, malformed-input rejection, provider-failure fallback to demo
- **E2E (Playwright):** generate → save → collection → compare flow; theme toggle; PWA install manifest; a11y assertions (axe)
- **AI evals:** golden-prompt suite (30 prompts across categories) scored on JSON validity, uniqueness, filter compliance; run on prompt changes
- **CI:** GitHub Actions — typecheck, lint, unit, build, Playwright smoke on PR

## 6. Deployment guide (MVP)

1. `cd ai-naming-studio/app && npm install`
2. Optional env: `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GOOGLE_API_KEY` (any one enables server-side AI; none = demo mode; users can also BYO key in Settings)
3. `npm run dev` (local) · `npm run build && npm start` (prod)
4. Vercel: import repo, set root to `ai-naming-studio/app`, add env vars, deploy. Add custom domain + enable Vercel Analytics.
5. Phase 4: provision Supabase project, run `docs` schema, set `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY`, configure Stripe products & webhook.

## 7. Store launch checklist (Phase 5, Capacitor builds)

- [ ] App icons/splash all sizes; screenshots (6.7", 6.1", iPad, Android phone/tablet)
- [ ] Privacy policy + data-safety forms (AI data handling disclosed; BYO key storage explained)
- [ ] In-app purchase products mirrored via RevenueCat (subs + lifetime + credits)
- [ ] Sign in with Apple (required when offering social login)
- [ ] Content rating (UGC gallery ⇒ moderation + report/block required)
- [ ] App Review notes with demo account; TestFlight/internal-track beta first
- [ ] ASO: title/subtitle/keywords per store; localized listings (EN → ES/JA first)

## 8. Growth & marketing strategy

1. **Programmatic SEO** (primary engine): thousands of category + name pages with genuinely rich curated content; the free web generators are the top of funnel (mirrors fantasynamegenerators.com's 5M visits/mo but with modern UX and accounts).
2. **Shareable artifacts:** image cards for character/name reveals sized for IG/TikTok/Pinterest with subtle branding — every export is an ad.
3. **Community seeding:** r/namenerds, r/DMAcademy, r/worldbuilding, NaNoWriMo season pushes; DM/writer influencer kits.
4. **Baby seasonality:** trend reports ("2027 name predictions") as PR/link-bait, mirroring Nameberry's playbook.
5. **Partnerships/affiliates:** writing tools (Scrivener, World Anvil import), baby registries.
6. **Lifecycle:** email digests ("names you saved this week", trend alerts), push for streaks in Inspiration Mode.
