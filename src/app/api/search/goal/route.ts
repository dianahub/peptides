import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { searchByGoalOrPeptide } from "@/lib/search/goal-search";
import { checkRateLimit, recordRateLimitHit } from "@/lib/rate-limit";
import { hashIp } from "@/lib/ip-hash";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const langParam = req.nextUrl.searchParams.get("lang");
  const lang = langParam === "en" || langParam === "es" ? langParam : undefined;

  if (!q) {
    return NextResponse.json(
      { error: "q query parameter is required" },
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

  const result = await searchByGoalOrPeptide(q, lang);
  return NextResponse.json(result);
}
