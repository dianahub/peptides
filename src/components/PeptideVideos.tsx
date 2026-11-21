"use client";

import { useTranslations } from "next-intl";
import type { VideoEntry } from "@/types/videos";
import { VideoCard } from "@/components/VideoCard";

/**
 * Renders "Our videos" grid when there are matches in videos.json.
 * The external YouTube search link is now rendered separately by
 * `<YouTubeButton>` placed at the top-right of each container.
 */
export function PeptideVideos({
  ourVideos,
}: {
  ourVideos: VideoEntry[];
}) {
  const t = useTranslations("research");
  if (ourVideos.length === 0) return null;
  return (
    <div>
      <h4 className="text-sm font-semibold text-navy mb-2">
        {t("ourVideosHeading")}
      </h4>
      <div className="grid gap-3 sm:grid-cols-2">
        {ourVideos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}
