import {
  pgTable,
  text,
  boolean,
  timestamp,
  pgEnum,
  uuid,
  integer,
} from "drizzle-orm/pg-core";

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
