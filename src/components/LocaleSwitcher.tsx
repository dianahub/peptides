"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTransition } from "react";

export function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (next: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div
      className="flex items-center gap-0.5 rounded border border-white/20 overflow-hidden"
      aria-label={t("label")}
      role="group"
    >
      {(["en", "es"] as const).map((lng) => (
        <button
          key={lng}
          onClick={() => switchLocale(lng)}
          disabled={locale === lng || isPending}
          className={`px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
            locale === lng
              ? "bg-white/20 text-white"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
          aria-pressed={locale === lng}
        >
          {t(lng)}
        </button>
      ))}
    </div>
  );
}
