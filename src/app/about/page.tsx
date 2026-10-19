import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About this site and its independent affiliate relationship.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">About</h1>

      {/* Placeholder paragraph */}
      <div className="bg-stone-100 border border-stone-300 rounded-md px-4 py-3 text-sm text-stone-500 mb-6">
        <strong>Placeholder:</strong> Replace this section with your personal
        bio and why you got interested in longevity and peptide education.
      </div>
      <p className="text-stone-600 mb-8 leading-relaxed">
        [Your personal story and background go here. Describe who you are, why
        you care about longevity research, and what drew you to sharing this
        educational content. Keep it personal, warm, and honest.]
      </p>

      {/* Affiliate statement */}
      <div className="border-t border-stone-200 pt-8">
        <h2 className="text-xl font-semibold text-stone-800 mb-3">
          Independent affiliate
        </h2>
        <p className="text-stone-600 leading-relaxed">
          I am an independent affiliate of The Longevity Consultants. I am not
          an employee, agent, or representative of that company. The views and
          content on this site are my own and do not represent the official
          positions of The Longevity Consultants.
        </p>
        <p className="text-stone-600 leading-relaxed mt-3">
          As an affiliate I may receive compensation if you request a
          consultation through this site. This does not affect the educational
          content presented here.
        </p>
      </div>
    </div>
  );
}
