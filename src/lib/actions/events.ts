"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MediaType } from "@/types/database";

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50MB per file

export async function addEvent(timelineId: string, _prevState: unknown, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const narration = String(formData.get("narration") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "");
  const files = formData.getAll("media").filter((f): f is File => f instanceof File && f.size > 0);

  if (!title || !eventDate) {
    return { error: "Please add a title and a date." };
  }

  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return { error: `"${file.name}" is larger than 50MB.` };
    }
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      return { error: `"${file.name}" isn't a photo or video.` };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be signed in." };
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      timeline_id: timelineId,
      title,
      narration: narration || null,
      event_date: eventDate,
      created_by: user.id,
    })
    .select()
    .single();

  if (eventError || !event) {
    return { error: eventError?.message ?? "Could not save the event." };
  }

  for (const file of files) {
    const mediaType: MediaType = file.type.startsWith("video/") ? "video" : "photo";
    const extension = file.name.includes(".") ? file.name.split(".").pop() : mediaType;
    const path = `${timelineId}/${event.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
      contentType: file.type,
    });

    if (uploadError) {
      return { error: `Event saved, but "${file.name}" failed to upload: ${uploadError.message}` };
    }

    await supabase.from("event_media").insert({
      event_id: event.id,
      storage_path: path,
      media_type: mediaType,
    });
  }

  revalidatePath(`/timeline/${timelineId}`);
  return { success: "Moment added!" };
}
