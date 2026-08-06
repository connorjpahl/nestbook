"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { MediaType } from "@/types/database";

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50MB per file
const MAX_VIDEO_SECONDS = 30;

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error(`Could not read "${file.name}" as a video.`));
    };
    video.src = URL.createObjectURL(file);
  });
}

export function EventForm({ timelineId }: { timelineId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const narration = String(formData.get("narration") ?? "").trim();
    const eventDate = String(formData.get("eventDate") ?? "");
    const files = formData
      .getAll("media")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (!title || !eventDate) {
      setError("Please add a title and a date.");
      return;
    }

    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        setError(`"${file.name}" is larger than 50MB.`);
        return;
      }
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setError(`"${file.name}" isn't a photo or video.`);
        return;
      }
      if (file.type.startsWith("video/")) {
        let duration: number;
        try {
          duration = await getVideoDuration(file);
        } catch (durationError) {
          setError(
            durationError instanceof Error
              ? durationError.message
              : `Could not read "${file.name}" as a video.`
          );
          return;
        }
        if (duration > MAX_VIDEO_SECONDS) {
          setError(`"${file.name}" is longer than ${MAX_VIDEO_SECONDS} seconds.`);
          return;
        }
      }
    }

    setPending(true);

    // Files are uploaded straight from the browser to Supabase Storage
    // rather than through a server action, since Next.js server actions
    // (and Vercel's serverless functions) cap request bodies well below
    // the size of a typical phone photo or video.
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You need to be signed in.");
      setPending(false);
      return;
    }

    const { data: newEvent, error: eventError } = await supabase
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

    if (eventError || !newEvent) {
      setError(eventError?.message ?? "Could not save the event.");
      setPending(false);
      return;
    }

    for (const file of files) {
      const mediaType: MediaType = file.type.startsWith("video/") ? "video" : "photo";
      const extension = file.name.includes(".") ? file.name.split(".").pop() : mediaType;
      const path = `${timelineId}/${newEvent.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage.from("media").upload(path, file, {
        contentType: file.type,
      });

      if (uploadError) {
        setError(`Event saved, but "${file.name}" failed to upload: ${uploadError.message}`);
        setPending(false);
        router.refresh();
        return;
      }

      await supabase.from("event_media").insert({
        event_id: newEvent.id,
        storage_path: path,
        media_type: mediaType,
      });
    }

    setPending(false);
    setSuccess("Moment added!");
    formRef.current?.reset();
    router.refresh();
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
    >
      <h2 className="font-medium text-stone-900">Add a moment</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
          Title
          <input
            name="title"
            type="text"
            required
            placeholder="First steps"
            className="rounded-lg border border-stone-300 px-3 py-2 text-base text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
          Date
          <input
            name="eventDate"
            type="date"
            required
            max={new Date().toISOString().slice(0, 10)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-base text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
        Narration <span className="font-normal text-stone-400">(the story behind it)</span>
        <textarea
          name="narration"
          rows={3}
          placeholder="She let go of the couch and just... walked."
          className="resize-none rounded-lg border border-stone-300 px-3 py-2 text-base text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-stone-700">
        Photos & videos
        <span className="text-xs font-normal text-stone-400">
          Videos must be {MAX_VIDEO_SECONDS} seconds or shorter.
        </span>
        <input
          name="media"
          type="file"
          accept="image/*,video/*"
          multiple
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-amber-50 file:px-3 file:py-1.5 file:text-amber-700 hover:file:bg-amber-100"
        />
      </label>

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {success ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition hover:bg-amber-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Add to timeline"}
      </button>
    </form>
  );
}
