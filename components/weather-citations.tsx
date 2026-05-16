import type { WeatherReference } from "@/lib/advisory/build-advisory";

export function WeatherCitations({ items }: { items: WeatherReference[] }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Authoritative references
      </h3>
      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
        Forecast numbers in this app come from Open-Meteo (see Terms). These links help you connect
        numerical guidance to satellite programmes and measurement science.
      </p>
      <ul className="mt-3 space-y-3 text-sm">
        {items.map((ref) => (
          <li key={ref.href}>
            <a className="font-medium text-sky-800 underline dark:text-sky-300" href={ref.href}>
              {ref.label}
            </a>
            <div className="text-xs text-zinc-600 dark:text-zinc-400">{ref.note}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
