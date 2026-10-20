import type { VideoEntry } from "@/types/videos";

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);

    // YouTube (regular, shorts, youtu.be)
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let videoId: string | null = null;
      if (u.hostname.includes("youtu.be")) {
        videoId = u.pathname.slice(1);
      } else if (u.pathname.startsWith("/shorts/")) {
        videoId = u.pathname.split("/shorts/")[1]?.split("/")[0] ?? null;
      } else {
        videoId = u.searchParams.get("v");
      }
      if (!videoId || videoId.startsWith("PLACEHOLDER")) return null;
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }

    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const videoId = u.pathname.split("/").filter(Boolean)[0];
      if (!videoId) return null;
      return `https://player.vimeo.com/video/${videoId}?dnt=1`;
    }
  } catch {
    // ignore
  }
  return null;
}

export function VideoCard({ video }: { video: VideoEntry }) {
  const embedUrl = getEmbedUrl(video.url);

  return (
    <article className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {embedUrl ? (
        <div className="aspect-video">
          <iframe
            src={embedUrl}
            title={video.title}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      ) : (
        <div className="aspect-video bg-stone-100 flex items-center justify-center">
          <p className="text-stone-400 text-sm text-center px-4">
            Video placeholder — replace the URL in{" "}
            <code className="font-mono">src/data/videos.json</code>
          </p>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-stone-800 mb-1">{video.title}</h3>
        <p className="text-sm text-stone-600">{video.description}</p>
      </div>
    </article>
  );
}
