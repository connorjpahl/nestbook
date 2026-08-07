"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Moves an event earlier/later among its same-day siblings by swapping
// display_order values. The whole sibling group gets "crystallized" into
// concrete sequential numbers first (most rows start out with a null
// display_order, tiebroken by created_at) so the swap always has real
// integers to work with.
export async function reorderEvent(eventId: string, direction: "up" | "down") {
  const supabase = await createClient();

  const { data: target } = await supabase
    .from("events")
    .select("id, timeline_id, event_date")
    .eq("id", eventId)
    .single();

  if (!target) {
    return { error: "Moment not found." };
  }

  const { data: siblings } = await supabase
    .from("events")
    .select("id")
    .eq("timeline_id", target.timeline_id)
    .eq("event_date", target.event_date)
    .order("display_order", { ascending: true, nullsFirst: false })
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
