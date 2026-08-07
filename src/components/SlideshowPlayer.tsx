"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { refreshSlideshowSlides } from "@/lib/actions/slideshow";
import { SproutMark } from "@/components/SproutMark";
import type { SlideshowSlide } from "@/lib/slideshow";

const PHOTO_DURATION_MS = 7000;
const IDLE_HIDE_MS = 4000;
const LOOP_SAFETY_REFRESH_MS = 6 * 60 * 60 * 1000; // 6 hours

export function SlideshowPlayer({
  timelineId,
  childName,
  initialSlides,
}: {
  timelineId: string;
  childName: string;
  initialSlides: SlideshowSlide[];
}) {
  const [slides, setSlides] = useState(initialSlides);
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slide = slides[index] as SlideshowSlide | undefined;

  const goTo = useCallback(
    (next: number) => {
      if (slides.length === 0) return;
      const wrapped = ((next % slides.length) + slides.length) % slides.length;
      setProgress(0);
      setIndex(wrapped);
    },
    [slides.length]
  );

  const goNext = useCallback(() => {
    if (slides.length === 0) return;
    if (index === slides.length - 1) {
      // Completed a full loop -- good moment to refresh signed URLs.
      refreshSlideshowSlides(timelineId).then((fresh) => {
        if (fresh.length > 0) setSlides(fresh);
      });
    }
    goTo(index + 1);
  }, [index, slides.length, timelineId, goTo]);

  const goPrev = useCallback(() => goTo(index - 1), [index, goTo]);

  // Photo slides auto-advance on a timer; video slides advance on `onEnded`.
  useEffect(() => {
    if (!started || !playing || !slide) return;
    if (slide.media?.mediaType === "video") return;

    const start = Date.now();
    const tick = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / PHOTO_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) goNext();
    }, 100);

    return () => clearInterval(tick);
  }, [started, playing, slide, index, goNext]);

  // Keep a playing video in sync with the play/pause control.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) video.play().catch(() => {});
    else video.pause();
  }, [playing, index]);

  // Safety-net refresh for very long-running sessions that rarely loop.
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      refreshSlideshowSlides(timelineId).then((fresh) => {
        if (fresh.length > 0) setSlides(fresh);
      });
    }, LOOP_SAFETY_REFRESH_MS);
    return () => clearInterval(interval);
  }, [started, timelineId]);

  // Idle-hide the controls, like a real screensaver.
  const registerActivity = useCallback(() => {
    setControlsVisible(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setControlsVisible(false), IDLE_HIDE_MS);
  }, []);

  useEffect(() => {
    if (!started) return;
    // Controls start visible (initial state) and this schedules the first
    // idle-hide; avoid calling registerActivity() synchronously here since
    // it would trigger a setState during the effect body itself.
    idleTimerRef.current = setTimeout(() => setControlsVisible(false), IDLE_HIDE_MS);
    const events: (keyof DocumentEventMap)[] = ["pointermove", "pointerdown", "keydown"];
    events.forEach((event) => document.addEventListener(event, registerActivity));
    return () => {
      events.forEach((event) => document.removeEventListener(event, registerActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [started, registerActivity]);

  // Keyboard controls.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!started) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [started, goNext, goPrev]);

  async function handleStart() {
    setStarted(true);
    setPlaying(true);
    try {
      await containerRef.current?.requestFullscreen?.();
    } catch {
      // Fullscreen isn't available on every device (notably iPhone Safari)
      // -- the immersive layout still works without it.
    }
  }

  async function handleExit() {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // ignore
      }
    }
    setStarted(false);
    setPlaying(false);
  }

  const formattedDate = slide
    ? new Date(`${slide.eventDate}T00:00:00`).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden bg-stone-950"
      onPointerMove={registerActivity}
    >
      {!started ? (
        <div className="relative flex h-full w-full flex-col items-center justify-center gap-6 px-6 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-terracotta-900 opacity-30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-sage-900 opacity-30 blur-3xl"
          />

          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <SproutMark className="h-9 w-9" />
          </div>

          {slides.length === 0 ? (
            <>
              <h1 className="relative text-2xl font-semibold text-white">
                No moments yet
              </h1>
              <p className="relative max-w-sm text-stone-300">
                Add a few photos to {childName}&apos;s timeline first, then come back to start
                the slideshow.
              </p>
            </>
          ) : (
            <>
              <h1 className="relative text-2xl font-semibold text-white">
                {childName}&apos;s story
              </h1>
              <p className="relative max-w-sm text-stone-300">
                Plays fullscreen and loops on its own — a nice fit for a mounted tablet or a
                spare screen.
              </p>
              <button
                type="button"
                onClick={handleStart}
                className="relative mt-2 rounded-lg bg-terracotta-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-terracotta-700"
              >
                ▶ Play slideshow
              </button>
            </>
          )}

          <Link
            href={`/timeline/${timelineId}`}
            className="relative mt-4 text-sm text-stone-400 hover:text-stone-200"
          >
            Back to timeline
          </Link>
        </div>
      ) : (
        <>
          <div className="absolute inset-x-0 top-0 z-10 h-1 bg-white/10">
            <div
              className="h-full bg-terracotta-400 transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex h-full w-full items-center justify-center">
            {slide?.media ? (
              slide.media.mediaType === "video" ? (
                <video
                  key={slide.id}
                  ref={videoRef}
                  src={slide.media.signedUrl}
                  autoPlay
                  muted={muted}
                  playsInline
                  onEnded={goNext}
                  onTimeUpdate={(e) => {
                    const v = e.currentTarget;
                    if (v.duration) setProgress((v.currentTime / v.duration) * 100);
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={slide.id}
                  src={slide.media.signedUrl}
                  alt={slide.title}
                  className="max-h-full max-w-full object-contain"
                />
              )
            ) : (
              <div className="flex max-w-xl flex-col items-center gap-3 px-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-400">
                  {formattedDate}
                </p>
                <h2 className="text-3xl font-semibold text-white">{slide?.title}</h2>
                {slide?.narration ? (
                  <p className="whitespace-pre-line text-lg leading-relaxed text-stone-300">
                    {slide.narration}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {slide?.media ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-6 pb-8 pt-20 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-300">
                {formattedDate}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">{slide.title}</h2>
              {slide.narration ? (
                <p className="mx-auto mt-2 max-w-2xl whitespace-pre-line text-stone-200">
                  {slide.narration}
                </p>
              ) : null}
            </div>
          ) : null}

          <div
            className={`absolute inset-x-0 top-4 z-20 flex items-center justify-between px-4 transition-opacity duration-500 ${
              controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <button
              type="button"
              onClick={handleExit}
              aria-label="Exit slideshow"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-xl text-white backdrop-blur transition hover:bg-black/60"
            >
              ×
            </button>

            <div className="flex items-center gap-2">
              {slide?.media?.mediaType === "video" ? (
                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
                >
                  {muted ? "🔇" : "🔊"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause" : "Play"}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
              >
                {playing ? "❚❚" : "▶"}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous"
            className={`absolute inset-y-0 left-0 z-10 w-1/5 transition-opacity duration-500 ${
              controlsVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="ml-2 flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-2xl text-white backdrop-blur">
              ‹
            </span>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next"
            className={`absolute inset-y-0 right-0 z-10 flex w-1/5 justify-end transition-opacity duration-500 ${
              controlsVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="mr-2 flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-2xl text-white backdrop-blur">
              ›
            </span>
          </button>
        </>
      )}
    </div>
  );
}
