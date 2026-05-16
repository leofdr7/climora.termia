"use client";

import { useEffect, useState, useTransition } from "react";
import { saveAlertSubscription } from "@/app/dashboard/actions";
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
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const initial = deriveFromSubscription(subscription);

  const [countryId, setCountryId] = useState<string>(initial.countryId);
  const [regionId, setRegionId] = useState<string>(initial.regionId);
  const [lat, setLat] = useState(initial.lat);
  const [lon, setLon] = useState(initial.lon);
  const [timezone, setTimezone] = useState(initial.timezone);

  const isOther = countryId === OTHER_COUNTRY_ID;
  const selectedCountry = getCountryById(countryId);

  useEffect(() => {
    const d = deriveFromSubscription(subscription);
    setLat(d.lat);
    setLon(d.lon);
    setTimezone(d.timezone);
    setCountryId(d.countryId);
    setRegionId(d.regionId);
  }, [subscription]);

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

  return (
    <form
      className="flex flex-col gap-4"
      action={(formData) => {
        setFeedback(null);
        startTransition(async () => {
          const result = await saveAlertSubscription(formData);
          if (result && "error" in result && result.error) {
            setFeedback({ type: "error", text: result.error });
          } else if (result && "ok" in result && result.ok) {
            setFeedback({ type: "ok", text: "Saved alert settings." });
          }
        });
      }}
    >
      <input type="hidden" name="lat" value={Number.isFinite(lat) ? lat : 40.7128} />
      <input type="hidden" name="lon" value={Number.isFinite(lon) ? lon : -74.006} />

      <label className="flex flex-col gap-1 text-sm font-medium">
        Alert email
        <input
          name="alert_email"
          type="email"
          required
          defaultValue={subscription?.alert_email ?? defaultEmail}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Country
        <select
          aria-label="Country"
          value={countryId}
          onChange={(e) => applyCountry(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        >
          {LATIN_AMERICA_COUNTRIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
          <option value={OTHER_COUNTRY_ID}>Other — manual timezone</option>
        </select>
        <span className="text-xs font-normal text-zinc-500">
          Choosing a country sets the legal timezone for alerts; pick a region below for precise coordinates.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Region / city
        <select
          aria-label="Region or city"
          value={isOther ? "" : regionId}
          disabled={isOther || !selectedCountry?.regions.length}
          onChange={(e) => applyRegion(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950"
        >
          {isOther ? (
            <option value="">Use saved coordinates</option>
          ) : (
            selectedCountry?.regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))
          )}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Latitude</span>
          <div
            className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm tabular-nums text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            aria-live="polite"
          >
            {formatCoord(lat)}
          </div>
          <span className="text-xs font-normal text-zinc-500">Set automatically from the region you select.</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Longitude</span>
          <div
            className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm tabular-nums text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            aria-live="polite"
          >
            {formatCoord(lon)}
          </div>
          <span className="text-xs font-normal text-zinc-500">Set automatically from the region you select.</span>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        IANA timezone
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
              ? "rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              : "cursor-default rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          }
        />
        <span className="text-xs font-normal text-zinc-500">
          {isOther
            ? "Enter a valid IANA zone (e.g. America/New_York) when your location is not listed."
            : "Derived from the country (and from the region only where multiple zones apply, e.g. México or Brasil)."}
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Cold alert below (°C)
          <input
            name="min_temp_alert_celsius"
            type="number"
            step="0.1"
            defaultValue={subscription?.min_temp_alert_celsius ?? 2}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <span className="text-xs font-normal text-zinc-500">
            Email highlights when modeled air min drops under this value in the lookahead window.
          </span>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Heat alert above (°C)
          <input
            name="max_temp_alert_celsius"
            type="number"
            step="0.1"
            defaultValue={subscription?.max_temp_alert_celsius ?? 32}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
          <span className="text-xs font-normal text-zinc-500">
            Highlights when modeled air max climbs above this value.
          </span>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Preferred digest hour (0–23, local TZ)
        <input
          name="daily_digest_hour"
          type="number"
          min={0}
          max={23}
          defaultValue={subscription?.daily_digest_hour ?? 8}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="is_active"
          value="on"
          defaultChecked={subscription?.is_active ?? true}
          className="h-4 w-4 rounded border-zinc-300"
        />
        Alerts enabled
      </label>
      {feedback ? (
        <p
          className={
            feedback.type === "ok"
              ? "text-sm text-emerald-700 dark:text-emerald-300"
              : "text-sm text-red-600 dark:text-red-400"
          }
        >
          {feedback.text}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Saving…" : "Save alert settings"}
      </button>
    </form>
  );
}
