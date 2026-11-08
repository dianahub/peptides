import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "disclaimer" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function DisclaimerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "disclaimer" });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-6">
        {t("draft")}
      </p>
      <h1 className="text-3xl font-bold text-stone-900 mb-6">{t("pageTitle")}</h1>
      <div className="prose prose-stone max-w-none space-y-4 text-stone-700 leading-relaxed">
        <p>
          {t("p1pre")}
          <strong>{t("p1bold")}</strong>
          {t("p1post")}
        </p>
        <p>{t("p2")}</p>
        <p>{t("p3")}</p>
        <p>{t("p4")}</p>
        <p>{t("p5")}</p>
        <p className="text-sm text-stone-500">{t("lastUpdated")}</p>
      </div>
    </div>
  );
}
