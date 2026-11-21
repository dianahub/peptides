"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TopicDetailModal } from "./TopicDetailModal";
import { PeptideVideos } from "./PeptideVideos";
import topicDetails from "@/data/topicDetails.json";
import { slugify } from "@/lib/slugify";
import { videosForTopic, youtubeSearchUrl } from "@/lib/videos/for-peptide";

interface TopicCardProps {
  title: string;
  researchArea: string;
  group: string;
}

export function TopicCard({ title, researchArea, group }: TopicCardProps) {
  const t = useTranslations("topics");
  const locale = useLocale();
  const consultationParams = new URLSearchParams({ topic: `${title} (${group})` });
  const hasDetail = title in topicDetails;
  const isKlow = title === "KLOW";
  const slug = slugify(title);
  const ourVideos = videosForTopic(title, slug);
  const youtubeUrl = youtubeSearchUrl(title, locale === "es" ? "es" : "en");

  return (
    <div className={`bg-white border rounded-lg p-4 flex flex-col gap-3 shadow-sm ${isKlow ? "border-blue-200" : "border-stone-200"}`}>
      <div>
        <Link
          href={`/topics/${slug}`}
          className="font-semibold text-stone-800 hover:text-sky-700 transition-colors focus:outline-none focus-visible:underline"
        >
          {title}
        </Link>
        <p className="text-sm text-stone-500 mt-0.5">{researchArea}</p>
      </div>
      <div className="flex flex-col gap-2 mt-auto">
        {hasDetail ? (
          <TopicDetailModal title={title} group={group} />
        ) : (
          <Link
            href={`/consultation?${consultationParams.toString()}`}
            className="text-sm font-medium text-sky-700 border border-sky-300 rounded px-3 py-1.5 hover:bg-sky-50 transition-colors text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {t("askTopic")}
          </Link>
        )}
        <Link
          href={`/topics/${slug}`}
          className="text-xs text-stone-400 hover:text-sky-600 text-center transition-colors"
        >
          {t("learnMore")}
        </Link>
      </div>
      <div className="border-t border-stone-100 pt-3">
        <PeptideVideos
          canonicalName={title}
          ourVideos={ourVideos}
          youtubeUrl={youtubeUrl}
        />
      </div>
    </div>
  );
}
