"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { AccountType } from "@/lib/types/database";

export type OnboardingErrorCode =
  | "FULL_NAME_REQUIRED"
  | "STORE_NAME_REQUIRED"
  | "NOT_SIGNED_IN"
  | "GENERIC";

export type OnboardingResult =
  | { ok: true }
  | { errorCode: OnboardingErrorCode; message?: string };

export async function completeOnboarding(
  formData: FormData,
): Promise<OnboardingResult> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const accountType = String(
    formData.get("account_type") ?? "individual",
  ) as AccountType;
  const storeName = String(formData.get("store_name") ?? "").trim();
  const businessAddress = String(formData.get("business_address") ?? "").trim();

  if (!fullName) {
    return { errorCode: "FULL_NAME_REQUIRED" };
  }

  if (accountType === "grocery" && !storeName) {
    return { errorCode: "STORE_NAME_REQUIRED" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { errorCode: "NOT_SIGNED_IN" };
  }

  const atype =
    accountType === "grocery" ? ("grocery" as const) : ("individual" as const);

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      account_type: atype,
      store_name: atype === "grocery" ? storeName : null,
      business_address: businessAddress || null,
      onboarding_complete: true,
    },
    { onConflict: "id" },
  );

  if (error) {
    return { errorCode: "GENERIC", message: error.message };
  }

  revalidatePath("/[locale]/dashboard", "page");
  revalidatePath("/[locale]/onboarding", "page");
  return { ok: true };
}
