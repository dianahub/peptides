"use client";

import { useSearchParams } from "next/navigation";
import { ConsultationForm } from "@/components/ConsultationForm";

export function ConsultationFormWrapper() {
  const params = useSearchParams();
  const topic = params.get("topic") ?? undefined;
  return <ConsultationForm defaultTopic={topic} />;
}
