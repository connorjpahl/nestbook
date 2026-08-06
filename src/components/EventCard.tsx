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

function CalendarBadge({ eventDate, className }: { eventDate: string; className?: string }) {
  const d = new Date(`${eventDate}T00:00:00`);
  const day = d.getDate();
  const month = d.toLocaleDateString(undefined, { month: "short" }).toUpperCase();

  return (
    <div
      className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-terracotta-100 ${className ?? ""}`}
    >
      <span className="text-[10px] font-semibold tracking-wide text-terracotta-600">{month}</span>
      <span className="text-lg font-bold leading-none text-stone-900">{day}</span>
    </div>
  );
}

export function EventCard({
  eventId,
  title,
  narration,
  eventDate,
  media,
  canEdit,
  align,
}: {
  eventId: string;
  title: string;
  narration: string | null;
  eventDate: string;
  media: DisplayMedia[];
  canEdit: boolean;
  align: "left" | "right";
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

  function renderThumb(item: DisplayMedia, i: number, aspect: string) {
    if (!item.signedUrl) return null;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => setLightboxIndex(i)}
        className={`group relative overflow-hidden rounded-xl bg-stone-100 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-400 ${aspect}`}
      >
        {item.media_type === "video" ? (
          <video
            // iOS Safari won't paint a video's first frame as a thumbnail on
            // its own (unlike desktop browsers) -- appending a tiny time
            // offset forces it to seek to and decode that frame instead of
            // showing blank/gray.
            src={`${item.signedUrl}#t=0.1`}
            preload="metadata"
            playsInline
            muted
            className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
          />
        ) : (
          // Signed URLs are short-lived and per-user, so next/image's
          // remote optimizer isn't a good fit here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.signedUrl}
            alt={displayTitle}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
          />
        )}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
          {item.media_type === "video" ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
              ▶
            </span>
          ) : null}
        </span>
      </button>
    );
  }

  const card = (
    <div className="rounded-2xl border border-terracotta-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-600 md:hidden">
          {formattedDate}
        </p>
        {canEdit && !isEditing ? (
          <button
            type="button"
            onClick={startEditing}
            className="ml-auto text-xs font-medium text-stone-400 transition hover:text-terracotta-700"
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
            className="rounded-lg border border-stone-300 px-3 py-2 text-base font-semibold text-stone-900 outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200"
          />
          <textarea
            value={draftNarration}
            onChange={(e) => setDraftNarration(e.target.value)}
            rows={3}
            placeholder="Narration"
            className="resize-none rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-200"
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-terracotta-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-terracotta-700 disabled:opacity-60"
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

      {media.length === 1 ? (
        <div className="mt-4">{renderThumb(media[0], 0, "aspect-video w-full")}</div>
      ) : media.length > 1 ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {media.map((item, i) => renderThumb(item, i, "aspect-square w-full"))}
        </div>
      ) : null}
    </div>
  );

  const gutter = (
    <div className="hidden md:flex md:items-start md:justify-center md:pt-1">
      <CalendarBadge eventDate={eventDate} />
    </div>
  );

  return (
    <li className="relative grid grid-cols-1 gap-3 pl-9 md:grid-cols-[1fr_3.75rem_1fr] md:items-start md:gap-6 md:pl-0">
      <span className="absolute left-[11px] top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-terracotta-500 bg-white md:hidden" />

      {align === "left" ? (
        <>
          <div className="md:col-start-1">{card}</div>
          <div className="md:col-start-2">{gutter}</div>
          <div className="hidden md:block md:col-start-3" />
        </>
      ) : (
        <>
          <div className="hidden md:block md:col-start-1" />
          <div className="md:col-start-2">{gutter}</div>
          <div className="md:col-start-3">{card}</div>
        </>
      )}

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
