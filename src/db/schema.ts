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
  primaryKey,
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
  fdaIndication: text("fda_indication"),
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
  goals: text("goals").array(),
});

export const chunks = pgTable("chunks", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  paperId: uuid("paper_id").references(() => papers.id, { onDelete: "cascade" }),
  section: text("section"),
  content: text("content"),
  embedding: vector("embedding", 1024),
});

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameEs: text("name_es").notNull(),
  synonymsEn: text("synonyms_en").array().notNull().default([]),
  synonymsEs: text("synonyms_es").array().notNull().default([]),
  conditionTerms: text("condition_terms").array().notNull().default([]),
});

export const peptideGoals = pgTable(
  "peptide_goals",
  {
    peptideId: uuid("peptide_id")
      .notNull()
      .references(() => peptides.id, { onDelete: "cascade" }),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.peptideId, t.goalId] })],
);

export type Peptide = typeof peptides.$inferSelect;
export type NewPeptide = typeof peptides.$inferInsert;
export type Paper = typeof papers.$inferSelect;
export type NewPaper = typeof papers.$inferInsert;
export type Chunk = typeof chunks.$inferSelect;
export type NewChunk = typeof chunks.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type PeptideGoal = typeof peptideGoals.$inferSelect;
export type NewPeptideGoal = typeof peptideGoals.$inferInsert;
