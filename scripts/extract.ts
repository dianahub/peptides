/**
 * Extracts structured study metadata from paper title + abstract via Claude.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/extract.ts [--limit N] [--peptide ID]
 *
 * Env vars:
 *   ANTHROPIC_API_KEY  — required
 *   EXTRACTION_MODEL   — default "claude-haiku-5-5"
 *   NCBI_API_KEY       — optional; raises PubMed rate limit
 *   DATABASE_URL       — the DB to update (set this to STAGING_DATABASE_URL
 *                        for staging runs)
 */

import { XMLParser } from "fast-xml-parser";
import postgres from "postgres";
import { z } from "zod";
import { writeFileSync, mkdirSync, appendFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const MODEL = process.env.EXTRACTION_MODEL ?? "claude-haiku-5-5";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const NCBI_KEY = process.env.NCBI_API_KEY;
const NCBI_EMAIL = process.env.NCBI_EMAIL ?? "dianahelene@gmail.com";
const DB_URL = process.env.DATABASE_URL;

const FAILURES_FILE = resolve(process.cwd(), "logs/extract-failures.log");

const STUDY_TYPES = [
  "rct",
  "cohort",
  "case_series",
  "in_vitro",
  "animal",
  "review",
  "meta_analysis",
  "other",
] as const;

const GOAL_SLUG_PATTERN = /^[a-z][a-z0-9-]*$/;

const ExtractionSchema = z.object({
  species: z.array(z.string()).default([]),
  study_type: z.enum(STUDY_TYPES),
  sample_size: z.number().int().positive().nullable(),
  peptide: z.string().nullable(),
  dose: z.string().nullable(),
  route: z.string().nullable(),
  condition: z.string().nullable(),
  outcomes: z
    .array(
      z.object({
        measure: z.string(),
        direction: z.string(),
      }),
    )
    .default([]),
  adverse_events: z.array(z.string()).default([]),
  funding_conflict: z.string().nullable(),
  retracted: z.boolean().default(false),
  goals: z.array(z.string().regex(GOAL_SLUG_PATTERN)).default([]),
});

type Extraction = z.infer<typeof ExtractionSchema>;

// ─── PubMed abstract fetch ──────────────────────────────────────────────────

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) => ["PubmedArticle", "AbstractText"].includes(name),
});

function coerceString(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (typeof v === "object" && "#text" in (v as object))
    return String((v as Record<string, unknown>)["#text"]);
  return "";
}

async function fetchAbstracts(pmids: string[]): Promise<Record<string, string>> {
  if (pmids.length === 0) return {};
  const params = new URLSearchParams({
    tool: "futurotek-peptide-extract",
    email: NCBI_EMAIL,
    db: "pubmed",
    rettype: "abstract",
    retmode: "xml",
    id: pmids.join(","),
    ...(NCBI_KEY ? { api_key: NCBI_KEY } : {}),
  });
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`efetch HTTP ${res.status}`);
  const xml = await res.text();

  const root = xmlParser.parse(xml) as Record<string, unknown>;
  const set = root["PubmedArticleSet"] as Record<string, unknown> | undefined;
  const articles = (set?.["PubmedArticle"] as unknown[]) ?? [];
  const out: Record<string, string> = {};

  for (const raw of articles) {
    const article = raw as Record<string, unknown>;
    const citation = article["MedlineCitation"] as Record<string, unknown>;
    const pmid = coerceString(citation?.["PMID"]).trim();
    if (!pmid) continue;

    const articleBlock = citation?.["Article"] as Record<string, unknown> | undefined;
    const abstractBlock = articleBlock?.["Abstract"] as
      | Record<string, unknown>
      | undefined;
    const abstractTexts = (abstractBlock?.["AbstractText"] as unknown[]) ?? [];

    const parts: string[] = [];
    for (const node of abstractTexts) {
      if (typeof node === "string") parts.push(node);
      else if (typeof node === "object" && node) {
        const label = coerceString((node as Record<string, unknown>)["@_Label"]);
        const text = coerceString((node as Record<string, unknown>)["#text"]);
        parts.push(label ? `${label}: ${text}` : text);
      }
    }
    out[pmid] = parts.join("\n").trim();
  }
  return out;
}

// ─── Claude API ──────────────────────────────────────────────────────────────

interface ClaudeResponse {
  content?: Array<{ type: string; text?: string }>;
  error?: { type: string; message: string };
}

async function callClaude(
  title: string,
  abstract: string,
  goalSlugs: string[],
): Promise<unknown> {
  const system = `You extract structured metadata from biomedical paper title + abstract into strict JSON. Be deterministic and conservative — never guess fields not supported by the text. Use null (or empty array) when unknown.

Available goal slugs (map "condition" to the applicable subset): ${goalSlugs.join(", ")}

Output ONLY JSON matching this shape (no prose, no code fences):
{
  "species": ["rat" | "mouse" | "human" | "in_vitro" | "pig" | "dog" | "other"],
  "study_type": "rct" | "cohort" | "case_series" | "in_vitro" | "animal" | "review" | "meta_analysis" | "other",
  "sample_size": <int or null>,
  "peptide": "<canonical name or null>",
  "dose": "<with units or null>",
  "route": "<admin route or null>",
  "condition": "<clinical/experimental condition or null>",
  "outcomes": [{"measure": "...", "direction": "improved|worsened|unchanged|mixed|other"}],
  "adverse_events": ["..."],
  "funding_conflict": "<string or null>",
  "retracted": false,
  "goals": ["<slug from the list above>", ...]
}`;

  const user = `Title: ${title}\n\nAbstract:\n${abstract || "(no abstract available)"}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (res.status === 404) {
    const body = await res.text();
    throw new Error(`MODEL_NOT_FOUND:${MODEL}:${body}`);
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic HTTP ${res.status}: ${body}`);
  }

  const json = (await res.json()) as ClaudeResponse;
  if (json.error) throw new Error(`Anthropic: ${json.error.type}: ${json.error.message}`);

  const text = json.content?.find((c) => c.type === "text")?.text ?? "";
  // Strip code fences if the model wraps the JSON.
  const stripped = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(stripped);
}

