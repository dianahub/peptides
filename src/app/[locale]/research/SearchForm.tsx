"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";

export function SearchForm({ initialQuery }: { initialQuery: string }) {
  const t = useTranslations("research");
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    startTransition(() => {
      if (trimmed) {
        router.replace(`${pathname}?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.replace(pathname);
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
      <label htmlFor="research-q" className="sr-only">
        {t("searchLabel")}
      </label>
      <input
        id="research-q"
        type="search"
        inputMode="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="flex-1 rounded border border-navy/20 bg-white px-4 py-2.5 text-ink shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded bg-navy px-4 py-2.5 text-white text-sm font-semibold hover:bg-navy/90 transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {t("searchButton")}
      </button>
      {initialQuery && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            startTransition(() => router.replace(pathname));
          }}
          className="rounded border border-navy/20 px-4 py-2.5 text-sm text-navy hover:bg-navy/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {t("clearSearch")}
        </button>
      )}
    </form>
  );
}
