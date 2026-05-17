import { setRequestLocale } from "next-intl/server";
import { use } from "react";

import { AnimatedStat } from "@/components/animated-stat";
import { AnimatedWallpaper } from "@/components/animated-wallpaper";
import { SpaceEarth } from "@/components/space-earth";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function Home({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("home");
  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];
  const features = [
    {
      icon: "satellite",
      title: t("featureSatelliteTitle"),
      body: t("featureSatelliteBody"),
    },
    {
      icon: "map",
      title: t("featureMapTitle"),
      body: t("featureMapBody"),
    },
    {
      icon: "globe",
      title: t("featureGlobeTitle"),
      body: t("featureGlobeBody"),
    },
  ];
  const stats = [
    { value: 195, suffix: "+", label: t("statCountries") },
    { value: 12000, suffix: "+", label: t("statUsers") },
    { value: 48000, suffix: "+", label: t("statViews") },
  ];

  return (
    <main className="relative isolate -mt-[5.25rem] overflow-hidden bg-[#020713] text-white">
      <AnimatedWallpaper />
      <div className="space-stars" />
      <div className="space-topography absolute inset-0 opacity-60" />
      <section className="relative flex min-h-screen items-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(26rem,1.05fr)]">
          <div className="space-reveal relative z-10">
            <label className="sr-only" htmlFor="home-earth-search">
              {t("searchAria")}
            </label>
            <input
              id="home-earth-search"
              readOnly
              aria-readonly="true"
              placeholder={t("searchPlaceholder")}
              className="mb-6 w-full max-w-xl cursor-default rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-sm text-white placeholder:text-sky-100/70 shadow-2xl shadow-cyan-500/10 backdrop-blur-md outline-none focus-visible:ring-2 focus-visible:ring-[#00aaff]"
            />
            <p className="w-fit rounded-full border border-[#00aaff]/40 bg-[#00aaff]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#8fe7ff]">
              {t("eyebrow")}
            </p>
            <h1 className="font-display mt-6 max-w-4xl text-balance text-4xl font-bold uppercase leading-[1.02] tracking-tight text-white sm:text-6xl xl:text-7xl">
              {t("heading")}
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-slate-300">
              {t("intro")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                className="space-pulse rounded-full bg-[#00aaff] px-7 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#001427] hover:-translate-y-0.5 hover:bg-[#00ff88]"
                href="/auth/sign-up"
              >
                {t("ctaSignUp")}
              </Link>
              <Link
                className="rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm hover:-translate-y-0.5 hover:border-[#00ff88]/70 hover:bg-white/20"
                href="/auth/login"
              >
                {t("ctaSignIn")}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
                Open-Meteo
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
                Supabase Auth
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
                Resend
              </span>
            </div>
          </div>
          <div className="space-reveal space-delay-1 relative">
            <div className="absolute inset-8 rounded-full bg-[#00aaff]/20 blur-3xl" />
            <SpaceEarth />
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-reveal max-w-2xl">
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-[#00ff88]">
            {t("howItWorks")}
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
            {t("featuresTitle")}
          </h2>
          <p className="mt-4 text-slate-300">{t("featuresSubtitle")}</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={`space-reveal space-delay-${index + 1} rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-md hover:-translate-y-1 hover:border-[#00aaff]/50 hover:bg-white/15`}
            >
              <FeatureIcon name={feature.icon} />
              <h3 className="font-display mt-5 text-xl font-bold uppercase text-white">
                {feature.title}
              </h3>
              <p className="mt-3 leading-7 text-slate-300">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[#00aaff]/25 bg-[#031426]/70 p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur-md sm:p-8">
          <p className="font-display text-sm font-bold uppercase tracking-[0.28em] text-[#00aaff]">
            {t("statsTitle")}
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-black/25 p-5">
                <p className="font-display text-4xl font-bold text-[#00ff88] sm:text-5xl">
                  <AnimatedStat value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-slate-300">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-8">
            <h2 className="font-display text-2xl font-bold uppercase text-white">
              {t("honestTitle")}
            </h2>
            <p className="mt-4 leading-7 text-slate-300">{t("honestBody")}</p>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-8">
            <h2 className="font-display text-2xl font-bold uppercase text-white">
              {t("howItWorks")}
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-white/10 bg-black/25 p-4"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00aaff] text-sm font-bold text-[#001427]">
                  {index + 1}
                </span>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {step}
                </p>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#00ff88]/25 bg-black/50 p-8 text-center shadow-2xl shadow-emerald-950/40 backdrop-blur-md sm:p-12">
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#00aaff]/20 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold uppercase text-white sm:text-5xl">
              {t("finalCtaTitle")}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              {t("finalCtaBody")}
            </p>
            <Link
              className="space-pulse mt-8 inline-flex rounded-full bg-[#00ff88] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#00140c] hover:-translate-y-1 hover:bg-[#00aaff]"
              href="/auth/sign-up"
            >
              {t("finalCtaButton")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureIcon({ name }: { name: string }) {
  const common = "h-8 w-8 text-[#00ff88]";
  if (name === "satellite") {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#00ff88]/30 bg-[#00ff88]/10">
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M9 13 4 18" />
          <path d="m14 4 6 6" />
          <path d="m11 7 6 6" />
          <path d="M8 4h3l9 9v3h-3L8 7V4Z" />
          <path d="M4 20h4" />
          <path d="M6 16v4" />
        </svg>
      </div>
    );
  }
  if (name === "map") {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#00aaff]/30 bg-[#00aaff]/10">
        <svg className="h-8 w-8 text-[#00aaff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="m3 6 5-2 8 3 5-2v13l-5 2-8-3-5 2V6Z" />
          <path d="M8 4v13" />
          <path d="M16 7v13" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.4 2.8 3.6 5.8 3.6 9S14.4 18.2 12 21c-2.4-2.8-3.6-5.8-3.6-9S9.6 5.8 12 3Z" />
      </svg>
    </div>
  );
}
