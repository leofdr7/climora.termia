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
      <div className="h-full min-h-[28rem] animate-pulse rounded-[1.65rem] bg-zinc-800/80 dark:bg-zinc-900" />
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
    <section className="overflow-hidden rounded-3xl border border-zinc-800/70 bg-zinc-900/45 p-4 shadow-2xl shadow-black/30 ring-1 ring-white/5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mb-4 flex flex-col gap-3 px-2 pt-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-teal-200/90 dark:text-teal-200">
            {t("mapEyebrow")}
          </p>
          <h2 className="font-display mt-2 text-xl font-semibold text-white dark:text-emerald-50">
            {t("mapTitle")}
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-300 dark:text-zinc-400">
            {isCurrentLocationPreview ? t("mapSubtitleCurrent") : t("mapSubtitleSaved")}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-right">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-100">
            {t("mapCurrent")}
          </p>
          <p className="font-display text-2xl font-bold text-[#00ff88]">
            {formatTemperature(currentTemperature)}
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.75rem] border border-zinc-700/80 bg-zinc-800/50 dark:border-zinc-700 dark:bg-zinc-900">
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
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-[500] rounded-2xl border border-white/10 bg-zinc-900/85 p-3 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span>{t("mapDailyRange")}: {dailyRange}</span>
            <span>{lat.toFixed(3)}, {lon.toFixed(3)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
