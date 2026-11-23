import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { featuredVideos } from "@/db/schema";
import { asc } from "drizzle-orm";
import topicsData from "@/data/topics.json";
import { slugify } from "@/lib/slugify";
import { NewFeaturedVideoForm } from "./NewFeaturedVideoForm";
import { FeaturedVideoRow } from "./FeaturedVideoRow";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Featured Videos",
  robots: { index: false, follow: false },
};

interface TopicGroup {
  group: string;
  items: { title: string }[];
}

export default async function AdminVideosPage() {
  const rows = await db
    .select()
    .from(featuredVideos)
    .orderBy(asc(featuredVideos.topicSlug), asc(featuredVideos.position));

  const slugOptions = Array.from(
    new Set(
      (topicsData as TopicGroup[]).flatMap((g) =>
        g.items.map((i) => slugify(i.title)),
      ),
    ),
  ).sort();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Featured Videos</h1>
        <Link
          href="/admin"
          className="text-sm text-sky-600 hover:underline ml-auto"
        >
          ← Consultation requests
        </Link>
      </div>

      <div className="mb-8">
        <NewFeaturedVideoForm slugOptions={slugOptions} />
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-stone-500 bg-white border border-stone-200 rounded-lg px-4 py-8 text-center">
          No featured videos yet. Add one above.
        </p>
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs uppercase tracking-wider text-stone-500">
                <th className="px-3 py-2">Topic slug</th>
                <th className="px-3 py-2">YouTube URL</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2 text-center">Pos</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <FeaturedVideoRow key={v.id} video={v} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
