"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import {
  completeOnboarding,
  type OnboardingErrorCode,
} from "@/app/[locale]/onboarding/actions";
import { useRouter } from "@/i18n/navigation";
import type { Profile } from "@/lib/types/database";

export function OnboardingForm({ profile }: { profile: Profile | null }) {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  const defaultType = profile?.account_type ?? "individual";

  function translateError(code: OnboardingErrorCode, fallback?: string): string {
    const key = `errors.${code}` as const;
    const translated = t(key);
    if (code === "GENERIC" && fallback) {
      return `${translated} ${fallback}`.trim();
    }
    return translated;
  }

  return (
    <form
      className="mt-8 flex flex-col gap-5"
      action={(formData) => {
        setFeedback(null);
        startTransition(async () => {
          const result = await completeOnboarding(formData);
          if ("errorCode" in result) {
            setFeedback({
              type: "error",
              text: translateError(result.errorCode, result.message),
            });
          } else if (result.ok) {
            router.push("/dashboard");
            router.refresh();
          }
        });
      }}
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        {t("fullName")}
        <input
          required
          name="full_name"
          defaultValue={profile?.full_name ?? ""}
          className="rounded-2xl border border-zinc-200 bg-teal-50/70 px-4 py-3 outline-none focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-teal-950"
        />
      </label>
      <fieldset className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-950 dark:bg-emerald-950/30">
        <legend className="px-1 text-sm font-bold text-emerald-950 dark:text-emerald-100">
          {t("accountType")}
        </legend>
        <label className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm dark:bg-zinc-950">
          <input
            type="radio"
            name="account_type"
            value="individual"
            defaultChecked={defaultType === "individual"}
          />
          {t("individual")}
        </label>
        <label className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm dark:bg-zinc-950">
          <input
            type="radio"
            name="account_type"
            value="grocery"
            defaultChecked={defaultType === "grocery"}
          />
          {t("grocery")}
        </label>
      </fieldset>
      <label className="flex flex-col gap-1 text-sm font-medium">
        {t("storeName")}
        <input
          name="store_name"
          defaultValue={profile?.store_name ?? ""}
          className="rounded-2xl border border-zinc-200 bg-teal-50/70 px-4 py-3 outline-none focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-teal-950"
          placeholder={t("storeNamePlaceholder")}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        {t("address")}
        <textarea
          name="business_address"
          rows={3}
          defaultValue={profile?.business_address ?? ""}
          className="rounded-2xl border border-zinc-200 bg-teal-50/70 px-4 py-3 outline-none focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-teal-950"
          placeholder={t("addressPlaceholder")}
        />
      </label>
      {feedback ? (
        <p
          className={
            feedback.type === "ok"
              ? "rounded-2xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300"
          }
        >
          {feedback.text}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-md hover:-translate-y-0.5 hover:bg-teal-800 disabled:translate-y-0 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
