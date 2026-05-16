import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const handleI18nRouting = createIntlMiddleware(routing);

function shouldSkipI18n(pathname: string): boolean {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth/callback") ||
    pathname === "/auth/callback"
  );
}

export async function middleware(request: NextRequest) {
  const supabaseResponse = await updateSession(request);

  if (shouldSkipI18n(request.nextUrl.pathname)) {
    return supabaseResponse;
  }

  const intlResponse = handleI18nRouting(request);

  for (const cookie of supabaseResponse.cookies.getAll()) {
    intlResponse.cookies.set(cookie);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
