import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { featuredVideos } from "@/db/schema";
import { asc, inArray } from "drizzle-orm";
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

type AdminLocale = "en" | "es";

function parseLocale(raw: string | undefined): AdminLocale {
  return raw === "es" ? "es" : "en";
}

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const { locale: rawLocale } = await searchParams;
  const locale = parseLocale(rawLocale);
  const matchingLocales: ("en" | "es" | "both")[] = [locale, "both"];

  const rows = await db
    .select()
    .from(featuredVideos)
    .where(inArray(featuredVideos.locale, matchingLocales))
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
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Featured Videos</h1>

        <div
          role="tablist"
          aria-label="Filter by locale"
          className="inline-flex rounded-md border border-stone-300 overflow-hidden text-sm"
        >
          {(["en", "es"] as const).map((loc) => {
            const active = locale === loc;
            return (
              <Link
                key={loc}
                href={{ query: { locale: loc } }}
                role="tab"
                aria-selected={active}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  active
                    ? "bg-sky-600 text-white"
                    : "bg-white text-stone-600 hover:bg-stone-50"
                }`}
              >
                {loc.toUpperCase()}
              </Link>
            );
          })}
        </div>

        <p className="text-xs text-stone-500">
          Showing videos set to <code className="font-mono">{locale}</code> or{" "}
          <code className="font-mono">both</code>.
        </p>

        <Link
          href="/admin"
          className="text-sm text-sky-600 hover:underline ml-auto"
        >
          ← Consultation requests
        </Link>
      </div>

      <div className="mb-8">
        <NewFeaturedVideoForm slugOptions={slugOptions} defaultLocale={locale} />
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-stone-500 bg-white border border-stone-200 rounded-lg px-4 py-8 text-center">
          No featured videos match this locale. Add one above.
        </p>
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr className="text-left text-xs uppercase tracking-wider text-stone-500">
                <th className="px-3 py-2">Topic slug</th>
                <th className="px-3 py-2">Locale</th>
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
