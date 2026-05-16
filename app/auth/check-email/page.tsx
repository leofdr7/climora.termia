import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        We sent a confirmation link from Supabase Auth. Click it to activate your account and land
        on onboarding. You can close this tab after you verify.
      </p>
      <Link
        href="/auth/login"
        className="mt-8 text-sm font-medium text-sky-700 underline dark:text-sky-300"
      >
        Back to sign in
      </Link>
    </div>
  );
}
