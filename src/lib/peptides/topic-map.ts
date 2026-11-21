import topicsData from "@/data/topics.json";
import topicDetails from "@/data/topicDetails.json";
import { slugify } from "@/lib/slugify";
import { PEPTIDES, type PeptideEntry } from "@/lib/peptides/data";

export interface TopicDetail {
  isBlend?: boolean;
  subtitle?: string;
  bottleImage?: string;
  bottleAlt?: string;
  summary: string;
  researchNote?: string;
  consultationNote?: string;
  ingredients?: { name: string; label: string; researchArea: string }[];
  researchAreas?: { area: string; detail: string; links?: { label: string; url: string }[] }[];
  citations?: { label: string; url: string }[];
}

interface TopicGroup {
  group: string;
  items: { title: string; researchArea: string }[];
}

const titleBySlug = (() => {
  const m = new Map<string, string>();
  for (const g of topicsData as TopicGroup[]) {
    for (const item of g.items) m.set(slugify(item.title), item.title);
  }
  return m;
})();

const details = topicDetails as Record<string, TopicDetail>;

/**
 * Resolve a peptide's topic page by matching its canonical name or any
 * synonym against the topics catalogue. Falls back to a substring match
 * on topic titles (e.g. Retatrutide → "GLP-3 (retatrutide)").
 */
export function peptideTopic(entry: PeptideEntry): {
  slug: string;
  title: string;
  detail: TopicDetail;
} | null {
  const candidates = [entry.canonicalName, ...entry.synonyms];
  // Exact slug match against any name.
  for (const c of candidates) {
    const s = slugify(c);
    const title = titleBySlug.get(s);
    if (title && details[title]) return { slug: s, title, detail: details[title] };
  }
  // Loose match: topic title contains any candidate (case-insensitive).
  for (const [s, title] of titleBySlug) {
    const tLower = title.toLowerCase();
    if (candidates.some((c) => tLower.includes(c.toLowerCase())) && details[title]) {
      return { slug: s, title, detail: details[title] };
    }
  }
  return null;
}

export function peptideTopicByCanonicalName(
  canonicalName: string,
): ReturnType<typeof peptideTopic> {
  const entry = PEPTIDES.find(
    (p) => p.canonicalName.toLowerCase() === canonicalName.toLowerCase(),
  );
  return entry ? peptideTopic(entry) : null;
}
