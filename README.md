# Satellite Temperature Advisor

Next.js App Router frontend with Supabase Auth + Postgres (`profiles`, `alert_subscriptions`), deterministic temperature advisories using [Open‑Meteo](https://open-meteo.com), and HTML alerts via [Resend](https://resend.com).

## 1 · Prerequisites

- Node 20+
- Supabase project
- Optional: Resend account for digest emails + Vercel (or similar) hosting for cron pings

Copy env values:

```
cp .env.example .env.local
```

Populate:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Cron API route batches every active subscriber (never expose client-side) |
| `CRON_SECRET` | `Authorization: Bearer <secret>` gate for `/api/cron/send-temperature-alerts` |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Outbound advisory mail |

Supabase Dashboard → Authentication → SMTP: configure transactional provider so password confirmation emails deliver.

Redirect URL allowlist:

- `${YOUR_SITE_URL}/auth/callback`

## 2 · Database

Run the SQL migration in [`supabase/migrations/20250516120000_init_profiles_and_alerts.sql`](supabase/migrations/20250516120000_init_profiles_and_alerts.sql):

- Creates `profiles` + `alert_subscriptions`
- Seeds `profiles` via `handle_new_user` trigger (reads signup metadata `{ account_type, full_name }`)
- Enables Row Level Security for end users while the cron route leverages the **service role** key

Local dev can use Supabase CLI or paste into the SQL Editor.

## 3 · Scripts

```
npm install
npm run dev
```

Lint & production build:

```
npm run lint
npm run build
```

## 4 · User journey

1. `/auth/sign-up` — selects **Individual** vs **Grocery**, triggers Supabase email confirmation (`emailRedirectTo` → `/auth/callback`).
2. `/auth/callback` — exchanges OTP/pkce `code`, sets SSR cookies.
3. `/onboarding` — persists profile/store metadata (upsert guarded by RLS).
4. `/dashboard` — edits alert coordinates + thresholds, previews next-day advisory sourced from Open‑Meteo, lists authoritative reference links.

## 5 · Advisory + attribution

Forecast numbers originate from Open‑Meteo. Non-commercial demos must cite:

> Weather data provided by Open-Meteo (<https://open-meteo.com>)

Summaries inside the dashboard are deterministic rule templates—feel free to add an AI summarisation layer later that only narrates validated JSON forecasts.

## 6 · Scheduled emails

Protected route: `GET|POST https://YOUR_DOMAIN/api/cron/send-temperature-alerts`

- Header: `Authorization: Bearer ${CRON_SECRET}`
- Queries every **active** `alert_subscriptions` row with the Supabase **service role** client
- For each subscriber, renders HTML + sends Resend payload

[Vercel Cron](https://vercel.com/docs/cron-jobs): see [`vercel.json`](vercel.json) (`vercel`-managed jobs send `GET`; both verbs are wired). Mirror the scheduling pattern on other hosts (GitHub Actions, cron-job.org) with HTTPS + secret header.

Manual smoke test:

```bash
curl -X POST "$SITE/api/cron/send-temperature-alerts" ^
  -H "Authorization: Bearer $CRON_SECRET"
```

Roadmap polish: honour `timezone` when deciding whether `daily_digest_hour` should fire—the current MVP sends whenever the cron trigger runs.
