"use client";

import { useTranslations } from "next-intl";
import { useEffect, useSyncExternalStore } from "react";

import {
  THEME_COOKIE_MAX_AGE,
  THEME_COOKIE_NAME,
  isThemePreference,
  nextThemePreference,
  type ThemePreference,
} from "@/lib/theme/theme";

function readThemeCookie(): ThemePreference {
  if (typeof document === "undefined") return "system";
  const match = document.cookie.match(
    new RegExp(`(?:^| )${THEME_COOKIE_NAME}=([^;]+)`),
  );
  const raw = match ? decodeURIComponent(match[1]) : null;
  return isThemePreference(raw) ? raw : "system";
}

function writeThemeCookie(value: ThemePreference) {
  document.cookie = `${THEME_COOKIE_NAME}=${value}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
}

const themeListeners = new Set<() => void>();

function subscribeToThemeChanges(listener: () => void) {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

function notifyThemeChange() {
  themeListeners.forEach((listener) => listener());
}

function applyThemeClass(value: ThemePreference) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (value === "dark") {
    root.classList.add("dark");
  } else if (value === "light") {
    root.classList.remove("dark");
  } else {
    const prefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  }
}

export function ThemeSwitcher() {
  const t = useTranslations("site.theme");
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    readThemeCookie,
    () => "system",
  );
  const mounted = useSyncExternalStore(
    subscribeToThemeChanges,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (theme !== "system") return;
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyThemeClass("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  function cycleTheme() {
    const next = nextThemePreference(theme);
    writeThemeCookie(next);
    applyThemeClass(next);
    notifyThemeChange();
  }

  const labels: Record<ThemePreference, string> = {
    light: t("light"),
    dark: t("dark"),
    system: t("system"),
  };
  const upcomingLabel = labels[nextThemePreference(theme)];
  const ariaLabel = t("toggle", { current: labels[theme], next: upcomingLabel });

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={cycleTheme}
      suppressHydrationWarning
      className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
    >
      <ThemeIcon theme={theme} mounted={mounted} className="h-4 w-4" />
      <span className="hidden sm:inline">{labels[theme]}</span>
    </button>
  );
}

function ThemeIcon({
  theme,
  mounted,
  className,
}: {
  theme: ThemePreference;
  mounted: boolean;
  className?: string;
}) {
  if (!mounted) {
    return <SystemIcon className={className} aria-hidden="true" />;
  }
  if (theme === "light") return <SunIcon className={className} aria-hidden="true" />;
  if (theme === "dark") return <MoonIcon className={className} aria-hidden="true" />;
  return <SystemIcon className={className} aria-hidden="true" />;
}

function svgProps(className?: string): React.SVGProps<SVGSVGElement> {
  return {
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
  };
}

function SunIcon({ className, ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps(className)} {...rest}>
      <circle cx="10" cy="10" r="3.4" />
      <path d="M10 2.5v2.2" />
      <path d="M10 15.3v2.2" />
      <path d="M2.5 10h2.2" />
      <path d="M15.3 10h2.2" />
      <path d="M4.7 4.7l1.55 1.55" />
      <path d="M13.75 13.75l1.55 1.55" />
      <path d="M4.7 15.3l1.55-1.55" />
      <path d="M13.75 6.25l1.55-1.55" />
    </svg>
  );
}

function MoonIcon({ className, ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps(className)} {...rest}>
      <path d="M16 11.5A6.5 6.5 0 0 1 8.5 4a6.5 6.5 0 1 0 7.5 7.5z" />
    </svg>
  );
}

function SystemIcon({ className, ...rest }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...svgProps(className)} {...rest}>
      <rect x="2.75" y="3.75" width="14.5" height="10" rx="1.5" />
      <path d="M6.5 17h7" />
      <path d="M10 13.75V17" />
    </svg>
  );
}
