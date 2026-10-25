"use server";

import { z } from "zod";
import { headers } from "next/headers";

const CONSENT_TEXT =
  "My name, email, and topic of interest will be shared with The Longevity Consultants so they can contact me about a consultation.";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Enter a valid email address"),
  message: z.string().max(1000, "Message must be 1000 characters or fewer").optional(),
  topic: z.string().max(500).optional(),
  consent: z.literal("on", {
    error: () => ({ message: "You must agree before submitting" }),
  }),
  website: z.string().max(0, "Bot detected"), // honeypot
});

type FormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

const LEAD_API = process.env.LEAD_API_URL ?? "https://futurotekhealth.com/api/lead";

export async function submitConsultation(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message") || undefined,
    topic: formData.get("topic") || undefined,
    consent: formData.get("consent"),
    website: formData.get("website") ?? "",
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      if (key === "website") return { error: "Submission blocked." };
      fieldErrors[key] = issue.message;
    }
    if (fieldErrors.consent) {
      return { error: "You must agree to the consent statement to continue.", fieldErrors };
    }
    return { fieldErrors };
  }

  const headersList = await headers();
  const clientIp =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  try {
    const res = await fetch(LEAD_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-IP": clientIp,
      },
      body: JSON.stringify({
        name: parsed.data.name,
        email: parsed.data.email,
        interest: parsed.data.topic ?? "Peptides",
        source: "peptides",
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) return { error: "Too many requests. Please try again later." };
      console.error("[submitConsultation] API error:", res.status, data);
      return { error: "Something went wrong. Please try again." };
    }
  } catch (err) {
    console.error("[submitConsultation] fetch error:", err);
    return { error: "Could not submit your request. Please try again." };
  }

  return { success: true };
}
