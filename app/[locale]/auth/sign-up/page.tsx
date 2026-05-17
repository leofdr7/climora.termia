"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

type AccountChoice = "individual" | "grocery";

export default function SignUpPage() {
  const t = useTranslations("auth.signUp");
  const router = useRouter();
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
    router.push("/auth/check-email");
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col justify-center px-4 py-16">
      <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-6 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/40">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-200">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-emerald-950 dark:text-emerald-50">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {t("subtitleBefore")}{" "}
            <Link className="font-bold text-emerald-800 underline" href="/auth/login">
              {t("subtitleLink")}
            </Link>
            .
          </p>
        </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-950 dark:bg-emerald-950/30">
          <legend className="px-1 text-sm font-bold text-emerald-950 dark:text-emerald-100">
            {t("accountTypeLegend")}
          </legend>
          <label className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm dark:bg-zinc-950">
            <input
              type="radio"
              name="account"
              checked={accountType === "individual"}
              onChange={() => setAccountType("individual")}
            />
            {t("individual")}
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-white p-3 text-sm dark:bg-zinc-950">
            <input
              type="radio"
              name="account"
              checked={accountType === "grocery"}
              onChange={() => setAccountType("grocery")}
            />
            {t("grocery")}
          </label>
        </fieldset>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("fullName")}
          <input
            required
            className="rounded-2xl border border-zinc-200 bg-emerald-50 px-4 py-3 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
            value={fullName}
            onChange={(ev) => setFullName(ev.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("email")}
          <input
            required
            autoComplete="email"
            className="rounded-2xl border border-zinc-200 bg-emerald-50 px-4 py-3 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("password")}
          <input
            required
            autoComplete="new-password"
            minLength={8}
            className="rounded-2xl border border-zinc-200 bg-emerald-50 px-4 py-3 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-emerald-950"
            type="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
        </label>
        {error ? (
          <p className="rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        ) : null}
        <button
          disabled={loading}
          type="submit"
          className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-md hover:-translate-y-0.5 hover:bg-emerald-800 disabled:translate-y-0 disabled:opacity-60"
        >
          {loading ? t("submitting") : t("submit")}
        </button>
      </form>
      </div>
    </div>
  );
}
