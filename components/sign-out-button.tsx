"use client";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
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
      Sign out
    </button>
  );
}
