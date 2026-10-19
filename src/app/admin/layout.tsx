import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-semibold text-stone-700">Futurotek Admin</span>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="text-sm text-stone-500 hover:text-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded px-2 py-1"
          >
            Sign out
          </button>
        </form>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</div>
    </div>
  );
}
