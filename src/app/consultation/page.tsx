import type { Metadata } from "next";
import { Suspense } from "react";
import { ConsultationFormWrapper } from "./ConsultationFormWrapper";

export const metadata: Metadata = {
  title: "Free Consultation",
  description:
    "Request a free consultation to learn more about peptide and longevity research topics.",
};

export default function ConsultationPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">
        Request a Free Consultation
      </h1>
      <p className="text-stone-600 mb-8">
        Fill out the form below to request a free consultation. Someone will
        reach out to answer your questions about peptide and longevity research
        topics. There&apos;s no obligation and no cost.
      </p>

      <Suspense fallback={<div className="text-stone-500">Loading form…</div>}>
        <ConsultationFormWrapper />
      </Suspense>
    </div>
  );
}
