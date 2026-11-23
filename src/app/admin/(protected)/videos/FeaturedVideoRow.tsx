"use client";

import { useState, useTransition } from "react";
import { updateFeaturedVideo, deleteFeaturedVideo } from "./actions";
import type { FeaturedVideo } from "@/db/schema";

export function FeaturedVideoRow({ video }: { video: FeaturedVideo }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (editing) {
    return (
      <tr className="border-t border-stone-200 bg-sky-50">
        <td colSpan={7} className="px-3 py-3">
          <form
            action={(fd) =>
              startTransition(async () => {
                await updateFeaturedVideo(video.id, fd);
                setEditing(false);
              })
            }
            className="grid gap-2 sm:grid-cols-6"
          >
            <input
              name="topicSlug"
              defaultValue={video.topicSlug}
              placeholder="topic slug"
              required
              className="border border-stone-300 rounded px-2 py-1 text-sm"
            />
            <select
              name="locale"
              defaultValue={video.locale}
              className="border border-stone-300 rounded px-2 py-1 text-sm"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="both">Both</option>
            </select>
            <input
              name="youtubeUrl"
              defaultValue={video.youtubeUrl}
              placeholder="https://youtube.com/..."
              required
              className="border border-stone-300 rounded px-2 py-1 text-sm sm:col-span-2"
            />
            <input
              name="title"
              defaultValue={video.title}
              placeholder="Title"
              required
              className="border border-stone-300 rounded px-2 py-1 text-sm sm:col-span-2"
            />
            <input
              name="position"
              type="number"
              defaultValue={video.position}
              min={0}
              className="border border-stone-300 rounded px-2 py-1 text-sm w-20"
            />
            <textarea
              name="description"
              defaultValue={video.description}
              placeholder="Description"
              className="border border-stone-300 rounded px-2 py-1 text-sm sm:col-span-5"
              rows={2}
            />
            <div className="sm:col-span-6 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-sm px-3 py-1 rounded border border-stone-300 text-stone-600 hover:bg-stone-100"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="text-sm px-3 py-1 rounded bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-50"
              >
                {isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-stone-200">
      <td className="px-3 py-2 text-sm font-mono text-stone-700">
        {video.topicSlug}
      </td>
      <td className="px-3 py-2 text-xs">
        <span
          className={`inline-block rounded px-1.5 py-0.5 uppercase font-semibold ${
            video.locale === "both"
              ? "bg-stone-200 text-stone-700"
              : "bg-sky-100 text-sky-700"
          }`}
        >
          {video.locale}
        </span>
      </td>
      <td className="px-3 py-2 text-sm">
        <a
          href={video.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 hover:underline break-all"
        >
          {video.youtubeUrl}
        </a>
      </td>
      <td className="px-3 py-2 text-sm text-stone-800">{video.title}</td>
      <td className="px-3 py-2 text-xs text-stone-500 max-w-xs truncate">
        {video.description || "—"}
      </td>
      <td className="px-3 py-2 text-sm text-stone-500 text-center">
        {video.position}
      </td>
      <td className="px-3 py-2 text-right whitespace-nowrap">
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-sky-600 hover:underline mr-3"
          disabled={isPending}
        >
          Edit
        </button>
        <button
          onClick={() =>
            startTransition(async () => {
              if (confirm(`Delete featured video "${video.title}"?`)) {
                await deleteFeaturedVideo(video.id, video.topicSlug);
              }
            })
          }
          className="text-sm text-red-600 hover:underline"
          disabled={isPending}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
