"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import type {
  AdvisoryResult,
  HourlyTimelineItem,
} from "@/lib/advisory/build-advisory";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

type ForecastChatbotProps = {
  advisory: AdvisoryResult;
  isCurrentLocationPreview: boolean;
  timezone: string;
};

const SPRING = { type: "spring", stiffness: 420, damping: 32, mass: 0.8 } as const;

function formatTemperature(value: number | null) {
  if (value === null || Number.isNaN(value)) return "–";
  return `${value.toFixed(1)} °C`;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function findHighest(
  items: HourlyTimelineItem[],
  getValue: (item: HourlyTimelineItem) => number | null,
) {
  return items.reduce<HourlyTimelineItem | null>((best, item) => {
    const value = getValue(item);
    const bestValue = best ? getValue(best) : null;

    if (value === null || Number.isNaN(value)) return best;
    if (bestValue === null || bestValue === undefined || value > bestValue) return item;
    return best;
  }, null);
}

export function ForecastChatbot({
  advisory,
  isCurrentLocationPreview,
  timezone,
}: ForecastChatbotProps) {
  const t = useTranslations("dashboard");
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      text: t("forecastChatbotWelcome"),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextMessageId = useRef(0);

  const quickPrompts = useMemo(
    () => [
      t("forecastChatbotQuickSummary"),
      t("forecastChatbotQuickRain"),
      t("forecastChatbotQuickHeat"),
      t("forecastChatbotQuickCold"),
    ],
    [t],
  );

  const locationLabel = isCurrentLocationPreview
    ? t("forecastChatbotLocationCurrent")
    : t("forecastChatbotLocationSaved");

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  function buildReply(question: string) {
    const normalized = normalize(question);
    const timeline = advisory.insights.timeline;
    const rainiest = findHighest(timeline, (item) => item.precipitationProbability);
    const windiest = findHighest(timeline, (item) => item.windSpeed);
    const strongestUv = findHighest(timeline, (item) => item.uvIndex);
    const mainRecommendation = advisory.insights.recommendations[0];

    if (
      includesAny(normalized, [
        "rain",
        "umbrella",
        "precip",
        "lluvia",
        "paraguas",
        "llover",
      ])
    ) {
      const probability = rainiest?.precipitationProbability ?? null;

      if (rainiest && probability !== null && probability >= 25) {
        return t("forecastChatbotReplyRain", {
          time: rainiest.timeLabel,
          probability: Math.round(probability),
          advice: rainiest.advice,
        });
      }

      return t("forecastChatbotReplyNoRain");
    }

    if (
      includesAny(normalized, [
        "hot",
        "heat",
        "warm",
        "sun",
        "uv",
        "calor",
        "sol",
        "caliente",
      ])
    ) {
      const peak = advisory.insights.peakHeat;
      const uvCopy =
        strongestUv?.uvIndex !== null && strongestUv?.uvIndex !== undefined
          ? t("forecastChatbotUvAddon", {
              time: strongestUv.timeLabel,
              uv: strongestUv.uvIndex.toFixed(1),
            })
          : "";

      if (peak) {
        return t("forecastChatbotReplyHeat", {
          time: peak.timeLabel,
          temperature: formatTemperature(peak.temperature),
          advice: peak.advice,
          uv: uvCopy,
        });
      }
    }

    if (
      includesAny(normalized, [
        "cold",
        "frost",
        "freeze",
        "chilly",
        "frio",
        "helada",
        "congel",
      ])
    ) {
      const coldest = advisory.insights.coldest;

      if (coldest) {
        return t("forecastChatbotReplyCold", {
          time: coldest.timeLabel,
          temperature: formatTemperature(coldest.temperature),
          advice: coldest.advice,
        });
      }
    }

    if (includesAny(normalized, ["wind", "breeze", "viento", "ventoso"])) {
      if (windiest?.windSpeed !== null && windiest?.windSpeed !== undefined) {
        return t("forecastChatbotReplyWind", {
          time: windiest.timeLabel,
          speed: windiest.windSpeed.toFixed(1),
          advice: windiest.advice,
        });
      }
    }

    if (
      includesAny(normalized, [
        "do",
        "plan",
        "recommend",
        "next",
        "summary",
        "resumen",
        "recomienda",
        "hacer",
        "planear",
      ])
    ) {
      return t("forecastChatbotReplyPlan", {
        summary: advisory.summary,
        recommendation: mainRecommendation?.detail ?? t("forecastChatbotNoSpecificStep"),
        threshold: advisory.breachDetail ?? t("forecastChatbotNoThresholdBreach"),
      });
    }

    return t("forecastChatbotReplyFallback", {
      summary: advisory.summary,
      current: formatTemperature(advisory.currentTemperature),
    });
  }

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;
    nextMessageId.current += 1;

    const userMessage: ChatMessage = {
      id: `user-${nextMessageId.current}`,
      role: "user",
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsThinking(true);

    window.setTimeout(() => {
      nextMessageId.current += 1;
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${nextMessageId.current}`,
          role: "assistant",
          text: buildReply(trimmed),
        },
      ]);
      setIsThinking(false);
    }, 420);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[#00aaff]/25 bg-[#031426]/85 p-1 shadow-2xl shadow-cyan-950/30 backdrop-blur-md">
      <div className="pointer-events-none absolute -left-24 top-8 size-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 size-64 rounded-full bg-lime-300/20 blur-3xl" />
      <div className="relative grid gap-0 overflow-hidden rounded-[1.75rem] bg-slate-950 text-white lg:grid-cols-[0.78fr_1.22fr]">
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(0,170,255,0.28),transparent_36%),linear-gradient(160deg,rgba(3,20,38,0.98),rgba(2,7,19,0.96))] p-6 lg:border-b-0 lg:border-r">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
            {t("forecastChatbotEyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
            {t("forecastChatbotTitle")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-cyan-50/80">
            {t("forecastChatbotSubtitle")}
          </p>

          <div className="mt-6 grid gap-3 text-sm">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">
                {t("forecastChatbotForecastContext")}
              </p>
              <p className="mt-2 font-bold">{locationLabel}</p>
              <p className="mt-1 text-cyan-50/70">{timezone}</p>
            </div>
            <div className="rounded-3xl border border-lime-200/20 bg-lime-300/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-100/80">
                {t("forecastChatbotCurrent")}
              </p>
              <p className="mt-2 text-3xl font-black text-lime-100">
                {formatTemperature(advisory.currentTemperature)}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <motion.button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                whileHover={{ y: -2, transition: SPRING }}
                whileTap={{ scale: 0.96, transition: SPRING }}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-cyan-50 transition-colors hover:bg-white/15"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex min-h-[33rem] flex-col bg-[#061527] text-white">
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6"
            aria-live="polite"
          >
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.article
                  key={message.id}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.28 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[86%] rounded-[1.4rem] px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.role === "user"
                        ? "rounded-br-md bg-[#00aaff] text-[#001427]"
                        : "rounded-bl-md border border-white/10 bg-white/10 text-slate-100"
                    }`}
                  >
                    <p className="mb-1 text-[0.65rem] font-black uppercase tracking-[0.18em] opacity-55">
                      {message.role === "user"
                        ? t("forecastChatbotUserLabel")
                        : t("forecastChatbotBotLabel")}
                    </p>
                    <p>{message.text}</p>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>

            {isThinking ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-fit rounded-full border border-[#00aaff]/25 bg-[#00aaff]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#8fe7ff] shadow-sm"
              >
                {t("forecastChatbotThinking")}
              </motion.div>
            ) : null}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 bg-black/25 p-4 backdrop-blur"
          >
            <label htmlFor="forecast-chat-input" className="sr-only">
              {t("forecastChatbotInputLabel")}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="forecast-chat-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t("forecastChatbotPlaceholder")}
                className="min-h-12 flex-1 rounded-full border border-white/15 bg-[#031426] px-5 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-[#00aaff] focus:bg-[#071b30] focus:ring-4 focus:ring-[#00aaff]/15"
              />
              <motion.button
                type="submit"
                disabled={isThinking || input.trim().length === 0}
                whileHover={{ scale: 1.03, transition: SPRING }}
                whileTap={{ scale: 0.96, transition: SPRING }}
                className="min-h-12 rounded-full bg-[#00ff88] px-6 text-sm font-black text-[#00140c] shadow-lg shadow-emerald-950/20 transition hover:bg-[#00aaff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("forecastChatbotSend")}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
