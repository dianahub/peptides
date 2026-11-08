import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">{t("pageTitle")}</h1>

      <div className="bg-stone-100 border border-stone-300 rounded-md px-4 py-3 text-sm text-stone-500 mb-6">
        <strong>{t("placeholderLabel")}</strong> {t("placeholderText")}
      </div>
      <p className="text-stone-600 mb-8 leading-relaxed">{t("bioText")}</p>

      <div className="border-t border-stone-200 pt-8">
        <h2 className="text-xl font-semibold text-stone-800 mb-3">
          {t("affiliateTitle")}
        </h2>
        <p className="text-stone-600 leading-relaxed">{t("affiliateText1")}</p>
        <p className="text-stone-600 leading-relaxed mt-3">{t("affiliateText2")}</p>
      </div>
    </div>
  );
}
