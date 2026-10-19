"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { createSession, setSessionCookie } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { and, gte, count, eq } from "drizzle-orm";
import { hashIp } from "@/lib/ip-hash";
import { headers } from "next/headers";

type LoginState = { error: string } | null;

const MAX_LOGIN_ATTEMPTS = 10;

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = z
    .object({
      email: z.string().email(),
      password: z.string().min(1),
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

  if (!parsed.success) {
    return { error: "Invalid email or password." };
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";
  const ipHash = hashIp(`login:${ip}`);

  // Rate limit login attempts
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [{ total }] = await db
    .select({ total: count() })
    .from(rateLimits)
    .where(
      and(eq(rateLimits.ipHash, ipHash), gte(rateLimits.createdAt, oneHourAgo))
    );

  if (total >= MAX_LOGIN_ATTEMPTS) {
    return { error: "Too many attempts. Try again later." };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminHash) {
    return { error: "Admin credentials not configured." };
  }

  const emailMatch = parsed.data.email === adminEmail;
  const passwordMatch = await bcrypt.compare(parsed.data.password, adminHash);

  if (!emailMatch || !passwordMatch) {
    await db.insert(rateLimits).values({ ipHash });
    return { error: "Invalid email or password." };
  }

  const token = await createSession(adminEmail);
  await setSessionCookie(token);
  redirect("/admin");
}
