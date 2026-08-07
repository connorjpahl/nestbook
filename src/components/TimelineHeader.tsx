"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { updateTimeline } from "@/lib/actions/timelines";

type UpdateState =
  | { error: string }
  | { success: true; childName: string; description: string | null }
  | null;

export function TimelineHeader({
  timelineId,
  initialChildName,
  initialDescription,
  canEdit,
}: {
  timelineId: string;
  initialChildName: string;
  initialDescription: string | null;
  canEdit: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const boundAction = updateTimeline.bind(null, timelineId);
  const [state, formAction, pending] = useActionState<UpdateState, FormData>(boundAction, null);

  // Close the edit form the moment a submission succeeds. Adjusting state
  // during render (guarded by comparing to the previous state) rather than
  // in a useEffect, per React's guidance on deriving state from props.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state && "success" in state) {
      setIsEditing(false);
    }
  }

  const childName = state && "success" in state ? state.childName : initialChildName;
  const description = state && "success" in state ? state.description : initialDescription;

  return (
    <div className="flex items-start justify-between gap-4">
      {isEditing ? (
        <form action={formAction} className="flex flex-1 flex-col gap-3">
          <input
            name="childName"
            type="text"
            required
            defaultValue={childName}
            placeholder="Child's name"
            className="rounded-lg border border-stone-300 px-3 py-2 text-xl font-semibold text-stone-900 outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200"
          />
          <input
            name="description"
            type="text"
            defaultValue={description ?? ""}
            placeholder="Description (optional)"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-700 outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200"
          />
          {state && "error" in state ? <p className="text-sm text-red-700">{state.error}</p> : null}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-terracotta-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-terracotta-700 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={pending}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-stone-900">{childName}</h1>
            {canEdit ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs font-medium text-stone-400 transition hover:text-terracotta-700"
              >
                Edit
              </button>
            ) : null}
          </div>
          {description ? <p className="mt-1 text-stone-500">{description}</p> : null}
        </div>
      )}

      <Link
        href={`/timeline/${timelineId}/slideshow`}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-terracotta-200 bg-white px-3 py-1.5 text-sm font-medium text-terracotta-700 shadow-sm transition hover:bg-terracotta-50"
      >
        ▶ Slideshow
      </Link>
    </div>
  );
}
