import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardSubscriptionForm } from "@/app/[locale]/dashboard/dashboard-subscription-form";
import { AnimatedWallpaper } from "@/components/animated-wallpaper";
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
    <main className="relative isolate -mt-[5.25rem] min-h-screen overflow-hidden bg-[#020713] px-4 pb-14 pt-28 text-white">
      <AnimatedWallpaper />
      <div className="space-stars" />
      <div className="space-topography absolute inset-0 opacity-45" />
      <div className="relative mx-auto max-w-4xl space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#00aaff]/25 bg-[#031426]/80 p-8 shadow-2xl shadow-cyan-950/30 backdrop-blur-md">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#00aaff]/20 blur-3xl" />
        <p className="w-fit rounded-full border border-[#00ff88]/35 bg-[#00ff88]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#00ff88]">
          {t("settingsEyebrow")}
        </p>
        <h1 className="font-display mt-4 text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl">
          {t("settingsTitle")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {t("settingsSubtitle")}
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex rounded-full border border-[#00aaff]/30 bg-[#00aaff]/12 px-4 py-2 text-sm font-bold text-[#8fe7ff] hover:-translate-y-0.5 hover:bg-[#00aaff]/20"
        >
          {t("settingsBackToDashboard")}
        </Link>
      </div>

      <div className="rounded-[2rem] border border-white/12 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-md">
        <h2 className="font-display text-xl font-bold uppercase text-white">
          {t("alertTitle")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {t.rich("alertSubtitle", {
            secret: "CRON_SECRET",
            code: (chunks) => (
              <code className="rounded-md border border-[#00ff88]/25 bg-[#00ff88]/10 px-1.5 py-0.5 text-xs text-[#00ff88]">
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
    </main>
  );
}
