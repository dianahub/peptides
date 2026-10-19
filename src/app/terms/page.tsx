import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for Futurotek.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-6">
        Draft — have this reviewed by a licensed attorney before publishing.
      </p>
      <h1 className="text-3xl font-bold text-stone-900 mb-6">Terms of Use</h1>
      <div className="space-y-6 text-stone-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            Acceptance of terms
          </h2>
          <p>
            By using this website you agree to these terms. If you do not agree,
            please do not use the site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            Educational use only
          </h2>
          <p>
            The content on this site is for educational purposes only. It is not
            medical advice. See our{" "}
            <a href="/disclaimer" className="text-teal-700 underline">
              Disclaimer
            </a>{" "}
            for full details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            No products or services sold
          </h2>
          <p>
            This site does not sell products, prescribe medications, or offer
            medical services. Submitting a consultation request connects you with
            a third-party consulting company (The Longevity Consultants) as
            described in the affiliate disclosure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            Intellectual property
          </h2>
          <p>
            Video content embedded on this site is property of its respective
            owners and is embedded with permission. Text content on this site
            may not be reproduced without permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            Limitation of liability
          </h2>
          <p>
            To the fullest extent permitted by law, this site and its operators
            are not liable for any damages arising from your use of this site or
            reliance on its content.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">Changes</h2>
          <p>
            We may update these terms at any time. Continued use of the site
            after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <p className="text-sm text-stone-500">Last updated: October 2026</p>
      </div>
    </div>
  );
}
