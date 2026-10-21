import type { Metadata } from "next";
import { TopicCard } from "@/components/TopicCard";
import topicsData from "@/data/topics.json";

export const metadata: Metadata = {
  title: "Peptide Education Topics — GLP-3, BPC-157, NAD+, Oxytocin & More",
  description:
    "Educational information about peptide and longevity research areas including GLP-3, BPC-157, NAD+, Oxytocin, Epithalon, and more. Independent affiliate of The Longevity Consultants.",
};

const GLOBAL_NOTICE_TOP =
  "Educational information only. Investigational uses may lack FDA approval. Not medical advice or a treatment plan.";
const GLOBAL_NOTICE_BOTTOM = "Discuss any health concerns with a licensed clinician.";

interface TopicGroup {
  group: string;
  groupNote?: string | null;
  groupSubtitle?: string;
  items: { title: string; researchArea: string }[];
}

export default function TopicsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">
        Peptide Education Topics
      </h1>

      {/* Top notice */}
      <div
        role="note"
        className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-sm text-stone-700 mb-8"
      >
        <p>{GLOBAL_NOTICE_TOP}</p>
        <p className="mt-1 font-medium">{GLOBAL_NOTICE_BOTTOM}</p>
      </div>

      <div className="space-y-12">
        {(topicsData as TopicGroup[]).map((group) => (
          <section key={group.group} aria-labelledby={`group-${group.group.replace(/\s+/g, "-").toLowerCase()}`}>
            <div className="mb-4">
              <h2
                id={`group-${group.group.replace(/\s+/g, "-").toLowerCase()}`}
                className="text-xl font-bold text-stone-800"
              >
                {group.group}
                {group.groupSubtitle && (
                  <span className="text-base font-normal text-stone-500 ml-2">
                    — {group.groupSubtitle}
                  </span>
                )}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Investigational uses; benefits and safety uncertain.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((item) => (
                <TopicCard
                  key={`${group.group}-${item.title}`}
                  title={item.title}
                  researchArea={item.researchArea}
                  group={group.group}
                />
              ))}
            </div>

            {group.groupNote && (
              <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                {group.groupNote}
              </p>
            )}
          </section>
        ))}
      </div>

      {/* Bottom notice */}
      <div
        role="note"
        className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-sm text-stone-700 mt-12"
      >
        <p>{GLOBAL_NOTICE_TOP}</p>
        <p className="mt-1 font-medium">{GLOBAL_NOTICE_BOTTOM}</p>
      </div>
    </div>
  );
}
