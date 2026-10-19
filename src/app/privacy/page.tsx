import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Futurotek.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-6">
        Draft — have this reviewed by a licensed attorney before publishing.
      </p>
      <h1 className="text-3xl font-bold text-stone-900 mb-6">Privacy Policy</h1>
      <div className="space-y-6 text-stone-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            What information we collect
          </h2>
          <p>
            When you submit a consultation request we collect your{" "}
            <strong>name</strong>, <strong>email address</strong>, an{" "}
            <strong>optional message</strong>, and your{" "}
            <strong>topic of interest</strong> (if provided). We also store a
            one-way hash of your IP address solely for spam prevention and rate
            limiting; the raw IP address is never stored.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            How we use your information
          </h2>
          <p>
            We use your name, email, message, and topic of interest to follow up
            on your consultation request and to share that information with{" "}
            <strong>The Longevity Consultants</strong> so they can contact you
            to schedule a free consultation.
          </p>
          <p className="mt-2">
            We do not sell your personal information. We do not use it for
            marketing unrelated to your request. We do not use analytics or
            tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            Retention
          </h2>
          <p>
            We keep consultation requests for up to <strong>12 months</strong>{" "}
            from the date of submission, after which they are automatically
            deleted.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            Your rights and deletion requests
          </h2>
          <p>
            You may request deletion of your personal information at any time by
            contacting us through the consultation form and noting your request.
            We will delete your record promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            Data security
          </h2>
          <p>
            Your data is stored in a secured database. We take reasonable
            technical precautions to protect it from unauthorized access,
            disclosure, or loss.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">
            Contact
          </h2>
          <p>
            For questions about this privacy policy or to request deletion of
            your data, please use the consultation form and indicate your
            request in the message field.
          </p>
        </section>

        <p className="text-sm text-stone-500">Last updated: October 2026</p>
      </div>
    </div>
  );
}
