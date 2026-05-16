import { useTranslations } from "next-intl";

import type { WeatherReference } from "@/lib/advisory/build-advisory";

export function WeatherCitations({ items }: { items: WeatherReference[] }) {
  const t = useTranslations("citations");
  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {t("title")}
      </h3>
      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
        {t("intro")}
      </p>
      <ul className="mt-3 space-y-3 text-sm">
        {items.map((ref) => (
          <li key={ref.href}>
            <a
              className="font-medium text-sky-800 underline dark:text-sky-300"
              href={ref.href}
            >
              {t(`${ref.key}.label`)}
            </a>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              {t(`${ref.key}.note`)}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
