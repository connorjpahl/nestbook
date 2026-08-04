import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateTimelineForm } from "@/components/CreateTimelineForm";
import type { TimelineRole } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: memberships } = await supabase
    .from("timeline_members")
    .select("timeline_id, role")
    .eq("user_id", user.id);

  const timelineIds = memberships?.map((m) => m.timeline_id) ?? [];
  const roleByTimelineId = new Map<string, TimelineRole>(
    memberships?.map((m) => [m.timeline_id, m.role]) ?? []
  );

  const { data: timelines } = timelineIds.length
    ? await supabase
        .from("timelines")
        .select("*")
        .in("id", timelineIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-stone-900">Your timelines</h1>
      <p className="mt-1 text-stone-500">
        Every timeline you own or have been invited to.
      </p>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-medium text-stone-900">Start a new timeline</h2>
        <CreateTimelineForm />
      </div>

      <ul className="mt-8 flex flex-col gap-3">
        {(timelines ?? []).map((timeline) => (
          <li key={timeline.id}>
            <Link
              href={`/timeline/${timeline.id}`}
              className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-amber-300 hover:shadow"
            >
              <div>
                <p className="font-medium text-stone-900">{timeline.child_name}</p>
                {timeline.description ? (
                  <p className="text-sm text-stone-500">{timeline.description}</p>
                ) : null}
              </div>
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium capitalize text-stone-600">
                {roleByTimelineId.get(timeline.id) ?? "member"}
              </span>
            </Link>
          </li>
        ))}

        {timelineIds.length === 0 ? (
          <li className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-stone-500">
            No timelines yet — create your first one above.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
