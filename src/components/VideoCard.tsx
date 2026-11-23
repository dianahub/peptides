"use client";

import { useState } from "react";
import type { VideoEntry } from "@/types/videos";

interface EmbedInfo {
  provider: "youtube" | "vimeo";
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
}

function parseEmbed(url: string): EmbedInfo | null {
  try {
    const u = new URL(url);

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
      return {
        provider: "youtube",
        videoId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    }

    if (u.hostname.includes("vimeo.com")) {
      const videoId = u.pathname.split("/").filter(Boolean)[0];
      if (!videoId) return null;
      return {
        provider: "vimeo",
        videoId,
        embedUrl: `https://player.vimeo.com/video/${videoId}?dnt=1&autoplay=1`,
        thumbnailUrl: "",
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export function VideoCard({ video }: { video: VideoEntry }) {
  const info = parseEmbed(video.url);
  const [loaded, setLoaded] = useState(false);

  return (
    <article className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {info ? (
        <div className="aspect-video relative bg-stone-900">
          {loaded ? (
            <iframe
              src={info.embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setLoaded(true)}
              aria-label={`Play video: ${video.title}`}
              className="w-full h-full relative group focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400"
            >
              {info.provider === "youtube" && info.thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={info.thumbnailUrl}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              )}
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
              >
                <span className="flex items-center justify-center w-16 h-16 rounded-full bg-black/75 group-hover:bg-red-600 transition-colors shadow-lg">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-7 h-7 text-white translate-x-0.5"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
              <span className="sr-only">
                Click to load the video player from{" "}
                {info.provider === "youtube" ? "YouTube" : "Vimeo"}.
              </span>
            </button>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-stone-100 flex items-center justify-center">
          <p className="text-stone-400 text-sm text-center px-4">
            Video unavailable
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
