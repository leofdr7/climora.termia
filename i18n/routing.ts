import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"] as const,
  defaultLocale: "en",
  localePrefix: "always",
  localeCookie: {
    name: "NEXT_LOCALE",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  },
});

export type AppLocale = (typeof routing.locales)[number];
