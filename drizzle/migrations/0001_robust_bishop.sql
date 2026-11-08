CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TYPE "public"."study_type" AS ENUM('rct', 'cohort', 'case_series', 'in_vitro', 'animal', 'review', 'meta_analysis', 'other');--> statement-breakpoint
CREATE TABLE "chunks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"paper_id" uuid,
	"section" text,
	"content" text,
	"embedding" vector(1024)
);
--> statement-breakpoint
CREATE TABLE "papers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pmid" text,
	"doi" text,
	"pmcid" text,
	"title" text,
	"journal" text,
	"pub_year" integer,
	"license" text,
	"full_text_available" boolean DEFAULT false NOT NULL,
	"species" text[],
	"study_type" "study_type",
	"sample_size" integer,
	"evidence_score" integer,
	"retracted" boolean DEFAULT false NOT NULL,
	"r2_key" text,
	CONSTRAINT "papers_pmid_unique" UNIQUE("pmid"),
	CONSTRAINT "papers_doi_unique" UNIQUE("doi")
);
--> statement-breakpoint
CREATE TABLE "peptides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canonical_name" text NOT NULL,
	"synonyms" text[] DEFAULT '{}' NOT NULL,
	"category" text,
	"fda_status" text
);
--> statement-breakpoint
ALTER TABLE "chunks" ADD CONSTRAINT "chunks_paper_id_papers_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."papers"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "chunks" ADD COLUMN "tsv" tsvector GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;
--> statement-breakpoint
CREATE INDEX ON "chunks" USING hnsw ("embedding" vector_cosine_ops) WITH (m = 16, ef_construction = 64);
--> statement-breakpoint
CREATE INDEX ON "chunks" USING gin ("tsv");