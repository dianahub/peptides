CREATE TYPE "public"."video_locale" AS ENUM('en', 'es', 'both');--> statement-breakpoint
ALTER TABLE "featured_videos" ADD COLUMN "locale" "video_locale" DEFAULT 'both' NOT NULL;