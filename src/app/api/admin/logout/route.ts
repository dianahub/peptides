import { clearSessionCookie } from "@/lib/session";
import { redirect } from "next/navigation";

export async function POST() {
  await clearSessionCookie();
  redirect("/admin/login");
}
