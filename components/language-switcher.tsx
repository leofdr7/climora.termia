"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const FLAG_BY_LOCALE: Record<string, string> = {
  en: "EN",
  es: "ES",
};

const LABEL_KEY_BY_LOCALE: Record<string, "english" | "spanish"> = {
  en: "english",
  es: "spanish",
};

export function LanguageSwitcher() {
  const t = useTranslations("site.language");
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function selectLocale(nextLocale: (typeof routing.locales)[number]) {
    setOpen(false);
    if (nextLocale === currentLocale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t("label")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        <GlobeIcon className="h-4 w-4" aria-hidden="true" />
        <span className="tabular-nums">
          {FLAG_BY_LOCALE[currentLocale] ?? currentLocale.toUpperCase()}
        </span>
      </button>
      {open ? (
        <ul
          role="menu"
          className="absolute right-0 z-20 mt-2 w-36 overflow-hidden rounded-md border border-zinc-200 bg-white text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
        >
          {routing.locales.map((loc) => {
            const isActive = loc === currentLocale;
            return (
              <li key={loc} role="none">
                <button
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => selectLocale(loc)}
                  className={
                    isActive
                      ? "flex w-full items-center justify-between gap-2 bg-zinc-100 px-3 py-2 text-left font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  }
                >
                  <span>{t(LABEL_KEY_BY_LOCALE[loc] ?? "english")}</span>
                  <span className="text-xs text-zinc-500 tabular-nums">
                    {FLAG_BY_LOCALE[loc] ?? loc.toUpperCase()}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function GlobeIcon({
  className,
  ...rest
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <circle cx="10" cy="10" r="7.25" />
      <path d="M2.75 10h14.5" />
      <path d="M10 2.75c2 2.4 3 5.25 3 7.25s-1 4.85-3 7.25c-2-2.4-3-5.25-3-7.25s1-4.85 3-7.25z" />
    </svg>
  );
}
