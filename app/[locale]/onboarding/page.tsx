import { getTranslations, setRequestLocale } from "next-intl/server";

import { OnboardingForm } from "@/app/[locale]/onboarding/onboarding-form";
import { redirect } from "@/i18n/navigation";
import { getProfile } from "@/lib/auth/session";
import type { Profile } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OnboardingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "onboarding" });

  const { profile } = await getProfile();

  if ((profile as Profile | null)?.onboarding_complete) {
    redirect({ href: "/dashboard", locale });
  }

  const typedProfile = profile as Profile | null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <div className="rounded-3xl border border-sky-100 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <p className="w-fit rounded-full bg-sky-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-800 dark:bg-sky-950 dark:text-sky-200">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-sky-950 dark:text-sky-50">
          {t("title")}
        </h1>
        <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-300">
          {t("subtitle")}
        </p>
        <OnboardingForm profile={typedProfile} />
      </div>
    </div>
  );
}
