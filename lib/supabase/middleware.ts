import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeSupabaseProjectUrl } from "@/lib/supabase/project-url";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const authCookieCount = request.cookies
    .getAll()
    .filter((cookie) => cookie.name.startsWith("sb-")).length;

  // #region agent log
  fetch("http://127.0.0.1:7506/ingest/a0bd12c4-1da4-41dd-a1d3-4c2e22dde1ae", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e26103" },
    body: JSON.stringify({
      sessionId: "e26103",
      runId: "pre-fix",
      hypothesisId: "H3",
      location: "lib/supabase/middleware.ts:12",
      message: "Middleware received request cookies",
      data: { path: request.nextUrl.pathname, authCookieCount },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const supabase = createServerClient(
    normalizeSupabaseProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

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
      hypothesisId: "H2,H3",
      location: "lib/supabase/middleware.ts:53",
      message: "Middleware refreshed Supabase user",
      data: { path: request.nextUrl.pathname, hasUser: Boolean(user), errorName: error?.name ?? null },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return supabaseResponse;
}
