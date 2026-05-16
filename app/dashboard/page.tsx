import type { AdvisoryResult } from "@/lib/advisory/build-advisory";
import { WEATHER_REFERENCES, buildAdvisory } from "@/lib/advisory/build-advisory";
import type { AlertSubscription, Profile } from "@/lib/types/database";
import { DashboardSubscriptionForm } from "@/app/dashboard/dashboard-subscription-form";
import { WeatherCitations } from "@/components/weather-citations";
import { getProfile } from "@/lib/auth/session";
import {
  fetchOpenMeteoForecast,
  sliceNext24Hours,
  summarizeTemperatures,
} from "@/lib/weather/openmeteo";
import { redirect } from "next/navigation";

function AdvisoryPreview({ advisory }: { advisory: AdvisoryResult }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/60 dark:bg-sky-950/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-900 dark:text-sky-100">
          Rule-based advisory (next ~24 hours)
        </p>
        <h2 className="mt-2 text-xl font-semibold">{advisory.title}</h2>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{advisory.summary}</p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
          {advisory.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        {advisory.breachDetail ? (
          <p className="mt-4 rounded-md bg-amber-100 p-3 text-sm text-amber-950 dark:bg-amber-400/15 dark:text-amber-50">
            {advisory.thresholdBreached ? "Threshold note: " : ""}
            {advisory.breachDetail}
          </p>
        ) : null}
        {advisory.todayDaily ? (
          <div className="mt-4 text-xs text-zinc-600 dark:text-zinc-400">
            Modeled daily air min/max for {advisory.todayDaily.date}:{" "}
            {advisory.todayDaily.temperature_2m_min ?? "–"} /{" "}
            {advisory.todayDaily.temperature_2m_max ?? "–"} °C (Open-Meteo).
          </div>
        ) : null}
      </div>
      <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        Weather data by Open-Meteo (Commercial use requires attribution; see References). Forecasts are
        model guidance — supplement with calibrated sensors on site.
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  const { user, profile, supabase } = await getProfile();

  if (!(profile as Profile | null)?.onboarding_complete) {
    redirect("/onboarding");
  }

  const typedProfile = profile as Profile;

  const { data: subRow } = await supabase
    .from("alert_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const subscription = (subRow as AlertSubscription | null) ?? null;

  const previewLat = subscription?.lat ?? 40.7128;
  const previewLon = subscription?.lon ?? -74.006;
  const previewTz = subscription?.timezone ?? "America/New_York";

  let advisory: AdvisoryResult | null = null;

  try {
    const forecast = await fetchOpenMeteoForecast(previewLat, previewLon, previewTz);
    const windowSlice = sliceNext24Hours(forecast.hourly);
    const stats = summarizeTemperatures(windowSlice);
    advisory = buildAdvisory({
      min24h: stats.min,
      max24h: stats.max,
      soilMean: stats.soilMean,
      minThreshold: subscription?.min_temp_alert_celsius ?? 2,
      maxThreshold: subscription?.max_temp_alert_celsius ?? 32,
      daily: forecast.daily,
    });
  } catch {
    advisory = null;
  }

  const advisoryBlock =
    advisory === null ? (
      <p className="text-sm text-red-600">
        Forecast preview unavailable. Configure coordinates/timezone below and ensure network access is
        allowed for Open-Meteo.
      </p>
    ) : (
      <AdvisoryPreview advisory={advisory} />
    );

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-sky-800 dark:text-sky-300">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Welcome back, {typedProfile.full_name}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Account type:{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {typedProfile.account_type === "grocery" ? "Grocery / retail" : "Individual"}
          </span>
          {typedProfile.store_name ? (
            <>
              {" "}
              · <span className="font-medium">{typedProfile.store_name}</span>
            </>
          ) : null}
        </p>
      </div>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold">Live advisory preview</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Preview uses your saved coordinates or NYC defaults until you save a subscription.
          </p>
          <div className="mt-4">{advisoryBlock}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold">Alert delivery</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Configure where we email temperature digests. Cron jobs should call the secured API route using{" "}
            <code className="text-xs">CRON_SECRET</code> — see README.
          </p>
          <DashboardSubscriptionForm
            subscription={subscription}
            defaultEmail={user.email ?? ""}
          />
        </div>
      </section>

      <WeatherCitations items={WEATHER_REFERENCES} />
    </div>
  );
}
