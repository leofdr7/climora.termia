"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AccountChoice = "individual" | "grocery";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<AccountChoice>("individual");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: signError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          full_name: fullName,
          account_type: accountType,
        },
      },
    });

    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    window.location.href = "/auth/check-email";
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Households and grocery teams each get email verification through Supabase Auth. Already
        registered?{" "}
        <Link className="underline" href="/auth/login">
          Sign in
        </Link>
        .
      </p>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <fieldset className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
          <legend className="px-1 text-sm font-medium">I am signing up as</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="account"
              checked={accountType === "individual"}
              onChange={() => setAccountType("individual")}
            />
            An individual / household
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="account"
              checked={accountType === "grocery"}
              onChange={() => setAccountType("grocery")}
            />
            A grocery store or food retail team
          </label>
        </fieldset>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Full name or primary contact
          <input
            required
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            value={fullName}
            onChange={(ev) => setFullName(ev.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Work email
          <input
            required
            autoComplete="email"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Password
          <input
            required
            autoComplete="new-password"
            minLength={8}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            type="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
        </label>
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
        <button
          disabled={loading}
          type="submit"
          className="rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Sending verification…" : "Request email confirmation"}
        </button>
      </form>
    </div>
  );
}
