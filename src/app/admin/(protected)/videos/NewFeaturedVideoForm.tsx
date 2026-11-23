"use client";

import { useTransition, useRef } from "react";
import { createFeaturedVideo } from "./actions";

export function NewFeaturedVideoForm({
  slugOptions,
  defaultLocale,
}: {
  slugOptions: string[];
  defaultLocale: "en" | "es";
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(fd) =>
        startTransition(async () => {
          await createFeaturedVideo(fd);
          formRef.current?.reset();
        })
      }
      className="bg-white border border-stone-200 rounded-lg p-4 grid gap-3 sm:grid-cols-6"
    >
      <div className="sm:col-span-6">
        <h2 className="text-sm font-semibold text-stone-700">
          Add a featured video
        </h2>
        <p className="text-xs text-stone-500">
          Featured videos appear first in the &quot;Our videos&quot; list on the
          matching topic page and in research cards.
        </p>
      </div>
      <input
        name="topicSlug"
        list="slug-options"
        placeholder="topic-slug"
        required
        pattern="[a-z0-9-]+"
        title="lowercase letters, numbers, and hyphens"
        className="border border-stone-300 rounded px-2 py-1 text-sm"
      />
      <datalist id="slug-options">
        {slugOptions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <input
        name="youtubeUrl"
        type="url"
        placeholder="https://youtube.com/watch?v=…"
        required
        className="border border-stone-300 rounded px-2 py-1 text-sm sm:col-span-2"
      />
      <input
        name="title"
        placeholder="Title"
        required
        className="border border-stone-300 rounded px-2 py-1 text-sm sm:col-span-2"
      />
      <input
        name="position"
        type="number"
        defaultValue={0}
        min={0}
        title="Lower = earlier"
        className="border border-stone-300 rounded px-2 py-1 text-sm w-20"
      />
      <select
        name="locale"
        defaultValue={defaultLocale}
        title="Locale: en shows only on /en; es only on /es; both shows on both"
        className="border border-stone-300 rounded px-2 py-1 text-sm"
      >
        <option value="en">EN</option>
        <option value="es">ES</option>
        <option value="both">Both</option>
      </select>
      <textarea
        name="description"
        placeholder="Description (optional)"
        className="border border-stone-300 rounded px-2 py-1 text-sm sm:col-span-4"
        rows={2}
      />
      <button
        type="submit"
        disabled={isPending}
        className="text-sm px-3 py-1 rounded bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-50 sm:col-span-1 self-start"
      >
        {isPending ? "Adding…" : "Add"}
      </button>
    </form>
  );
}
