"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { PeptideCard as CardData } from "@/lib/search/goal-search";
import { evidenceTier, type EvidenceLabel } from "@/lib/evidence/label";

const TIER_CLASSES: Record<ReturnType<typeof evidenceTier>, string> = {
  green: "bg-emerald-100 text-emerald-900 border-emerald-300",
  blue: "bg-sky-100 text-sky-900 border-sky-300",
  amber: "bg-amber-100 text-amber-900 border-amber-300",
  slate: "bg-slate-100 text-slate-700 border-slate-300",
};

function translateEvidence(t: ReturnType<typeof useTranslations>, label: EvidenceLabel): string {
  switch (label.kind) {
    case "humanRct":
      return label.n != null ? t("humanRctN", { n: label.n }) : t("humanRct");
    case "humanCohort":
      return label.n != null ? t("humanCohortN", { n: label.n }) : t("humanCohort");
    case "humanCaseSeries":
      return label.n != null ? t("humanCaseSeriesN", { n: label.n }) : t("humanCaseSeries");
    case "humanOther":
      return label.n != null ? t("humanOtherN", { n: label.n }) : t("humanOther");
    case "animalOnly":
      return label.n != null ? t("animalOnlyN", { n: label.n }) : t("animalOnly");
    case "inVitroOnly":
      return t("inVitroOnly");
    case "review":
      return t("review");
    case "preclinical":
      return t("preclinical");
    case "unknown":
      return t("unknown");
  }
}

export function PeptideCard({ card }: { card: CardData }) {
  const t = useTranslations("research");
  const tEv = useTranslations("evidence");
  const tStudy = useTranslations("studyTypes");
  const [expanded, setExpanded] = useState(false);

  const fdaLine =
    card.fdaStatus === "approved" && card.fdaIndication
      ? t("fdaApproved", { indication: card.fdaIndication })
      : card.fdaStatus === "approved"
      ? t("fdaApprovedGeneric")
      : card.fdaStatus === "cosmetic_use"
      ? t("cosmeticUse")
      : card.fdaStatus === "investigational"
      ? t("investigational")
      : t("researchOnly");

  const hasPapers = card.paperCount > 0;
  const tier = hasPapers && card.bestEvidence ? evidenceTier(card.bestEvidence) : "slate";
  const badgeText = hasPapers && card.bestEvidence
    ? translateEvidence(tEv, card.bestEvidence)
    : t("noStudiesBadge");

  return (
    <article className="rounded-lg border border-navy/15 bg-white shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-serif text-xl text-navy">{card.canonicalName}</h3>
            {card.synonyms.length > 0 && (
              <p className="text-xs text-ink/60 mt-1">
                {card.synonyms.slice(0, 3).join(" · ")}
              </p>
            )}
          </div>
          {badgeText && (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${TIER_CLASSES[tier]}`}
            >
              {badgeText}
            </span>
          )}
        </div>

        <p className="mt-3 text-sm">
          <span className={`font-semibold ${card.fdaStatus === "approved" ? "text-emerald-800" : "text-ink/70"}`}>
            {fdaLine}
          </span>
        </p>

        <p className="mt-2 text-sm text-ink/70">
          {t("paperCount", { count: card.paperCount })}
        </p>

        {card.topPapers.length > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 text-sm font-semibold text-navy hover:underline focus:outline-none focus-visible:underline"
            aria-expanded={expanded}
          >
            {t("topPapersHeading")} {expanded ? "▴" : "▾"}
          </button>
        ) : (
          <p className="mt-3 text-sm text-ink/60">{t("noPapers")}</p>
        )}
      </div>

      {expanded && card.topPapers.length > 0 && (
        <ul className="divide-y divide-navy/10 border-t border-navy/10 bg-paper/40">
          {card.topPapers.map((p, i) => (
            <li key={p.pmid ?? i} className="p-4 text-sm">
              <p className="font-medium text-ink">{p.title ?? "(untitled)"}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/70">
                {p.pubYear != null && <span>{t("pubYearLabel")}: {p.pubYear}</span>}
                {p.species && p.species.length > 0 && (
                  <span>{t("speciesLabel")}: {p.species.join(", ")}</span>
                )}
                {p.studyType && (
                  <span>{t("studyTypeLabel")}: {tStudy(p.studyType as Parameters<typeof tStudy>[0])}</span>
                )}
                {p.sampleSize != null && <span>{t("nLabel")}: {p.sampleSize}</span>}
              </div>
              {p.pubmedUrl && (
                <a
                  href={p.pubmedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-navy hover:underline"
                >
                  {t("viewOnPubmed")}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
