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
      className="text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
    >
      {t("signOut")}
    </button>
  );
}
