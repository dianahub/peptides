"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import topicDetails from "@/data/topicDetails.json";

const klow = topicDetails.KLOW;

export function KlowModal({ group }: { group: string }) {
  const [open, setOpen] = useState(false);
  const params = new URLSearchParams({ topic: `KLOW (${group})` });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-auto text-sm font-medium text-blue-700 border border-blue-300 rounded px-3 py-1.5 hover:bg-blue-50 transition-colors text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 w-full"
      >
        Learn about KLOW
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="klow-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
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

            {/* Header with bottle */}
            <div className="flex items-center gap-5 mb-5">
              <Image
                src="/klow-bottle.svg"
                alt="KLOW peptide blend bottle"
                width={70}
                height={117}
                className="flex-shrink-0"
              />
              <div>
                <h2 id="klow-modal-title" className="text-2xl font-bold text-blue-900">
                  KLOW
                </h2>
                <p className="text-sm text-blue-600 font-medium">Beauty · Vitality · Power</p>
                <p className="text-xs text-stone-500 mt-1">{klow.subtitle}</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-stone-600 mb-4">
              Educational information only. Investigational uses may lack FDA approval. Not medical advice.
            </div>

            {/* Summary */}
            <p className="text-sm text-stone-700 mb-5 leading-relaxed">{klow.summary}</p>

            {/* Ingredients */}
            <h3 className="font-semibold text-stone-800 mb-3 text-sm uppercase tracking-wide">
              Blend ingredients
            </h3>
            <div className="space-y-3 mb-6">
              {klow.ingredients.map((ing) => (
                <div key={ing.name} className="bg-blue-50 rounded-lg px-4 py-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-blue-900 text-sm">{ing.name}</span>
                    <span className="text-xs text-blue-500">{ing.label}</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">{ing.researchArea}</p>
                </div>
              ))}
            </div>

            {/* Consultation note */}
            <p className="text-xs text-stone-500 italic mb-5 border-t border-stone-100 pt-4">
              {klow.consultationNote}
            </p>

            {/* CTA */}
            <Link
              href={`/consultation?${params.toString()}`}
              onClick={() => setOpen(false)}
              className="block w-full bg-teal-600 text-white font-semibold text-center rounded-md px-4 py-3 hover:bg-teal-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              Ask about KLOW — free consultation
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
