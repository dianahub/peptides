import { Resend } from "resend";

interface AdminNotificationParams {
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  topic: string | null;
  locale: "en" | "es";
  submittedAt: Date;
}

export async function sendAdminNotification(
  params: AdminNotificationParams
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!apiKey || !adminEmail) {
    console.warn(
      "[sendAdminNotification] RESEND_API_KEY or ADMIN_EMAIL not set; skipping email"
    );
    return;
  }

  const resend = new Resend(apiKey);

  const language = params.locale === "es" ? "Spanish (es)" : "English (en)";
  const lines = [
    `New consultation request submitted.`,
    ``,
    `Name: ${params.name}`,
    `Email: ${params.email}`,
    params.phone ? `Phone: ${params.phone}` : null,
    params.topic ? `Topic: ${params.topic}` : null,
    `Language: ${language}`,
    `Submitted: ${params.submittedAt.toISOString()}`,
    ``,
    `Message:`,
    params.message ? params.message : "(none)",
  ].filter((l): l is string => l !== null);

  const { error } = await resend.emails.send({
    from: "Futurotek <noreply@futurotek.com>",
    to: adminEmail,
    replyTo: params.email,
    subject: `New consultation request: ${params.name}`,
    text: lines.join("\n"),
  });

  if (error) {
    console.error("[sendAdminNotification] Resend error:", error);
    throw new Error(
      `Resend send failed: ${error.message ?? JSON.stringify(error)}`
    );
  }
}
