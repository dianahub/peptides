import topicsData from "@/data/topics.json";
import topicDetails from "@/data/topicDetails.json";
import topicDetailsEs from "@/data/topicDetails.es.json";
import { slugify } from "@/lib/slugify";
import { PEPTIDES, type PeptideEntry } from "@/lib/peptides/data";

export type Locale = "en" | "es";

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
const detailsEs = topicDetailsEs as Record<string, Partial<TopicDetail>>;

/**
 * Merge Spanish translation over the English base per-field. Any field
 * missing from the ES entry (including nested researchAreas[] items and
 * citations[] entries) falls back to English.
 */
function mergeDetail(en: TopicDetail, es: Partial<TopicDetail> | undefined): TopicDetail {
  if (!es) return en;
  const researchAreas = en.researchAreas?.map((raEn, i) => {
    const raEs = es.researchAreas?.[i];
    if (!raEs) return raEn;
    return {
      area: raEs.area ?? raEn.area,
      detail: raEs.detail ?? raEn.detail,
      links: raEs.links ?? raEn.links,
    };
  });
  const citations = en.citations?.map((cEn, i) => {
    const cEs = es.citations?.[i];
    if (!cEs) return cEn;
    return { label: cEs.label ?? cEn.label, url: cEs.url ?? cEn.url };
  });
  const ingredients = en.ingredients?.map((iEn, i) => {
    const iEs = es.ingredients?.[i];
    if (!iEs) return iEn;
    return {
      name: iEs.name ?? iEn.name,
      label: iEs.label ?? iEn.label,
      researchArea: iEs.researchArea ?? iEn.researchArea,
    };
  });
  return {
    isBlend: en.isBlend,
    bottleImage: es.bottleImage ?? en.bottleImage,
    bottleAlt: es.bottleAlt ?? en.bottleAlt,
    subtitle: es.subtitle ?? en.subtitle,
    summary: es.summary ?? en.summary,
    researchNote: es.researchNote ?? en.researchNote,
    consultationNote: es.consultationNote ?? en.consultationNote,
    ingredients,
    researchAreas,
    citations,
  };
}

function detailFor(title: string, locale: Locale): TopicDetail | undefined {
  const en = details[title];
  if (!en) return undefined;
  return locale === "es" ? mergeDetail(en, detailsEs[title]) : en;
}

/** Locale-aware lookup by topic title (as it appears in topicDetails.json). */
export function getTopicDetailByTitle(
  title: string,
  locale: Locale = "en",
): TopicDetail | undefined {
  return detailFor(title, locale);
}

/**
 * Resolve a peptide's topic page by matching its canonical name or any
 * synonym against the topics catalogue. Falls back to a substring match
 * on topic titles (e.g. Retatrutide → "GLP-3 (retatrutide)").
 */
export function peptideTopic(
  entry: PeptideEntry,
  locale: Locale = "en",
): { slug: string; title: string; detail: TopicDetail } | null {
  const candidates = [entry.canonicalName, ...entry.synonyms];
  for (const c of candidates) {
    const s = slugify(c);
    const title = titleBySlug.get(s);
    const d = title ? detailFor(title, locale) : undefined;
    if (title && d) return { slug: s, title, detail: d };
  }
  for (const [s, title] of titleBySlug) {
    const tLower = title.toLowerCase();
    const d = detailFor(title, locale);
    if (candidates.some((c) => tLower.includes(c.toLowerCase())) && d) {
      return { slug: s, title, detail: d };
    }
  }
  return null;
}

export function peptideTopicByCanonicalName(
  canonicalName: string,
  locale: Locale = "en",
): ReturnType<typeof peptideTopic> {
  const entry = PEPTIDES.find(
    (p) => p.canonicalName.toLowerCase() === canonicalName.toLowerCase(),
  );
  return entry ? peptideTopic(entry, locale) : null;
}
