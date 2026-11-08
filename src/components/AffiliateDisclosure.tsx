"use client";

import { useTranslations } from "next-intl";

export function AffiliateDisclosure({ className = "" }: { className?: string }) {
  const t = useTranslations("affiliate");
  return (
    <p
      className={`text-xs text-navy-soft border-l-2 pl-3 ${className}`}
      style={{ borderColor: "rgba(20,48,77,0.25)" }}
      role="note"
    >
      <strong className="text-navy">{t("disclosure")}</strong>{" "}
      {t("text")}
    </p>
  );
}
