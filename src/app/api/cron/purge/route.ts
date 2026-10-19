import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { consultationRequests, rateLimits } from "@/db/schema";
import { lt } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  const [deletedRequests, deletedRateLimits] = await Promise.all([
    db
      .delete(consultationRequests)
      .where(lt(consultationRequests.createdAt, twelveMonthsAgo))
      .returning({ id: consultationRequests.id }),
    db
      .delete(rateLimits)
      .where(lt(rateLimits.createdAt, sixHoursAgo))
      .returning({ id: rateLimits.id }),
  ]);

  return NextResponse.json({
    ok: true,
    deleted: {
      consultationRequests: deletedRequests.length,
      rateLimits: deletedRateLimits.length,
    },
  });
}
