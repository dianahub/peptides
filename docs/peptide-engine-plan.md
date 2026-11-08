# Peptide Research Engine — Build Plan

Core insight: the hard part isn't the search bar or the AI. It's peptide name normalization and keeping animal data from masquerading as human data.

## Positioning

**"Evidence-graded peptide research, with the animal/human split made explicit."**

Answer: what do we actually know, in what species, at what dose, and how good is the paper? The AI is the interface, not the product.

## Three non-negotiable design decisions

1. **Never let the LLM answer from parametric memory.** Synthesis must be grounded in retrieved chunks with inline citation. Every claim maps to a PMID. If nothing relevant comes back, say so.
2. **Species and study type are first-class fields.** A user searching BPC-157 must see "Rat, n=24, tendon model" on the card.
3. **Own the peptide dictionary first.** Synonyms: BPC-157 = PL 14736 = pentadecapeptide BPC 157 = Body Protection Compound 157. ARA-290 = cibinetide. TB-500 = thymosin beta-4 fragment Ac-LKKTETQ (residues 17-23). Without normalization, recall is garbage and the AI conflates compounds.

## Stack

| Layer | Choice |
|---|---|
| App | Next.js App Router, TypeScript, Tailwind, shadcn/ui |
| DB | Postgres + pgvector (Supabase) |
| Search | tsvector GIN + pgvector HNSW, fused with RRF |
| Rerank | Cohere Rerank or bge-reranker-v2-m3 |
| Embeddings | bge-m3, Voyage, or text-embedding-3-large |
| LLM | Claude Sonnet for synthesis, Claude Haiku for extraction |
| Jobs | Trigger.dev or Inngest |
| Storage | Cloudflare R2 |
| Cache/limits | Upstash Redis |
| Hosting | Vercel (app) + Railway (workers) |

## Data sources

- **PubMed E-utilities**: esearch then efetch (XML). Requires tool and email params; API key allows 10 req/sec. Do not scrape the website.
- **PMC Open Access subset**: only legal bulk full text. Prefer JATS XML over PDF.
- **Europe PMC**: REST API with licensing metadata, includes preprints.
- **ClinicalTrials.gov API v2**: human trials, including recruiting ones.
- **OpenAlex / Semantic Scholar**: citation counts for quality scoring.
- **bioRxiv / medRxiv**: preprints, flagged as unrefereed.

**Licensing:** abstracts OK to display with attribution and PubMed link. Never host non-OA full text. Store each PMC OA article's license and honor NC restrictions.

## Ingestion pipeline

Idempotent, one job per paper, deduped on DOI -> PMID -> normalized title hash.

harvest -> dedupe -> fetch -> parse -> extract -> chunk -> embed -> index

**Parsing:** JATS XML split by section (abstract, methods, results, discussion, limitations). PDF fallback via GROBID. Discard reference lists and figure captions.

**Extraction:** one LLM call, strict JSON, temperature 0:

```json
{
  "species": ["rat", "mouse", "human", "in_vitro"],
  "study_type": "rct | cohort | case_series | animal | in_vitro | review",
  "sample_size": 24,
  "peptide": "BPC-157",
  "dose": "10 µg/kg",
  "route": "intraperitoneal",
  "condition": "Achilles tendon transection",
  "outcomes": [{"measure": "biomechanical strength", "direction": "improved"}],
  "adverse_events": ["none reported"],
  "funding_conflict": "single-lab",
  "retracted": false
}
```

Validate with Zod, reject malformed, log failures. Flag repeated single-research-group papers.

**Chunking:** 600-800 tokens, section-aware, 15% overlap, header on each chunk: `[Peptide: BPC-157 | Species: rat | Study: animal | PMID: 12345678]`.

**Quality gate:** 0-100 evidence score from study type, n, journal tier, citation count, retraction status. Low scorers stay searchable but visually demoted.

## Query pipeline

1. Normalize term to canonical peptide ID; expand synonyms; "did you mean" on fuzzy match.
2. Classify intent: dosing | efficacy | safety | mechanism | human_only | comparison.
3. Hybrid retrieve: BM25 top 50 + vector top 50, Reciprocal Rank Fusion.
4. Filter: species, study type, date range, has full text.
5. Rerank: top 50 -> 12.
6. Synthesize (streaming): bottom line, evidence table, established vs speculative, contradictions, gaps, numbered citations.
7. Grade: evidence badge and human/animal tag on the answer.

**Hard rules for synthesis:** no claim without a citation; state species on every finding; give n and dose where present; say "no human trials" when true; never extrapolate doses across species; separate "Shown in animals" and "Shown in humans" sections.

## Schema sketch

```sql
create table peptides (
  id uuid primary key,
  canonical_name text not null,
  synonyms text[] not null default '{}',
  category text,
  fda_status text
);

create table papers (
  id uuid primary key,
  pmid text unique, doi text unique, pmcid text,
  title text, journal text, pub_year int,
  license text, full_text_available bool default false,
  species text[], study_type text, sample_size int,
  evidence_score int, retracted bool default false,
  r2_key text
);

create table chunks (
  id bigserial primary key,
  paper_id uuid references papers(id) on delete cascade,
  section text, content text,
  embedding vector(1024),
  tsv tsvector generated always as (to_tsvector('english', content)) stored
);

create index on chunks using hnsw (embedding vector_cosine_ops);
create index on chunks using gin (tsv);
```

## Differentiating features

- Evidence badge on every card: "Human RCT", "Human pilot, n=12", "Animal only", "In vitro only".
- Cross-species comparison view.
- Dose translator table; HED conversions flagged as estimates.
- Retraction and paper-mill flag (Crossref + Retraction Watch).
- "Where the evidence stops" panel at the bottom of every synthesis.
- Preprint vs published distinction.

## Legal and honesty layer

- Persistent footer: not medical advice, not a dosing recommendation, no FDA approval implied.
- License badge next to any full-text excerpt.
- "Research use only" banner for non-approved compounds.
- Disclose that AI summaries can err; link every claim to its source.

## Failure modes

| Risk | Fix |
|---|---|
| Hallucinated PMIDs | Validate every cited ID against the DB before render |
| Synonym miss | Fuzzy match, "did you mean", grow dictionary from search logs |
| Animal data read as human | Species in chunk header and prompt, separate sections |
| Dose conflation | Units and species in the same sentence as any dose |
| Retracted papers | Join on retraction table, demote, banner |
| Cost blowout | Query cache, 12-chunk cap, cheap model for follow-ups |

## MVP scope

Healing peptides only, five compounds. Search, cards, evidence badges, cited synthesis. No auth, accounts, saved searches, or API. Ship, watch which queries fail, fix recall before adding anything.
