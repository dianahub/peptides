import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sourcing" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function SourcingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "sourcing" });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">{t("pageTitle")}</h1>

      <section className="space-y-4 text-stone-700 leading-relaxed">
        <p>{t("intro")}</p>

        <ul className="list-disc pl-6 space-y-2">
          <li>{t("criteriaTesting")}</li>
          <li>{t("criteriaCOA")}</li>
          <li>{t("criteriaStorage")}</li>
          <li>{t("criteriaLegal")}</li>
        </ul>

        <p className="text-sm text-stone-500">{t("notRecommendation")}</p>
      </section>

      <section
        className="mt-10 rounded-lg border p-6"
        style={{ background: "#f6f1e4", borderColor: "rgba(20,48,77,0.16)" }}
        aria-labelledby="partner-heading"
      >
        <p className="text-xs uppercase tracking-wide text-navy-soft mb-2">
          {t("partnerLabel")}
        </p>
        <h2 id="partner-heading" className="text-2xl font-semibold text-stone-900 mb-2">
          Miami BioTides
        </h2>
        <p className="text-stone-700 leading-relaxed mb-4">{t("partnerBlurb")}</p>

        <div className="rounded-md bg-white/60 border border-stone-200 px-4 py-3 mb-4">
          <p className="text-sm text-stone-700 mb-1">{t("codeLabel")}</p>
          <p className="text-lg font-mono font-semibold text-navy tracking-wider">
            DIANA15
          </p>
          <p className="text-xs text-stone-500 mt-1">{t("codeNote")}</p>
        </div>

        <a
          href="https://miamibiotides.com"
          rel="sponsored noopener"
          target="_blank"
          className="inline-block rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors"
        >
          {t("visitPartner")} ↗
        </a>

        <p
          className="text-xs text-navy-soft border-l-2 pl-3 mt-5"
          style={{ borderColor: "rgba(20,48,77,0.25)" }}
          role="note"
        >
          <strong className="text-navy">{t("disclosureLabel")}</strong>{" "}
          {t("disclosureText")}
        </p>
      </section>

      <section className="mt-8 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm text-amber-800">
          <strong>{t("ruoLabel")}</strong> {t("ruoText")}
        </p>
      </section>

      <p className="text-sm text-stone-500 mt-8">{t("lastUpdated")}</p>
    </div>
  );
}
