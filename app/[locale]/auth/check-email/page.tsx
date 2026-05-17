import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function CheckEmailPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("auth.checkEmail");

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-md flex-col justify-center px-4 py-16 text-center">
      <div className="rounded-3xl border border-amber-100 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-2xl font-black text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          @
        </div>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-amber-950 dark:text-amber-100">
          {t("title")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {t("body")}
        </p>
        <Link
          href="/auth/login"
          className="mt-8 inline-flex rounded-full bg-sky-700 px-5 py-3 text-sm font-bold text-white shadow-md hover:-translate-y-0.5 hover:bg-sky-800"
        >
          {t("back")}
        </Link>
      </div>
    </div>
  );
}
