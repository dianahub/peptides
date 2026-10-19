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
        className="bg-teal-50 border border-teal-200 rounded-xl p-8 text-center"
      >
        <svg
          className="mx-auto h-12 w-12 text-teal-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-xl font-semibold text-teal-800 mb-2">
          Request received — thank you!
        </h2>
        <p className="text-stone-600">
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
          className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm"
        >
          {state.error}
        </div>
      )}

      {/* Honeypot — hidden from real users, must be empty */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website (leave blank)</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <input type="hidden" name="topic" value={defaultTopic ?? ""} />

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Full name <span aria-hidden="true">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          autoComplete="name"
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="Your name"
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
        <label
          htmlFor="email"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Email address <span aria-hidden="true">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          autoComplete="email"
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          placeholder="you@example.com"
          aria-required="true"
          aria-describedby={state?.fieldErrors?.email ? "email-error" : undefined}
        />
        {state?.fieldErrors?.email && (
          <p id="email-error" className="text-red-600 text-xs mt-1" role="alert">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      {defaultTopic && (
        <div className="bg-teal-50 border border-teal-200 rounded-md px-4 py-3 text-sm text-teal-800">
          Topic of interest: <strong>{defaultTopic}</strong>
        </div>
      )}

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Message{" "}
          <span className="text-stone-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          maxLength={1000}
          className="w-full border border-stone-300 rounded-md px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y"
          placeholder="Any questions or context you'd like to share…"
          aria-describedby="message-note"
        />
        <p id="message-note" className="text-xs text-stone-400 mt-1">
          Please don&apos;t include medical or personal health details. Max 1000
          characters.
        </p>
      </div>

      <AffiliateDisclosure />

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="consent"
          name="consent"
          required
          className="mt-0.5 h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
          aria-required="true"
          aria-describedby={state?.fieldErrors?.consent ? "consent-error" : "consent-label"}
        />
        <label
          id="consent-label"
          htmlFor="consent"
          className="text-sm text-stone-600"
        >
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
        className="w-full bg-teal-600 text-white font-medium rounded-md px-6 py-3 hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        aria-busy={pending}
      >
        {pending ? "Submitting…" : "Request free consultation"}
      </button>
    </form>
  );
}
