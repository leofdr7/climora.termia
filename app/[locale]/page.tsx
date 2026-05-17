import { setRequestLocale } from "next-intl/server";
import { use } from "react";

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

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:py-16">
      <section className="grid items-center gap-8 lg:grid-cols-[1fr_380px]">
        <div className="rounded-3xl border border-teal-200/90 bg-white/95 p-8 shadow-lg dark:border-emerald-800/70 dark:bg-zinc-950 sm:p-10">
          <p className="w-fit rounded-full border border-amber-200/80 bg-amber-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/60 dark:text-amber-100">
            {t("eyebrow")}
          </p>
          <h1 className="font-display mt-5 text-balance text-4xl font-semibold tracking-tight text-teal-950 dark:text-emerald-50 sm:text-6xl">
            {t("heading")}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            {t("intro")}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              className="rounded-full bg-teal-700 px-6 py-3 text-sm font-bold text-white shadow-md hover:-translate-y-0.5 hover:bg-teal-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              href="/auth/sign-up"
            >
              {t("ctaSignUp")}
            </Link>
            <Link
              className="rounded-full border border-emerald-300 bg-emerald-50 px-6 py-3 text-sm font-bold text-emerald-950 hover:-translate-y-0.5 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100 dark:hover:bg-emerald-900"
              href="/auth/login"
            >
              {t("ctaSignIn")}
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            <span className="rounded-full bg-teal-100 px-3 py-2 text-teal-950 dark:bg-teal-950 dark:text-teal-100">
              Open-Meteo
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-2 dark:bg-emerald-950 dark:text-emerald-100">
              Supabase Auth
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-2 dark:bg-amber-950 dark:text-amber-100">
              Resend
            </span>
          </div>
        </div>
        <aside className="rounded-3xl border border-emerald-200/90 bg-emerald-50/90 p-6 shadow-lg dark:border-emerald-900 dark:bg-emerald-950/50">
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-zinc-950">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-200">
              {t("flowLabel")}
            </p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-teal-200/70 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-950/50">
                <p className="text-sm font-bold text-teal-950 dark:text-teal-100">
                  {t("forecastWindow")}
                </p>
                <p className="font-display mt-1 text-3xl font-semibold text-teal-900 dark:text-teal-100">
                  24h
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-amber-100 p-4 dark:bg-amber-950/60">
                  <p className="text-xs font-bold text-amber-950 dark:text-amber-100">
                    {t("coldLabel")}
                  </p>
                  <p className="font-display mt-1 text-xl font-semibold">2°C</p>
                </div>
                <div className="rounded-2xl bg-rose-100 p-4 dark:bg-rose-950/50">
                  <p className="text-xs font-bold text-rose-950 dark:text-rose-100">
                    {t("heatLabel")}
                  </p>
                  <p className="font-display mt-1 text-xl font-semibold">32°C</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-3xl border border-teal-200/80 bg-white/95 p-6 shadow-sm dark:border-emerald-900/60 dark:bg-zinc-950 sm:p-8">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-teal-950 dark:text-emerald-50">
          {t("howItWorks")}
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white dark:bg-emerald-600">
                {index + 1}
              </span>
              <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                {step}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-amber-200/70 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100">
          {t("noteBox")}
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-200/80 bg-white/95 px-8 py-10 shadow-sm dark:border-emerald-900/60 dark:bg-zinc-950">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-emerald-950 dark:text-emerald-100">
          {t("honestTitle")}
        </h3>
        <p className="mt-3 max-w-3xl leading-7 text-zinc-600 dark:text-zinc-300">
          {t("honestBody")}
        </p>
      </section>
    </main>
  );
}
