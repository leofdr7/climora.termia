export type ThemePreference = "light" | "dark" | "system";

export const THEME_COOKIE_NAME = "theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function parseThemeCookie(value: string | undefined): ThemePreference {
  return isThemePreference(value) ? value : "system";
}

export function nextThemePreference(current: ThemePreference): ThemePreference {
  if (current === "light") return "dark";
  if (current === "dark") return "system";
  return "light";
}
