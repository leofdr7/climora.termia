import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { routing } from "@/i18n/routing";
import { normalizeSupabaseProjectUrl } from "@/lib/supabase/project-url";

function isAppLocale(value: string | undefined): value is (typeof routing.locales)[number] {
  return (
    !!value &&
    (routing.locales as ReadonlyArray<string>).includes(value)
  );
}

function buildLocalizedRedirect(
  origin: string,
  cookieLocale: string | undefined,
  nextPath: string,
): URL {
  const locale = isAppLocale(cookieLocale) ? cookieLocale : routing.defaultLocale;
  const cleanedNext = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return new URL(`/${locale}${cleanedNext}`, origin);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = url.searchParams.get("next") ?? "/onboarding";

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;

  if (!code) {
    return NextResponse.redirect(
      buildLocalizedRedirect(url.origin, localeCookie, "/auth/login"),
    );
  }

  const redirectUrl = buildLocalizedRedirect(url.origin, localeCookie, nextPath);
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    normalizeSupabaseProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.exchangeCodeForSession(code);
  return response;
}
