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

  const fieldClass =
    "rounded-2xl border border-white/15 bg-[#061527]/85 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-[#00aaff] focus:bg-[#071b30] focus:ring-4 focus:ring-[#00aaff]/15";
  const readoutClass =
    "rounded-2xl border border-[#00aaff]/20 bg-[#00aaff]/10 px-4 py-3 font-mono text-sm tabular-nums text-[#8fe7ff]";
  const hintClass = "text-xs font-normal text-slate-400";

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

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
        {t("alertEmail")}
        <input
          name="alert_email"
          type="email"
          required
          defaultValue={subscription?.alert_email ?? defaultEmail}
          className={fieldClass}
        />
      </label>

      <div className="rounded-3xl border border-white/10 bg-black/25 p-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
          {t("country")}
          <select
            aria-label={t("country")}
            value={countryId}
            onChange={(e) => applyCountry(e.target.value)}
            className={fieldClass}
          >
            {LATIN_AMERICA_COUNTRIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
            <option value={OTHER_COUNTRY_ID}>{t("countryOther")}</option>
          </select>
          <span className={hintClass}>
            {t("countryHint")}
          </span>
        </label>

        <label className="mt-4 flex flex-col gap-1 text-sm font-medium text-slate-200">
          {t("region")}
          <select
            aria-label={t("region")}
            value={isOther ? "" : regionId}
            disabled={isOther || !selectedCountry?.regions.length}
            onChange={(e) => applyRegion(e.target.value)}
            className={`${fieldClass} disabled:cursor-not-allowed disabled:opacity-60`}
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
          <span className="text-sm font-medium text-slate-200">{t("latitude")}</span>
          <div
            className={readoutClass}
            aria-live="polite"
          >
            {formatCoord(lat)}
          </div>
          <span className={hintClass}>
            {t("coordsHint")}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-200">{t("longitude")}</span>
          <div
            className={readoutClass}
            aria-live="polite"
          >
            {formatCoord(lon)}
          </div>
          <span className={hintClass}>
            {t("coordsHint")}
          </span>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
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
              ? fieldClass
              : "cursor-default rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-slate-300"
          }
        />
        <span className={hintClass}>
          {isOther ? t("timezoneHintOther") : t("timezoneHint")}
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
          {t("minAlert")}
          <input
            name="min_temp_alert_celsius"
            type="number"
            step="0.1"
            defaultValue={subscription?.min_temp_alert_celsius ?? 2}
            className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-amber-50 outline-none focus:border-amber-300 focus:bg-amber-300/15 focus:ring-4 focus:ring-amber-300/15"
          />
          <span className={hintClass}>
            {t("minAlertHint")}
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
          {t("maxAlert")}
          <input
            name="max_temp_alert_celsius"
            type="number"
            step="0.1"
            defaultValue={subscription?.max_temp_alert_celsius ?? 32}
            className="rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-rose-50 outline-none focus:border-rose-300 focus:bg-rose-400/15 focus:ring-4 focus:ring-rose-300/15"
          />
          <span className={hintClass}>
            {t("maxAlertHint")}
          </span>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
        {t("digestHour")}
        <input
          name="daily_digest_hour"
          type="number"
          min={0}
          max={23}
          defaultValue={subscription?.daily_digest_hour ?? 8}
          className={fieldClass}
        />
      </label>
      <label className="flex items-center gap-3 rounded-2xl border border-[#00ff88]/20 bg-[#00ff88]/10 p-4 text-sm font-bold text-[#00ff88]">
        <input
          type="checkbox"
          name="is_active"
          value="on"
          defaultChecked={subscription?.is_active ?? true}
          className="h-5 w-5 rounded border-white/30 bg-black/30 accent-[#00ff88]"
        />
        {t("active")}
      </label>
      {feedback ? (
        <p
          className={
            feedback.type === "ok"
              ? "rounded-2xl border border-[#00ff88]/25 bg-[#00ff88]/10 p-3 text-sm font-medium text-[#00ff88]"
              : "rounded-2xl border border-red-400/25 bg-red-500/10 p-3 text-sm font-medium text-red-200"
          }
        >
          {feedback.text}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="space-pulse w-fit rounded-full bg-[#00ff88] px-5 py-3 text-sm font-bold text-[#00140c] shadow-md hover:-translate-y-0.5 hover:bg-[#00aaff] disabled:translate-y-0 disabled:opacity-60"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
