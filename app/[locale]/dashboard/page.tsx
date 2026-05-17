import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AnimatedWallpaper } from "@/components/animated-wallpaper";
import { CurrentLocationButton } from "@/app/[locale]/dashboard/current-location-button";
import { ForecastChatbot } from "@/app/[locale]/dashboard/forecast-chatbot";
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
    <section className="relative overflow-hidden rounded-[2rem] border border-[#00aaff]/25 bg-[#031426]/80 p-6 text-white shadow-2xl shadow-cyan-950/30 backdrop-blur-md">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#00aaff]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-52 w-52 rounded-full bg-[#00ff88]/10 blur-3xl" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#00ff88]/30 bg-[#00ff88]/12 text-sm font-bold text-[#00ff88] shadow-lg shadow-emerald-950/30">
          AI
        </div>
        <div className="relative min-w-0 flex-1">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.24em] text-[#8fe7ff]">
            {t("weatherChatAssistant")}
          </p>
          <div className="mt-3 rounded-3xl rounded-tl-md border border-white/10 bg-black/30 p-5 text-sm leading-6 text-slate-300 shadow-sm backdrop-blur">
            <p className="font-semibold text-white">
              {t("weatherChatGreeting")}
            </p>
            <p className="mt-2 rounded-2xl border border-[#00aaff]/20 bg-[#00aaff]/10 p-3 text-xs font-bold text-cyan-100">
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
            <p className="mt-4 font-semibold text-white">
              {t("weatherChatRecommendations")}
            </p>
            <div className="mt-2 grid gap-3 lg:grid-cols-3">
              {advisory.insights.recommendations.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-white/10 p-3"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00ff88]">
                    {item.timeLabel}
                  </p>
                  <h3 className="font-display mt-1 font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-5">{item.detail}</p>
                </article>
              ))}
            </div>
            {advisory.breachDetail ? (
              <p className="mt-3 rounded-2xl border border-amber-300/30 bg-amber-300/12 p-3 font-medium text-amber-100">
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
    <main className="relative isolate -mt-[5.25rem] min-h-screen overflow-hidden bg-[#020713] px-4 pb-14 pt-28 text-white">
      <AnimatedWallpaper />
      <div className="space-stars" />
      <div className="space-topography absolute inset-0 opacity-45" />
      <div className="relative mx-auto max-w-6xl space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#00aaff]/25 bg-[#031426]/80 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur-md">
        <div className="pointer-events-none absolute right-10 top-8 h-36 w-36 rounded-full bg-[#00ff88]/10 blur-3xl" />
        <p className="w-fit rounded-full border border-[#00aaff]/40 bg-[#00aaff]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#8fe7ff]">
          {t("eyebrow")}
        </p>
        <h1 className="font-display mt-4 text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
          {t("welcome", { name: typedProfile.full_name })}
        </h1>
        <p className="mt-3 text-slate-300">
          {t("accountTypeLabel")}{" "}
          <span className="font-bold text-[#00ff88]">
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
            className="space-pulse w-fit rounded-full border border-[#00ff88]/30 bg-[#00ff88]/15 px-5 py-3 text-sm font-bold text-[#00ff88] hover:-translate-y-0.5 hover:bg-[#00ff88]/25"
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

      {advisory ? (
        <ForecastChatbot
          advisory={advisory}
          isCurrentLocationPreview={isCurrentLocationPreview}
          timezone={previewTz}
        />
      ) : null}

      {advisory ? <HourlyWeatherTimeline items={advisory.insights.timeline} /> : null}
      </div>
    </main>
  );
}
