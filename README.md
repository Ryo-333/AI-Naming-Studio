# AI Naming Studio

A premium AI-powered naming platform for parents, writers, game developers, and worldbuilders — generate names for babies, characters, pets, kingdoms, spaceships, and brands, with meaning, origin, pronunciation, and the story behind every name.

> **Status:** Deployed to production (Vercel) with AI generation + Supabase accounts/cloud-sync integrated. Remaining for launch: Stripe billing. See docs/00-project-log.md.

## Quick start

```bash
cd app
npm install
npm run dev        # http://localhost:3000 — runs in demo mode with no keys
```

Optional: set `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY` / `GOOGLE_API_KEY`) to enable real AI generation server-side — or add a bring-your-own key in the app's Settings page. See `app/.env.example`.

**Deploy (Vercel):** import this repo, set the project root directory to `app/`, add an AI provider env var, deploy. Full guide in `docs/03-architecture.md` §6.

## Cloud sync & accounts (Supabase)

Optional — without it the app is fully functional, local-only. To enable email sign-in and cross-device favorites sync:

1. In your Supabase project: **SQL Editor → New query**, paste the contents of [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql), **Run**.
2. **Project Settings → Data API**: copy the **Project URL** and the **anon / publishable** key (safe to expose in the browser — row-level security guards the data; never use the `service_role` key here).
3. Add both to Vercel → Settings → Environment Variables (all environments) and redeploy:
   - `NEXT_PUBLIC_SUPABASE_URL` = the Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the anon/publishable key
4. Supabase **Authentication → URL Configuration**: set Site URL to your deployment URL (e.g. `https://ai-naming-studio.vercel.app`) so magic-link emails redirect back correctly.
5. Visit `/account` on the site, enter your email, click the emailed link — favorites now sync (local-first; offline keeps working).

## Billing (Stripe)

Optional — pricing buttons show "billing not enabled" until configured. Setup:

1. Run `supabase/migrations/002_entitlements.sql` in the Supabase SQL Editor.
2. In the [Stripe Dashboard](https://dashboard.stripe.com) (Test mode first), create four products with one price each: Premium $7.99/month (recurring), Premium Yearly $49/year (recurring), Lifetime $129 (one-time), Credits $4.99 (one-time). Copy each **price ID** (`price_…`).
3. **Developers → Webhooks → Add endpoint**: URL `https://<your-domain>/api/stripe/webhook`, events `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy the **signing secret** (`whsec_…`).
4. Add to Vercel env vars (server-side; never `NEXT_PUBLIC`): `STRIPE_SECRET_KEY` (Developers → API keys), `STRIPE_WEBHOOK_SECRET`, the four `STRIPE_PRICE_*` IDs, and `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API keys → service_role). Redeploy.
5. Test with card `4242 4242 4242 4242` in Stripe Test mode, then flip the key/prices/webhook to Live mode when ready.

Flow: pricing page → Stripe Checkout (hosted) → webhook grants the plan/credits in `entitlements` → Account page shows plan + "Manage billing" (Stripe customer portal — enable it once under Settings → Billing → Customer portal).

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
