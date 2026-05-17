"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { HourlyTimelineItem } from "@/lib/advisory/build-advisory";

const INITIAL_COUNT = 4;

const SPRING = { type: "spring", stiffness: 380, damping: 30, mass: 0.8 } as const;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function formatMaybe(value: number | null, suffix: string) {
  if (value === null || Number.isNaN(value)) return "–";
  return `${value.toFixed(1)}${suffix}`;
}

function toneClass(tone: HourlyTimelineItem["tone"]) {
  switch (tone) {
    case "hot":
      return "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-50";
    case "cold":
      return "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-50";
    case "rain":
      return "border-indigo-200 bg-indigo-50 text-indigo-950 dark:border-indigo-400/30 dark:bg-indigo-400/10 dark:text-indigo-50";
    case "wind":
      return "border-zinc-200 bg-zinc-50 text-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
    case "sun":
      return "border-yellow-200 bg-yellow-50 text-yellow-950 dark:border-yellow-400/30 dark:bg-yellow-400/10 dark:text-yellow-50";
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-50";
  }
}

function TimelineCard({
  item,
  index,
}: {
  item: HourlyTimelineItem;
  index: number;
}) {
  const t = useTranslations("dashboard");

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.18 } }}
      transition={{
        duration: 0.42,
        delay: index * 0.055,
        ease: EASE_OUT,
      }}
      whileHover={{
        y: -3,
        scale: 1.015,
        transition: SPRING,
      }}
      className={`rounded-3xl border p-4 ${toneClass(item.tone)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-60">
            {item.dateLabel}
          </p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
            {item.timeLabel}
          </p>
          <h3 className="mt-1 text-lg font-black">{item.label}</h3>
        </div>
        <motion.p
          className="rounded-full bg-white/70 px-3 py-1 text-sm font-black dark:bg-zinc-950/60"
          layout
        >
          {formatMaybe(item.temperature, " °C")}
        </motion.p>
      </div>
      <p className="mt-3 text-sm leading-6">{item.advice}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-current/10 pt-3 text-xs">
        <span>{t("timelineFeelsLike", { value: formatMaybe(item.apparentTemperature, " °C") })}</span>
        <span>{t("timelineHumidity", { value: formatMaybe(item.humidity, "%") })}</span>
        <span>{t("timelineRain", { value: formatMaybe(item.precipitationProbability, "%") })}</span>
        <span>{t("timelineWind", { value: formatMaybe(item.windSpeed, " km/h") })}</span>
      </div>
    </motion.article>
  );
}

export function HourlyWeatherTimeline({ items }: { items: HourlyTimelineItem[] }) {
  const t = useTranslations("dashboard");
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, INITIAL_COUNT);

  if (items.length === 0) return null;

  return (
    <motion.section
      layout
      className="rounded-3xl border border-sky-100 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-sky-950 dark:text-sky-50">
            {t("timelineTitle")}
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {t("timelineSubtitle")}
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          whileHover={{ scale: 1.04, transition: SPRING }}
          whileTap={{ scale: 0.96, transition: SPRING }}
          className="w-fit rounded-full border border-sky-200 px-4 py-2 text-sm font-bold text-sky-900 transition-colors hover:bg-sky-50 dark:border-sky-900 dark:text-sky-100 dark:hover:bg-sky-950"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={expanded ? "less" : "more"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              {expanded ? t("timelineShowLess") : t("timelineShowMore")}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      <motion.div layout className="mt-5 grid gap-3 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {visibleItems.map((item, index) => (
            <TimelineCard
              key={`${item.dateLabel}-${item.timeLabel}-${item.temperature}`}
              item={item}
              index={index}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}
