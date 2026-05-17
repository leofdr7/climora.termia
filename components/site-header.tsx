import type { User } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/language-switcher";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Link } from "@/i18n/navigation";

export function SiteHeader({ user }: { user: User | null }) {
  const t = useTranslations("site");
  return (
    <header className="sticky top-0 z-30 border-b border-teal-200/80 bg-amber-50/85 shadow-sm backdrop-blur dark:border-emerald-800/60 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="font-display flex items-center gap-2 text-sm font-semibold tracking-tight text-teal-950 dark:text-emerald-50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300/80 bg-gradient-to-br from-teal-100 to-emerald-200 text-xs font-bold text-teal-950 shadow-sm dark:border-amber-700/50 dark:from-emerald-900 dark:to-teal-900 dark:text-amber-100">
            CT
          </span>
          <span>{t("title")}</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {user ? (
            <>
              <Link
                className="hidden rounded-full px-3 py-2 text-teal-900 hover:bg-teal-100/80 dark:text-emerald-100 dark:hover:bg-emerald-950/80 sm:inline-flex"
                href="/dashboard"
              >
                {t("header.dashboard")}
              </Link>
              <Link
                className="hidden rounded-full px-3 py-2 text-emerald-900 hover:bg-emerald-50 dark:text-emerald-100 dark:hover:bg-emerald-950 sm:inline-flex"
                href="/settings/alerts"
              >
                {t("header.alertSettings")}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                className="rounded-full bg-emerald-100 px-4 py-2 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-100 dark:hover:bg-emerald-900"
                href="/auth/sign-up"
              >
                {t("header.register")}
              </Link>
              <Link
                className="rounded-full border border-teal-300/90 bg-white px-4 py-2 text-teal-900 hover:bg-teal-50 dark:border-emerald-800 dark:bg-zinc-950 dark:text-emerald-100 dark:hover:bg-emerald-950/80"
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
