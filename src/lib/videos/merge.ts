import type { VideoEntry } from "@/types/videos";

/** Merge featured videos in front of matched videos, de-duplicating by URL. */
export function mergeFeatured(
  featured: VideoEntry[],
  matched: VideoEntry[],
): VideoEntry[] {
  if (featured.length === 0) return matched;
  const seen = new Set(featured.map((v) => v.url));
  return [...featured, ...matched.filter((v) => !seen.has(v.url))];
}
