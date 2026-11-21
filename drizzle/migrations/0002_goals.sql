CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name_en" text NOT NULL,
	"name_es" text NOT NULL,
	"synonyms_en" text[] DEFAULT '{}' NOT NULL,
	"synonyms_es" text[] DEFAULT '{}' NOT NULL,
	"condition_terms" text[] DEFAULT '{}' NOT NULL,
	CONSTRAINT "goals_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "peptide_goals" (
	"peptide_id" uuid NOT NULL,
	"goal_id" uuid NOT NULL,
	CONSTRAINT "peptide_goals_peptide_id_goal_id_pk" PRIMARY KEY("peptide_id","goal_id")
);
--> statement-breakpoint
ALTER TABLE "peptide_goals" ADD CONSTRAINT "peptide_goals_peptide_id_peptides_id_fk" FOREIGN KEY ("peptide_id") REFERENCES "public"."peptides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peptide_goals" ADD CONSTRAINT "peptide_goals_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;