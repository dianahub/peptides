"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function NavSearch({
  variant,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const t = useTranslations("nav");
  const router = useRouter();
  const [q, setQ] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    startTransition(() => {
      router.push({ pathname: "/research", query: { q: trimmed } });
      setQ("");
      onNavigate?.();
    });
  }

  const isDesktop = variant === "desktop";

  // Keep paddingRight large enough to clear the submit button, so the
  // arrow never overlaps placeholder or typed text.
  const inputBase =
    "w-full rounded-full border border-white/20 bg-white/10 text-white placeholder-white/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:border-white/40 disabled:opacity-60";
  const inputSize = isDesktop
    ? "pl-3 pr-10 py-1.5 text-sm"
    : "pl-3 pr-11 py-2 text-sm";
  const wrapperWidth = isDesktop ? "relative w-56" : "relative w-full";

  const btnSize = isDesktop ? "h-7 w-7" : "h-8 w-8";

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label={t("searchLabel")}
      className={isDesktop ? "flex items-center" : "flex items-center py-2"}
    >
      <label htmlFor={`nav-search-${variant}`} className="sr-only">
        {t("searchLabel")}
      </label>
      <div className={wrapperWidth}>
        <input
          id={`nav-search-${variant}`}
          type="search"
          inputMode="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          disabled={isPending}
          className={`${inputBase} ${inputSize}`}
        />
        <button
          type="submit"
          aria-label={t("searchSubmit")}
          disabled={isPending || !q.trim()}
          className={`absolute right-1 top-1/2 -translate-y-1/2 ${btnSize} inline-flex items-center justify-center rounded-full bg-gold text-navy hover:bg-amber-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-navy`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isDesktop ? "h-3.5 w-3.5" : "h-4 w-4"}
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </form>
  );
}
