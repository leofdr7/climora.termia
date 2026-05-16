import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { SignOutButton } from "@/components/sign-out-button";

export function SiteHeader({ user }: { user: User | null }) {
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
