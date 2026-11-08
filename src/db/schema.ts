import {
  pgTable,
  text,
  boolean,
  timestamp,
  pgEnum,
  uuid,
  integer,
  bigserial,
  customType,
} from "drizzle-orm/pg-core";

const vector = (name: string, dimensions: number) =>
  customType<{ data: number[]; driverData: string }>({
    dataType() { return `vector(${dimensions})`; },
    toDriver(val: number[]) { return JSON.stringify(val); },
    fromDriver(val: string) { return JSON.parse(val) as number[]; },
  })(name);

export const requestStatusEnum = pgEnum("request_status", [
  "new",
  "contacted",
  "forwarded",
  "closed",
]);

export const consultationRequests = pgTable("consultation_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message"),
  topic: text("topic"),
  consentGiven: boolean("consent_given").notNull(),
  consentText: text("consent_text").notNull(),
  consentedAt: timestamp("consented_at", { withTimezone: true }).notNull(),
  ipHash: text("ip_hash").notNull(),
  status: requestStatusEnum("status").notNull().default("new"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const rateLimits = pgTable("rate_limits", {
  id: uuid("id").primaryKey().defaultRandom(),
  ipHash: text("ip_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ConsultationRequest = typeof consultationRequests.$inferSelect;
export type NewConsultationRequest = typeof consultationRequests.$inferInsert;

export const peptides = pgTable("peptides", {
  id: uuid("id").primaryKey().defaultRandom(),
  canonicalName: text("canonical_name").notNull(),
  synonyms: text("synonyms").array().notNull().default([]),
  category: text("category"),
  fdaStatus: text("fda_status"),
});

export const studyTypeEnum = pgEnum("study_type", [
  "rct",
  "cohort",
  "case_series",
  "in_vitro",
  "animal",
  "review",
  "meta_analysis",
  "other",
]);

export const papers = pgTable("papers", {
  id: uuid("id").primaryKey().defaultRandom(),
  pmid: text("pmid").unique(),
  doi: text("doi").unique(),
  pmcid: text("pmcid"),
  title: text("title"),
  journal: text("journal"),
  pubYear: integer("pub_year"),
  license: text("license"),
  fullTextAvailable: boolean("full_text_available").notNull().default(false),
  species: text("species").array(),
  studyType: studyTypeEnum("study_type"),
  sampleSize: integer("sample_size"),
  evidenceScore: integer("evidence_score"),
  retracted: boolean("retracted").notNull().default(false),
  r2Key: text("r2_key"),
});

export const chunks = pgTable("chunks", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  paperId: uuid("paper_id").references(() => papers.id, { onDelete: "cascade" }),
  section: text("section"),
  content: text("content"),
  embedding: vector("embedding", 1024),
});

export type Peptide = typeof peptides.$inferSelect;
export type NewPeptide = typeof peptides.$inferInsert;
export type Paper = typeof papers.$inferSelect;
export type NewPaper = typeof papers.$inferInsert;
export type Chunk = typeof chunks.$inferSelect;
export type NewChunk = typeof chunks.$inferInsert;
