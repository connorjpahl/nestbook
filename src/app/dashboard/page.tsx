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

      <div className="mt-6 rounded-2xl border border-terracotta-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-medium text-stone-900">Start a new timeline</h2>
        <CreateTimelineForm />
      </div>

      <ul className="mt-8 flex flex-col gap-3">
        {(timelines ?? []).map((timeline) => {
          const role = roleByTimelineId.get(timeline.id) ?? "member";
          return (
            <li key={timeline.id}>
              <Link
                href={`/timeline/${timeline.id}`}
                className="flex items-center justify-between rounded-2xl border border-terracotta-100 bg-white p-4 shadow-sm transition hover:border-terracotta-300 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta-50 text-lg">
                    🪺
                  </span>
                  <div>
                    <p className="font-medium text-stone-900">{timeline.child_name}</p>
                    {timeline.description ? (
                      <p className="text-sm text-stone-500">{timeline.description}</p>
                    ) : null}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                    role === "owner"
                      ? "bg-terracotta-100 text-terracotta-700"
                      : role === "editor"
                        ? "bg-sage-100 text-sage-700"
                        : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {role}
                </span>
              </Link>
            </li>
          );
        })}

        {timelineIds.length === 0 ? (
          <li className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-stone-500">
            No timelines yet — create your first one above.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
