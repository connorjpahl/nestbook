import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadSlideshowSlides } from "@/lib/slideshow";
import { SlideshowPlayer } from "@/components/SlideshowPlayer";

export default async function SlideshowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/timeline/${id}/slideshow`);
  }

  const { data: timeline } = await supabase.from("timelines").select("*").eq("id", id).single();

  if (!timeline) {
    notFound();
  }

  const slides = await loadSlideshowSlides(supabase, id);

  return <SlideshowPlayer timelineId={id} childName={timeline.child_name} initialSlides={slides} />;
}
