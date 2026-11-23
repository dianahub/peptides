"use server";

import { db } from "@/db";
import { featuredVideos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

const inputSchema = z.object({
  topicSlug: z
    .string()
    .trim()
    .min(1, "Topic slug is required")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  youtubeUrl: z.string().trim().url().max(500),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).default(""),
  position: z.coerce.number().int().min(0).max(999).default(0),
});

function parse(formData: FormData) {
  return inputSchema.parse({
    topicSlug: formData.get("topicSlug"),
    youtubeUrl: formData.get("youtubeUrl"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    position: formData.get("position") ?? 0,
  });
}

function revalidateEverywhere(slug: string) {
  revalidatePath("/admin/videos");
  revalidatePath(`/en/topics/${slug}`);
  revalidatePath(`/es/topics/${slug}`);
  revalidatePath("/en/topics");
  revalidatePath("/es/topics");
  revalidatePath("/en/research");
  revalidatePath("/es/research");
}

export async function createFeaturedVideo(formData: FormData) {
  await requireAdmin();
  const data = parse(formData);
  await db.insert(featuredVideos).values({
    topicSlug: data.topicSlug,
    youtubeUrl: data.youtubeUrl,
    title: data.title,
    description: data.description,
    position: data.position,
  });
  revalidateEverywhere(data.topicSlug);
}

export async function updateFeaturedVideo(id: string, formData: FormData) {
  await requireAdmin();
  const uuid = z.string().uuid().parse(id);
  const data = parse(formData);
  await db
    .update(featuredVideos)
    .set({
      topicSlug: data.topicSlug,
      youtubeUrl: data.youtubeUrl,
      title: data.title,
      description: data.description,
      position: data.position,
      updatedAt: new Date(),
    })
    .where(eq(featuredVideos.id, uuid));
  revalidateEverywhere(data.topicSlug);
}

export async function deleteFeaturedVideo(id: string, slug: string) {
  await requireAdmin();
  const uuid = z.string().uuid().parse(id);
  await db.delete(featuredVideos).where(eq(featuredVideos.id, uuid));
  revalidateEverywhere(slug);
}
