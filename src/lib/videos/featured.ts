import { db } from "@/db";
import { featuredVideos } from "@/db/schema";
import { and, eq, inArray, asc } from "drizzle-orm";
import type { VideoEntry } from "@/types/videos";

export { mergeFeatured } from "./merge";

export type UILocale = "en" | "es";

/** Locales matching a given UI locale: the locale itself and 'both'. */
function matchingLocales(locale: UILocale): ("en" | "es" | "both")[] {
  return [locale, "both"];
}

export async function getFeaturedVideosForSlug(
  topicSlug: string,
  locale: UILocale,
): Promise<VideoEntry[]> {
  const rows = await db
    .select()
    .from(featuredVideos)
    .where(
      and(
        eq(featuredVideos.topicSlug, topicSlug),
        inArray(featuredVideos.locale, matchingLocales(locale)),
      ),
    )
    .orderBy(asc(featuredVideos.position), asc(featuredVideos.createdAt));

  return rows.map((r) => ({
    id: `featured:${r.id}`,
    title: r.title,
    description: r.description,
    url: r.youtubeUrl,
    featured: true,
    topic: r.topicSlug,
  }));
}

export async function getFeaturedVideosForSlugs(
  slugs: string[],
  locale: UILocale,
): Promise<Map<string, VideoEntry[]>> {
  if (slugs.length === 0) return new Map();
  const rows = await db
    .select()
    .from(featuredVideos)
    .where(inArray(featuredVideos.locale, matchingLocales(locale)))
    .orderBy(asc(featuredVideos.position), asc(featuredVideos.createdAt));

  const wanted = new Set(slugs);
  const out = new Map<string, VideoEntry[]>();
  for (const r of rows) {
    if (!wanted.has(r.topicSlug)) continue;
    const entry: VideoEntry = {
      id: `featured:${r.id}`,
      title: r.title,
      description: r.description,
      url: r.youtubeUrl,
      featured: true,
      topic: r.topicSlug,
    };
    const list = out.get(r.topicSlug) ?? [];
    list.push(entry);
    out.set(r.topicSlug, list);
  }
  return out;
}

