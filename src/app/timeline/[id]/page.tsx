import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/EventForm";
import { EventCard, type DisplayMedia } from "@/components/EventCard";
import { InviteMemberForm } from "@/components/InviteMemberForm";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/timeline/${id}`);
  }

  const { data: timeline } = await supabase.from("timelines").select("*").eq("id", id).single();

  if (!timeline) {
    notFound();
  }

  const { data: membership } = await supabase
    .from("timeline_members")
    .select("role")
    .eq("timeline_id", id)
    .eq("user_id", user.id)
    .single();

  const canEdit = membership?.role === "owner" || membership?.role === "editor";
  const isOwner = membership?.role === "owner";

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("timeline_id", id)
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false });

  const eventIds = (events ?? []).map((event) => event.id);

  const { data: mediaRows } = eventIds.length
    ? await supabase.from("event_media").select("*").in("event_id", eventIds)
    : { data: [] };

  const paths = (mediaRows ?? []).map((row) => row.storage_path);
  const { data: signedUrls } = paths.length
    ? await supabase.storage.from("media").createSignedUrls(paths, SIGNED_URL_TTL_SECONDS)
    : { data: [] };

  const signedUrlByPath = new Map(
    (signedUrls ?? []).map((entry) => [entry.path, entry.signedUrl])
  );

  const mediaByEventId = new Map<string, DisplayMedia[]>();
  for (const row of mediaRows ?? []) {
    const list = mediaByEventId.get(row.event_id) ?? [];
    list.push({
      id: row.id,
      media_type: row.media_type,
      signedUrl: signedUrlByPath.get(row.storage_path) ?? null,
    });
    mediaByEventId.set(row.event_id, list);
  }

  const { data: memberRows } = await supabase
    .from("timeline_members")
    .select("user_id, role")
    .eq("timeline_id", id);

  const memberIds = (memberRows ?? []).map((m) => m.user_id);
  const { data: memberProfiles } = memberIds.length
    ? await supabase.from("profiles").select("*").in("id", memberIds)
    : { data: [] };

  const profileById = new Map((memberProfiles ?? []).map((p) => [p.id, p.display_name]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">{timeline.child_name}</h1>
          {timeline.description ? (
            <p className="mt-1 text-stone-500">{timeline.description}</p>
          ) : null}
        </div>
        <Link
          href={`/timeline/${id}/slideshow`}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-terracotta-200 bg-white px-3 py-1.5 text-sm font-medium text-terracotta-700 shadow-sm transition hover:bg-terracotta-50"
        >
          ▶ Slideshow
        </Link>
      </div>

      {canEdit ? (
        <div className="mt-6">
          <EventForm timelineId={id} />
        </div>
      ) : null}

      <ol className="relative mt-8 flex flex-col gap-8">
        <div className="pointer-events-none absolute inset-y-0 left-[11px] w-0.5 -translate-x-1/2 bg-gradient-to-b from-terracotta-200 via-sage-200 to-terracotta-200 md:hidden" />
        <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-0.5 -translate-x-1/2 bg-gradient-to-b from-terracotta-200 via-sage-200 to-terracotta-200 md:block" />

        {(events ?? []).map((event, i) => (
          <EventCard
            key={event.id}
            eventId={event.id}
            title={event.title}
            narration={event.narration}
            eventDate={event.event_date}
            media={mediaByEventId.get(event.id) ?? []}
            canEdit={canEdit}
            align={i % 2 === 0 ? "left" : "right"}
          />
        ))}

        {(events ?? []).length === 0 ? (
          <li className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-stone-500">
            No moments yet — {canEdit ? "add the first one above." : "check back soon."}
          </li>
        ) : null}
      </ol>

      <div className="mt-10 rounded-2xl border border-terracotta-100 bg-white p-5 shadow-sm">
        <h2 className="font-medium text-stone-900">Family members</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {(memberRows ?? []).map((member) => (
            <li
              key={member.user_id}
              className="flex items-center justify-between rounded-lg bg-cream px-3 py-2 text-sm"
            >
              <span className="text-stone-700">
                {profileById.get(member.user_id) ?? "Family member"}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  member.role === "owner"
                    ? "bg-terracotta-100 text-terracotta-700"
                    : member.role === "editor"
                      ? "bg-sage-100 text-sage-700"
                      : "bg-stone-200 text-stone-600"
                }`}
              >
                {member.role}
              </span>
            </li>
          ))}
        </ul>

        {isOwner ? (
          <div className="mt-4 border-t border-stone-100 pt-4">
            <InviteMemberForm timelineId={id} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
