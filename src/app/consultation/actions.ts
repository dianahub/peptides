"use server";

import { z } from "zod";
import { headers } from "next/headers";

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

const LEAD_API = process.env.LEAD_API_URL ?? "https://futurotekhealth.com/api/lead";

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
        phone: parsed.data.phone ?? undefined,
        interest: parsed.data.topic ?? "Peptides",
        message: parsed.data.message ?? undefined,
        source: "peptides",
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) {
        return {
          error: isEs
            ? "Demasiadas solicitudes. Por favor intente de nuevo más tarde."
            : "Too many requests. Please try again later.",
        };
      }
      console.error("[submitConsultation] API error:", res.status, data);
      return {
        error: isEs
          ? "Algo salió mal. Por favor intente de nuevo."
          : "Something went wrong. Please try again.",
      };
    }
  } catch (err) {
    console.error("[submitConsultation] fetch error:", err);
    return {
      error: isEs
        ? "No se pudo enviar su solicitud. Por favor intente de nuevo."
        : "Could not submit your request. Please try again.",
    };
  }

  return { success: true };
}
