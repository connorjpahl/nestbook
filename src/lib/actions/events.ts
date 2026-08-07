"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Moves an event earlier/later among ALL of a timeline's events (not just
// same-day ones) by swapping display_order values. The whole timeline gets
// "crystallized" into concrete sequential numbers first (most rows start
// out with a null display_order, tiebroken by event_date/created_at) so
// the swap always has real integers to work with. Once any event on a
// timeline has been reordered this way, display_order becomes the primary
// sort key for the whole thing -- see the matching ORDER BY in the
// timeline page and slideshow loader.
export async function reorderEvent(eventId: string, direction: "up" | "down") {
  const supabase = await createClient();

  const { data: target } = await supabase
    .from("events")
    .select("id, timeline_id")
    .eq("id", eventId)
    .single();

  if (!target) {
    return { error: "Moment not found." };
  }

  const { data: siblings } = await supabase
    .from("events")
    .select("id")
    .eq("timeline_id", target.timeline_id)
    .order("display_order", { ascending: true, nullsFirst: true })
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false });

  const list = siblings ?? [];
  const currentIndex = list.findIndex((event) => event.id === eventId);
  if (currentIndex === -1) {
    return { error: "Moment not found." };
  }

  const neighborIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (neighborIndex < 0 || neighborIndex >= list.length) {
    return {}; // already at the boundary -- nothing to do
  }

  const order = list.map((event) => event.id);
  [order[currentIndex], order[neighborIndex]] = [order[neighborIndex], order[currentIndex]];

  for (let i = 0; i < order.length; i++) {
    const { error } = await supabase.from("events").update({ display_order: i }).eq("id", order[i]);
    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath(`/timeline/${target.timeline_id}`);
  return {};
}
