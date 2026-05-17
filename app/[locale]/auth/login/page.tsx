"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-3xl border border-sky-100 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-6 rounded-2xl bg-sky-50 p-4 dark:bg-sky-950/40">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-800 dark:text-sky-200">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-sky-950 dark:text-sky-50">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {t("subtitleBefore")}{" "}
            <Link className="font-bold text-sky-800 underline" href="/auth/sign-up">
              {t("subtitleLink")}
            </Link>
            .
          </p>
        </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("email")}
          <input
            required
            autoComplete="email"
            className="rounded-2xl border border-zinc-200 bg-sky-50 px-4 py-3 outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-sky-950"
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("password")}
          <input
            required
            autoComplete="current-password"
            className="rounded-2xl border border-zinc-200 bg-sky-50 px-4 py-3 outline-none focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-sky-950"
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
          className="rounded-full bg-sky-700 px-5 py-3 text-sm font-bold text-white shadow-md hover:-translate-y-0.5 hover:bg-sky-800 disabled:translate-y-0 disabled:opacity-60"
        >
          {loading ? t("submitting") : t("submit")}
        </button>
      </form>
      </div>
    </div>
  );
}
