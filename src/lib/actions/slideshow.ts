"use server";

import { createClient } from "@/lib/supabase/server";
import { loadSlideshowSlides, type SlideshowSlide } from "@/lib/slideshow";

// Called periodically by a running slideshow to mint fresh signed URLs
// before the previous batch expires. RLS on events/event_media/storage
// means a non-member simply gets an empty list back, same as any other
// query -- no separate authorization check needed here.
export async function refreshSlideshowSlides(timelineId: string): Promise<SlideshowSlide[]> {
  const supabase = await createClient();
  return loadSlideshowSlides(supabase, timelineId);
}
