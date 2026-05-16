/**
 * Hierarchical presets: country (canonical IANA timezone) → region/city (coordinates).
 * Use `region.timezone` only when it differs from the country default (e.g. México, Brasil).
 */

export const OTHER_COUNTRY_ID = "__other__";

const MATCH_EPS_DEG = 0.35;

export type CountrySubregion = {
  id: string;
  label: string;
  lat: number;
  lon: number;
  /** Optional override when the country spans multiple IANA zones */
  timezone?: string;
};

export type LatinAmericaCountry = {
  id: string;
  label: string;
  /** Default IANA timezone for the country; regions inherit unless they override */
  timezone: string;
  regions: CountrySubregion[];
};

export const LATIN_AMERICA_COUNTRIES: LatinAmericaCountry[] = [
  {
    id: "mx",
    label: "México",
    timezone: "America/Mexico_City",
    regions: [
      { id: "mx-cdmx", label: "Ciudad de México", lat: 19.4326, lon: -99.1332 },
      { id: "mx-gdl", label: "Guadalajara", lat: 20.6597, lon: -103.3496 },
      { id: "mx-mty", label: "Monterrey", lat: 25.6866, lon: -100.3161, timezone: "America/Monterrey" },
      { id: "mx-cun", label: "Cancún", lat: 21.1619, lon: -86.8515, timezone: "America/Cancun" },
      { id: "mx-tij", label: "Tijuana", lat: 32.5149, lon: -117.0382, timezone: "America/Tijuana" },
    ],
  },
  {
    id: "gt",
    label: "Guatemala",
    timezone: "America/Guatemala",
    regions: [
      { id: "gt-capital", label: "Ciudad de Guatemala", lat: 14.6349, lon: -90.5069 },
      { id: "gt-xela", label: "Quetzaltenango", lat: 14.8347, lon: -91.5185 },
    ],
  },
  {
    id: "sv",
    label: "El Salvador",
    timezone: "America/El_Salvador",
    regions: [
      { id: "sv-capital", label: "San Salvador", lat: 13.6929, lon: -89.2182 },
      { id: "sv-santa-ana", label: "Santa Ana", lat: 13.9942, lon: -89.5597 },
      { id: "sv-san-miguel", label: "San Miguel", lat: 13.4833, lon: -88.1833 },
    ],
  },
  {
    id: "hn",
    label: "Honduras",
    timezone: "America/Tegucigalpa",
    regions: [
      { id: "hn-tegus", label: "Tegucigalpa", lat: 14.0818, lon: -87.2068 },
      { id: "hn-sps", label: "San Pedro Sula", lat: 15.5042, lon: -88.0259 },
    ],
  },
  {
    id: "ni",
    label: "Nicaragua",
    timezone: "America/Managua",
    regions: [
      { id: "ni-mga", label: "Managua", lat: 12.1364, lon: -86.2514 },
      { id: "ni-leon", label: "León", lat: 12.4379, lon: -86.878 },
    ],
  },
  {
    id: "cr",
    label: "Costa Rica",
    timezone: "America/Costa_Rica",
    regions: [
      { id: "cr-sj", label: "San José", lat: 9.9281, lon: -84.0907 },
      { id: "cr-limon", label: "Limón", lat: 9.9907, lon: -83.0359 },
    ],
  },
  {
    id: "pa",
    label: "Panamá",
    timezone: "America/Panama",
    regions: [
      { id: "pa-capital", label: "Ciudad de Panamá", lat: 8.9824, lon: -79.5199 },
      { id: "pa-david", label: "David", lat: 8.4174, lon: -82.421 },
    ],
  },
  {
    id: "co",
    label: "Colombia",
    timezone: "America/Bogota",
    regions: [
      { id: "co-bog", label: "Bogotá", lat: 4.711, lon: -74.0721 },
      { id: "co-med", label: "Medellín", lat: 6.2442, lon: -75.5812 },
      { id: "co-cali", label: "Cali", lat: 3.4516, lon: -76.532 },
      { id: "co-ctg", label: "Cartagena", lat: 10.391, lon: -75.4794 },
      { id: "co-baq", label: "Barranquilla", lat: 10.9848, lon: -74.807 },
    ],
  },
  {
    id: "ve",
    label: "Venezuela",
    timezone: "America/Caracas",
    regions: [
      { id: "ve-ccs", label: "Caracas", lat: 10.4806, lon: -66.9036 },
      { id: "ve-mar", label: "Maracaibo", lat: 10.6427, lon: -71.6125 },
    ],
  },
  {
    id: "ec",
    label: "Ecuador",
    timezone: "America/Guayaquil",
    regions: [
      { id: "ec-uio", label: "Quito", lat: -0.1807, lon: -78.4678 },
      { id: "ec-gye", label: "Guayaquil", lat: -2.1709, lon: -79.9224 },
    ],
  },
  {
    id: "pe",
    label: "Perú",
    timezone: "America/Lima",
    regions: [
      { id: "pe-lim", label: "Lima", lat: -12.0464, lon: -77.0428 },
      { id: "pe-cuz", label: "Cusco", lat: -13.5319, lon: -71.9675 },
      { id: "pe-aqp", label: "Arequipa", lat: -16.409, lon: -71.5378 },
    ],
  },
  {
    id: "bo",
    label: "Bolivia",
    timezone: "America/La_Paz",
    regions: [
      { id: "bo-lpz", label: "La Paz", lat: -16.4897, lon: -68.1193 },
      { id: "bo-scz", label: "Santa Cruz de la Sierra", lat: -17.7834, lon: -63.1821 },
    ],
  },
  {
    id: "cl",
    label: "Chile",
    timezone: "America/Santiago",
    regions: [
      { id: "cl-scl", label: "Santiago", lat: -33.4489, lon: -70.6693 },
      { id: "cl-anf", label: "Antofagasta", lat: -23.6509, lon: -70.3975 },
      { id: "cl-puq", label: "Punta Arenas", lat: -53.1638, lon: -70.9176, timezone: "America/Punta_Arenas" },
    ],
  },
  {
    id: "ar",
    label: "Argentina",
    timezone: "America/Argentina/Buenos_Aires",
    regions: [
      { id: "ar-bue", label: "Buenos Aires", lat: -34.6037, lon: -58.3816 },
      { id: "ar-cba", label: "Córdoba", lat: -31.4201, lon: -64.1888, timezone: "America/Argentina/Cordoba" },
      { id: "ar-mdz", label: "Mendoza", lat: -32.8895, lon: -68.8458, timezone: "America/Argentina/Mendoza" },
    ],
  },
  {
    id: "uy",
    label: "Uruguay",
    timezone: "America/Montevideo",
    regions: [
      { id: "uy-mvd", label: "Montevideo", lat: -34.9011, lon: -56.1645 },
      { id: "uy-pde", label: "Punta del Este", lat: -34.9623, lon: -54.9498 },
    ],
  },
  {
    id: "py",
    label: "Paraguay",
    timezone: "America/Asuncion",
    regions: [
      { id: "py-asu", label: "Asunción", lat: -25.2637, lon: -57.5759 },
      { id: "py-cde", label: "Ciudad del Este", lat: -25.5097, lon: -54.6111 },
    ],
  },
  {
    id: "br",
    label: "Brasil",
    timezone: "America/Sao_Paulo",
    regions: [
      { id: "br-bsb", label: "Brasília", lat: -15.7939, lon: -47.8828 },
      { id: "br-gru", label: "São Paulo", lat: -23.5505, lon: -46.6333 },
      { id: "br-rio", label: "Río de Janeiro", lat: -22.9068, lon: -43.1729 },
      { id: "br-ssg", label: "Salvador", lat: -12.9777, lon: -38.5016, timezone: "America/Bahia" },
      { id: "br-rec", label: "Recife", lat: -8.0476, lon: -34.877, timezone: "America/Recife" },
      { id: "br-for", label: "Fortaleza", lat: -3.7172, lon: -38.5434, timezone: "America/Fortaleza" },
      { id: "br-mao", label: "Manaus", lat: -3.119, lon: -60.0217, timezone: "America/Manaus" },
      { id: "br-bel", label: "Belém", lat: -1.4558, lon: -48.5039, timezone: "America/Belem" },
    ],
  },
  {
    id: "cu",
    label: "Cuba",
    timezone: "America/Havana",
    regions: [
      { id: "cu-hav", label: "La Habana", lat: 23.1136, lon: -82.3666 },
      { id: "cu-scu", label: "Santiago de Cuba", lat: 20.0247, lon: -75.8219 },
    ],
  },
  {
    id: "do",
    label: "República Dominicana",
    timezone: "America/Santo_Domingo",
    regions: [
      { id: "do-sdq", label: "Santo Domingo", lat: 18.4861, lon: -69.9312 },
      { id: "do-sti", label: "Santiago de los Caballeros", lat: 19.4517, lon: -70.697 },
    ],
  },
  {
    id: "pr",
    label: "Puerto Rico",
    timezone: "America/Puerto_Rico",
    regions: [
      { id: "pr-sju", label: "San Juan", lat: 18.4655, lon: -66.1057 },
      { id: "pr-pon", label: "Ponce", lat: 18.0111, lon: -66.6141 },
    ],
  },
  {
    id: "jm",
    label: "Jamaica",
    timezone: "America/Jamaica",
    regions: [
      { id: "jm-kin", label: "Kingston", lat: 17.9712, lon: -76.7936 },
      { id: "jm-mbj", label: "Montego Bay", lat: 18.4712, lon: -77.9188 },
    ],
  },
  {
    id: "ht",
    label: "Haití",
    timezone: "America/Port-au-Prince",
    regions: [
      { id: "ht-pap", label: "Puerto Príncipe", lat: 18.5944, lon: -72.3074 },
      { id: "ht-cap", label: "Cap-Haïtien", lat: 19.7596, lon: -72.1989 },
    ],
  },
];

