import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "@/components/language-switcher";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Link } from "@/i18n/navigation";

export function SiteHeader({ user }: { user: User | null }) {
  const t = useTranslations("site");
  return (
    <header className="pointer-events-none fixed left-0 right-0 top-4 z-50 flex justify-center px-3 sm:px-4">
      <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-2xl border border-white/15 bg-zinc-900/78 px-3 py-2.5 shadow-xl shadow-black/25 backdrop-blur-md sm:gap-4 sm:px-4 sm:py-3 dark:border-white/10 dark:bg-zinc-950/82">
        <Link
          href="/"
          className="font-display flex min-w-0 items-center gap-2 text-sm font-semibold tracking-tight text-white"
        >
          <Image
            src="/climora-mascot.png"
            alt="Climora"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-xl border border-white/20 object-cover shadow-sm"
            priority
          />
          <span className="truncate">{t("title")}</span>
        </Link>
        <nav className="flex shrink-0 items-center gap-2 text-sm font-medium text-zinc-200 sm:gap-3">
          {user ? (
            <>
              <Link
                className="hidden rounded-full px-3 py-2 text-white/90 hover:bg-white/10 sm:inline-flex"
                href="/dashboard"
              >
                {t("header.dashboard")}
              </Link>
              <Link
                className="hidden rounded-full px-3 py-2 text-white/90 hover:bg-white/10 sm:inline-flex"
                href="/settings/alerts"
              >
                {t("header.alertSettings")}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                className="rounded-full bg-teal-500 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-400 sm:px-4 sm:text-sm"
                href="/auth/sign-up"
              >
                {t("header.register")}
              </Link>
              <Link
                className="rounded-full border border-white/35 px-3 py-2 text-xs font-bold text-white hover:bg-white/10 sm:px-4 sm:text-sm"
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
