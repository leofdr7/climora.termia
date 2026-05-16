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

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-14 px-4 py-20">
      <section className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-800 dark:text-sky-300">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("heading")}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-lg text-zinc-600 dark:text-zinc-400">
            {t("intro")}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              className="rounded-md bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800"
              href="/auth/sign-up"
            >
              {t("ctaSignUp")}
            </Link>
            <Link
              className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
              href="/auth/login"
            >
              {t("ctaSignIn")}
            </Link>
          </div>
        </div>
        <aside className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold tracking-tight">
            {t("howItWorks")}
          </h2>
          <ol className="mt-4 list-decimal space-y-3 ps-5 text-sm text-zinc-600 dark:text-zinc-400">
            <li>{t("step1")}</li>
            <li>{t("step2")}</li>
            <li>{t("step3")}</li>
            <li>{t("step4")}</li>
          </ol>
          <div className="mt-6 rounded-lg bg-zinc-100 p-3 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            {t("noteBox")}
          </div>
        </aside>
      </section>
      <section className="rounded-3xl border border-zinc-200 bg-white px-8 py-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-2xl font-semibold tracking-tight">
          {t("honestTitle")}
        </h3>
        <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-400">
          {t("honestBody")}
        </p>
      </section>
    </main>
  );
}
