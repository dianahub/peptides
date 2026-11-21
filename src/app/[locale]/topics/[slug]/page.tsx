import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import topicsData from "@/data/topics.json";
import { slugify } from "@/lib/slugify";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { TopicDetailBody } from "@/components/TopicDetailBody";
import { getTopicDetailByTitle, type Locale } from "@/lib/peptides/topic-map";
import { PeptideVideos } from "@/components/PeptideVideos";
import { YouTubeButton } from "@/components/YouTubeButton";
import { PEPTIDES } from "@/lib/peptides/data";
import { videosForPeptide, videosForTopic, youtubeSearchUrl } from "@/lib/videos/for-peptide";

interface TopicGroup {
  group: string;
  items: { title: string; researchArea: string }[];
}

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
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const map = buildTopicMap();
  const topic = map.get(slug);
  if (!topic) return {};

  const detail = getTopicDetailByTitle(topic.title, locale === "es" ? "es" : "en");
  const t = await getTranslations({ locale, namespace: "topics" });
  const description = detail?.summary
    ? detail.summary.slice(0, 155)
    : `Educational information about ${topic.title} research areas and signaling pathway investigations.`;

  return {
    title: t("topicMetaTitle", { title: topic.title }),
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
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const map = buildTopicMap();
  const topic = map.get(slug);
  if (!topic) notFound();

  const t = await getTranslations({ locale, namespace: "topics" });
  const localeKey: Locale = locale === "es" ? "es" : "en";
  const detail = getTopicDetailByTitle(topic.title, localeKey);
  const consultationParams = new URLSearchParams({ topic: topic.title });
  const bottleImage = topic.title === "KLOW" ? "/klow-bottle.svg" : detail?.bottleImage;
  const bottleAlt = topic.title === "KLOW" ? "KLOW peptide blend bottle" : detail?.bottleAlt;

  // Resolve videos + YouTube link once; used in the header and in the
  // "Our videos" block below. Falls back to a topic-only match for
  // non-seeded topics like NAD+ or Oxytocin.
  const peptide = PEPTIDES.find((p) => {
    const names = [p.canonicalName, ...p.synonyms].map((n) => slugify(n));
    return names.includes(slug) || slugify(topic.title).includes(slugify(p.canonicalName));
  });
  const videoDisplayName = peptide?.canonicalName ?? topic.title;
  const ourVideos = peptide
    ? videosForPeptide(peptide, slug)
    : videosForTopic(topic.title, slug);
  const youtubeUrl = youtubeSearchUrl(videoDisplayName, localeKey);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-stone-400 mb-6">
        <Link href="/topics" className="hover:text-sky-700">
          {t("breadcrumbTopics")}
        </Link>
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
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-stone-900 leading-tight">
                {t("topicResearch", { title: topic.title })}
              </h1>
              {detail?.subtitle && (
                <p className="text-sky-700 font-medium mt-1">{detail.subtitle}</p>
              )}
            </div>
            <div className="sm:flex-shrink-0 sm:pt-1">
              <YouTubeButton href={youtubeUrl} />
            </div>
          </div>
          <p className="text-sm text-stone-500 mt-2">
            {t("researchArea")} {topic.researchArea}
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
        {t("disclaimer")}
      </div>

      {/* Summary */}
      {detail ? (
        <TopicDetailBody detail={detail} />
      ) : (
        <p className="text-stone-600 mb-8">
          {t("noDetailText", { title: topic.title, researchArea: topic.researchArea })}
        </p>
      )}

      {/* Our videos (external YouTube link lives in the header, top-right) */}
      {ourVideos.length > 0 && (
        <div className="mb-8 border-t border-stone-200 pt-6">
          <PeptideVideos ourVideos={ourVideos} />
        </div>
      )}

      {/* CTA */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-stone-800 mb-2">
          {t("ctaTitle", { topic: topic.title })}
        </h2>
        <p className="text-stone-600 text-sm mb-4">{t("ctaBody")}</p>
        <AffiliateDisclosure className="mb-4" />
        <Link
          href={`/consultation?${consultationParams.toString()}`}
          className="inline-block bg-sky-600 text-white font-semibold rounded-md px-6 py-3 hover:bg-sky-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {t("ctaButton")}
        </Link>
      </div>

      <div className="mt-8">
        <Link href="/topics" className="text-sm text-sky-700 hover:underline">
          {t("backToTopics")}
        </Link>
      </div>
    </div>
  );
}
