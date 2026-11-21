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
 * Match videos to a peptide by any of:
 *   - explicit `peptide` field equal to canonical name or any synonym
 *   - explicit `topic` field equal to a provided topic slug
 *   - any `tags` entry equal to canonical name or synonym
 *   - canonical name appearing as a whole word in title or description
 * Generic/featured videos with no identifying field are not returned.
 */
export function videosForPeptide(
  peptide: PeptideEntry,
  topicSlug?: string | null,
): VideoEntry[] {
  const names = [peptide.canonicalName, ...peptide.synonyms].map(norm);
  const nameSet = new Set(names);

  return videos.filter((v) => {
    if (v.peptide && nameSet.has(norm(v.peptide))) return true;
    if (topicSlug && v.topic && norm(v.topic) === norm(topicSlug)) return true;
    if (v.tags?.some((t) => nameSet.has(norm(t)))) return true;
    const haystack = norm(`${v.title} ${v.description}`);
    return names.some((n) => {
      if (!n) return false;
      const pattern = new RegExp(`(^|\\s)${n.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}(\\s|$)`);
      return pattern.test(haystack);
    });
  });
}

/** Build the "Videos on YouTube" external search URL. */
export function youtubeSearchUrl(canonicalName: string, lang: "en" | "es"): string {
  const query =
    lang === "es"
      ? `${canonicalName} péptido estudios`
      : `${canonicalName} peptide research`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
