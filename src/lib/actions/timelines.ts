"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Timeline } from "@/types/database";

export async function createTimeline(_prevState: unknown, formData: FormData) {
  const childName = String(formData.get("childName") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!childName) {
    return { error: "Please enter a name." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("create_timeline", {
      _child_name: childName,
      _description: description || null,
    })
    .single<Timeline>();

  if (error || !data) {
    return { error: error?.message ?? "Could not create the timeline." };
  }

  redirect(`/timeline/${data.id}`);
}

export async function inviteMember(timelineId: string, _prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "editor");

  if (!email) {
    return { error: "Please enter an email address." };
  }

  const supabase = await createClient();

  // Members are matched by user id, but we only have their email. Look the
  // user up through a security-definer RPC that resolves email -> user id
  // without exposing the full auth.users table to clients.
  const { data: userId, error: rpcError } = await supabase.rpc("get_user_id_by_email", {
    _email: email,
  });

  if (rpcError || !userId) {
    return { error: "No account found with that email. Ask them to sign up first." };
  }

  const { error: insertError } = await supabase.from("timeline_members").insert({
    timeline_id: timelineId,
    user_id: userId as string,
    role: role as "owner" | "editor" | "viewer",
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath(`/timeline/${timelineId}`);
  return {
    success: `Added ${email} to this timeline. No email is sent — they'll see it in their own dashboard next time they sign in.`,
  };
}

export async function updateTimeline(timelineId: string, _prevState: unknown, formData: FormData) {
  const childName = String(formData.get("childName") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!childName) {
    return { error: "Please enter a name." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("timelines")
    .update({ child_name: childName, description: description || null })
    .eq("id", timelineId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/timeline/${timelineId}`);
  revalidatePath("/dashboard");
  return { success: true as const, childName, description: description || null };
}

export async function deleteTimeline(timelineId: string) {
  const supabase = await createClient();

  // Collect storage paths before deleting -- the DB rows cascade away with
  // the timeline, but the actual files in the bucket won't clean themselves
  // up, so gather what to remove first.
  const { data: events } = await supabase.from("events").select("id").eq("timeline_id", timelineId);
  const eventIds = (events ?? []).map((event) => event.id);

  let storagePaths: string[] = [];
  if (eventIds.length > 0) {
    const { data: mediaRows } = await supabase
      .from("event_media")
      .select("storage_path")
      .in("event_id", eventIds);
    storagePaths = (mediaRows ?? []).map((row) => row.storage_path);
  }

  const { error } = await supabase.from("timelines").delete().eq("id", timelineId);

  if (error) {
    return { error: error.message };
  }

  if (storagePaths.length > 0) {
    await supabase.storage.from("media").remove(storagePaths);
  }

  redirect("/dashboard");
}
