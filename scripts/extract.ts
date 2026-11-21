/**
 * Extracts structured study metadata from paper title + abstract via Claude.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/extract.ts [--limit N] [--peptide ID]
 *
 * Env vars:
 *   ANTHROPIC_API_KEY  — required
 *   EXTRACTION_MODEL   — default "claude-haiku-5-5"
 *   DATABASE_URL       — target DB (use npm run extract:staging for staging)
 */

import postgres from "postgres";
import { z } from "zod";
import { mkdirSync, appendFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { evidenceScore } from "../src/lib/evidence/score";

const MODEL = process.env.EXTRACTION_MODEL ?? "claude-haiku-5-5";
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
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
  "species": ["human" | "rat" | "mouse" | "rabbit" | "dog" | "pig" | "sheep" | "horse" | "primate" | "in_vitro" | "other"],
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
    { id: string; pmid: string | null; title: string | null; abstract: string | null }[]
  >`
    SELECT id, pmid, title, abstract
    FROM papers
    WHERE extraction IS NULL AND pmid IS NOT NULL
    ORDER BY pmid ASC
    LIMIT ${limit}
  `;
  console.log(`Papers to process: ${papers.length}`);
  if (papers.length === 0) {
    await sql.end();
    return;
  }

  let ok = 0;
  let failed = 0;
  let noAbstract = 0;
  const samples: Array<{
    pmid: string;
    title: string;
    extraction: Extraction;
    evidence_score: number;
  }> = [];

  for (const paper of papers) {
    const pmid = paper.pmid!;
    const title = paper.title ?? "";
    const abstract = paper.abstract ?? "";
    if (!abstract) noAbstract++;
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
      const cleaned: Extraction = { ...e, goals: validGoals };

      const score = evidenceScore({
        studyType: e.study_type,
        sampleSize: e.sample_size,
        retracted: e.retracted,
      });

      await sql`
        UPDATE papers
        SET species = ${e.species.length ? e.species : null},
            study_type = ${e.study_type}::study_type,
            sample_size = ${e.sample_size},
            retracted = ${e.retracted},
            goals = ${validGoals.length ? validGoals : null},
            evidence_score = ${score},
            extraction = ${sql.json(cleaned)}
        WHERE id = ${paper.id}
      `;
      ok++;
      if (samples.length < 3) samples.push({ pmid, title, extraction: cleaned, evidence_score: score });
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

  console.log(`\nDone. ok=${ok}, failed=${failed}, missing_abstract=${noAbstract}`);
  if (failed > 0) console.log(`Failures logged to ${FAILURES_FILE}`);
  console.log("\n--- Sample extractions ---");
  for (const s of samples) {
    console.log(`\nPMID ${s.pmid}: ${s.title.slice(0, 100)}`);
    console.log(`evidence_score: ${s.evidence_score}`);
    console.log(JSON.stringify(s.extraction, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
