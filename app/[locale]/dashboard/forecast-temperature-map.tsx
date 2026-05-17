"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import type { LeafletForecastMapProps } from "@/app/[locale]/dashboard/forecast-temperature-map-leaflet";

const LeafletForecastMap = dynamic<LeafletForecastMapProps>(
  () =>
    import("@/app/[locale]/dashboard/forecast-temperature-map-leaflet").then(
      (mod) => mod.LeafletForecastMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[21rem] animate-pulse rounded-[1.65rem] bg-teal-100 dark:bg-teal-950/50" />
    ),
  },
);

export type ForecastTemperatureMapProps = {
  lat: number;
  lon: number;
  timezone: string;
  currentTemperature: number | null;
  dailyMin: number | null;
  dailyMax: number | null;
  isCurrentLocationPreview: boolean;
};

function formatTemperature(value: number | null) {
  if (value === null || Number.isNaN(value)) return "–";
  return `${value.toFixed(1)} °C`;
}

export function ForecastTemperatureMap({
  lat,
  lon,
  timezone,
  currentTemperature,
  dailyMin,
  dailyMax,
  isCurrentLocationPreview,
}: ForecastTemperatureMapProps) {
  const t = useTranslations("dashboard");
  const center: [number, number] = [lat, lon];
  const dailyRange =
    dailyMin === null && dailyMax === null
      ? t("mapUnavailable")
      : `${formatTemperature(dailyMin)} / ${formatTemperature(dailyMax)}`;

  return (
    <section className="overflow-hidden rounded-3xl border border-teal-200/90 bg-white/95 p-4 shadow-lg dark:border-emerald-900/70 dark:bg-zinc-950">
      <div className="mb-4 flex flex-col gap-3 px-2 pt-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-200">
            {t("mapEyebrow")}
          </p>
          <h2 className="font-display mt-2 text-xl font-semibold text-teal-950 dark:text-emerald-50">
            {t("mapTitle")}
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {isCurrentLocationPreview ? t("mapSubtitleCurrent") : t("mapSubtitleSaved")}
          </p>
        </div>
        <div className="rounded-2xl bg-orange-50 px-4 py-3 text-right dark:bg-orange-400/10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700 dark:text-orange-200">
            {t("mapCurrent")}
          </p>
          <p className="text-2xl font-black text-orange-950 dark:text-orange-50">
            {formatTemperature(currentTemperature)}
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.75rem] border border-teal-100/90 bg-teal-50/60 dark:border-zinc-800 dark:bg-zinc-900">
        <LeafletForecastMap
          center={center}
          currentTemperature={currentTemperature}
          dailyMax={dailyMax}
          dailyMin={dailyMin}
          labels={{
            ariaLabel: t("mapAriaLabel"),
            current: t("mapCurrent"),
            dailyRange: t("mapDailyRange"),
            location: t("mapLocation"),
            timezone: t("mapTimezone"),
            unavailable: t("mapUnavailable"),
          }}
          timezone={timezone}
        />
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[500] rounded-2xl bg-white/90 p-3 text-xs font-bold text-teal-950 shadow-lg backdrop-blur dark:bg-zinc-950/90 dark:text-teal-50">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>{t("mapDailyRange")}: {dailyRange}</span>
            <span>{lat.toFixed(3)}, {lon.toFixed(3)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
