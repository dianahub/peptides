import { db } from "@/db";
import { featuredVideos } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import type { VideoEntry } from "@/types/videos";

export { mergeFeatured } from "./merge";

export async function getFeaturedVideosForSlug(
  topicSlug: string,
): Promise<VideoEntry[]> {
  const rows = await db
    .select()
    .from(featuredVideos)
    .where(eq(featuredVideos.topicSlug, topicSlug))
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
): Promise<Map<string, VideoEntry[]>> {
  if (slugs.length === 0) return new Map();
  const rows = await db
    .select()
    .from(featuredVideos)
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

