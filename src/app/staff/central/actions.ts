"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createLiveClass(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const zoom_link = formData.get("zoom_link") as string;
  const gender = formData.get("gender") as string;
  const city = formData.get("city") as string;
  const scheduled_at = formData.get("scheduled_at") as string;

  if (!title || !zoom_link || !scheduled_at) throw new Error("Title, Zoom Link, and Schedule Date are required");

  const admin = createSupabaseAdminClient();
  
  try {
    const { error } = await admin.from("live_classes").insert({
      title,
      description: description || null,
      zoom_link,
      gender: gender || 'Both',
      city: city || null,
      scheduled_at: new Date(scheduled_at).toISOString(),
    });

    if (error) {
      if (error.message.includes("schema cache") || error.code === "PGRST116") {
        throw new Error("The 'live_classes' table is missing from your database. Please run the SQL migrations in Supabase first.");
      }
      throw new Error(error.message);
    }
  } catch (e: any) {
    throw new Error(e.message || "Failed to create live class");
  }

  revalidatePath("/staff/central/live");
}

export async function createAnnouncement(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const priority = formData.get("priority") as string;

  const admin = createSupabaseAdminClient();
  
  try {
    const { error } = await admin.from("announcements").insert({
      title,
      content,
      priority,
    });

    if (error) {
      if (error.message.includes("schema cache") || error.code === "PGRST116") {
        throw new Error("The 'announcements' table is missing from your database. Please run the SQL migrations in Supabase first.");
      }
      throw new Error(error.message);
    }
  } catch (e: any) {
    throw new Error(e.message || "Failed to create announcement");
  }

  revalidatePath("/staff/central/announcements");
}
