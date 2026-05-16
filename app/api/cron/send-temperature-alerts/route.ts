import { buildDigestForRecipient } from "@/lib/email/digest";
import { sendHtmlEmail } from "@/lib/email/send";
import { createServiceClient } from "@/lib/supabase/admin";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type SubscriptionRow = {
  lat: number;
  lon: number;
  timezone: string | null;
  min_temp_alert_celsius: number | null;
  max_temp_alert_celsius: number | null;
  alert_email: string;
};

async function runDispatch(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!cronSecret) {
    return Response.json(
      { ok: false, error: "CRON_SECRET must be set to call this endpoint securely." },
      { status: 500 },
    );
  }
  if (auth !== `Bearer ${cronSecret}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return Response.json(
      {
        ok: false,
        error: "Temperature emails require RESEND_API_KEY and RESEND_FROM_EMAIL.",
      },
      { status: 503 },
    );
  }

  let admin;
  try {
    admin = createServiceClient();
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Unable to initialise Supabase service client.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }

  const { data: rows, error } = await admin
    .from("alert_subscriptions")
    .select("*")
    .eq("is_active", true);

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  const typedRows = rows as SubscriptionRow[] | null;
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  for (const row of typedRows ?? []) {
    try {
      const digest = await buildDigestForRecipient({
        lat: row.lat,
        lon: row.lon,
        timezone: row.timezone ?? "UTC",
        minTemp: row.min_temp_alert_celsius ?? 2,
        maxTemp: row.max_temp_alert_celsius ?? 32,
      });
      await sendHtmlEmail({
        to: row.alert_email,
        subject: digest.subject,
        html: digest.html,
      });
      results.sent += 1;
    } catch (e) {
      results.failed += 1;
      results.errors.push(
        `${row.alert_email}: ${e instanceof Error ? e.message : "unknown error"}`,
      );
    }

    await delay(150);
  }

  return Response.json({
    ok: true,
    processed: typedRows?.length ?? 0,
    ...results,
  });
}

export async function POST(request: Request) {
  return runDispatch(request);
}

/** Vercel Cron invokes GET requests; authorize with Bearer CRON_SECRET. */
export async function GET(request: Request) {
  return runDispatch(request);
}
