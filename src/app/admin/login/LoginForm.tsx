"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2 text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          autoComplete="username"
          className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full border border-stone-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-teal-600 text-white font-medium rounded-md px-4 py-2.5 hover:bg-teal-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        aria-busy={pending}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
