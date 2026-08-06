import Link from "next/link";
import { SproutMark } from "@/components/SproutMark";
import { GrowthTree } from "@/components/GrowthTree";

const JOURNEY = [
  { label: "Newborn" },
  { label: "Baby" },
  { label: "Toddler" },
  { label: "School days" },
  { label: "Graduate" },
] as const;

const FEATURES = [
  {
    emoji: "📸",
    title: "Photos & videos",
    body: "Drop in photos and video clips for every milestone, from first steps to first day of school.",
    tint: "terracotta" as const,
  },
  {
    emoji: "🎙️",
    title: "Narrated stories",
    body: "Add a written narration to each moment so the story behind the picture never gets lost.",
    tint: "sage" as const,
  },
  {
    emoji: "👨‍👩‍👧",
    title: "Shared with family",
    body: "Invite parents, grandparents, and caregivers to add to the same timeline together.",
    tint: "sage" as const,
  },
  {
    emoji: "🔒",
    title: "Private by default",
    body: "Every timeline is only visible to the people you invite to it — never public.",
    tint: "terracotta" as const,
  },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      <section className="relative mx-auto max-w-4xl px-4 pt-20 pb-16 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-terracotta-100 opacity-60 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-10 left-1/2 -z-10 h-72 w-72 -translate-x-[calc(50%-10rem)] rounded-full bg-sage-100 opacity-50 blur-3xl"
        />

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-terracotta-100">
          <SproutMark className="h-9 w-9" />
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
          Watch them grow, one moment at a time.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">
          NestBook is a shared, scrollable timeline for your child&apos;s
          milestones — photos, videos, and the stories behind them, kept in
          one place for your whole family.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-terracotta-600 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-terracotta-700"
          >
            Start a timeline
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-stone-300 bg-white px-5 py-2.5 font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-wide text-stone-400">
          One timeline, their whole journey
        </p>
        <div className="relative flex flex-wrap items-start justify-center gap-x-8 gap-y-8 sm:justify-between">
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-terracotta-200 via-sage-200 to-terracotta-200 sm:block"
          />
          {JOURNEY.map((stage, i) => (
            <div key={stage.label} className="relative flex flex-col items-center gap-2">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-terracotta-100">
                {i === 0 ? (
                  <SproutMark className="h-8 w-8" />
                ) : (
                  <GrowthTree stage={i as 1 | 2 | 3 | 4} className="h-9 w-9" />
                )}
              </span>
              <span className="text-xs font-medium text-stone-500">{stage.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-4 pb-24 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
              feature.tint === "terracotta" ? "border-terracotta-100" : "border-sage-100"
            }`}
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${
                feature.tint === "terracotta" ? "bg-terracotta-50" : "bg-sage-50"
              }`}
            >
              {feature.emoji}
            </div>
            <h2 className="mt-3 font-semibold text-stone-900">{feature.title}</h2>
            <p className="mt-1 text-sm text-stone-600">{feature.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
