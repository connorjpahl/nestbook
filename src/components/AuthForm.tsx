"use client";

import { useActionState } from "react";
import Link from "next/link";

type AuthFormState = { error?: string; success?: string } | null;
type AuthAction = (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;

export function AuthForm({
  mode,
  action,
  next,
}: {
  mode: "login" | "signup";
  action: AuthAction;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(action, null);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {mode === "signup" ? (
        <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
          Your name
          <input
            name="displayName"
            type="text"
            required
            autoComplete="name"
            placeholder="Jamie Rivera"
            className="rounded-lg border border-stone-300 px-3 py-2 text-base text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </label>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="rounded-lg border border-stone-300 px-3 py-2 text-base text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder="••••••••"
          className="rounded-lg border border-stone-300 px-3 py-2 text-base text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </label>

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-700 disabled:opacity-60"
      >
        {pending
          ? "Please wait…"
          : mode === "signup"
            ? "Create account"
            : "Sign in"}
      </button>

      <p className="text-center text-sm text-stone-500">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-amber-700 hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="font-medium text-amber-700 hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
