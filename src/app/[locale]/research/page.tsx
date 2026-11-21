import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  searchByGoalOrPeptide,
  listGoalsWithPeptides,
} from "@/lib/search/goal-search";
import { SearchForm } from "./SearchForm";
import { PeptideCard } from "./PeptideCard";

type Lang = "en" | "es";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "research" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ResearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q = "" } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "research" });
  const tGoals = await getTranslations({ locale, namespace: "goals" });

  const lang: Lang = locale === "es" ? "es" : "en";

  const [goals, result] = await Promise.all([
    listGoalsWithPeptides(),
    q.trim() ? searchByGoalOrPeptide(q, lang) : null,
  ]);

  const matchedGoalSlug =
    result?.matched?.kind === "goal" ? result.matched.slug : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <header className="mb-8">
        <h1 className="font-serif text-4xl text-navy">{t("pageTitle")}</h1>
        <p className="mt-3 text-ink/70 max-w-3xl">{t("pageDescription")}</p>
      </header>

      <section className="mb-8">
        <SearchForm initialQuery={q} />
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-navy/70 mb-3">
          {t("goalsHeading")}
        </h2>
        <ul className="flex flex-wrap gap-2" role="list">
          {goals.map((g) => {
            const active = matchedGoalSlug === g.slug;
            return (
              <li key={g.slug}>
                <Link
                  href={{ pathname: "/research", query: { q: g.slug } }}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    active
                      ? "border-navy bg-navy text-white"
                      : "border-navy/20 text-navy hover:bg-navy/5"
                  }`}
                >
                  <span>{tGoals(g.slug as Parameters<typeof tGoals>[0])}</span>
                  <span className={`text-xs ${active ? "text-white/70" : "text-ink/50"}`}>
                    {g.peptideCount}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {result && (
        <section className="mb-10">
          {result.matched?.kind === "goal" && (
            <p className="text-sm text-ink/70 mb-4">
              {t("matchedGoal", {
                goal: tGoals(result.matched.slug as Parameters<typeof tGoals>[0]),
              })}
            </p>
          )}
          {result.matched?.kind === "peptide" && (
            <p className="text-sm text-ink/70 mb-4">
              {t("matchedPeptide", { peptide: result.matched.canonicalName })}
            </p>
          )}
          {!result.matched && (
            <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
              <p>{t("noMatch", { query: result.query })}</p>
              {result.didYouMean && (
                <p className="mt-1">
                  {t("didYouMean", { suggestion: result.didYouMean })}
                </p>
              )}
            </div>
          )}

          {result.matched && result.peptides.length === 0 && (
            <p className="text-sm text-ink/60">{t("noPeptides")}</p>
          )}

          <div className="grid gap-4 mt-4">
            {result.peptides.map((card) => (
              <PeptideCard key={card.id} card={card} />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-12 border-t border-navy/10 pt-6">
        <p className="text-xs text-ink/60">{t("disclaimer")}</p>
      </footer>
    </div>
  );
}
