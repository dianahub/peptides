/**
 * Harvests PubMed papers for a peptide ID, upserts into the papers table.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/harvest-pubmed.ts <peptide-id>
 *
 * Env vars (optional but recommended):
 *   NCBI_API_KEY   — raises rate limit from 3 to 10 req/sec
 *   NCBI_EMAIL     — identifies your tool to NCBI (required by their TOS)
 */

import { XMLParser } from "fast-xml-parser";
import { db } from "../src/db";
import { papers } from "../src/db/schema";
import { PEPTIDES } from "../src/lib/peptides/data";
import { sql } from "drizzle-orm";

const TOOL = "futurotek-peptide-harvester";
const EMAIL = process.env.NCBI_EMAIL ?? "dianahelene@gmail.com";
const API_KEY = process.env.NCBI_API_KEY;
const BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

// ≤10 req/sec with key, ≤3 without — stay safely under with 110 ms gap
const DELAY_MS = API_KEY ? 110 : 340;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function ncbiParams(extra: Record<string, string> = {}): string {
  const p: Record<string, string> = {
    tool: TOOL,
    email: EMAIL,
    retmode: "json",
    ...extra,
  };
  if (API_KEY) p.api_key = API_KEY;
  return new URLSearchParams(p).toString();
}

function buildQuery(canonicalName: string, synonyms: string[]): string {
  const terms = [canonicalName, ...synonyms]
    .map((s) => `"${s}"[tiab]`)
    .join(" OR ");
  return `(${terms})`;
}

// ─── esearch ────────────────────────────────────────────────────────────────

async function esearch(query: string): Promise<string[]> {
  const params = ncbiParams({
    db: "pubmed",
    term: query,
    retmax: "10000",
    usehistory: "n",
  });
  const url = `${BASE}/esearch.fcgi?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`esearch HTTP ${res.status}`);
  const json = (await res.json()) as {
    esearchresult?: { idlist?: string[] };
  };
  return json.esearchresult?.idlist ?? [];
}

// ─── efetch (XML) ────────────────────────────────────────────────────────────

interface ParsedArticle {
  pmid: string;
  doi: string | null;
  pmcid: string | null;
  title: string | null;
  journal: string | null;
  pubYear: number | null;
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) =>
    ["PubmedArticle", "ArticleId", "AbstractText"].includes(name),
});

function coerceString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number") return String(v);
  // fast-xml-parser may return { "#text": "...", "@_...": "..." }
  if (typeof v === "object" && "#text" in (v as object))
    return String((v as Record<string, unknown>)["#text"]).trim() || null;
  return null;
}

function parseArticles(xml: string): ParsedArticle[] {
  const root = xmlParser.parse(xml) as Record<string, unknown>;
  const set = root["PubmedArticleSet"] as Record<string, unknown> | undefined;
  if (!set) return [];

  const articles = (set["PubmedArticle"] as unknown[]) ?? [];
  const results: ParsedArticle[] = [];

  for (const raw of articles) {
    const article = raw as Record<string, unknown>;
    const citation = article["MedlineCitation"] as Record<string, unknown>;
    const pubmedData = article["PubmedData"] as
      | Record<string, unknown>
      | undefined;

    // PMID
    const pmid = coerceString(citation?.["PMID"]);
    if (!pmid) continue;

    // Article block
    const articleBlock = citation?.["Article"] as
      | Record<string, unknown>
      | undefined;
    const title = coerceString(articleBlock?.["ArticleTitle"]);

    // Journal
    const journalBlock = articleBlock?.["Journal"] as
      | Record<string, unknown>
      | undefined;
    const journal = coerceString(journalBlock?.["Title"]);

    // Year — may be under PubDate.Year or MedlineDate
    const pubDate = (journalBlock?.["JournalIssue"] as Record<string, unknown>)
      ?.["PubDate"] as Record<string, unknown> | undefined;
    const yearRaw = coerceString(pubDate?.["Year"]);
    const pubYear = yearRaw ? parseInt(yearRaw, 10) : null;

    // IDs
    let doi: string | null = null;
    let pmcid: string | null = null;
    const idList = (
      (pubmedData?.["ArticleIdList"] as Record<string, unknown>)
        ?.["ArticleId"] as unknown[]
    ) ?? [];
    for (const idNode of idList) {
      const node = idNode as Record<string, unknown>;
      const type = coerceString(node["@_IdType"]);
      const val = coerceString(node["#text"] ?? node);
      if (type === "doi") doi = val;
      if (type === "pmc") pmcid = val;
    }

    results.push({ pmid, doi, pmcid, title, journal, pubYear });
  }

  return results;
}

async function efetch(pmids: string[]): Promise<ParsedArticle[]> {
  // efetch supports up to 500 IDs per request
  const BATCH = 500;
  const all: ParsedArticle[] = [];

  for (let i = 0; i < pmids.length; i += BATCH) {
    if (i > 0) await sleep(DELAY_MS);

    const batch = pmids.slice(i, i + BATCH);
    const params = new URLSearchParams({
      tool: TOOL,
      email: EMAIL,
      db: "pubmed",
      rettype: "abstract",
      retmode: "xml",
      id: batch.join(","),
      ...(API_KEY ? { api_key: API_KEY } : {}),
    });
    const url = `${BASE}/efetch.fcgi?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`efetch HTTP ${res.status}`);
    const xml = await res.text();
    all.push(...parseArticles(xml));
  }

  return all;
}

// ─── upsert ──────────────────────────────────────────────────────────────────

async function upsert(articles: ParsedArticle[]): Promise<number> {
  let count = 0;
  for (const a of articles) {
    // Dedup strategy: DOI first, fall back to PMID
    await db
      .insert(papers)
      .values({
        pmid: a.pmid,
        doi: a.doi ?? undefined,
        pmcid: a.pmcid ?? undefined,
        title: a.title ?? undefined,
        journal: a.journal ?? undefined,
        pubYear: a.pubYear ?? undefined,
      })
      .onConflictDoUpdate({
        target: a.doi ? papers.doi : papers.pmid,
        set: {
          pmid: sql`excluded.pmid`,
          doi: sql`excluded.doi`,
          pmcid: sql`excluded.pmcid`,
          title: sql`excluded.title`,
          journal: sql`excluded.journal`,
          pubYear: sql`excluded.pub_year`,
        },
      });
    count++;
  }
  return count;
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  const peptideId = process.argv[2];
  if (!peptideId) {
    console.error("Usage: harvest-pubmed.ts <peptide-id>");
    process.exit(1);
  }

  const entry = PEPTIDES.find((p) => p.id === peptideId);
  if (!entry) {
    console.error(`Unknown peptide ID: ${peptideId}`);
    console.error("Available:", PEPTIDES.map((p) => p.id).join(", "));
    process.exit(1);
  }

  const query = buildQuery(entry.canonicalName, entry.synonyms);
  console.log("Query:", query);
  console.log(`Rate limit: ${API_KEY ? "10" : "3"} req/sec`);

  console.log("esearch…");
  const pmids = await esearch(query);
  console.log(`Found ${pmids.length} PMIDs`);
  if (pmids.length === 0) return;

  await sleep(DELAY_MS);

  console.log("efetch…");
  const articles = await efetch(pmids);
  console.log(`Parsed ${articles.length} articles`);

  console.log("Upserting…");
  const count = await upsert(articles);
  console.log(`Done — ${count} papers upserted for ${entry.canonicalName}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
