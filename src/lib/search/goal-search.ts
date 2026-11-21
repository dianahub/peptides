import { db } from "@/db";
import { sql } from "drizzle-orm";
import { PEPTIDES } from "@/lib/peptides/data";
import { lookup as lookupPeptide, didYouMean as peptideDidYouMean } from "@/lib/peptides/normalize";
import { lookupGoal, type Lang } from "@/lib/goals/normalize";
import { evidenceLabel, type EvidenceLabel } from "@/lib/evidence/label";

export interface TopPaper {
  pmid: string | null;
  title: string | null;
  pubYear: number | null;
  species: string[] | null;
  studyType: string | null;
  sampleSize: number | null;
  evidenceScore: number | null;
  pubmedUrl: string | null;
}

export interface PeptideCard {
  id: string;
  canonicalName: string;
  synonyms: string[];
  fdaStatus: string | null;
  fdaIndication: string | null;
  paperCount: number;
  bestEvidence: EvidenceLabel | null;
  topPapers: TopPaper[];
}

export type Matched =
  | { kind: "goal"; slug: string; matchedTerm: string; lang: Lang }
  | { kind: "peptide"; id: string; canonicalName: string };

export interface SearchResult {
  query: string;
  matched: Matched | null;
  didYouMean: string | null;
  peptides: PeptideCard[];
}

type PaperRow = {
  pmid: string | null;
  title: string | null;
  pub_year: number | null;
  species: string[] | null;
  study_type: string | null;
  sample_size: number | null;
  evidence_score: number | null;
} & Record<string, unknown>;

function pubmedUrl(pmid: string | null): string | null {
  return pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : null;
}

function peptideLowerNames(id: string): string[] {
  const p = PEPTIDES.find((x) => x.id === id);
  if (!p) return [];
  return [p.canonicalName, ...p.synonyms].map((s) => s.toLowerCase());
}

/** Build `ARRAY[$1,$2,…]::<type>` from a JS array for use with `ANY(…)`. */
function arrayLiteral(values: string[], pgType: string) {
  if (values.length === 0) return sql`ARRAY[]::${sql.raw(pgType)}[]`;
  const parts = values.map((v, i) => (i === 0 ? sql`${v}` : sql`, ${v}`));
  return sql`ARRAY[${sql.join(parts)}]::${sql.raw(pgType)}[]`;
}

async function paperRowsForPeptide(
  peptideId: string,
  goalSlug: string | null,
  limit: number,
): Promise<PaperRow[]> {
  const names = peptideLowerNames(peptideId);
  if (names.length === 0) return [];

  const nameArr = arrayLiteral(names, "text");

  if (goalSlug) {
    const res = await db.execute<PaperRow>(sql`
      SELECT pmid, title, pub_year, species, study_type::text, sample_size, evidence_score
      FROM papers
      WHERE ${goalSlug} = ANY(goals)
        AND LOWER(extraction->>'peptide') = ANY(${nameArr})
      ORDER BY COALESCE(evidence_score, 0) DESC,
               pub_year DESC NULLS LAST,
               pmid DESC
      LIMIT ${limit}
    `);
    return Array.from(res) as PaperRow[];
  }

  const res = await db.execute<PaperRow>(sql`
    SELECT pmid, title, pub_year, species, study_type::text, sample_size, evidence_score
    FROM papers
    WHERE LOWER(extraction->>'peptide') = ANY(${nameArr})
    ORDER BY COALESCE(evidence_score, 0) DESC,
             pub_year DESC NULLS LAST,
             pmid DESC
    LIMIT ${limit}
  `);
  return Array.from(res) as PaperRow[];
}

async function paperCountForPeptide(
  peptideId: string,
  goalSlug: string | null,
): Promise<number> {
  const names = peptideLowerNames(peptideId);
  if (names.length === 0) return 0;
  const nameArr = arrayLiteral(names, "text");
  if (goalSlug) {
    const res = await db.execute<{ cnt: string } & Record<string, unknown>>(sql`
      SELECT COUNT(*)::text AS cnt FROM papers
      WHERE ${goalSlug} = ANY(goals)
        AND LOWER(extraction->>'peptide') = ANY(${nameArr})
    `);
    const row = Array.from(res)[0] as { cnt: string } | undefined;
    return Number(row?.cnt ?? 0);
  }
  const res = await db.execute<{ cnt: string } & Record<string, unknown>>(sql`
    SELECT COUNT(*)::text AS cnt FROM papers
    WHERE LOWER(extraction->>'peptide') = ANY(${nameArr})
  `);
  const row = Array.from(res)[0] as { cnt: string } | undefined;
  return Number(row?.cnt ?? 0);
}

