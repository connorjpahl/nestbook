"use client";

import { useActionState } from "react";
import { createTimeline } from "@/lib/actions/timelines";

export function CreateTimelineForm() {
  const [state, formAction, pending] = useActionState(createTimeline, null);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-stone-700">
        Child&apos;s name
        <input
          name="childName"
          type="text"
          required
          placeholder="e.g. Mila"
          className="rounded-lg border border-stone-300 px-3 py-2 text-base text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </label>
      <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-stone-700">
        Description <span className="font-normal text-stone-400">(optional)</span>
        <input
          name="description"
          type="text"
          placeholder="Mila's growing-up story"
          className="rounded-lg border border-stone-300 px-3 py-2 text-base text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-700 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create timeline"}
      </button>
      {state?.error ? (
        <p className="text-sm text-red-700 sm:basis-full">{state.error}</p>
      ) : null}
    </form>
  );
}
