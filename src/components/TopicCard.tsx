import Link from "next/link";

interface TopicItem {
  title: string;
  researchArea: string;
}

interface TopicCardProps {
  title: string;
  researchArea: string;
  group: string;
}

export function TopicCard({ title, researchArea, group }: TopicCardProps) {
  const params = new URLSearchParams({ topic: `${title} (${group})` });

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4 flex flex-col gap-3 shadow-sm">
      <div>
        <h3 className="font-semibold text-stone-800">{title}</h3>
        <p className="text-sm text-stone-500 mt-0.5">{researchArea}</p>
      </div>
      <Link
        href={`/consultation?${params.toString()}`}
        className="mt-auto text-sm font-medium text-teal-700 border border-teal-300 rounded px-3 py-1.5 hover:bg-teal-50 transition-colors text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      >
        Ask about this topic
      </Link>
    </div>
  );
}
