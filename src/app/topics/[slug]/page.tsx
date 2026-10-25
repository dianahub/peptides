import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import topicsData from "@/data/topics.json";
import topicDetails from "@/data/topicDetails.json";
import { slugify } from "@/lib/slugify";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";

type TopicDetail = {
  isBlend?: boolean;
  subtitle?: string;
  bottleImage?: string;
  bottleAlt?: string;
  summary: string;
  researchNote?: string;
  consultationNote?: string;
  ingredients?: { name: string; label: string; researchArea: string }[];
  researchAreas?: { area: string; detail: string; links?: { label: string; url: string }[] }[];
  citations?: { label: string; url: string }[];
};

interface TopicGroup {
  group: string;
  items: { title: string; researchArea: string }[];
}

// Build a flat map of slug → { title, researchArea, groups[] }
function buildTopicMap() {
  const map = new Map<string, { title: string; researchArea: string; groups: string[] }>();
  for (const group of topicsData as TopicGroup[]) {
    for (const item of group.items) {
      const slug = slugify(item.title);
      const existing = map.get(slug);
      if (existing) {
        existing.groups.push(group.group);
      } else {
        map.set(slug, { title: item.title, researchArea: item.researchArea, groups: [group.group] });
      }
    }
  }
  return map;
}

export async function generateStaticParams() {
  const map = buildTopicMap();
  return Array.from(map.keys()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const map = buildTopicMap();
  const topic = map.get(slug);
  if (!topic) return {};

  const detail = (topicDetails as Record<string, TopicDetail>)[topic.title];
  const description = detail?.summary
    ? detail.summary.slice(0, 155)
    : `Educational information about ${topic.title} research areas and signaling pathway investigations.`;

  return {
    title: `${topic.title} Research — Peptide Education`,
    description,
    openGraph: {
      title: `${topic.title} Research | Futurotek`,
      description,
    },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const map = buildTopicMap();
  const topic = map.get(slug);
  if (!topic) notFound();

  const detail = (topicDetails as Record<string, TopicDetail>)[topic.title];
  const consultationParams = new URLSearchParams({ topic: topic.title });
  const bottleImage = topic.title === "KLOW" ? "/klow-bottle.svg" : detail?.bottleImage;
  const bottleAlt = topic.title === "KLOW" ? "KLOW peptide blend bottle" : detail?.bottleAlt;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-stone-400 mb-6">
        <Link href="/topics" className="hover:text-sky-700">Topics</Link>
        <span className="mx-2">›</span>
        <span className="text-stone-600">{topic.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-6 mb-6">
        {bottleImage && (
          <Image
            src={bottleImage}
            alt={bottleAlt ?? `${topic.title} bottle`}
            width={80}
            height={133}
            className="flex-shrink-0"
            priority
          />
        )}
        <div>
          <h1 className="text-3xl font-bold text-stone-900 leading-tight">
            {topic.title} Research
          </h1>
          {detail?.subtitle && (
            <p className="text-sky-700 font-medium mt-1">{detail.subtitle}</p>
          )}
          <p className="text-sm text-stone-500 mt-2">
            Research area: {topic.researchArea}
          </p>
          {topic.groups.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {topic.groups.map((g) => (
                <span key={g} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-sm text-stone-700 mb-8">
        Educational information only. Investigational uses may lack FDA approval. Not medical advice or a treatment plan.
      </div>

      {/* Summary */}
      {detail ? (
        <div className="prose prose-stone max-w-none">
          <p className="text-stone-700 leading-relaxed text-base mb-8">{detail.summary}</p>

          {/* Research areas */}
          {detail.researchAreas && detail.researchAreas.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-stone-800 mb-4">Research Areas</h2>
              <div className="space-y-4 not-prose">
                {detail.researchAreas.map((ra) => (
                  <div key={ra.area} className="bg-stone-50 border border-stone-200 rounded-lg px-5 py-4">
                    <h3 className="font-semibold text-stone-800 mb-1">{ra.area}</h3>
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
            </section>
          )}

          {/* KLOW ingredient breakdown */}
          {detail.isBlend && detail.ingredients && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-stone-800 mb-4">Blend Ingredients</h2>
              <div className="space-y-4 not-prose">
                {detail.ingredients.map((ing) => (
                  <div key={ing.name} className="bg-blue-50 border border-blue-100 rounded-lg px-5 py-4">
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

          {/* Research / consultation note */}
          {(detail.researchNote || detail.consultationNote) && (
            <p className="text-sm text-stone-500 italic border-t border-stone-200 pt-4 mb-4">
              {detail.consultationNote ?? detail.researchNote}
            </p>
          )}

          {/* Citations */}
          {detail.citations && detail.citations.length > 0 && (
            <section className="mb-8">
              <h2 className="text-base font-semibold text-stone-700 mb-2">Research References</h2>
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
        </div>
      ) : (
        <p className="text-stone-600 mb-8">
          {topic.title} is studied in the context of {topic.researchArea}. Ask about this topic
          in a free consultation to learn more.
        </p>
      )}

      {/* CTA */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-stone-800 mb-2">
          Have questions about {topic.title}?
        </h2>
        <p className="text-stone-600 text-sm mb-4">
          Request a free consultation to ask questions and learn more about this research area.
        </p>
        <AffiliateDisclosure className="mb-4" />
        <Link
          href={`/consultation?${consultationParams.toString()}`}
          className="inline-block bg-sky-600 text-white font-semibold rounded-md px-6 py-3 hover:bg-sky-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          Request a free consultation
        </Link>
      </div>

      <div className="mt-8">
        <Link href="/topics" className="text-sm text-sky-700 hover:underline">
          ← Back to all topics
        </Link>
      </div>
    </div>
  );
}
