import type { DailyPoint } from "@/lib/weather/openmeteo";

export type RiskLevel = "frost_watch" | "heat_stress" | "seasonal_blend" | "normal";

export type WeatherReferenceKey =
  | "openmeteo"
  | "ecmwf"
  | "noaa"
  | "nasa"
  | "eumetsat"
  | "copernicus";

export type WeatherReference = {
  key: WeatherReferenceKey;
  href: string;
};

export const WEATHER_REFERENCES: WeatherReference[] = [
  { key: "openmeteo", href: "https://open-meteo.com/" },
  { key: "ecmwf", href: "https://www.ecmwf.int/" },
  { key: "noaa", href: "https://www.weather.gov/jetstream/temp" },
  { key: "nasa", href: "https://worldview.earthdata.nasa.gov/" },
  { key: "eumetsat", href: "https://www.eumetsat.int/" },
  { key: "copernicus", href: "https://www.copernicus.eu/en" },
];

export type AdvisoryTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

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
  t: AdvisoryTranslator;
}): AdvisoryResult {
  const { min24h, max24h, soilMean, minThreshold, maxThreshold, daily, t } = input;
  const todayDaily = daily[0] ?? null;

  let thresholdBreached = false;
  let breachDetail: string | null = null;

  if (min24h !== null && min24h < minThreshold) {
    thresholdBreached = true;
    breachDetail = t("breachCold", {
      threshold: minThreshold.toFixed(1),
      observed: min24h.toFixed(1),
    });
  }
  if (max24h !== null && max24h > maxThreshold) {
    thresholdBreached = true;
    if (breachDetail) {
      breachDetail =
        breachDetail +
        t("breachHotAfterCold", {
          threshold: maxThreshold.toFixed(1),
          observed: max24h.toFixed(1),
        });
    } else {
      breachDetail = t("breachHotOnly", {
        threshold: maxThreshold.toFixed(1),
        observed: max24h.toFixed(1),
      });
    }
  }

  let risk: RiskLevel = "normal";
  let title = t("stable.title");
  let summary = t("stable.summary");
  const bullets: string[] = [t("defaultBullet")];

  if (min24h !== null && min24h < 2) {
    risk = "frost_watch";
    title = t("frostWatch.title");
    summary = t("frostWatch.summary");
    bullets.unshift(t("frostWatch.bullet"));
    if (soilMean !== null) {
      bullets.push(t("frostWatch.soil", { soil: soilMean.toFixed(1) }));
    }
  }

  if (max24h !== null && max24h >= 35) {
    risk = risk === "frost_watch" ? "seasonal_blend" : "heat_stress";
    title =
      risk === "seasonal_blend"
        ? t("seasonalBlend.title")
        : t("heatStress.title");
    summary =
      risk === "seasonal_blend"
        ? t("seasonalBlend.summary")
        : t("heatStress.summary");
    bullets.unshift(t("heatStress.bullet"));
  }

  if (risk === "normal" && thresholdBreached) {
    title = t("thresholdOnly.title");
    summary = t("thresholdOnly.summary");
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
