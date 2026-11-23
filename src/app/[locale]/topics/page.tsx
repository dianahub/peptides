import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { TopicCard } from "@/components/TopicCard";
import topicsData from "@/data/topics.json";
import { slugify } from "@/lib/slugify";
import { getFeaturedVideosForSlugs } from "@/lib/videos/featured";

interface TopicGroup {
  group: string;
  groupNote?: string | null;
  groupSubtitle?: string;
  items: { title: string; researchArea: string }[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "topics" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function TopicsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "topics" });

  const allSlugs = Array.from(
    new Set(
      (topicsData as TopicGroup[]).flatMap((g) =>
        g.items.map((i) => slugify(i.title)),
      ),
    ),
  );
  const featuredMap = await getFeaturedVideosForSlugs(
    allSlugs,
    locale === "es" ? "es" : "en",
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">
        {t("pageTitle")}
      </h1>

      <div
        role="note"
        className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-sm text-stone-700 mb-8"
      >
        <p>{t("notice")}</p>
      </div>

      <div className="space-y-12">
        {(topicsData as TopicGroup[]).map((group) => (
          <section
            key={group.group}
            aria-labelledby={`group-${group.group.replace(/\s+/g, "-").toLowerCase()}`}
          >
            <div className="mb-4">
              <h2
                id={`group-${group.group.replace(/\s+/g, "-").toLowerCase()}`}
                className="text-xl font-bold text-stone-800"
              >
                {group.group}
                {group.groupSubtitle && (
                  <span className="text-base font-normal text-stone-500 ml-2">
                    — {group.groupSubtitle}
                  </span>
                )}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {t("investigational")}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((item) => (
                <TopicCard
                  key={`${group.group}-${item.title}`}
                  title={item.title}
                  researchArea={item.researchArea}
                  group={group.group}
                  featuredVideos={featuredMap.get(slugify(item.title)) ?? []}
                />
              ))}
            </div>

            {group.groupNote && (
              <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                {group.groupNote}
              </p>
            )}
          </section>
        ))}
      </div>

      <div
        role="note"
        className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-sm text-stone-700 mt-12"
      >
        <p>{t("notice")}</p>
      </div>
    </div>
  );
}
