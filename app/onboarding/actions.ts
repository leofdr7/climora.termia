"use server";

import { createClient } from "@/lib/supabase/server";
import type { AccountType } from "@/lib/types/database";
import { revalidatePath } from "next/cache";

export async function completeOnboarding(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const accountType = String(formData.get("account_type") ?? "individual") as AccountType;
  const storeName = String(formData.get("store_name") ?? "").trim();
  const businessAddress = String(formData.get("business_address") ?? "").trim();

  if (!fullName) {
    return { error: "Full name is required." };
  }

  if (accountType === "grocery" && !storeName) {
    return { error: "Store name is required for grocery accounts." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
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
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  return { ok: true };
}
