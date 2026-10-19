import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { db } from "@/db";
import { consultationRequests } from "@/db/schema";
import { desc } from "drizzle-orm";

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(consultationRequests)
    .orderBy(desc(consultationRequests.createdAt));

  const headers = [
    "id",
    "name",
    "email",
    "topic",
    "message",
    "status",
    "consent_given",
    "consented_at",
    "notes",
    "created_at",
  ];

  const csvRows = rows.map((r) =>
    [
      escapeCsv(r.id),
      escapeCsv(r.name),
      escapeCsv(r.email),
      escapeCsv(r.topic),
      escapeCsv(r.message),
      escapeCsv(r.status),
      escapeCsv(String(r.consentGiven)),
      escapeCsv(r.consentedAt.toISOString()),
      escapeCsv(r.notes),
      escapeCsv(r.createdAt.toISOString()),
    ].join(",")
  );

  const csv = [headers.join(","), ...csvRows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="consultation-requests-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
