import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/language-switcher";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Link } from "@/i18n/navigation";

export function SiteHeader({ user }: { user: User | null }) {
  const t = useTranslations("site");
  return (
    <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/90 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-xs font-black text-sky-900 shadow-sm dark:bg-sky-950 dark:text-sky-100">
            ST
          </span>
          <span>{t("title")}</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {user ? (
            <SignOutButton />
          ) : (
            <>
              <Link
                className="rounded-full bg-emerald-100 px-4 py-2 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:hover:bg-emerald-900"
                href="/auth/sign-up"
              >
                {t("header.register")}
              </Link>
              <Link
                className="rounded-full border border-sky-200 bg-white px-4 py-2 text-sky-900 hover:bg-sky-50 dark:border-sky-900 dark:bg-zinc-950 dark:text-sky-100 dark:hover:bg-sky-950"
                href="/auth/login"
              >
                {t("header.signIn")}
              </Link>
            </>
          )}
          <ThemeSwitcher />
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
