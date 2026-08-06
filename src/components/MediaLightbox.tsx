"use client";

import { useEffect } from "react";
import type { DisplayMedia } from "@/components/EventCard";

export function MediaLightbox({
  media,
  index,
  title,
  narration,
  formattedDate,
  onIndexChange,
  onClose,
}: {
  media: DisplayMedia[];
  index: number;
  title: string;
  narration: string | null;
  formattedDate: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const current = media[index];
  const hasMultiple = media.length > 1;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && hasMultiple) {
        onIndexChange((index + 1) % media.length);
      }
      if (e.key === "ArrowLeft" && hasMultiple) {
        onIndexChange((index - 1 + media.length) % media.length);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [index, hasMultiple, media.length, onIndexChange, onClose]);

  if (!current?.signedUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition hover:bg-white/20"
      >
        ×
      </button>

      {hasMultiple ? (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange((index - 1 + media.length) % media.length);
            }}
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:left-4"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange((index + 1) % media.length);
            }}
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:right-4"
          >
            ›
          </button>
        </>
      ) : null}

      <div
        className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-stone-900 shadow-2xl sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-0 flex-1 items-center justify-center bg-black">
          {current.media_type === "video" ? (
            <video
              key={current.id}
              src={current.signedUrl}
              controls
              autoPlay
              className="max-h-[60vh] max-w-full sm:max-h-[85vh]"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={current.id}
              src={current.signedUrl}
              alt={title}
              className="max-h-[60vh] max-w-full object-contain sm:max-h-[85vh]"
            />
          )}
        </div>

        <div className="flex w-full flex-col gap-2 overflow-y-auto p-5 sm:w-72 sm:shrink-0">
          <p className="text-xs font-medium uppercase tracking-wide text-terracotta-400">
            {formattedDate}
          </p>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {narration ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-stone-300">
              {narration}
            </p>
          ) : null}
          {hasMultiple ? (
            <p className="mt-auto pt-2 text-xs text-stone-500">
              {index + 1} of {media.length}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
