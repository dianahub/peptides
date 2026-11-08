import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "terms" });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-6">
        {t("draft")}
      </p>
      <h1 className="text-3xl font-bold text-stone-900 mb-6">{t("pageTitle")}</h1>
      <div className="space-y-6 text-stone-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">{t("acceptanceTitle")}</h2>
          <p>{t("acceptanceText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">{t("educationalTitle")}</h2>
          <p>
            {t("educationalText1")}{" "}
            <Link href="/disclaimer" className="text-sky-700 underline">
              {t("disclaimerLinkText")}
            </Link>{" "}
            {t("educationalText2")}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">{t("noProductsTitle")}</h2>
          <p>{t("noProductsText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">{t("ipTitle")}</h2>
          <p>{t("ipText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">{t("liabilityTitle")}</h2>
          <p>{t("liabilityText")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">{t("changesTitle")}</h2>
          <p>{t("changesText")}</p>
        </section>

        <p className="text-sm text-stone-500">{t("lastUpdated")}</p>
      </div>
    </div>
  );
}
