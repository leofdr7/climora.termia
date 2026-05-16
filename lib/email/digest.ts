import { createTranslator } from "next-intl";

import enMessages from "@/messages/en.json";
import {
  buildAdvisory,
  type AdvisoryResult,
  type AdvisoryTranslator,
} from "@/lib/advisory/build-advisory";
import {
  fetchOpenMeteoForecast,
  sliceNext24Hours,
  summarizeTemperatures,
} from "@/lib/weather/openmeteo";

const englishAdvisoryTranslator = createTranslator({
  locale: "en",
  messages: enMessages,
  namespace: "advisory",
}) as unknown as AdvisoryTranslator;

export function renderAlertHtml(input: {
  advisory: AdvisoryResult;
  locationLabel: string;
  lat: number;
  lon: number;
  timezone: string;
}) {
  const { advisory, locationLabel, lat, lon, timezone } = input;
  const bullets = advisory.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(advisory.title)} · Satellite Temperature Advisor</title>
<style>
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#ffffff;color:#0f172a;padding:24px;}
  .card{border-radius:14px;border:1px solid #bae6fd;padding:22px;background:#f0f9ff;}
  h1{font-size:20px;margin:0 0 10px;color:#082f49;}
  p{margin:0 0 10px;line-height:1.5;color:#334155;}
  ul{margin:8px 0 12px;padding-left:18px;}
  .meta{font-size:12px;color:#64748b;}
  footer{margin-top:24px;font-size:11px;color:#94a3b8;line-height:1.5;}
</style>
</head>
<body>
<section class="card">
  <div class="meta">Forecast guidance near ${escapeHtml(locationLabel)} · ${escapeHtml(lat.toFixed(
    2,
  ))}, ${escapeHtml(lon.toFixed(2))} (${escapeHtml(timezone)}) — Open-Meteo</div>
  <h1>${escapeHtml(advisory.title)}</h1>
  <p>${escapeHtml(advisory.summary)}</p>
  <ul>${bullets}</ul>
  ${advisory.breachDetail ? `<p><strong>Threshold emphasis:</strong> ${escapeHtml(advisory.breachDetail)}</p>` : ""}
  ${
    advisory.todayDaily &&
    advisory.todayDaily.temperature_2m_min !== null &&
    advisory.todayDaily.temperature_2m_max !== null
      ? `<p>Daily modeled min/max (${escapeHtml(advisory.todayDaily.date)}): ${escapeHtml(
          String(advisory.todayDaily.temperature_2m_min),
        )} / ${escapeHtml(String(advisory.todayDaily.temperature_2m_max))} °C</p>`
      : ""
  }
  <footer>
    Attribution: Weather information by Open-Meteo (<a href="https://open-meteo.com">open-meteo.com</a>).
    This email is informational and does not constitute emergency monitoring.
  </footer>
</section>
</body>
</html>`;
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function buildDigestForRecipient(input: {
  lat: number;
  lon: number;
  timezone: string;
  minTemp: number;
  maxTemp: number;
}) {
  const forecast = await fetchOpenMeteoForecast(
    input.lat,
    input.lon,
    input.timezone,
    { cache: "no-store" },
  );
  const windowSlice = sliceNext24Hours(forecast.hourly);
  const stats = summarizeTemperatures(windowSlice);
  const advisory = buildAdvisory({
    min24h: stats.min,
    max24h: stats.max,
    soilMean: stats.soilMean,
    minThreshold: input.minTemp,
    maxThreshold: input.maxTemp,
    daily: forecast.daily,
    t: englishAdvisoryTranslator,
  });
  const locationLabel =
    advisory.todayDaily?.date ?? `${input.lat.toFixed(2)}, ${input.lon.toFixed(2)}`;
  const html = renderAlertHtml({
    advisory,
    locationLabel,
    lat: input.lat,
    lon: input.lon,
    timezone: input.timezone,
  });
  return {
    advisory,
    html,
    subject: `[Temperature Advisor] ${advisory.thresholdBreached ? "Threshold note · " : ""}${advisory.title}`,
  };
}
