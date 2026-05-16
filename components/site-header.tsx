import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { SignOutButton } from "@/components/sign-out-button";

export function SiteHeader({ user }: { user: User | null }) {
  const hasUser = Boolean(user);

  // #region agent log
  fetch("http://127.0.0.1:7506/ingest/a0bd12c4-1da4-41dd-a1d3-4c2e22dde1ae", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e26103" },
    body: JSON.stringify({
      sessionId: "e26103",
      runId: "pre-fix",
      hypothesisId: "H1,H2",
      location: "components/site-header.tsx:8",
      message: "SiteHeader render auth navigation state",
      data: { hasUser, rendersGuestLinks: true, rendersAuthedLinks: hasUser },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  // #region agent log
  fetch("http://127.0.0.1:7506/ingest/a0bd12c4-1da4-41dd-a1d3-4c2e22dde1ae", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e26103" },
    body: JSON.stringify({
      sessionId: "e26103",
      runId: "post-fix",
      hypothesisId: "H1",
      location: "components/site-header.tsx:24",
      message: "SiteHeader post-fix visible navigation branch",
      data: { hasUser, visibleBranch: hasUser ? "signed-in" : "guest" },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Satellite Temperature Advisor
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {user ? (
            <SignOutButton />
          ) : (
            <>
              <Link className="hover:underline" href="/auth/sign-up">
                Register
              </Link>
              <Link className="hover:underline" href="/auth/login">
                Sign in
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
