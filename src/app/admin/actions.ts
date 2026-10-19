"use server";

import { db } from "@/db";
import { consultationRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function updateRequestStatus(
  id: string,
  status: "new" | "contacted" | "forwarded" | "closed"
) {
  await requireAdmin();
  await db
    .update(consultationRequests)
    .set({ status, updatedAt: new Date() })
    .where(eq(consultationRequests.id, id));
  revalidatePath("/admin");
}

export async function updateRequestNotes(id: string, notes: string) {
  await requireAdmin();
  await db
    .update(consultationRequests)
    .set({ notes: notes || null, updatedAt: new Date() })
    .where(eq(consultationRequests.id, id));
  revalidatePath("/admin");
}

export async function deleteRequest(id: string) {
  await requireAdmin();
  const parsed = z.string().uuid().safeParse(id);
  if (!parsed.success) throw new Error("Invalid ID");
  await db
    .delete(consultationRequests)
    .where(eq(consultationRequests.id, id));
  revalidatePath("/admin");
}
