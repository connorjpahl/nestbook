import { createClient } from "@/lib/supabase/server";
import type { MediaType } from "@/types/database";

export interface SlideshowSlide {
  id: string;
  eventId: string;
  title: string;
  narration: string | null;
  eventDate: string;
  media: { id: string; mediaType: MediaType; signedUrl: string } | null;
}

// Long-lived so a slideshow left running on a mounted tablet doesn't hit
// expired image URLs mid-session; the player also proactively refreshes
// (see refreshSlideshowSlides) well before this window closes.
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24;

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

export async function loadSlideshowSlides(
  supabase: ServerSupabase,
  timelineId: string
): Promise<SlideshowSlide[]> {
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("timeline_id", timelineId)
    .order("event_date", { ascending: true })
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  const eventList = events ?? [];
  if (eventList.length === 0) return [];

  const eventIds = eventList.map((event) => event.id);

  const { data: mediaRows } = await supabase
    .from("event_media")
    .select("*")
    .in("event_id", eventIds)
    .order("created_at", { ascending: true });

  const paths = (mediaRows ?? []).map((row) => row.storage_path);
  const { data: signedUrlEntries } = paths.length
    ? await supabase.storage.from("media").createSignedUrls(paths, SIGNED_URL_TTL_SECONDS)
    : { data: [] as { path: string | null; signedUrl: string }[] };

  const signedUrlByPath = new Map(
    (signedUrlEntries ?? [])
      .filter((entry): entry is { path: string; signedUrl: string } => Boolean(entry.path))
      .map((entry) => [entry.path, entry.signedUrl])
  );

  const mediaByEventId = new Map<
    string,
    { id: string; mediaType: MediaType; signedUrl: string }[]
  >();
  for (const row of mediaRows ?? []) {
    const signedUrl = signedUrlByPath.get(row.storage_path);
    if (!signedUrl) continue;
    const list = mediaByEventId.get(row.event_id) ?? [];
    list.push({ id: row.id, mediaType: row.media_type, signedUrl });
    mediaByEventId.set(row.event_id, list);
  }

  const slides: SlideshowSlide[] = [];
  for (const event of eventList) {
    const media = mediaByEventId.get(event.id) ?? [];
    if (media.length === 0) {
      slides.push({
        id: event.id,
        eventId: event.id,
        title: event.title,
        narration: event.narration,
        eventDate: event.event_date,
        media: null,
      });
      continue;
    }
    for (const item of media) {
      slides.push({
        id: `${event.id}-${item.id}`,
        eventId: event.id,
        title: event.title,
        narration: event.narration,
        eventDate: event.event_date,
        media: item,
      });
    }
  }

  return slides;
}
