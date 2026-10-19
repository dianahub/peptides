import { db } from "@/db";
import { rateLimits } from "@/db/schema";
import { and, gte, count, eq } from "drizzle-orm";

const MAX_PER_HOUR = 5;

export async function checkRateLimit(ipHash: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [result] = await db
    .select({ total: count() })
    .from(rateLimits)
    .where(
      and(
        eq(rateLimits.ipHash, ipHash),
        gte(rateLimits.createdAt, oneHourAgo)
      )
    );
  return (result?.total ?? 0) < MAX_PER_HOUR;
}

export async function recordRateLimitHit(ipHash: string): Promise<void> {
  await db.insert(rateLimits).values({ ipHash });
}
