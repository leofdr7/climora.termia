import "server-only";

const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";

export type HourlyPoint = {
  time: string;
  temperature_2m: number | null;
  soil_temperature_6cm: number | null;
};

export type DailyPoint = {
  date: string;
  temperature_2m_max: number | null;
  temperature_2m_min: number | null;
};

export type OpenMeteoForecast = {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
};

type OpenMeteoJson = {
  latitude: number;
  longitude: number;
  timezone?: string;
  hourly?: {
    time: string[];
    temperature_2m?: (number | null)[];
    soil_temperature_6cm?: (number | null)[];
  };
  daily?: {
    time: string[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
  };
};

export async function fetchOpenMeteoForecast(
  lat: number,
  lon: number,
  timezone: string,
  options?: { cache?: RequestCache; revalidateSeconds?: number },
): Promise<OpenMeteoForecast> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: "temperature_2m,soil_temperature_6cm",
    daily: "temperature_2m_max,temperature_2m_min",
    forecast_days: "3",
    timezone,
  });

  const fetchOptions: RequestInit & { next?: { revalidate: number } } =
    options?.cache === "no-store"
      ? { cache: "no-store" }
      : {
          cache: options?.cache,
          next: { revalidate: options?.revalidateSeconds ?? 900 },
        };

  const res = await fetch(`${OPEN_METEO}?${params.toString()}`, fetchOptions);

  if (!res.ok) {
    throw new Error(`Open-Meteo error: ${res.status}`);
  }

  const data = (await res.json()) as OpenMeteoJson;
  const hourly: HourlyPoint[] = [];
  const hourlyBlock = data.hourly;

  if (hourlyBlock?.time?.length && hourlyBlock.temperature_2m) {
    for (let i = 0; i < hourlyBlock.time.length; i++) {
      hourly.push({
        time: hourlyBlock.time[i],
        temperature_2m: hourlyBlock.temperature_2m[i] ?? null,
        soil_temperature_6cm: hourlyBlock.soil_temperature_6cm?.[i] ?? null,
      });
    }
  }

  const daily: DailyPoint[] = [];
  const dailyBlock = data.daily;

  if (
    dailyBlock?.time?.length &&
    dailyBlock.temperature_2m_max &&
    dailyBlock.temperature_2m_min
  ) {
    for (let i = 0; i < dailyBlock.time.length; i++) {
      daily.push({
        date: dailyBlock.time[i],
        temperature_2m_max: dailyBlock.temperature_2m_max[i] ?? null,
        temperature_2m_min: dailyBlock.temperature_2m_min[i] ?? null,
      });
    }
  }

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone ?? timezone,
    hourly,
    daily,
  };
}

/** Next ~24h slice from hourly series starting at approximate "now". */
export function sliceNext24Hours(hourly: HourlyPoint[]): HourlyPoint[] {
  if (hourly.length === 0) return [];
  const now = Date.now();
  return hourly.filter((h) => {
    const t = Date.parse(h.time);
    return t >= now - 60 * 60 * 1000 && t <= now + 24 * 60 * 60 * 1000;
  });
}

export function summarizeTemperatures(hourly: HourlyPoint[]) {
  const temps = hourly
    .map((h) => h.temperature_2m)
    .filter((t): t is number => t !== null && !Number.isNaN(t));
  const soil = hourly
    .map((h) => h.soil_temperature_6cm)
    .filter((t): t is number => t !== null && !Number.isNaN(t));

  if (temps.length === 0) {
    return {
      min: null as number | null,
      max: null as number | null,
      mean: null as number | null,
      soilMean: soil.length ? soil.reduce((a, b) => a + b, 0) / soil.length : null,
    };
  }

  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
  const soilMean = soil.length
    ? soil.reduce((a, b) => a + b, 0) / soil.length
    : null;

  return { min, max, mean, soilMean };
}