// ─── preflight ──────────────────────────────────────────────────────────────

async function preflightModel(): Promise<void> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8,
      messages: [{ role: "user", content: "Reply with: ok" }],
    }),
  });
  if (res.status === 404) {
    const body = await res.text();
    console.error(`❌ Model preflight 404 for "${MODEL}"`);
    console.error(body);
    console.error("\nStopping — set EXTRACTION_MODEL to a valid model and retry.");
    process.exit(1);
  }
  if (!res.ok) {
    const body = await res.text();
    console.error(`❌ Preflight failed HTTP ${res.status}: ${body}`);
    process.exit(1);
  }
  console.log(`✓ Model "${MODEL}" reachable`);
}

// ─── main ────────────────────────────────────────────────────────────────────

function logFailure(pmid: string, reason: string, detail: unknown) {
  mkdirSync(dirname(FAILURES_FILE), { recursive: true });
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    pmid,
    reason,
    detail: detail instanceof Error ? detail.message : detail,
  });
  appendFileSync(FAILURES_FILE, line + "\n");
}

interface CLIArgs {
  limit: number;
}

function parseArgs(argv: string[]): CLIArgs {
  let limit = 20;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--limit") {
      limit = parseInt(argv[++i] ?? "20", 10);
    }
  }
  return { limit };
}

async function main() {
  if (!ANTHROPIC_KEY) {
    console.error("ANTHROPIC_API_KEY not set");
    process.exit(1);
  }
  if (!DB_URL) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const { limit } = parseArgs(process.argv.slice(2));

  console.log(`Model: ${MODEL}`);
  await preflightModel();

  const sql = postgres(DB_URL, { ssl: "require", max: 1 });

  // Pull known goal slugs so the LLM is constrained to real values.
  const goals = await sql<{ slug: string }[]>`SELECT slug FROM goals ORDER BY slug`;
  const goalSlugs = goals.map((g) => g.slug);
  console.log(`Known goals: ${goalSlugs.join(", ")}`);

  const papers = await sql<
    { id: string; pmid: string | null; title: string | null }[]
  >`
    SELECT id, pmid, title
    FROM papers
    WHERE study_type IS NULL AND pmid IS NOT NULL
    ORDER BY pmid ASC
    LIMIT ${limit}
  `;
  console.log(`Papers to process: ${papers.length}`);
  if (papers.length === 0) {
    await sql.end();
    return;
  }

  const pmids = papers.map((p) => p.pmid!).filter(Boolean);
  console.log("Fetching abstracts…");
  const abstracts = await fetchAbstracts(pmids);

  let ok = 0;
  let failed = 0;
  const samples: Array<{ pmid: string; title: string; extraction: Extraction }> = [];

  for (const paper of papers) {
    const pmid = paper.pmid!;
    const title = paper.title ?? "";
    const abstract = abstracts[pmid] ?? "";
    try {
      const raw = await callClaude(title, abstract, goalSlugs);
      const parsed = ExtractionSchema.safeParse(raw);
      if (!parsed.success) {
        failed++;
        logFailure(pmid, "zod_validation", { raw, issues: parsed.error.issues });
        console.log(`  ✗ ${pmid}: zod failed (${parsed.error.issues.length} issues)`);
        continue;
      }
      const e = parsed.data;

      // Drop unknown goal slugs rather than failing the whole row.
      const validGoals = e.goals.filter((g) => goalSlugs.includes(g));

      await sql`
        UPDATE papers
        SET species = ${e.species.length ? e.species : null},
            study_type = ${e.study_type}::study_type,
            sample_size = ${e.sample_size},
            retracted = ${e.retracted},
            goals = ${validGoals.length ? validGoals : null}
        WHERE id = ${paper.id}
      `;
      ok++;
      if (samples.length < 3) samples.push({ pmid, title, extraction: { ...e, goals: validGoals } });
    } catch (err) {
      failed++;
      logFailure(pmid, "api_or_parse", err);
      console.log(`  ✗ ${pmid}: ${err instanceof Error ? err.message.slice(0, 120) : err}`);
      // Fatal: if the model id is bad we stop here.
      if (err instanceof Error && err.message.startsWith("MODEL_NOT_FOUND:")) {
        console.error("\nStopping — see above.");
        await sql.end();
        process.exit(1);
      }
    }
  }

  await sql.end();

  console.log(`\nDone. ok=${ok}, failed=${failed}`);
  if (failed > 0) console.log(`Failures logged to ${FAILURES_FILE}`);
  console.log("\n--- Sample extractions ---");
  for (const s of samples) {
    console.log(`\nPMID ${s.pmid}: ${s.title.slice(0, 100)}`);
    console.log(JSON.stringify(s.extraction, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
