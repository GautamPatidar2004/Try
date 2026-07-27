# Hostfluencer

The marketplace connecting Airbnb / vacation-rental **hosts** and **brands** with **content creators** for authentic UGC — plus **Voyager**, the AI discovery assistant. Hosts list properties, creators apply for stays/campaigns, brands run campaigns, and an ambassador/affiliate layer drives referrals.

Production: **https://hostfluencer.com** (hosted on Vercel).

---

## Tech stack

- **Frontend:** Vite + React 18 + TypeScript, [shadcn/ui](https://ui.shadcn.com) (Radix) + Tailwind CSS
- **Data/state:** TanStack Query, React Router
- **Backend:** [Supabase](https://supabase.com) — Postgres + Auth + Storage + Edge Functions (Deno)
- **Payments:** Stripe · **Maps:** Mapbox · **Email:** Resend
- **Tooling:** ESLint, Prettier, Vitest + Testing Library, Husky (pre-commit formatting)

## Prerequisites

- **Node.js 20+** and npm ([nvm](https://github.com/nvm-sh/nvm) recommended)
- A Supabase project's API URL + publishable (anon) key

## Run it locally

```sh
git clone https://github.com/LVL-Holding/hostfluencer.git
cd hostfluencer
npm install

# configure environment
cp .env.example .env        # then fill in the values (see below)

npm run dev                 # starts Vite on http://localhost:8080
```

### Environment variables (`.env`)

| Variable                        | Description                                                               |
| ------------------------------- | ------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | Supabase project API URL (`https://<ref>.supabase.co`)                    |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase **publishable / anon** key (never the secret key)                |
| `VITE_SUPABASE_PROJECT_ID`      | Supabase project ref                                                      |
| `VITE_APP_DOMAIN`               | App base URL (e.g. `https://hostfluencer.com` or `http://localhost:8080`) |

> Point these at the **`develop` Supabase branch** for local dev so you don't work against production data. The `.env` is gitignored.

## Scripts

| Script                  | What it does                                                        |
| ----------------------- | ------------------------------------------------------------------- |
| `npm run dev`           | Vite dev server (port 8080)                                         |
| `npm run build`         | Production build → `dist/`                                          |
| `npm run preview`       | Serve the production build locally                                  |
| `npm test`              | Run the test suite once (Vitest)                                    |
| `npm run test:watch`    | Vitest in watch mode                                                |
| `npm run test:coverage` | Tests with a coverage report                                        |
| `npm run lint`          | ESLint                                                              |
| `npm run format`        | Prettier-format `src/` + `eslint --fix`                             |
| `npm run format:check`  | Verify formatting + fail on lint **errors** (warnings OK)           |
| `npm run type-check`    | `tsc --noEmit`                                                      |
| `npm run types:gen`     | Regenerate Supabase types into `src/integrations/supabase/types.ts` |

## Testing

Tests use **Vitest** + **@testing-library/react** (jsdom). Co-locate tests as `*.test.ts(x)` or under `__tests__/`. Global setup lives in `src/setupTests.ts`. Run `npm test` (or `npm run test:watch`).

## Formatting & commit hooks

A **Husky `pre-commit`** hook runs `format:changed`, which Prettier-formats **only your staged files** and re-stages them — so commits stay formatted without reformatting the whole repo. Hooks install automatically on `npm install` (via the `prepare` script).

## Project structure

```
src/
  pages/                 # route-level pages (React Router)
  components/
    marketplace/         # property / stays marketplace
    creators/            # creator marketplace
    discovery/           # Voyager — AI discovery chat
    messaging/           # conversations & threads
    admin/               # admin dashboards & tables
    profiles/            # host / creator / brand dashboards
    ui/                  # shadcn/ui primitives
  hooks/                 # data hooks (TanStack Query + Supabase)
  integrations/supabase/ # Supabase client + generated types
  lib/  utils/           # shared helpers
supabase/
  functions/             # Deno edge functions (Stripe, email, AI, analytics, …)
  migrations/            # SQL migrations
```

## Backend (Supabase)

- **Edge functions** live in `supabase/functions/` (Stripe webhooks/checkout, AI matching, analytics sync, email, automations, etc.).
- **Schema** is managed via `supabase/migrations/`.
- Each Git branch can map to a **Supabase branch** (e.g. `develop`) so dev/preview run against an isolated copy of the database.

## Deployment

The app deploys to **Vercel**. Pushing the production branch (`main`) deploys production; other branches (e.g. `develop`) produce preview deployments. Environment variables are configured per environment in the Vercel dashboard (production → prod Supabase, preview → the `develop` Supabase branch).
