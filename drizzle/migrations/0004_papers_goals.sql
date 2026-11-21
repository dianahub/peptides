ALTER TABLE "papers" ADD COLUMN "goals" text[];--> statement-breakpoint
CREATE INDEX "papers_goals_gin" ON "papers" USING gin ("goals");