import Link from "next/link";
import type { Metadata } from "next";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { VideoCard } from "@/components/VideoCard";
import { SITE_TITLE, SITE_DESCRIPTION } from "@/lib/config";
import videosData from "@/data/videos.json";
import type { VideoEntry } from "@/types/videos";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

const featuredVideos = (videosData as VideoEntry[]).filter((v) => v.featured);

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <AffiliateDisclosure className="mb-8 max-w-2xl" />
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 leading-tight mb-4 max-w-3xl">
            Futurotek: Peptide and Longevity Education
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mb-8">
            {SITE_DESCRIPTION} I share educational content from The Longevity
            Consultants as an independent affiliate and connect interested
            visitors with a free consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/consultation"
              className="inline-block bg-teal-600 text-white font-semibold rounded-md px-7 py-3 hover:bg-teal-700 transition-colors text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              Request a free consultation
            </Link>
            <Link
              href="/topics"
              className="inline-block border border-stone-300 text-stone-700 font-semibold rounded-md px-7 py-3 hover:bg-stone-100 transition-colors text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              Explore education topics
            </Link>
          </div>
        </div>
      </section>

      {/* Featured videos */}
      {featuredVideos.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          {/* TODO: Add introductory context for these videos here.
              Note: health-outcomes testimonials (e.g., recovery claims) are not
              permitted under the site's compliance policy. Consult a healthcare
              attorney before adding any personal health story. */}
          <h2 className="text-2xl font-bold text-stone-800 mb-6">
            Featured Videos
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {featuredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-bold text-stone-800 mb-8 text-center">
            How it works
          </h2>
          <ol className="grid sm:grid-cols-3 gap-8" role="list">
            {[
              {
                step: "1",
                title: "Watch or read",
                body: "Explore the educational videos and topic information to learn about peptide research areas.",
              },
              {
                step: "2",
                title: "Request a consultation",
                body: "Fill out a short form to request a free consultation. No obligation and no cost.",
              },
              {
                step: "3",
                title: "Get connected",
                body: "A consultant will reach out to answer your questions and discuss your interests.",
              },
            ].map(({ step, title, body }) => (
              <li key={step} className="flex flex-col items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-lg">
                  {step}
                </span>
                <h3 className="font-semibold text-stone-800">{title}</h3>
                <p className="text-stone-600 text-sm">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-3">
          Ready to learn more?
        </h2>
        <p className="text-stone-600 mb-6 max-w-xl mx-auto">
          Request a free consultation and get connected with an expert who can
          answer your questions.
        </p>
        <AffiliateDisclosure className="max-w-xl mx-auto mb-6 text-left" />
        <Link
          href="/consultation"
          className="inline-block bg-teal-600 text-white font-semibold rounded-md px-8 py-3 hover:bg-teal-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          Request a free consultation
        </Link>
      </section>
    </>
  );
}
