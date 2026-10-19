export async function sendAdminNotification(params: {
  name: string;
  email: string;
  topic: string | null;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!apiKey || !adminEmail) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    await resend.emails.send({
      from: "Futurotek <noreply@futurotek.com>",
      to: adminEmail,
      subject: "New consultation request",
      text: [
        `New consultation request received.`,
        `Name: ${params.name}`,
        `Email: ${params.email}`,
        params.topic ? `Topic: ${params.topic}` : null,
        ``,
        `Review at: ${baseUrl}/admin`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch {
    // Silently skip — notifications are optional
  }
}
