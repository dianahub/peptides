"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { TopicDetail } from "@/lib/peptides/topic-map";

/**
 * Renders a topic's prose body (summary + research areas, optionally
 * ingredients, note, citations). `compact` collapses detail-heavy
 * sections behind toggles; the full topic page passes compact=false.
 */
export function TopicDetailBody({
  detail,
  compact = false,
}: {
  detail: TopicDetail;
  compact?: boolean;
}) {
  const t = useTranslations("topics");
  const [raOpen, setRaOpen] = useState(!compact);
  const [refsOpen, setRefsOpen] = useState(!compact);

  return (
    <div className={compact ? "text-sm text-stone-700" : "prose prose-stone max-w-none"}>
      <p className={compact ? "text-stone-700 leading-relaxed mb-4" : "text-stone-700 leading-relaxed text-base mb-8"}>
        {detail.summary}
      </p>

      {detail.researchAreas && detail.researchAreas.length > 0 && (
        <section className={compact ? "mb-4" : "mb-8"}>
          {compact ? (
            <button
              type="button"
              onClick={() => setRaOpen((v) => !v)}
              className="text-sm font-semibold text-navy hover:underline focus:outline-none focus-visible:underline"
              aria-expanded={raOpen}
            >
              {t("researchAreas")} {raOpen ? "▴" : "▾"}{" "}
              <span className="font-normal text-stone-500">({detail.researchAreas.length})</span>
            </button>
          ) : (
            <h2 className="text-xl font-bold text-stone-800 mb-4">{t("researchAreas")}</h2>
          )}
          {raOpen && (
            <div className={compact ? "space-y-3 not-prose mt-3" : "space-y-4 not-prose"}>
              {detail.researchAreas.map((ra) => (
                <div
                  key={ra.area}
                  className="bg-stone-50 border border-stone-200 rounded-lg px-4 py-3"
                >
                  <h3 className={compact ? "font-semibold text-stone-800 text-sm" : "font-semibold text-stone-800 mb-1"}>
                    {ra.area}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{ra.detail}</p>
                  {ra.links && ra.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ra.links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-sky-700 bg-sky-50 border border-sky-200 rounded px-2 py-0.5 hover:bg-sky-100 transition-colors"
                        >
                          <span>↗</span> {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {!compact && detail.isBlend && detail.ingredients && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-stone-800 mb-4">{t("blendIngredients")}</h2>
          <div className="space-y-4 not-prose">
            {detail.ingredients.map((ing) => (
              <div
                key={ing.name}
                className="bg-blue-50 border border-blue-100 rounded-lg px-5 py-4"
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="font-bold text-blue-900">{ing.name}</h3>
                  <span className="text-xs text-blue-500">{ing.label}</span>
                </div>
                <p className="text-sm text-stone-600">{ing.researchArea}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(detail.researchNote || detail.consultationNote) && (
        <p className={compact ? "text-xs text-stone-500 italic mb-3" : "text-sm text-stone-500 italic border-t border-stone-200 pt-4 mb-4"}>
          {detail.consultationNote ?? detail.researchNote}
        </p>
      )}

      {!compact && detail.citations && detail.citations.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-stone-700 mb-2">
            {t("researchReferences")}
          </h2>
          <ul className="space-y-1 not-prose">
            {detail.citations.map((c) => (
              <li key={c.url} className="text-sm">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 hover:underline"
                >
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {compact && detail.citations && detail.citations.length > 0 && (
        <section className="mb-2">
          <button
            type="button"
            onClick={() => setRefsOpen((v) => !v)}
            className="text-sm font-semibold text-navy hover:underline focus:outline-none focus-visible:underline"
            aria-expanded={refsOpen}
          >
            {t("researchReferences")} {refsOpen ? "▴" : "▾"}{" "}
            <span className="font-normal text-stone-500">({detail.citations.length})</span>
          </button>
          {refsOpen && (
            <ul className="space-y-1 not-prose mt-2">
              {detail.citations.map((c) => (
                <li key={c.url} className="text-sm">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-700 hover:underline"
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
