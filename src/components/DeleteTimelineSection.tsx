"use client";

import { useState } from "react";
import { deleteTimeline } from "@/lib/actions/timelines";

export function DeleteTimelineSection({
  timelineId,
  childName,
}: {
  timelineId: string;
  childName: string;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText.trim() === childName;

  async function handleDelete() {
    setPending(true);
    setError(null);
    const result = await deleteTimeline(timelineId);
    // Only reached on failure -- deleteTimeline redirects on success, which
    // throws internally and never returns control here.
    if (result && "error" in result) {
      setError(result.error);
      setPending(false);
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="mt-4 text-sm font-medium text-red-700 hover:underline"
      >
        Delete this timeline
      </button>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-800">
        This permanently deletes <strong>{childName}</strong>&apos;s timeline — every moment,
        photo, and video on it — for everyone with access. This can&apos;t be undone.
      </p>
      <label className="flex flex-col gap-1 text-sm font-medium text-red-800">
        Type <strong>{childName}</strong> to confirm
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="rounded-lg border border-red-300 bg-white px-3 py-2 text-base text-stone-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
        />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={!canDelete || pending}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Deleting…" : "Permanently delete"}
        </button>
        <button
          type="button"
          onClick={() => {
            setExpanded(false);
            setConfirmText("");
          }}
          disabled={pending}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
