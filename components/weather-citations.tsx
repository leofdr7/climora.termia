import { useTranslations } from "next-intl";

import type { WeatherReference } from "@/lib/advisory/build-advisory";

export function WeatherCitations({ items }: { items: WeatherReference[] }) {
  const t = useTranslations("citations");
  return (
    <section className="rounded-3xl border border-teal-200/80 bg-white/95 p-6 shadow-sm dark:border-emerald-900/60 dark:bg-zinc-950">
      <h3 className="font-display text-lg font-semibold text-amber-950 dark:text-amber-100">
        {t("title")}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
        {t("intro")}
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((ref) => (
          <li
            key={ref.href}
            className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-950/30"
          >
            <a
              className="font-bold text-teal-800 underline dark:text-teal-300"
              href={ref.href}
            >
              {t(`${ref.key}.label`)}
            </a>
            <div className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
              {t(`${ref.key}.note`)}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
