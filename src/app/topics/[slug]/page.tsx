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
  researchAreas?: { area: string; detail: string }[];
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
        <Link href="/topics" className="hover:text-teal-700">Topics</Link>
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
            <p className="text-teal-700 font-medium mt-1">{detail.subtitle}</p>
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
        Educational information only. Investigational uses may lack FDA approval. Not medical advice or a treatment plan. Discuss any health concerns with a licensed clinician.
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
            <p className="text-sm text-stone-500 italic border-t border-stone-200 pt-4 mb-8">
              {detail.consultationNote ?? detail.researchNote}
            </p>
          )}
        </div>
      ) : (
        <p className="text-stone-600 mb-8">
          {topic.title} is studied in the context of {topic.researchArea}. Ask about this topic
          in a free consultation to learn more.
        </p>
      )}

      {/* Bottom disclaimer */}
      <p className="text-sm text-stone-500 mb-8">
        Discuss any health concerns with a licensed clinician before making health decisions.
      </p>

      {/* CTA */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-stone-800 mb-2">
          Have questions about {topic.title}?
        </h2>
        <p className="text-stone-600 text-sm mb-4">
          Request a free consultation to ask questions and learn more about this research area.
        </p>
        <AffiliateDisclosure className="mb-4" />
        <Link
          href={`/consultation?${consultationParams.toString()}`}
          className="inline-block bg-teal-600 text-white font-semibold rounded-md px-6 py-3 hover:bg-teal-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          Request a free consultation
        </Link>
      </div>

      <div className="mt-8">
        <Link href="/topics" className="text-sm text-teal-700 hover:underline">
          ← Back to all topics
        </Link>
      </div>
    </div>
  );
}
