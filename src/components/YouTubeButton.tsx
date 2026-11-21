"use client";

import { Youtube } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Compact pill button linking to a YouTube search. Lucide `Youtube`
 * icon in YouTube red. The "External content, not reviewed by
 * Futurotek" note is exposed as a native tooltip via `title`
 * (readable on hover + by screen readers via aria-label).
 */
export function YouTubeButton({
  href,
  size = "md",
}: {
  href: string;
  size?: "sm" | "md";
}) {
  const t = useTranslations("research");
  const label = t("youtubeLink");
  const note = t("externalContentNote");

  const sizing =
    size === "sm"
      ? "px-2.5 py-1 text-xs gap-1.5"
      : "px-3 py-1.5 text-sm gap-2";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={note}
      aria-label={`${label} — ${note}`}
      className={`inline-flex items-center rounded-full border border-navy/20 bg-white text-navy hover:bg-navy/5 whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold font-medium ${sizing}`}
    >
      <Youtube
        size={size === "sm" ? 14 : 16}
        strokeWidth={2}
        color="#FF0000"
        aria-hidden="true"
      />
      <span>{label}</span>
    </a>
  );
}
