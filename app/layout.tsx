import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Satellite Temperature Advisor",
  description:
    "Open-Meteo-backed temperature guidance with deterministic advisories for households and grocery operations.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // #region agent log
  fetch("http://127.0.0.1:7506/ingest/a0bd12c4-1da4-41dd-a1d3-4c2e22dde1ae", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e26103" },
    body: JSON.stringify({
      sessionId: "e26103",
      runId: "pre-fix",
      hypothesisId: "H2",
      location: "app/layout.tsx:33",
      message: "RootLayout resolved Supabase user",
      data: { hasUser: Boolean(user), errorName: error?.name ?? null },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <SiteHeader user={user} />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
