import type { Metadata } from "next";
import { db } from "@/db";

export const dynamic = "force-dynamic";
import { consultationRequests } from "@/db/schema";
import { desc, ilike, eq, and, or, count } from "drizzle-orm";
import { AdminRequestRow } from "./AdminRequestRow";

export const metadata: Metadata = {
  title: "Admin — Consultation Requests",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function AdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search?.trim() ?? "";
  const statusFilter = params.status ?? "";

  const where = and(
    search
      ? or(
          ilike(consultationRequests.name, `%${search}%`),
          ilike(consultationRequests.email, `%${search}%`),
          ilike(consultationRequests.topic, `%${search}%`)
        )
      : undefined,
    statusFilter &&
      ["new", "contacted", "forwarded", "closed"].includes(statusFilter)
      ? eq(
          consultationRequests.status,
          statusFilter as "new" | "contacted" | "forwarded" | "closed"
        )
      : undefined
  );

  const [requests, [{ total }]] = await Promise.all([
    db
      .select()
      .from(consultationRequests)
      .where(where)
      .orderBy(desc(consultationRequests.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ total: count() })
      .from(consultationRequests)
      .where(where),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const baseParams = new URLSearchParams();
  if (search) baseParams.set("search", search);
  if (statusFilter) baseParams.set("status", statusFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800">
          Consultation Requests{" "}
          <span className="text-stone-400 font-normal text-lg">({total})</span>
        </h1>
        <a
          href="/api/admin/export"
          className="text-sm bg-stone-100 border border-stone-300 text-stone-700 px-4 py-2 rounded hover:bg-stone-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          Export CSV ⚠ contains personal data
        </a>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search name, email, topic…"
          className="border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
          aria-label="Search requests"
        />
        <select
          name="status"
          defaultValue={statusFilter}
          className="border border-stone-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="forwarded">Forwarded</option>
          <option value="closed">Closed</option>
        </select>
        <button
          type="submit"
          className="bg-teal-600 text-white text-sm px-4 py-2 rounded hover:bg-teal-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          Filter
        </button>
        {(search || statusFilter) && (
          <a
            href="/admin"
            className="text-sm text-stone-500 px-4 py-2 hover:text-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
          >
            Clear
          </a>
        )}
      </form>

      {requests.length === 0 ? (
        <p className="text-stone-500 py-12 text-center">No requests found.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <AdminRequestRow key={req.id} request={req} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex gap-2 mt-8 justify-center"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const pParams = new URLSearchParams(baseParams);
            pParams.set("page", String(p));
            return (
              <a
                key={p}
                href={`/admin?${pParams.toString()}`}
                aria-current={p === page ? "page" : undefined}
                className={`px-3 py-1 rounded text-sm border ${
                  p === page
                    ? "bg-teal-600 text-white border-teal-600"
                    : "border-stone-300 text-stone-600 hover:bg-stone-100"
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500`}
              >
                {p}
              </a>
            );
          })}
        </nav>
      )}
    </div>
  );
}
