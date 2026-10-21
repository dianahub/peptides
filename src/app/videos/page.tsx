import type { Metadata } from "next";
import { VideoCard } from "@/components/VideoCard";
import videosData from "@/data/videos.json";
import type { VideoEntry } from "@/types/videos";

export const metadata: Metadata = {
  title: "Peptide & Longevity Education Videos",
  description:
    "Watch educational videos about peptide research, longevity science, and wellness topics from The Longevity Consultants.",
};

export default function VideosPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">
        Educational Videos
      </h1>
      <p className="text-stone-600 mb-8 max-w-2xl">
        These videos share educational information about peptide research and
        longevity science. Content is for informational purposes only and is not
        medical advice.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(videosData as VideoEntry[]).map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
