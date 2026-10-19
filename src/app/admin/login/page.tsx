import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-stone-800 mb-6">Admin sign in</h1>
        <LoginForm />
      </div>
    </div>
  );
}
