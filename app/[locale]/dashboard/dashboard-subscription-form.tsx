"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import {
  saveAlertSubscription,
  type DashboardErrorCode,
} from "@/app/[locale]/dashboard/actions";
import type { AlertSubscription } from "@/lib/types/database";
import {
  LATIN_AMERICA_COUNTRIES,
  OTHER_COUNTRY_ID,
  getCountryById,
  matchSubscriptionToPreset,
  resolveLocation,
} from "@/lib/regions/latin-america-presets";

function formatCoord(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(6);
}

function deriveFromSubscription(sub: AlertSubscription | null) {
  const lat = sub?.lat ?? 40.7128;
  const lon = sub?.lon ?? -74.006;
  const timezone = sub?.timezone ?? "America/New_York";
  const match = matchSubscriptionToPreset(lat, lon, timezone);
  return {
    lat,
    lon,
    timezone,
    countryId: match?.countryId ?? OTHER_COUNTRY_ID,
    regionId: match?.regionId ?? "",
  };
}

export function DashboardSubscriptionForm({
  subscription,
  defaultEmail,
}: {
  subscription: AlertSubscription | null;
  defaultEmail: string;
}) {
  const t = useTranslations("dashboard.form");
  const tErrors = useTranslations("dashboard.errors");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  const initial = deriveFromSubscription(subscription);

  const [countryId, setCountryId] = useState<string>(initial.countryId);
  const [regionId, setRegionId] = useState<string>(initial.regionId);
  const [lat, setLat] = useState(initial.lat);
  const [lon, setLon] = useState(initial.lon);
  const [timezone, setTimezone] = useState(initial.timezone);

  const isOther = countryId === OTHER_COUNTRY_ID;
  const selectedCountry = getCountryById(countryId);

  function applyCountry(nextCountryId: string) {
    setCountryId(nextCountryId);
    if (nextCountryId === OTHER_COUNTRY_ID) {
      setRegionId("");
      return;
    }
    const c = getCountryById(nextCountryId);
    const first = c?.regions[0];
    if (!c || !first) return;
    setRegionId(first.id);
    const loc = resolveLocation(nextCountryId, first.id);
    if (!loc) return;
    setLat(loc.lat);
    setLon(loc.lon);
    setTimezone(loc.timezone);
  }

  function applyRegion(nextRegionId: string) {
    setRegionId(nextRegionId);
    if (countryId === OTHER_COUNTRY_ID) return;
    const loc = resolveLocation(countryId, nextRegionId);
    if (!loc) return;
    setLat(loc.lat);
    setLon(loc.lon);
    setTimezone(loc.timezone);
  }

  function translateError(code: DashboardErrorCode, fallback?: string): string {
    const key = code as Parameters<typeof tErrors>[0];
    const translated = tErrors(key);
    if (code === "GENERIC" && fallback) {
      return `${translated} ${fallback}`.trim();
    }
    return translated;
  }

  return (
    <form
      className="flex flex-col gap-5"
      action={(formData) => {
        setFeedback(null);
        startTransition(async () => {
          const result = await saveAlertSubscription(formData);
          if ("errorCode" in result) {
            setFeedback({
              type: "error",
              text: translateError(result.errorCode, result.message),
            });
          } else if (result.ok) {
            setFeedback({ type: "ok", text: t("saved") });
          }
        });
      }}
    >
      <input type="hidden" name="lat" value={Number.isFinite(lat) ? lat : 40.7128} />
      <input type="hidden" name="lon" value={Number.isFinite(lon) ? lon : -74.006} />

      <label className="flex flex-col gap-1 text-sm font-medium">
        {t("alertEmail")}
        <input
          name="alert_email"
          type="email"
          required
          defaultValue={subscription?.alert_email ?? defaultEmail}
          className="rounded-2xl border border-zinc-200 bg-emerald-50 px-4 py-3 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
        />
      </label>

      <div className="rounded-3xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("country")}
          <select
            aria-label={t("country")}
            value={countryId}
            onChange={(e) => applyCountry(e.target.value)}
            className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-emerald-950"
          >
            {LATIN_AMERICA_COUNTRIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
            <option value={OTHER_COUNTRY_ID}>{t("countryOther")}</option>
          </select>
          <span className="text-xs font-normal text-zinc-500">
            {t("countryHint")}
          </span>
        </label>

        <label className="mt-4 flex flex-col gap-1 text-sm font-medium">
          {t("region")}
          <select
            aria-label={t("region")}
            value={isOther ? "" : regionId}
            disabled={isOther || !selectedCountry?.regions.length}
            onChange={(e) => applyRegion(e.target.value)}
            className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-60 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-emerald-950"
          >
            {isOther ? (
              <option value="">{t("regionUseSaved")}</option>
            ) : (
              selectedCountry?.regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))
            )}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t("latitude")}</span>
          <div
            className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 font-mono text-sm tabular-nums text-teal-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            aria-live="polite"
          >
            {formatCoord(lat)}
          </div>
          <span className="text-xs font-normal text-zinc-500">
            {t("coordsHint")}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{t("longitude")}</span>
          <div
            className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 font-mono text-sm tabular-nums text-teal-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            aria-live="polite"
          >
            {formatCoord(lon)}
          </div>
          <span className="text-xs font-normal text-zinc-500">
            {t("coordsHint")}
          </span>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        {t("timezone")}
        <input
          name="timezone"
          value={timezone}
          readOnly={!isOther}
          onChange={(e) => {
            if (!isOther) return;
            setTimezone(e.target.value);
          }}
          className={
            isOther
              ? "rounded-2xl border border-zinc-200 bg-emerald-50 px-4 py-3 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
              : "cursor-default rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          }
        />
        <span className="text-xs font-normal text-zinc-500">
          {isOther ? t("timezoneHintOther") : t("timezoneHint")}
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("minAlert")}
          <input
            name="min_temp_alert_celsius"
            type="number"
            step="0.1"
            defaultValue={subscription?.min_temp_alert_celsius ?? 2}
            className="rounded-2xl border border-zinc-200 bg-amber-50 px-4 py-3 outline-none focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-amber-950"
          />
          <span className="text-xs font-normal text-zinc-500">
            {t("minAlertHint")}
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("maxAlert")}
          <input
            name="max_temp_alert_celsius"
            type="number"
            step="0.1"
            defaultValue={subscription?.max_temp_alert_celsius ?? 32}
            className="rounded-2xl border border-zinc-200 bg-rose-50 px-4 py-3 outline-none focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-rose-950"
          />
          <span className="text-xs font-normal text-zinc-500">
            {t("maxAlertHint")}
          </span>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium">
        {t("digestHour")}
        <input
          name="daily_digest_hour"
          type="number"
          min={0}
          max={23}
          defaultValue={subscription?.daily_digest_hour ?? 8}
          className="rounded-2xl border border-zinc-200 bg-teal-50/80 px-4 py-3 outline-none focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-teal-950"
        />
      </label>
      <label className="flex items-center gap-3 rounded-2xl bg-teal-50 p-4 text-sm font-bold dark:bg-teal-950/25">
        <input
          type="checkbox"
          name="is_active"
          value="on"
          defaultChecked={subscription?.is_active ?? true}
          className="h-5 w-5 rounded border-zinc-300"
        />
        {t("active")}
      </label>
      {feedback ? (
        <p
          className={
            feedback.type === "ok"
              ? "rounded-2xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300"
          }
        >
          {feedback.text}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-md hover:-translate-y-0.5 hover:bg-emerald-800 disabled:translate-y-0 disabled:opacity-60"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
