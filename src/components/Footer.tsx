"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SITE_NAME } from "@/lib/config";

export function Footer() {
  const t = useTranslations("footer");

  const navLinks = [
    { href: "/" as const, label: t("home") },
    { href: "/videos" as const, label: t("videos") },
    { href: "/topics" as const, label: t("topics") },
    { href: "/consultation" as const, label: t("consultation") },
    { href: "/about" as const, label: t("about") },
    { href: "/sourcing" as const, label: t("sourcing") },
    { href: "/disclaimer" as const, label: t("disclaimerLink") },
    { href: "/privacy" as const, label: t("privacy") },
    { href: "/terms" as const, label: t("terms") },
  ];

  return (
    <footer
      className="mt-16 border-t"
      style={{ background: "#d6e0ec", borderColor: "rgba(20,48,77,0.16)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-xs text-navy-soft mb-4">
          <strong className="text-navy">{t("affiliateDisclosure")}</strong>{" "}
          {t("affiliateText")}
        </p>

        <p className="text-sm text-navy-soft mb-6">
          {t("disclaimer")}{" "}
          <Link
            href="/disclaimer"
            className="underline hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded transition-colors"
          >
            {t("fullDisclaimer")}
          </Link>
        </p>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-soft">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-xs text-navy-soft/70 mt-6">
          {t("copyright", { siteName: SITE_NAME })}
        </p>
      </div>
    </footer>
  );
}
