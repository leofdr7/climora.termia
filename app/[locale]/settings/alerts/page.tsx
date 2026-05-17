import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardSubscriptionForm } from "@/app/[locale]/dashboard/dashboard-subscription-form";
import { Link, redirect } from "@/i18n/navigation";
import { getProfile } from "@/lib/auth/session";
import type { AlertSubscription, Profile } from "@/lib/types/database";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AlertSettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "dashboard" });

  const { user, profile, supabase } = await getProfile();

  if (!(profile as Profile | null)?.onboarding_complete) {
    redirect({ href: "/onboarding", locale });
  }

  const { data: subRow } = await supabase
    .from("alert_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const subscription = (subRow as AlertSubscription | null) ?? null;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <p className="w-fit rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          {t("settingsEyebrow")}
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-emerald-950 dark:text-emerald-100">
          {t("settingsTitle")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {t("settingsSubtitle")}
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-900 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100"
        >
          {t("settingsBackToDashboard")}
        </Link>
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xl font-black text-emerald-950 dark:text-emerald-100">
          {t("alertTitle")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          {t.rich("alertSubtitle", {
            secret: "CRON_SECRET",
            code: (chunks) => (
              <code className="rounded-md bg-amber-100 px-1.5 py-0.5 text-xs text-amber-950 dark:bg-amber-950 dark:text-amber-100">
                {chunks}
              </code>
            ),
          })}
        </p>
        <div className="mt-6">
          <DashboardSubscriptionForm
            subscription={subscription}
            defaultEmail={user.email ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
