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
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        {t("body")}
      </p>
      <Link
        href="/auth/login"
        className="mt-8 text-sm font-medium text-sky-700 underline dark:text-sky-300"
      >
        {t("back")}
      </Link>
    </div>
  );
}
