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

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label={t("searchLabel")}
      className={isDesktop ? "flex items-center" : "flex items-center gap-2 py-2"}
    >
      <label htmlFor={`nav-search-${variant}`} className="sr-only">
        {t("searchLabel")}
      </label>
      <input
        id={`nav-search-${variant}`}
        type="search"
        inputMode="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("searchPlaceholder")}
        disabled={isPending}
        className={
          isDesktop
            ? "w-56 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white placeholder-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:border-white/40"
            : "flex-1 rounded border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        }
      />
      <button
        type="submit"
        aria-label={t("searchSubmit")}
        disabled={isPending || !q.trim()}
        className={
          isDesktop
            ? "sr-only"
            : "rounded bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/25 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        }
      >
        {t("searchSubmit")}
      </button>
    </form>
  );
}
