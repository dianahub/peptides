import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  searchByGoalOrPeptide,
  searchByGoalSlug,
} from "@/lib/search/goal-search";
import { checkRateLimit, recordRateLimitHit } from "@/lib/rate-limit";
import { hashIp } from "@/lib/ip-hash";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const goal = req.nextUrl.searchParams.get("goal")?.trim() ?? "";
  const langParam = req.nextUrl.searchParams.get("lang");
  const lang = langParam === "en" || langParam === "es" ? langParam : undefined;

  if (!q && !goal) {
    return NextResponse.json(
      { error: "q or goal query parameter is required" },
      { status: 400 },
    );
  }

  const headersList = await headers();
  const clientIp =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";
  const ipHash = hashIp(clientIp);

  const allowed = await checkRateLimit(ipHash);
  if (!allowed) {
    return NextResponse.json(
      { error: "too_many_requests" },
      { status: 429, headers: { "Retry-After": "3600" } },
    );
  }
  await recordRateLimitHit(ipHash);

  // goal= takes precedence over q= when both are present (direct lookup is
  // cheaper and bypasses label normalization).
  const result = goal
    ? await searchByGoalSlug(goal, lang)
    : await searchByGoalOrPeptide(q, lang);
  return NextResponse.json(result);
}
