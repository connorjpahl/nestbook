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
  return { success: `Invited ${email}.` };
}
