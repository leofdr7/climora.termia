import { OnboardingForm } from "@/app/onboarding/onboarding-form";
import { getProfile } from "@/lib/auth/session";
import type { Profile } from "@/lib/types/database";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const { profile } = await getProfile();

  if ((profile as Profile | null)?.onboarding_complete) {
    redirect("/dashboard");
  }

  const typedProfile = profile as Profile | null;

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-200">
        Onboarding
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Finish your Satellite Temperature Advisor profile
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Tell us whether you&apos;re optimizing a household plan or refrigerated operations for a food
        retail site. Threshold alerts and dashboards use this context in copy — not pricing or
        permissions in v1.
      </p>
      <OnboardingForm profile={typedProfile} />
    </div>
  );
}
