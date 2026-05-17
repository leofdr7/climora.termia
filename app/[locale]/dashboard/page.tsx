import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CurrentLocationButton } from "@/app/[locale]/dashboard/current-location-button";
import { ForecastTemperatureMap } from "@/app/[locale]/dashboard/forecast-temperature-map";
import { HourlyWeatherTimeline } from "@/app/[locale]/dashboard/hourly-weather-timeline";
import { Link, redirect } from "@/i18n/navigation";
import {
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
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function WeatherChatMessage({
  advisory,
  isCurrentLocationPreview,
  locale,
}: {
  advisory: AdvisoryResult;
  isCurrentLocationPreview: boolean;
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const temperature =
    advisory.currentTemperature === null
      ? null
      : `${advisory.currentTemperature.toFixed(1)} °C`;

  return (
    <section className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-6 shadow-lg dark:border-indigo-950 dark:from-indigo-950/40 dark:via-zinc-950 dark:to-sky-950/30">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-black text-white shadow-sm">
          AI
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-800 dark:text-indigo-200">
            {t("weatherChatAssistant")}
          </p>
          <div className="mt-3 rounded-3xl rounded-tl-md bg-white p-5 text-sm leading-6 text-zinc-700 shadow-sm dark:bg-zinc-900 dark:text-zinc-200">
            <p className="font-semibold text-zinc-950 dark:text-zinc-50">
              {t("weatherChatGreeting")}
            </p>
            <p className="mt-2 rounded-2xl bg-indigo-50 p-3 text-xs font-bold text-indigo-950 dark:bg-indigo-950/40 dark:text-indigo-100">
              {isCurrentLocationPreview
                ? t("currentLocationPreviewActive")
                : t("savedLocationPreviewActive")}
            </p>
            <p className="mt-2">
              {temperature
                ? t("weatherChatCurrentTemperature", { temperature })
                : t("weatherChatCurrentTemperatureUnavailable")}
            </p>
            {advisory.todayDaily ? (
              <p className="mt-2">
                {t("weatherChatDailyRange", {
                  date: advisory.todayDaily.date,
                  min: advisory.todayDaily.temperature_2m_min ?? "–",
                  max: advisory.todayDaily.temperature_2m_max ?? "–",
                })}
              </p>
            ) : null}
            <p className="mt-3">{advisory.summary}</p>
            <p className="mt-4 font-semibold text-zinc-950 dark:text-zinc-50">
              {t("weatherChatRecommendations")}
            </p>
            <div className="mt-2 grid gap-3 lg:grid-cols-3">
              {advisory.insights.recommendations.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl bg-sky-50 p-3 dark:bg-sky-950/40"
                >
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-800 dark:text-sky-200">
                    {item.timeLabel}
                  </p>
                  <h3 className="mt-1 font-black text-zinc-950 dark:text-zinc-50">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5">{item.detail}</p>
                </article>
              ))}
            </div>
            {advisory.breachDetail ? (
              <p className="mt-3 rounded-2xl bg-amber-100 p-3 font-medium text-amber-950 dark:bg-amber-400/15 dark:text-amber-50">
                {advisory.breachDetail}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePreviewCoordinates(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const rawLat = getSingleParam(searchParams.previewLat);
  const rawLon = getSingleParam(searchParams.previewLon);
  const rawTz = getSingleParam(searchParams.previewTz);
  const lat = rawLat ? Number(rawLat) : NaN;
  const lon = rawLon ? Number(rawLon) : NaN;
  const timezone = rawTz?.trim() || "";

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180 ||
    timezone.length === 0
  ) {
    return null;
  }

  return { lat, lon, timezone };
}

export default async function DashboardPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
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
  const previewCoordinates = parsePreviewCoordinates(resolvedSearchParams);
  const isCurrentLocationPreview = previewCoordinates !== null;

  const previewLat = previewCoordinates?.lat ?? subscription?.lat ?? 40.7128;
  const previewLon = previewCoordinates?.lon ?? subscription?.lon ?? -74.006;
  const previewTz =
    previewCoordinates?.timezone ?? subscription?.timezone ?? "America/New_York";

  let advisory: AdvisoryResult | null = null;

  try {
    const forecast = await fetchOpenMeteoForecast(previewLat, previewLon, previewTz);
    const windowSlice = sliceNext24Hours(forecast.hourly);
    const stats = summarizeTemperatures(windowSlice);
    const currentTemperature =
      windowSlice.find((point) => point.temperature_2m !== null)?.temperature_2m ?? null;
    advisory = buildAdvisory({
      min24h: stats.min,
      max24h: stats.max,
      currentTemperature,
      soilMean: stats.soilMean,
      minThreshold: subscription?.min_temp_alert_celsius ?? 2,
      maxThreshold: subscription?.max_temp_alert_celsius ?? 32,
      hourly: windowSlice,
      daily: forecast.daily,
      locale,
      t: tAdvisory as unknown as AdvisoryTranslator,
    });
  } catch {
    advisory = null;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="rounded-3xl border border-sky-100 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <p className="w-fit rounded-full bg-sky-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-800 dark:bg-sky-950 dark:text-sky-200">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-sky-950 dark:text-sky-50">
          {t("welcome", { name: typedProfile.full_name })}
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          {t("accountTypeLabel")}{" "}
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {typedProfile.account_type === "grocery"
              ? t("accountGrocery")
              : t("accountIndividual")}
          </span>
          {typedProfile.store_name ? (
            <>
              {" "}
              · <span className="font-bold">{typedProfile.store_name}</span>
            </>
          ) : null}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Suspense fallback={null}>
            <CurrentLocationButton />
          </Suspense>
          <Link
            href="/settings/alerts"
            className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
          >
            {t("manageAlertSettings")}
          </Link>
        </div>
      </div>

      {advisory ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] xl:items-stretch">
          <WeatherChatMessage
            advisory={advisory}
            isCurrentLocationPreview={isCurrentLocationPreview}
            locale={locale}
          />
          <ForecastTemperatureMap
            currentTemperature={advisory.currentTemperature}
            dailyMax={advisory.todayDaily?.temperature_2m_max ?? null}
            dailyMin={advisory.todayDaily?.temperature_2m_min ?? null}
            isCurrentLocationPreview={isCurrentLocationPreview}
            lat={previewLat}
            lon={previewLon}
            timezone={previewTz}
          />
        </div>
      ) : null}

      {advisory ? <HourlyWeatherTimeline items={advisory.insights.timeline} /> : null}
    </div>
  );
}
