import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "privacy" });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-6">
        {t("draft")}
      </p>
      <h1 className="text-3xl font-bold text-stone-900 mb-6">{t("pageTitle")}</h1>
      <div className="space-y-6 text-stone-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">{t("collectTitle")}</h2>
          <p>{t("collectText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">{t("useTitle")}</h2>
          <p>{t("useText1")}</p>
          <p className="mt-2">{t("useText2")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">{t("retentionTitle")}</h2>
          <p>{t("retentionText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">{t("rightsTitle")}</h2>
          <p>{t("rightsText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">{t("securityTitle")}</h2>
          <p>{t("securityText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">{t("contactTitle")}</h2>
          <p>{t("contactText")}</p>
        </section>

        <p className="text-sm text-stone-500">{t("lastUpdated")}</p>
      </div>
    </div>
  );
}