function toCard(
  entry: (typeof PEPTIDES)[number],
  rows: PaperRow[],
  paperCount: number,
): PeptideCard {
  const topPapers: TopPaper[] = rows.map((r) => ({
    pmid: r.pmid,
    title: r.title,
    pubYear: r.pub_year,
    species: r.species,
    studyType: r.study_type,
    sampleSize: r.sample_size,
    evidenceScore: r.evidence_score,
    pubmedUrl: pubmedUrl(r.pmid),
  }));
  const bestEvidence = rows[0]
    ? evidenceLabel({
        studyType: rows[0].study_type,
        species: rows[0].species,
        sampleSize: rows[0].sample_size,
      })
    : null;
  return {
    id: entry.id,
    canonicalName: entry.canonicalName,
    synonyms: entry.synonyms,
    fdaStatus: entry.fdaStatus ?? null,
    fdaIndication: entry.fdaIndication,
    paperCount,
    bestEvidence,
    topPapers,
  };
}

async function peptidesForGoal(goalSlug: string): Promise<PeptideCard[]> {
  const rows = await db.execute<{ peptide_id: string } & Record<string, unknown>>(sql`
    SELECT pg.peptide_id
    FROM peptide_goals pg
    JOIN goals g ON g.id = pg.goal_id
    WHERE g.slug = ${goalSlug}
  `);
  const ids = Array.from(rows).map((r) => (r as { peptide_id: string }).peptide_id);
  if (ids.length === 0) return [];

  // Map DB peptide ids → local PEPTIDES entries by canonical_name join.
  // DB stores uuids; data.ts uses slug ids. We match via canonical_name.
  const idArr = arrayLiteral(ids, "uuid");
  const names = await db.execute<{ id: string; canonical_name: string } & Record<string, unknown>>(sql`
    SELECT id::text AS id, canonical_name FROM peptides
    WHERE id = ANY(${idArr})
  `);
  const nameById = new Map<string, string>();
  for (const r of Array.from(names) as { id: string; canonical_name: string }[]) {
    nameById.set(r.id, r.canonical_name);
  }

  const cards: PeptideCard[] = [];
  for (const dbId of ids) {
    const canonical = nameById.get(dbId);
    if (!canonical) continue;
    const entry = PEPTIDES.find(
      (p) => p.canonicalName.toLowerCase() === canonical.toLowerCase(),
    );
    if (!entry) continue;
    const [papers, paperCount] = await Promise.all([
      paperRowsForPeptide(entry.id, goalSlug, 3),
      paperCountForPeptide(entry.id, goalSlug),
    ]);
    cards.push(toCard(entry, papers, paperCount));
  }
  // Order by paper count desc, then canonical name.
  cards.sort((a, b) =>
    b.paperCount - a.paperCount || a.canonicalName.localeCompare(b.canonicalName),
  );
  return cards;
}

async function cardForPeptide(peptideId: string): Promise<PeptideCard | null> {
  const entry = PEPTIDES.find((p) => p.id === peptideId);
  if (!entry) return null;
  const [papers, paperCount] = await Promise.all([
    paperRowsForPeptide(entry.id, null, 3),
    paperCountForPeptide(entry.id, null),
  ]);
  return toCard(entry, papers, paperCount);
}

/** Core search: goal → peptide fallback → empty with didYouMean. */
export async function searchByGoalOrPeptide(
  query: string,
  lang?: Lang,
): Promise<SearchResult> {
  // NFC-normalize to canonicalize any decomposed input from browsers/URL layer
  // before trimming; normalize lib already NFD-strips combining marks internally.
  const trimmed = query.normalize("NFC").trim();
  if (!trimmed) {
    return { query, matched: null, didYouMean: null, peptides: [] };
  }

  const goalMatch = lookupGoal(trimmed, lang);
  if (goalMatch.found) {
    const peptides = await peptidesForGoal(goalMatch.slug);
    return {
      query,
      matched: {
        kind: "goal",
        slug: goalMatch.slug,
        matchedTerm: goalMatch.matchedTerm,
        lang: goalMatch.lang,
      },
      didYouMean: null,
      peptides,
    };
  }

  const pepMatch = lookupPeptide(trimmed);
  if (pepMatch.found) {
    const card = await cardForPeptide(pepMatch.id);
    const entry = PEPTIDES.find((p) => p.id === pepMatch.id);
    return {
      query,
      matched: entry
        ? { kind: "peptide", id: pepMatch.id, canonicalName: entry.canonicalName }
        : null,
      didYouMean: null,
      peptides: card ? [card] : [],
    };
  }

  // Neither matched — try to suggest a peptide name as a hint.
  return {
    query,
    matched: null,
    didYouMean: peptideDidYouMean(trimmed),
    peptides: [],
  };
}

export interface GoalForMenu {
  slug: string;
  peptideCount: number;
}

/** Goals with ≥1 linked peptide, for the research-page button bar. */
export async function listGoalsWithPeptides(): Promise<GoalForMenu[]> {
  const rows = await db.execute<{ slug: string; cnt: string } & Record<string, unknown>>(sql`
    SELECT g.slug, COUNT(pg.peptide_id)::text AS cnt
    FROM goals g
    LEFT JOIN peptide_goals pg ON pg.goal_id = g.id
    GROUP BY g.slug
    HAVING COUNT(pg.peptide_id) > 0
    ORDER BY COUNT(pg.peptide_id) DESC, g.slug ASC
  `);
  return (Array.from(rows) as { slug: string; cnt: string }[]).map((r) => ({
    slug: r.slug,
    peptideCount: Number(r.cnt),
  }));
}
