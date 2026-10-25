"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitConsultation } from "@/app/consultation/actions";
import { AffiliateDisclosure } from "./AffiliateDisclosure";

const CONSENT_TEXT =
  "My name, email, and topic of interest will be shared with The Longevity Consultants so they can contact me about a consultation.";

interface Props {
  defaultTopic?: string;
}

export function ConsultationForm({ defaultTopic }: Props) {
  const [state, formAction, pending] = useActionState(submitConsultation, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state?.success]);

  if (state?.success) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="bg-sage border border-[rgba(20,48,77,0.2)] rounded-xl p-8 text-center"
      >
        <p className="text-2xl mb-2">✓</p>
        <p className="text-lg font-serif text-navy mb-1">Request received — thank you!</p>
        <p className="text-navy-soft text-sm">
          Your consultation request has been submitted. You&apos;ll be contacted
          to schedule a free consultation. In the meantime, feel free to keep
          exploring the educational content on this site.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className="space-y-6"
      aria-label="Free consultation request form"
    >
      {state?.error && (
        <div
          role="alert"
          className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-4 py-2"
        >
          {state.error}
        </div>
      )}

      {/* Honeypot — hidden from real users, must be empty */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website (leave blank)</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <input type="hidden" name="topic" value={defaultTopic ?? "Peptides"} />

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-navy mb-1">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            className="w-full rounded border border-[rgba(20,48,77,0.2)] bg-paper px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-navy-soft focus:border-transparent"
            aria-required="true"
            aria-describedby={state?.fieldErrors?.name ? "name-error" : undefined}
          />
          {state?.fieldErrors?.name && (
            <p id="name-error" className="text-red-600 text-xs mt-1" role="alert">
              {state.fieldErrors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-navy mb-1">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded border border-[rgba(20,48,77,0.2)] bg-paper px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-navy-soft focus:border-transparent"
            aria-required="true"
            aria-describedby={state?.fieldErrors?.email ? "email-error" : undefined}
          />
          {state?.fieldErrors?.email && (
            <p id="email-error" className="text-red-600 text-xs mt-1" role="alert">
              {state.fieldErrors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-navy mb-1">
          Phone <span className="text-navy-soft font-normal">(optional)</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          autoComplete="tel"
          placeholder="+1 (555) 000-0000"
          className="w-full rounded border border-[rgba(20,48,77,0.2)] bg-paper px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-navy-soft focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-navy mb-1">
          Message <span className="text-navy-soft font-normal">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={1000}
          placeholder="Any questions or context you'd like to share…"
          className="w-full rounded border border-[rgba(20,48,77,0.2)] bg-paper px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-navy-soft focus:border-transparent resize-y"
          aria-describedby="message-note"
        />
        <p id="message-note" className="text-xs text-navy-soft mt-1">
          Please don&apos;t include medical or personal health details. Max 1000 characters.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="consent"
          name="consent"
          required
          className="mt-0.5 h-4 w-4 rounded border-[rgba(20,48,77,0.2)] text-navy focus:ring-navy-soft"
          aria-required="true"
          aria-describedby={state?.fieldErrors?.consent ? "consent-error" : "consent-label"}
        />
        <label id="consent-label" htmlFor="consent" className="text-xs text-navy-soft leading-relaxed">
          {CONSENT_TEXT} <span aria-hidden="true">*</span>
        </label>
      </div>
      {state?.fieldErrors?.consent && (
        <p id="consent-error" className="text-red-600 text-xs" role="alert">
          {state.fieldErrors.consent}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto text-white font-medium rounded px-8 py-3 text-sm transition-all hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        style={{ background: "linear-gradient(135deg, #9c6f16 0%, #7c540c 100%)" }}
        aria-busy={pending}
      >
        {pending ? "Submitting…" : "Request free consultation"}
      </button>
    </form>
  );
}
