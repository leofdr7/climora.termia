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
        className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-60 sm:px-3"
      >
        <GlobeIcon className="h-4 w-4" aria-hidden="true" />
        <span className="tabular-nums">
          {FLAG_BY_LOCALE[currentLocale] ?? currentLocale.toUpperCase()}
        </span>
      </button>
      {open ? (
        <ul
          role="menu"
          className="absolute right-0 z-[60] mt-2 w-40 overflow-hidden rounded-2xl border border-white/15 bg-zinc-900/95 text-sm text-white shadow-xl shadow-black/40 backdrop-blur-md"
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
                      ? "flex w-full items-center justify-between gap-2 bg-white/15 px-3 py-2 text-left font-semibold text-white"
                      : "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-zinc-200 hover:bg-white/10"
                  }
                >
                  <span>{t(LABEL_KEY_BY_LOCALE[loc] ?? "english")}</span>
                  <span className="text-xs text-zinc-400 tabular-nums">
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
