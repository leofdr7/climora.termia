import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import "../globals.css";
import { SiteHeader } from "@/components/site-header";
import { ThemeScript } from "@/components/theme-script";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { THEME_COOKIE_NAME, parseThemeCookie } from "@/lib/theme/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const themePreference = parseThemeCookie(
    cookieStore.get(THEME_COOKIE_NAME)?.value,
  );
  const themeClass = themePreference === "dark" ? "dark" : "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${themeClass}`.trim()}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col bg-sky-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <NextIntlClientProvider>
          <SiteHeader user={user} />
          <div className="flex-1">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
