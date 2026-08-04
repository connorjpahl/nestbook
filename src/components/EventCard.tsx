import type { MediaType } from "@/types/database";

export interface DisplayMedia {
  id: string;
  media_type: MediaType;
  signedUrl: string | null;
}

export function EventCard({
  title,
  narration,
  eventDate,
  media,
}: {
  title: string;
  narration: string | null;
  eventDate: string;
  media: DisplayMedia[];
}) {
  const formattedDate = new Date(`${eventDate}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <li className="relative pl-10">
      <span className="absolute left-[5px] top-1.5 h-3 w-3 rounded-full border-2 border-amber-500 bg-white" />
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
          {formattedDate}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-stone-900">{title}</h3>
        {narration ? <p className="mt-2 whitespace-pre-line text-stone-600">{narration}</p> : null}

        {media.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((item) =>
              item.signedUrl ? (
                <div key={item.id} className="overflow-hidden rounded-lg bg-stone-100">
                  {item.media_type === "video" ? (
                    <video src={item.signedUrl} controls className="aspect-square w-full object-cover" />
                  ) : (
                    // Signed URLs are short-lived and per-user, so next/image's
                    // remote optimizer isn't a good fit here.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.signedUrl}
                      alt={title}
                      className="aspect-square w-full object-cover"
                    />
                  )}
                </div>
              ) : null
            )}
          </div>
        ) : null}
      </div>
    </li>
  );
}
