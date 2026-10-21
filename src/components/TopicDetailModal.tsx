"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import topicDetails from "@/data/topicDetails.json";

type TopicDetail = {
  isBlend?: boolean;
  subtitle?: string;
  bottleImage?: string;
  bottleAlt?: string;
  summary: string;
  researchNote?: string;
  consultationNote?: string;
  ingredients?: { name: string; label: string; researchArea: string }[];
  researchAreas?: { area: string; detail: string }[];
};

interface Props {
  title: string;
  group: string;
}

export function TopicDetailModal({ title, group }: Props) {
  const [open, setOpen] = useState(false);
  const detail = (topicDetails as Record<string, TopicDetail>)[title];
  const params = new URLSearchParams({ topic: `${title} (${group})` });

  if (!detail) return null;

  const isKlow = detail.isBlend;
  const bottleImage = isKlow ? "/klow-bottle.svg" : detail.bottleImage;
  const bottleAlt = isKlow ? "KLOW peptide blend bottle" : detail.bottleAlt;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`mt-auto text-sm font-medium rounded px-3 py-1.5 transition-colors text-center w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
          isKlow
            ? "text-blue-700 border border-blue-300 hover:bg-blue-50 focus-visible:ring-blue-500"
            : "text-teal-700 border border-teal-300 hover:bg-teal-50 focus-visible:ring-teal-500"
        }`}
      >
        Learn about {title}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`modal-title-${title.replace(/[\s+()]/g, "-")}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-5">
              {bottleImage && (
                <Image
                  src={bottleImage}
                  alt={bottleAlt ?? `${title} bottle`}
                  width={60}
                  height={100}
                  className="flex-shrink-0"
                />
              )}
              <div>
                <h2
                  id={`modal-title-${title.replace(/[\s+()]/g, "-")}`}
                  className={`text-2xl font-bold ${isKlow ? "text-blue-900" : "text-stone-900"}`}
                >
                  {title}
                </h2>
                {detail.subtitle && (
                  <p className={`text-sm font-medium mt-0.5 ${isKlow ? "text-blue-600" : "text-teal-600"}`}>
                    {detail.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-stone-600 mb-4">
              Educational information only. Investigational uses may lack FDA approval. Not medical advice.
            </div>

            {/* Summary */}
            <p className="text-sm text-stone-700 mb-4 leading-relaxed">{detail.summary}</p>

            {/* Research areas list */}
            {detail.researchAreas && detail.researchAreas.length > 0 && (
              <>
                <h3 className="font-semibold text-stone-800 mb-3 text-sm uppercase tracking-wide">
                  Research areas
                </h3>
                <div className="space-y-3 mb-4">
                  {detail.researchAreas.map((ra) => (
                    <div key={ra.area} className="bg-stone-50 rounded-lg px-4 py-3">
                      <p className="font-semibold text-stone-800 text-sm">{ra.area}</p>
                      <p className="text-xs text-stone-600 mt-1">{ra.detail}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* KLOW ingredient breakdown */}
            {isKlow && detail.ingredients && (
              <>
                <h3 className="font-semibold text-stone-800 mb-3 text-sm uppercase tracking-wide">
                  Blend ingredients
                </h3>
                <div className="space-y-3 mb-4">
                  {detail.ingredients.map((ing) => (
                    <div key={ing.name} className="bg-blue-50 rounded-lg px-4 py-3">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-blue-900 text-sm">{ing.name}</span>
                        <span className="text-xs text-blue-500">{ing.label}</span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">{ing.researchArea}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Research / consultation note */}
            {(detail.researchNote || detail.consultationNote) && (
              <p className="text-xs text-stone-500 italic mb-5 border-t border-stone-100 pt-4">
                {detail.consultationNote ?? detail.researchNote}
              </p>
            )}

            {/* CTA */}
            <Link
              href={`/consultation?${params.toString()}`}
              onClick={() => setOpen(false)}
              className="block w-full bg-teal-600 text-white font-semibold text-center rounded-md px-4 py-3 hover:bg-teal-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              Ask about {title} — free consultation
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
