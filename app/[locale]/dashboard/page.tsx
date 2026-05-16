import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardSubscriptionForm } from "@/app/[locale]/dashboard/dashboard-subscription-form";
import { WeatherCitations } from "@/components/weather-citations";
import { redirect } from "@/i18n/navigation";
import {
  WEATHER_REFERENCES,
  buildAdvisory,
  type AdvisoryResult,
  type AdvisoryTranslator,
} from "@/lib/advisory/build-advisory";
import { getProfile } from "@/lib/auth/session";
import type { AlertSubscription, Profile } from "@/lib/types/database";
import {
  fetchOpenMeteoForecast,
  sliceNext24Hours,
  summarizeTemperatures,
} from "@/lib/weather/openmeteo";

type Props = {
  params: Promise<{ locale: string }>;
};

async function AdvisoryPreview({
  advisory,
  locale,
}: {
  advisory: AdvisoryResult;
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/60 dark:bg-sky-950/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-900 dark:text-sky-100">
          {t("advisoryEyebrow")}
        </p>
        <h2 className="mt-2 text-xl font-semibold">{advisory.title}</h2>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          {advisory.summary}
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
          {advisory.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        {advisory.breachDetail ? (
          <p className="mt-4 rounded-md bg-amber-100 p-3 text-sm text-amber-950 dark:bg-amber-400/15 dark:text-amber-50">
            {advisory.thresholdBreached ? `${t("advisoryThresholdNote")} ` : ""}
            {advisory.breachDetail}
          </p>
        ) : null}
        {advisory.todayDaily ? (
          <div className="mt-4 text-xs text-zinc-600 dark:text-zinc-400">
            {t("advisoryDailyAirRange", {
              date: advisory.todayDaily.date,
              min: advisory.todayDaily.temperature_2m_min ?? "–",
              max: advisory.todayDaily.temperature_2m_max ?? "–",
            })}
          </div>
        ) : null}
      </div>
      <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        {t("advisoryAttribution")}
      </p>
    </div>
  );
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const tAdvisory = await getTranslations({ locale, namespace: "advisory" });

  const { user, profile, supabase } = await getProfile();

  if (!(profile as Profile | null)?.onboarding_complete) {
    redirect({ href: "/onboarding", locale });
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
      t: tAdvisory as unknown as AdvisoryTranslator,
    });
  } catch {
    advisory = null;
  }

  const advisoryBlock =
    advisory === null ? (
      <p className="text-sm text-red-600">{t("advisoryUnavailable")}</p>
    ) : (
      <AdvisoryPreview advisory={advisory} locale={locale} />
    );

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-sky-800 dark:text-sky-300">
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {t("welcome", { name: typedProfile.full_name })}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {t("accountTypeLabel")}{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {typedProfile.account_type === "grocery"
              ? t("accountGrocery")
              : t("accountIndividual")}
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
          <h2 className="text-lg font-semibold">{t("advisoryTitle")}</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {t("advisorySubtitle")}
          </p>
          <div className="mt-4">{advisoryBlock}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold">{t("alertTitle")}</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {t.rich("alertSubtitle", {
              secret: "CRON_SECRET",
              code: (chunks) => <code className="text-xs">{chunks}</code>,
            })}
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
