import videosData from "@/data/videos.json";
import type { VideoEntry } from "@/types/videos";
import type { PeptideEntry } from "@/lib/peptides/data";

const videos = videosData as VideoEntry[];

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Core matcher: finds videos whose explicit fields, tags, or title/description
 * reference any of the provided names, or whose explicit `topic` matches
 * `topicSlug`. Generic/featured videos with no identifying field are skipped.
 */
function videosByNames(names: string[], topicSlug?: string | null): VideoEntry[] {
  const normed = names.map(norm);
  const nameSet = new Set(normed);
  return videos.filter((v) => {
    if (v.peptide && nameSet.has(norm(v.peptide))) return true;
    if (topicSlug && v.topic && norm(v.topic) === norm(topicSlug)) return true;
    if (v.tags?.some((t) => nameSet.has(norm(t)))) return true;
    const haystack = norm(`${v.title} ${v.description}`);
    return normed.some((n) => {
      if (!n) return false;
      const pattern = new RegExp(`(^|\\s)${n.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}(\\s|$)`);
      return pattern.test(haystack);
    });
  });
}

/**
 * Match videos to a peptide using its canonical name + synonyms +
 * (optional) topic slug.
 */
export function videosForPeptide(
  peptide: PeptideEntry,
  topicSlug?: string | null,
): VideoEntry[] {
  return videosByNames([peptide.canonicalName, ...peptide.synonyms], topicSlug);
}

/**
 * Match videos to a topic by its title + topic slug (no peptide lookup
 * required). Use for non-peptide topics like NAD+, Oxytocin, PT-141.
 */
export function videosForTopic(title: string, topicSlug: string): VideoEntry[] {
  return videosByNames([title], topicSlug);
}

/** Build the "Videos on YouTube" external search URL. */
export function youtubeSearchUrl(canonicalName: string, lang: "en" | "es"): string {
  const query =
    lang === "es"
      ? `${canonicalName} péptido estudios`
      : `${canonicalName} peptide research`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
