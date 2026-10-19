"use client";

import { useState, useTransition } from "react";
import type { ConsultationRequest } from "@/db/schema";
import { updateRequestStatus, updateRequestNotes, deleteRequest } from "./actions";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  forwarded: "Forwarded",
  closed: "Closed",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  forwarded: "bg-purple-100 text-purple-700",
  closed: "bg-stone-100 text-stone-500",
};

export function AdminRequestRow({ request }: { request: ConsultationRequest }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(request.notes ?? "");
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as ConsultationRequest["status"];
    startTransition(() => updateRequestStatus(request.id, status));
  }

  function handleNotesSave() {
    startTransition(() => updateRequestNotes(request.id, notes));
  }

  function handleDelete() {
    if (!confirm("Permanently delete this request? This cannot be undone.")) return;
    startTransition(() => deleteRequest(request.id));
  }

  return (
    <div className={`bg-white border border-stone-200 rounded-lg p-4 ${isPending ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-800">{request.name}</p>
          <p className="text-sm text-stone-500">{request.email}</p>
          {request.topic && (
            <p className="text-xs text-teal-700 mt-0.5">
              Topic: {request.topic}
            </p>
          )}
          <p className="text-xs text-stone-400 mt-1">
            {new Date(request.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[request.status]}`}
          >
            {STATUS_LABELS[request.status]}
          </span>
          <select
            defaultValue={request.status}
            onChange={handleStatusChange}
            disabled={isPending}
            className="text-sm border border-stone-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Change status"
          >
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-sm text-stone-500 hover:text-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded px-2 py-1"
            aria-expanded={expanded}
          >
            {expanded ? "Less" : "More"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-stone-100 pt-4 space-y-3">
          {request.message && (
            <div>
              <p className="text-xs font-medium text-stone-500 mb-1">Message</p>
              <p className="text-sm text-stone-700 bg-stone-50 rounded px-3 py-2">
                {request.message}
              </p>
            </div>
          )}
          <div>
            <label
              htmlFor={`notes-${request.id}`}
              className="text-xs font-medium text-stone-500 block mb-1"
            >
              Notes
            </label>
            <textarea
              id={`notes-${request.id}`}
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm border border-stone-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleNotesSave}
              disabled={isPending}
              className="text-sm bg-teal-600 text-white px-4 py-1.5 rounded hover:bg-teal-700 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              Save notes
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-sm text-red-600 border border-red-300 px-4 py-1.5 rounded hover:bg-red-50 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Delete permanently
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
