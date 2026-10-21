import type { MetadataRoute } from "next";
import topicsData from "@/data/topics.json";
import { slugify } from "@/lib/slugify";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://futurotek.vercel.app";

interface TopicGroup {
  group: string;
  items: { title: string; researchArea: string }[];
}

function getUniqueTopicSlugs(): string[] {
  const seen = new Set<string>();
  for (const group of topicsData as TopicGroup[]) {
    for (const item of group.items) {
      seen.add(slugify(item.title));
    }
  }
  return Array.from(seen);
}

export default function sitemap(): MetadataRoute.Sitemap {
  const topicPages = getUniqueTopicSlugs().map((slug) => ({
    url: `${BASE_URL}/topics/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/videos`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/topics`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...topicPages,
    { url: `${BASE_URL}/consultation`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/disclaimer`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
