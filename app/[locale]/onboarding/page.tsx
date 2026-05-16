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
    <div className="mx-auto max-w-xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-200">
        {t("eyebrow")}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
      <OnboardingForm profile={typedProfile} />
    </div>
  );
}
