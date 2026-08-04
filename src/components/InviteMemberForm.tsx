"use client";

import { useActionState } from "react";
import { inviteMember } from "@/lib/actions/timelines";

export function InviteMemberForm({ timelineId }: { timelineId: string }) {
  const boundAction = inviteMember.bind(null, timelineId);
  const [state, formAction, pending] = useActionState(boundAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-stone-700">
        Invite by email
        <input
          name="email"
          type="email"
          required
          placeholder="grandma@example.com"
          className="rounded-lg border border-stone-300 px-3 py-2 text-base text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
        Role
        <select
          name="role"
          defaultValue="editor"
          className="rounded-lg border border-stone-300 px-3 py-2 text-base text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        >
          <option value="editor">Can add moments</option>
          <option value="viewer">Can only view</option>
        </select>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-stone-300 px-4 py-2 font-medium text-stone-700 transition hover:bg-stone-100 disabled:opacity-60"
      >
        {pending ? "Inviting…" : "Invite"}
      </button>
      {state?.error ? <p className="text-sm text-red-700 sm:basis-full">{state.error}</p> : null}
      {state?.success ? (
        <p className="text-sm text-emerald-700 sm:basis-full">{state.success}</p>
      ) : null}
    </form>
  );
}
