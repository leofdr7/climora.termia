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
      className="rounded-full border border-rose-400/40 bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/30 sm:px-4 sm:text-sm"
    >
      {t("signOut")}
    </button>
  );
}
