import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ConsultationFormWrapper } from "./ConsultationFormWrapper";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "consultation" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "consultation" });
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">
        {t("pageTitle")}
      </h1>
      <p className="text-stone-600 mb-8">{t("pageDescription")}</p>

      <Suspense fallback={<div className="text-stone-500">{t("loadingForm")}</div>}>
        <ConsultationFormWrapper />
      </Suspense>
    </div>
  );
}
