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
      className="mt-8 flex flex-col gap-4"
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
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <fieldset className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
        <legend className="px-1 text-sm font-medium">{t("accountType")}</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="account_type"
            value="individual"
            defaultChecked={defaultType === "individual"}
          />
          {t("individual")}
        </label>
        <label className="flex items-center gap-2 text-sm">
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
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          placeholder={t("storeNamePlaceholder")}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        {t("address")}
        <textarea
          name="business_address"
          rows={3}
          defaultValue={profile?.business_address ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          placeholder={t("addressPlaceholder")}
        />
      </label>
      {feedback ? (
        <p
          className={
            feedback.type === "ok"
              ? "text-sm text-emerald-700 dark:text-emerald-300"
              : "text-sm text-red-600 dark:text-red-400"
          }
        >
          {feedback.text}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
