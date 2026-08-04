"use client";

import { useActionState } from "react";
import { addEvent } from "@/lib/actions/events";

export function EventForm({ timelineId }: { timelineId: string }) {
  const boundAction = addEvent.bind(null, timelineId);
  const [state, formAction, pending] = useActionState(boundAction, null);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
    >
      <h2 className="font-medium text-stone-900">Add a moment</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
          Title
          <input
            name="title"
            type="text"
            required
            placeholder="First steps"
            className="rounded-lg border border-stone-300 px-3 py-2 text-base text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
          Date
          <input
            name="eventDate"
            type="date"
            required
            max={new Date().toISOString().slice(0, 10)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-base text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
        Narration <span className="font-normal text-stone-400">(the story behind it)</span>
        <textarea
          name="narration"
          rows={3}
          placeholder="She let go of the couch and just... walked."
          className="resize-none rounded-lg border border-stone-300 px-3 py-2 text-base text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
        Photos & videos
        <input
          name="media"
          type="file"
          accept="image/*,video/*"
          multiple
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-amber-50 file:px-3 file:py-1.5 file:text-amber-700 hover:file:bg-amber-100"
        />
      </label>

      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Add to timeline"}
      </button>
    </form>
  );
}
