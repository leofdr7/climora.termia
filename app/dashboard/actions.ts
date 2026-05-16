"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

function parseNumber(name: string, formData: FormData, fallback: number) {
  const raw = formData.get(name);
  const n = raw === null || raw === "" ? NaN : Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function parseIntBounded(name: string, formData: FormData, fallback: number) {
  const n = parseNumber(name, formData, fallback);
  return Math.min(23, Math.max(0, Math.round(n)));
}

export async function saveAlertSubscription(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "Sign in again to configure alerts." };
  }

  const lat = parseNumber("lat", formData, NaN);
  const lon = parseNumber("lon", formData, NaN);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return { error: "Latitude must be between -90 and 90." };
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    return { error: "Longitude must be between -180 and 180." };
  }

  const timezone = String(formData.get("timezone") || "UTC").trim() || "UTC";
  const alertEmail =
    String(formData.get("alert_email") ?? user.email).trim() || user.email;

  const min_temp_alert_celsius = parseNumber(
    "min_temp_alert_celsius",
    formData,
    2,
  );
  const max_temp_alert_celsius = parseNumber(
    "max_temp_alert_celsius",
    formData,
    32,
  );

  const daily_digest_hour = parseIntBounded(
    "daily_digest_hour",
    formData,
    8,
  );

  const is_active = Boolean(formData.get("is_active"));

  const payload = {
    user_id: user.id,
    alert_email: alertEmail,
    lat,
    lon,
    timezone,
    min_temp_alert_celsius,
    max_temp_alert_celsius,
    daily_digest_hour,
    is_active,
  };

  const { error } = await supabase
    .from("alert_subscriptions")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
