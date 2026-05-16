import type { DailyPoint } from "@/lib/weather/openmeteo";

export type RiskLevel = "frost_watch" | "heat_stress" | "seasonal_blend" | "normal";

export type WeatherReference = {
  label: string;
  href: string;
  note: string;
};

export const WEATHER_REFERENCES: WeatherReference[] = [
  {
    label: "Open-Meteo (data source)",
    href: "https://open-meteo.com/",
    note: "Open numerical weather forecasts with required attribution.",
  },
  {
    label: "ECMWF",
    href: "https://www.ecmwf.int/",
    note: "Global assimilation-fed models underpin many public forecast layers.",
  },
  {
    label: "NOAA JetStream — temperature basics",
    href: "https://www.weather.gov/jetstream/temp",
    note: "How air temperature is measured and interpreted.",
  },
  {
    label: "NASA Worldview",
    href: "https://worldview.earthdata.nasa.gov/",
    note: "Explore satellite imagery including land and surface context.",
  },
  {
    label: "EUMETSAT — satellite observations",
    href: "https://www.eumetsat.int/",
    note: "European operational satellite data for weather and climate monitoring.",
  },
  {
    label: "Copernicus",
    href: "https://www.copernicus.eu/en",
    note: "Earth observation programmes that inform environmental monitoring.",
  },
];

export type AdvisoryResult = {
  risk: RiskLevel;
  title: string;
  summary: string;
  bullets: string[];
  /** True if user-defined cold or hot thresholds are crossed in the next 24h window. */
  thresholdBreached: boolean;
  breachDetail: string | null;
  todayDaily: DailyPoint | null;
};

export function buildAdvisory(input: {
  min24h: number | null;
  max24h: number | null;
  soilMean: number | null;
  minThreshold: number;
  maxThreshold: number;
  daily: DailyPoint[];
}): AdvisoryResult {
  const { min24h, max24h, soilMean, minThreshold, maxThreshold, daily } = input;
  const todayDaily = daily[0] ?? null;

  let thresholdBreached = false;
  let breachDetail: string | null = null;

  if (min24h !== null && min24h < minThreshold) {
    thresholdBreached = true;
    breachDetail = `Air temperature may drop near or below ${minThreshold.toFixed(1)}°C (${min24h.toFixed(1)}°C in the next-day window); review cold-chain and frost-sensitive goods.`;
  }
  if (max24h !== null && max24h > maxThreshold) {
    thresholdBreached = true;
    breachDetail = breachDetail
      ? breachDetail +
        ` Heat stress possible above ${maxThreshold.toFixed(1)}°C (peak ~${max24h.toFixed(1)}°C).`
      : `Peak temperature may exceed ${maxThreshold.toFixed(1)}°C (~${max24h.toFixed(1)}°C); monitor refrigerated cases and staffing comfort.`;
  }

  let risk: RiskLevel = "normal";
  let title = "Stable conditions";
  let summary =
    "Near-surface temperatures in the next day look within typical ranges for your alert settings.";
  const bullets: string[] = [
    "Forecasts blend global models; always compare with local instruments for loading docks and display cases.",
  ];

  if (min24h !== null && min24h < 2) {
    risk = "frost_watch";
    title = "Cold / frost watch";
    summary =
      "Hourly guidance suggests surface air may approach frost-prone values. Ground and soil temperatures can lag or diverge from air readings.";
    bullets.unshift(
      "Consider protecting outdoor intake areas and verifying HVAC setpoints overnight.",
    );
    if (soilMean !== null) {
      bullets.push(
        `Soil temperature (model layer ~6 cm average in window) centered near ${soilMean.toFixed(1)}°C — helpful context, not a replacement for probes.`,
      );
    }
  }

  if (max24h !== null && max24h >= 35) {
    risk = risk === "frost_watch" ? "seasonal_blend" : "heat_stress";
    title =
      risk === "seasonal_blend"
        ? "Mixed temperature stress window"
        : "Heat stress window";
    summary =
      risk === "seasonal_blend"
        ? "The next day may include both chilly lows and strong daytime heat — plan for refrigerated inventory and hydrated crews."
        : "Hot peak temperatures are expected. Satellite-informed land context still benefits from point sensors at the store.";
    bullets.unshift(
      "Verify cold-chain for short trips from truck to shelf; peak sun on asphalt can exceed air temperature.",
    );
  }

  if (risk === "normal" && thresholdBreached) {
    title = "Within model range but past your alert thresholds";
    summary =
      "Rule-based checks flagged your custom limits even if broader risk labels stay calm — see breach detail below.";
  }

  return {
    risk,
    title,
    summary,
    bullets,
    thresholdBreached,
    breachDetail,
    todayDaily,
  };
}
