import Link from "next/link";

const FEATURES = [
  {
    emoji: "📸",
    title: "Photos & videos",
    body: "Drop in photos and video clips for every milestone, from first steps to first day of school.",
  },
  {
    emoji: "🎙️",
    title: "Narrated stories",
    body: "Add a written narration to each moment so the story behind the picture never gets lost.",
  },
  {
    emoji: "👨‍👩‍👧",
    title: "Shared with family",
    body: "Invite parents, grandparents, and caregivers to add to the same timeline together.",
  },
  {
    emoji: "🔒",
    title: "Private by default",
    body: "Every timeline is only visible to the people you invite to it — never public.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
          Watch them grow, one moment at a time.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">
          Little Timeline is a shared, scrollable timeline for your child&apos;s
          milestones — photos, videos, and the stories behind them, kept in
          one place for your whole family.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-amber-600 px-5 py-2.5 font-medium text-white transition hover:bg-amber-700"
          >
            Start a timeline
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-stone-300 px-5 py-2.5 font-medium text-stone-700 transition hover:bg-stone-100"
          >
            Sign in
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-4 pb-24 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <div className="text-2xl">{feature.emoji}</div>
            <h2 className="mt-2 font-semibold text-stone-900">{feature.title}</h2>
            <p className="mt-1 text-sm text-stone-600">{feature.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
