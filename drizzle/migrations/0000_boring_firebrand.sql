CREATE TYPE "public"."request_status" AS ENUM('new', 'contacted', 'forwarded', 'closed');--> statement-breakpoint
CREATE TABLE "consultation_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text,
	"topic" text,
	"consent_given" boolean NOT NULL,
	"consent_text" text NOT NULL,
	"consented_at" timestamp with time zone NOT NULL,
	"ip_hash" text NOT NULL,
	"status" "request_status" DEFAULT 'new' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
