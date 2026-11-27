"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { db } from "@/db";
import { consultationRequests } from "@/db/schema";
import { hashIp } from "@/lib/ip-hash";
import { checkRateLimit, recordRateLimitHit } from "@/lib/rate-limit";
import { sendAdminNotification } from "@/lib/email";

const CONSENT_TEXT_EN =
  "My name, email, and topic of interest will be shared with The Longevity Consultants so they can contact me about a consultation.";
const CONSENT_TEXT_ES =
  "Mi nombre, correo electrónico e interés temático serán compartidos con The Longevity Consultants para que puedan contactarme sobre una consulta.";

function getSchema(isEs: boolean) {
  return z.object({
    name: z.string().min(1, isEs ? "El nombre es requerido" : "Name is required").max(200),
    email: z.string().email(isEs ? "Ingrese un correo electrónico válido" : "Enter a valid email address"),
    phone: z.string().max(30).optional(),
    message: z.string().max(1000, isEs ? "El mensaje debe tener 1000 caracteres o menos" : "Message must be 1000 characters or fewer").optional(),
    topic: z.string().max(500).optional(),
    consent: z.literal("on", {
      error: () => ({ message: isEs ? "Debe aceptar antes de enviar" : "You must agree before submitting" }),
    }),
    website: z.string().max(0, "Bot detected"),
    locale: z.string().optional(),
  });
}

type FormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

export async function submitConsultation(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const locale = (formData.get("locale") as string) || "en";
  const isEs = locale === "es";
  const schema = getSchema(isEs);

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    message: formData.get("message") || undefined,
    topic: formData.get("topic") || undefined,
    consent: formData.get("consent"),
    website: formData.get("website") ?? "",
    locale,
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      if (key === "website") return { error: "Submission blocked." };
      if (key !== "locale") fieldErrors[key] = issue.message;
    }
    if (fieldErrors.consent) {
      return {
        error: isEs
          ? "Debe aceptar la declaración de consentimiento para continuar."
          : "You must agree to the consent statement to continue.",
        fieldErrors,
      };
    }
    return { fieldErrors };
  }

  const headersList = await headers();
  const clientIp =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";
  const ipHash = hashIp(clientIp);

  if (!(await checkRateLimit(ipHash))) {
    return {
      error: isEs
        ? "Demasiadas solicitudes. Por favor intente de nuevo más tarde."
        : "Too many requests. Please try again later.",
    };
  }

  const submittedAt = new Date();
  const consentText = isEs ? CONSENT_TEXT_ES : CONSENT_TEXT_EN;

  try {
    await db.insert(consultationRequests).values({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message ?? null,
      topic: parsed.data.topic ?? null,
      consentGiven: true,
      consentText,
      consentedAt: submittedAt,
      ipHash,
    });
  } catch (err) {
    console.error("[submitConsultation] DB insert failed:", err);
    return {
      error: isEs
        ? "No se pudo enviar su solicitud. Por favor intente de nuevo."
        : "Could not submit your request. Please try again.",
    };
  }

  await recordRateLimitHit(ipHash);

  try {
    await sendAdminNotification({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      message: parsed.data.message ?? null,
      topic: parsed.data.topic ?? null,
      locale: isEs ? "es" : "en",
      submittedAt,
    });
  } catch (err) {
    console.error("[submitConsultation] email notification failed:", err);
  }

  return { success: true };
}
