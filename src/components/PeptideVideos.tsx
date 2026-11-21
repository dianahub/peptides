"use client";

import { useTranslations } from "next-intl";
import type { VideoEntry } from "@/types/videos";
import { VideoCard } from "@/components/VideoCard";

/**
 * Displays videos for a peptide:
 *   1. "Our videos" — any matching entries from src/data/videos.json
 *   2. "Videos on YouTube ↗" — external search link
 */
export function PeptideVideos({
  canonicalName,
  ourVideos,
  youtubeUrl,
}: {
  canonicalName: string;
  ourVideos: VideoEntry[];
  youtubeUrl: string;
}) {
  const t = useTranslations("research");
  const label = t("youtubeLink");

  return (
    <div className="space-y-4">
      {ourVideos.length > 0 && (
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
      )}
      <div>
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-navy hover:underline focus:outline-none focus-visible:underline"
          aria-label={`${label}: ${canonicalName}`}
        >
          {label}
        </a>
        <p className="text-xs text-ink/55 mt-0.5">
          {t("externalContentNote")}
        </p>
      </div>
    </div>
  );
}
