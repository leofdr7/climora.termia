import type { DailyPoint, HourlyPoint } from "@/lib/weather/openmeteo";

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

export type WeatherInsightTone = "hot" | "cold" | "rain" | "wind" | "sun" | "calm";

export type TimedRecommendation = {
  id: string;
  tone: WeatherInsightTone;
  timeLabel: string;
  title: string;
  detail: string;
};

export type HourlyTimelineItem = {
  timeLabel: string;
  dateLabel: string;
  temperature: number | null;
  apparentTemperature: number | null;
  humidity: number | null;
  precipitationProbability: number | null;
  uvIndex: number | null;
  windSpeed: number | null;
  label: string;
  advice: string;
  tone: WeatherInsightTone;
};

export type WeatherInsights = {
  recommendations: TimedRecommendation[];
  timeline: HourlyTimelineItem[];
  peakHeat: HourlyTimelineItem | null;
  coldest: HourlyTimelineItem | null;
};

export type AdvisoryResult = {
  risk: RiskLevel;
  title: string;
  summary: string;
  bullets: string[];
  currentTemperature: number | null;
  insights: WeatherInsights;
  /** True if user-defined cold or hot thresholds are crossed in the next 24h window. */
  thresholdBreached: boolean;
  breachDetail: string | null;
  todayDaily: DailyPoint | null;
};

export function buildAdvisory(input: {
  min24h: number | null;
  max24h: number | null;
  currentTemperature: number | null;
  soilMean: number | null;
  minThreshold: number;
  maxThreshold: number;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  locale: string;
  t: AdvisoryTranslator;
}): AdvisoryResult {
  const {
    min24h,
    max24h,
    currentTemperature,
    soilMean,
    minThreshold,
    maxThreshold,
    hourly,
    daily,
    locale,
    t,
  } = input;
  const todayDaily = daily[0] ?? null;
  const insights = buildWeatherInsights({
    hourly,
    minThreshold,
    maxThreshold,
    locale,
    t,
  });

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
    currentTemperature,
    insights,
    thresholdBreached,
    breachDetail,
    todayDaily,
  };
}

function buildWeatherInsights(input: {
  hourly: HourlyPoint[];
  minThreshold: number;
  maxThreshold: number;
  locale: string;
  t: AdvisoryTranslator;
}): WeatherInsights {
  const { hourly, minThreshold, maxThreshold, locale, t } = input;
  const withTemp = hourly.filter(
    (point): point is HourlyPoint & { temperature_2m: number } =>
      point.temperature_2m !== null && !Number.isNaN(point.temperature_2m),
  );
  const peakPoint = withTemp.reduce<typeof withTemp[number] | null>(
    (best, point) =>
      best === null || point.temperature_2m > best.temperature_2m ? point : best,
    null,
  );
  const coldPoint = withTemp.reduce<typeof withTemp[number] | null>(
    (best, point) =>
      best === null || point.temperature_2m < best.temperature_2m ? point : best,
    null,
  );

  const timeline = hourly
    .filter((_, index) => index % 2 === 0)
    .slice(0, 12)
    .map((point) =>
      buildTimelineItem({
        point,
        minThreshold,
        maxThreshold,
        locale,
        t,
      }),
    );

  const peakHeat =
    peakPoint === null
      ? null
      : buildTimelineItem({
          point: peakPoint,
          minThreshold,
          maxThreshold,
          locale,
          t,
        });
  const coldest =
    coldPoint === null
      ? null
      : buildTimelineItem({
          point: coldPoint,
          minThreshold,
          maxThreshold,
          locale,
          t,
        });
  const recommendations: TimedRecommendation[] = [];

  if (peakPoint && peakPoint.temperature_2m >= Math.min(maxThreshold, 28)) {
    recommendations.push({
      id: "hydration",
      tone: "hot",
      timeLabel: formatForecastTime(peakPoint.time, locale),
      title: t("recommendations.hydration.title", {
        time: formatForecastTime(peakPoint.time, locale),
      }),
      detail: t("recommendations.hydration.detail", {
        time: formatForecastTime(peakPoint.time, locale),
        temperature: peakPoint.temperature_2m.toFixed(1),
      }),
    });
  }

  const highUv = hourly.find((point) => (point.uv_index ?? 0) >= 6);
  if (highUv) {
    recommendations.push({
      id: "uv",
      tone: "sun",
      timeLabel: formatForecastTime(highUv.time, locale),
      title: t("recommendations.uv.title", {
        time: formatForecastTime(highUv.time, locale),
      }),
      detail: t("recommendations.uv.detail", {
        uv: (highUv.uv_index ?? 0).toFixed(1),
      }),
    });
  }

  if (coldPoint && coldPoint.temperature_2m <= Math.max(minThreshold, 5)) {
    recommendations.push({
      id: "cold",
      tone: "cold",
      timeLabel: formatForecastTime(coldPoint.time, locale),
      title: t("recommendations.cold.title", {
        time: formatForecastTime(coldPoint.time, locale),
      }),
      detail: t("recommendations.cold.detail", {
        temperature: coldPoint.temperature_2m.toFixed(1),
      }),
    });
  }

  const rainPoint = hourly.find(
    (point) => (point.precipitation_probability ?? 0) >= 45,
  );
  if (rainPoint) {
    recommendations.push({
      id: "rain",
      tone: "rain",
      timeLabel: formatForecastTime(rainPoint.time, locale),
      title: t("recommendations.rain.title", {
        time: formatForecastTime(rainPoint.time, locale),
      }),
      detail: t("recommendations.rain.detail", {
        probability: Math.round(rainPoint.precipitation_probability ?? 0),
      }),
    });
  }

  if (recommendations.length === 0 && peakPoint) {
    recommendations.push({
      id: "steady",
      tone: "calm",
      timeLabel: formatForecastTime(peakPoint.time, locale),
      title: t("recommendations.steady.title"),
      detail: t("recommendations.steady.detail", {
        time: formatForecastTime(peakPoint.time, locale),
        temperature: peakPoint.temperature_2m.toFixed(1),
      }),
    });
  }

  return {
    recommendations: recommendations.slice(0, 3),
    timeline,
    peakHeat,
    coldest,
  };
}

