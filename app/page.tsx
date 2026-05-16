import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-14 px-4 py-20">
      <section className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-800 dark:text-sky-300">
            Satellite-informed · Open data
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Temperature adviser for groceries and neighbours.
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-lg text-zinc-600 dark:text-zinc-400">
            Register as a shopper or grocer, confirm via email through Supabase Auth, and receive
            rule-based summaries built on Open‑Meteo numerical forecasts—with explicit links back to EU
            and US authoritative programmes.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              className="rounded-md bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800"
              href="/auth/sign-up"
            >
              Start registration
            </Link>
            <Link
              className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
              href="/auth/login"
            >
              Already confirmed? Sign in
            </Link>
          </div>
        </div>
        <aside className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold tracking-tight">How it works</h2>
          <ol className="mt-4 list-decimal space-y-3 ps-5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>Choose household or grocery onboarding after email verification.</li>
            <li>Save latitude, longitude, and temperature thresholds.</li>
            <li>Open-Meteo provides hourly temperatures; deterministic rules summarise risk.</li>
            <li>Secured cron job emails digests via Resend (configure your keys).</li>
          </ol>
          <div className="mt-6 rounded-lg bg-zinc-100 p-3 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            No third-party meteorological API keys needed for forecasting. Alerts require Resend and
            Supabase service credentials for secure batching.
          </div>
        </aside>
      </section>
      <section className="rounded-3xl border border-zinc-200 bg-white px-8 py-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-2xl font-semibold tracking-tight">Honest forecasting note</h3>
        <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-400">
          This demo does not run raw satellite ingestion. Instead it pairs trusted global model output
          (via Open‑Meteo) with satellite science references so teams can escalate to calibrated sensors when
          it matters—for walk-in coolers, loading docks, and community preparedness.
        </p>
      </section>
    </main>
  );
}