export function getCountryById(id: string): LatinAmericaCountry | undefined {
  return LATIN_AMERICA_COUNTRIES.find((c) => c.id === id);
}

export function effectiveRegionTimezone(country: LatinAmericaCountry, region: CountrySubregion): string {
  return region.timezone ?? country.timezone;
}

export function resolveLocation(
  countryId: string,
  regionId: string,
): { lat: number; lon: number; timezone: string } | undefined {
  const country = getCountryById(countryId);
  if (!country) return undefined;
  const region = country.regions.find((r) => r.id === regionId);
  if (!region) return undefined;
  return {
    lat: region.lat,
    lon: region.lon,
    timezone: effectiveRegionTimezone(country, region),
  };
}

/** When subscription coords match a preset; otherwise use OTHER_COUNTRY_ID in the UI */
export function matchSubscriptionToPreset(
  lat: number,
  lon: number,
  timezone: string,
): { countryId: string; regionId: string } | null {
  const tz = timezone.trim();
  for (const country of LATIN_AMERICA_COUNTRIES) {
    for (const region of country.regions) {
      const eff = effectiveRegionTimezone(country, region);
      if (
        eff === tz &&
        Math.abs(region.lat - lat) <= MATCH_EPS_DEG &&
        Math.abs(region.lon - lon) <= MATCH_EPS_DEG
      ) {
        return { countryId: country.id, regionId: region.id };
      }
    }
  }
  return null;
}