function buildTimelineItem(input: {
  point: HourlyPoint;
  minThreshold: number;
  maxThreshold: number;
  locale: string;
  t: AdvisoryTranslator;
}): HourlyTimelineItem {
  const { point, minThreshold, maxThreshold, locale, t } = input;
  const temp = point.temperature_2m;
  let tone: WeatherInsightTone = "calm";
  let label = t("timeline.calm.label");
  let advice = t("timeline.calm.advice");

  if (temp !== null && temp >= Math.min(maxThreshold, 28)) {
    tone = "hot";
    label = t("timeline.hot.label");
    advice = t("timeline.hot.advice");
  } else if (temp !== null && temp <= Math.max(minThreshold, 5)) {
    tone = "cold";
    label = t("timeline.cold.label");
    advice = t("timeline.cold.advice");
  } else if ((point.precipitation_probability ?? 0) >= 45) {
    tone = "rain";
    label = t("timeline.rain.label");
    advice = t("timeline.rain.advice");
  } else if ((point.uv_index ?? 0) >= 6) {
    tone = "sun";
    label = t("timeline.sun.label");
    advice = t("timeline.sun.advice");
  } else if ((point.wind_speed_10m ?? 0) >= 25) {
    tone = "wind";
    label = t("timeline.wind.label");
    advice = t("timeline.wind.advice");
  }

  return {
    timeLabel: formatForecastTime(point.time, locale),
    dateLabel: formatForecastDate(point.time, locale),
    temperature: temp,
    apparentTemperature: point.apparent_temperature,
    humidity: point.relative_humidity_2m,
    precipitationProbability: point.precipitation_probability,
    uvIndex: point.uv_index,
    windSpeed: point.wind_speed_10m,
    label,
    advice,
    tone,
  };
}

function formatForecastTime(value: string, locale: string) {
  const match = value.match(/T(\d{2}):(\d{2})/);
  if (!match) return value;
  const hour = Number(match[1]);
  const minute = match[2];

  if (locale.startsWith("es")) {
    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${suffix}`;
}

function formatForecastDate(value: string, locale: string) {
  const datePart = value.split("T")[0];
  if (!datePart) return value;
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return datePart;

  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(locale.startsWith("es") ? "es" : "en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
