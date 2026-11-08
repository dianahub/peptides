import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VideoCard } from "@/components/VideoCard";
import videosData from "@/data/videos.json";
import type { VideoEntry } from "@/types/videos";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "videos" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function VideosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "videos" });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">
        {t("pageTitle")}
      </h1>
      <p className="text-stone-600 mb-8 max-w-2xl">
        {t("pageDescription")}
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(videosData as VideoEntry[]).map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
