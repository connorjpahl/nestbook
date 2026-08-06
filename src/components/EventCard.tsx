"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MediaLightbox } from "@/components/MediaLightbox";
import type { MediaType } from "@/types/database";

export interface DisplayMedia {
  id: string;
  media_type: MediaType;
  signedUrl: string | null;
}

export function EventCard({
  eventId,
  title,
  narration,
  eventDate,
  media,
  canEdit,
}: {
  eventId: string;
  title: string;
  narration: string | null;
  eventDate: string;
  media: DisplayMedia[];
  canEdit: boolean;
}) {
  const [displayTitle, setDisplayTitle] = useState(title);
  const [displayNarration, setDisplayNarration] = useState(narration);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftNarration, setDraftNarration] = useState(narration ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const formattedDate = new Date(`${eventDate}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function startEditing() {
    setDraftTitle(displayTitle);
    setDraftNarration(displayNarration ?? "");
    setError(null);
    setIsEditing(true);
  }

  async function handleSave() {
    const nextTitle = draftTitle.trim();
    if (!nextTitle) {
      setError("Title can't be empty.");
      return;
    }

    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("events")
      .update({
        title: nextTitle,
        narration: draftNarration.trim() || null,
      })
      .eq("id", eventId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDisplayTitle(nextTitle);
    setDisplayNarration(draftNarration.trim() || null);
    setIsEditing(false);
  }

  return (
    <li className="relative pl-10">
      <span className="absolute left-[5px] top-1.5 h-3 w-3 rounded-full border-2 border-amber-500 bg-white" />
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
            {formattedDate}
          </p>
          {canEdit && !isEditing ? (
            <button
              type="button"
              onClick={startEditing}
              className="text-xs font-medium text-stone-400 transition hover:text-amber-700"
            >
              Edit
            </button>
          ) : null}
        </div>

        {isEditing ? (
          <div className="mt-2 flex flex-col gap-3">
            <input
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Title"
              className="rounded-lg border border-stone-300 px-3 py-2 text-base font-semibold text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
            <textarea
              value={draftNarration}
              onChange={(e) => setDraftNarration(e.target.value)}
              rows={3}
              placeholder="Narration"
              className="resize-none rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                }}
                disabled={saving}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="mt-1 text-lg font-semibold text-stone-900">{displayTitle}</h3>
            {displayNarration ? (
              <p className="mt-2 whitespace-pre-line text-stone-600">{displayNarration}</p>
            ) : null}
          </>
        )}

        {media.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((item, i) =>
              item.signedUrl ? (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className="group relative overflow-hidden rounded-lg bg-stone-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  {item.media_type === "video" ? (
                    <video
                      // iOS Safari won't paint a video's first frame as a
                      // thumbnail on its own (unlike desktop browsers) --
                      // appending a tiny time offset forces it to seek to
                      // and decode that frame instead of showing blank/gray.
                      src={`${item.signedUrl}#t=0.1`}
                      preload="metadata"
                      playsInline
                      muted
                      className="aspect-square w-full object-cover transition duration-200 group-hover:scale-105"
                    />
                  ) : (
                    // Signed URLs are short-lived and per-user, so next/image's
                    // remote optimizer isn't a good fit here.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.signedUrl}
                      alt={displayTitle}
                      className="aspect-square w-full object-cover transition duration-200 group-hover:scale-105"
                    />
                  )}
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                    {item.media_type === "video" ? (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/0 text-2xl text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                        ▶
                      </span>
                    ) : null}
                  </span>
                </button>
              ) : null
            )}
          </div>
        ) : null}
      </div>

      {lightboxIndex !== null ? (
        <MediaLightbox
          media={media}
          index={lightboxIndex}
          title={displayTitle}
          narration={displayNarration}
          formattedDate={formattedDate}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </li>
  );
}
