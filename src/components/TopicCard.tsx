import Link from "next/link";
import { TopicDetailModal } from "./TopicDetailModal";
import topicDetails from "@/data/topicDetails.json";
import { slugify } from "@/lib/slugify";

interface TopicCardProps {
  title: string;
  researchArea: string;
  group: string;
}

export function TopicCard({ title, researchArea, group }: TopicCardProps) {
  const consultationParams = new URLSearchParams({ topic: `${title} (${group})` });
  const hasDetail = title in topicDetails;
  const isKlow = title === "KLOW";
  const slug = slugify(title);

  return (
    <div className={`bg-white border rounded-lg p-4 flex flex-col gap-3 shadow-sm ${isKlow ? "border-blue-200" : "border-stone-200"}`}>
      <div>
        <Link
          href={`/topics/${slug}`}
          className="font-semibold text-stone-800 hover:text-teal-700 transition-colors focus:outline-none focus-visible:underline"
        >
          {title}
        </Link>
        <p className="text-sm text-stone-500 mt-0.5">{researchArea}</p>
      </div>
      <div className="flex flex-col gap-2 mt-auto">
        {hasDetail ? (
          <TopicDetailModal title={title} group={group} />
        ) : (
          <Link
            href={`/consultation?${consultationParams.toString()}`}
            className="text-sm font-medium text-teal-700 border border-teal-300 rounded px-3 py-1.5 hover:bg-teal-50 transition-colors text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            Ask about this topic
          </Link>
        )}
        <Link
          href={`/topics/${slug}`}
          className="text-xs text-stone-400 hover:text-teal-600 text-center transition-colors"
        >
          Full research page →
        </Link>
      </div>
    </div>
  );
}
