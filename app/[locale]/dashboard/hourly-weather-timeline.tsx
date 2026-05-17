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
      return "border-amber-300/25 bg-amber-300/10 text-amber-50";
    case "cold":
      return "border-[#00aaff]/25 bg-[#00aaff]/10 text-cyan-50";
    case "rain":
      return "border-[#00aaff]/25 bg-[#00aaff]/10 text-cyan-50";
    case "wind":
      return "border-white/15 bg-white/10 text-slate-50";
    case "sun":
      return "border-yellow-300/25 bg-yellow-300/10 text-yellow-50";
    default:
      return "border-[#00ff88]/25 bg-[#00ff88]/10 text-emerald-50";
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
      className={`rounded-3xl border p-4 shadow-lg shadow-black/15 backdrop-blur-sm ${toneClass(item.tone)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] opacity-60">
            {item.dateLabel}
          </p>
          <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
            {item.timeLabel}
          </p>
          <h3 className="font-display mt-1 text-lg font-semibold">{item.label}</h3>
        </div>
        <motion.p
          className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-sm font-black"
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
      className="rounded-[2rem] border border-white/12 bg-white/10 p-6 text-white shadow-2xl shadow-black/25 backdrop-blur-md"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold uppercase text-white">
            {t("timelineTitle")}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            {t("timelineSubtitle")}
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          whileHover={{ scale: 1.04, transition: SPRING }}
          whileTap={{ scale: 0.96, transition: SPRING }}
          className="w-fit rounded-full border border-[#00aaff]/30 px-4 py-2 text-sm font-bold text-[#8fe7ff] transition-colors hover:bg-[#00aaff]/10"
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
