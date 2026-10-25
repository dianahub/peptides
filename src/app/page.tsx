import Link from "next/link";
import type { Metadata } from "next";
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
      <section
        className="border-b border-[rgba(20,48,77,0.12)] overflow-hidden"
        style={{ background: "linear-gradient(180deg, #ffffff 0%, #faf8f3 42%, #eef1f6 100%)" }}
      >
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_380px]">
          {/* Left: text */}
          <div className="px-4 sm:px-6 lg:pr-12 py-16 sm:py-20 flex flex-col justify-center">
            <p className="text-gold-dark text-xs font-medium uppercase tracking-[0.16em] mb-3">
              Longevity Science Education
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl text-ink leading-tight mb-4">
              Peptide &amp; Longevity Education
            </h1>
            <p className="text-lg text-navy-soft max-w-lg mb-8">
              {SITE_DESCRIPTION} I share educational content from The Longevity
              Consultants as an independent affiliate and connect interested
              visitors with a free consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link
                href="/consultation"
                className="inline-block text-white font-medium rounded px-7 py-3 text-sm text-center transition-all hover:brightness-110 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                style={{
                  background: "linear-gradient(135deg, #9c6f16 0%, #7c540c 100%)",
                  boxShadow: "0 12px 24px -10px rgba(143,100,16,0.6)",
                }}
              >
                Request a free consultation
              </Link>
              <Link
                href="/topics"
                className="inline-block text-navy border border-[rgba(20,48,77,0.3)] font-medium rounded px-7 py-3 text-sm hover:border-navy-soft hover:-translate-y-0.5 transition-all text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              >
                Explore topics
              </Link>
            </div>
          </div>

          {/* Right: decorative panel with molecule illustration */}
          <div className="hidden lg:flex bg-sage-deep items-center justify-center relative overflow-hidden min-h-[420px]">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-sage opacity-60" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full" style={{ background: "rgba(20,48,77,0.08)" }} />
            <svg
              viewBox="0 0 260 260"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10 w-56 h-56"
              aria-hidden="true"
            >
              <circle cx="130" cy="130" r="105" stroke="#14304d" strokeOpacity="0.12" strokeWidth="1" />
              <circle cx="130" cy="130" r="70" stroke="#14304d" strokeOpacity="0.14" strokeWidth="1" />

              <line x1="130" y1="130" x2="72" y2="75" stroke="#14304d" strokeOpacity="0.45" strokeWidth="2" />
              <line x1="130" y1="130" x2="198" y2="82" stroke="#14304d" strokeOpacity="0.45" strokeWidth="2" />
              <line x1="130" y1="130" x2="80" y2="195" stroke="#14304d" strokeOpacity="0.4" strokeWidth="2" />
              <line x1="130" y1="130" x2="190" y2="200" stroke="#14304d" strokeOpacity="0.4" strokeWidth="2" />
              <line x1="130" y1="130" x2="130" y2="44" stroke="#14304d" strokeOpacity="0.38" strokeWidth="2" />

              <line x1="72" y1="75" x2="44" y2="130" stroke="#3f5a78" strokeOpacity="0.25" strokeWidth="1.5" />
              <line x1="72" y1="75" x2="90" y2="44" stroke="#3f5a78" strokeOpacity="0.25" strokeWidth="1.5" />
              <line x1="198" y1="82" x2="226" y2="136" stroke="#3f5a78" strokeOpacity="0.25" strokeWidth="1.5" />
              <line x1="80" y1="195" x2="55" y2="226" stroke="#3f5a78" strokeOpacity="0.22" strokeWidth="1.5" />
              <line x1="190" y1="200" x2="210" y2="232" stroke="#3f5a78" strokeOpacity="0.22" strokeWidth="1.5" />
              <line x1="72" y1="75" x2="198" y2="82" stroke="#3f5a78" strokeOpacity="0.15" strokeWidth="1" />

              <circle cx="130" cy="130" r="20" fill="#14304d" fillOpacity="0.85" />
              <circle cx="72" cy="75" r="14" fill="#3f5a78" fillOpacity="0.75" />
              <circle cx="198" cy="82" r="14" fill="#3f5a78" fillOpacity="0.75" />
              <circle cx="80" cy="195" r="12" fill="#3f5a78" fillOpacity="0.55" />
              <circle cx="190" cy="200" r="12" fill="#3f5a78" fillOpacity="0.55" />
              <circle cx="130" cy="44" r="10" fill="#cf9f3f" fillOpacity="0.7" />

              <circle cx="44" cy="130" r="7" fill="#3f5a78" fillOpacity="0.4" />
              <circle cx="90" cy="44" r="7" fill="#cf9f3f" fillOpacity="0.4" />
              <circle cx="226" cy="136" r="7" fill="#3f5a78" fillOpacity="0.4" />
              <circle cx="55" cy="226" r="6" fill="#3f5a78" fillOpacity="0.35" />
              <circle cx="210" cy="232" r="6" fill="#3f5a78" fillOpacity="0.35" />
            </svg>
          </div>
        </div>
      </section>

      {/* Featured videos */}
      {featuredVideos.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-serif text-2xl text-ink mb-6">
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
      <section className="bg-white border-y border-[rgba(20,48,77,0.1)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-serif text-2xl text-ink mb-8 text-center">
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
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-lg"
                  style={{ background: "linear-gradient(135deg, #10263c 0%, #24507a 100%)" }}
                >
                  {step}
                </span>
                <h3 className="font-medium text-ink">{title}</h3>
                <p className="text-navy-soft text-sm">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h2 className="font-serif text-2xl text-ink mb-3">
          Ready to learn more?
        </h2>
        <p className="text-navy-soft mb-6 max-w-xl mx-auto">
          Request a free consultation and get connected with an expert who can
          answer your questions.
        </p>
        <Link
          href="/consultation"
          className="inline-block text-white font-medium rounded px-8 py-3 text-sm transition-all hover:brightness-110 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          style={{ background: "linear-gradient(135deg, #9c6f16 0%, #7c540c 100%)" }}
        >
          Request a free consultation
        </Link>
      </section>
    </>
  );
}
