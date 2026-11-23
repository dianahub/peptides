"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TopicDetailModal } from "./TopicDetailModal";
import { PeptideVideos } from "./PeptideVideos";
import { YouTubeButton } from "./YouTubeButton";
import topicDetails from "@/data/topicDetails.json";
import { slugify } from "@/lib/slugify";
import { videosForTopic, youtubeSearchUrl } from "@/lib/videos/for-peptide";
import { mergeFeatured } from "@/lib/videos/merge";
import type { VideoEntry } from "@/types/videos";

interface TopicCardProps {
  title: string;
  researchArea: string;
  group: string;
  featuredVideos?: VideoEntry[];
}

export function TopicCard({ title, researchArea, group, featuredVideos = [] }: TopicCardProps) {
  const t = useTranslations("topics");
  const locale = useLocale();
  const consultationParams = new URLSearchParams({ topic: `${title} (${group})` });
  const hasDetail = title in topicDetails;
  const isKlow = title === "KLOW";
  const slug = slugify(title);
  const ourVideos = mergeFeatured(featuredVideos, videosForTopic(title, slug));
  const youtubeUrl = youtubeSearchUrl(title, locale === "es" ? "es" : "en");

  return (
    <div className={`bg-white border rounded-lg p-4 flex flex-col gap-3 shadow-sm ${isKlow ? "border-blue-200" : "border-stone-200"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link
            href={`/topics/${slug}`}
            className="font-semibold text-stone-800 hover:text-sky-700 transition-colors focus:outline-none focus-visible:underline"
          >
            {title}
          </Link>
          <p className="text-sm text-stone-500 mt-0.5">{researchArea}</p>
        </div>
        <YouTubeButton href={youtubeUrl} size="sm" />
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
      {ourVideos.length > 0 && (
        <div className="border-t border-stone-100 pt-3">
          <PeptideVideos ourVideos={ourVideos} />
        </div>
      )}
    </div>
  );
}
