"use client";

import { useTranslations } from "next-intl";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const t = useTranslations("site.header");

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100 dark:hover:bg-rose-900"
    >
      {t("signOut")}
    </button>
  );
}
