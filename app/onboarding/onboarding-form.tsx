"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { completeOnboarding } from "@/app/onboarding/actions";
import type { Profile } from "@/lib/types/database";

export function OnboardingForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const defaultType = profile?.account_type ?? "individual";

  return (
    <form
      className="mt-8 flex flex-col gap-4"
      action={(formData) => {
        setFeedback(null);
        startTransition(async () => {
          const result = await completeOnboarding(formData);
          if ("error" in result && result.error) {
            setFeedback({ type: "error", text: result.error });
          } else if ("ok" in result && result.ok) {
            router.push("/dashboard");
            router.refresh();
          }
        });
      }}
    >
      <label className="flex flex-col gap-1 text-sm font-medium">
        Full name
        <input
          required
          name="full_name"
          defaultValue={profile?.full_name ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <fieldset className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
        <legend className="px-1 text-sm font-medium">Account type</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="account_type"
            value="individual"
            defaultChecked={defaultType === "individual"}
          />
          Individual / household
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="account_type"
            value="grocery"
            defaultChecked={defaultType === "grocery"}
          />
          Grocery / food retail
        </label>
      </fieldset>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Store name (grocery only)
        <input
          name="store_name"
          defaultValue={profile?.store_name ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="e.g. Harborview Market"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Business address (optional)
        <textarea
          name="business_address"
          rows={3}
          defaultValue={profile?.business_address ?? ""}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="Street, city — used for your own records in v1"
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
        {pending ? "Saving…" : "Save and continue to dashboard"}
      </button>
    </form>
  );
}
