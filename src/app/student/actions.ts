"use server";

import { redirect } from "next/navigation";
import { clearStudentSession, getStudentSession, setStudentSession } from "@/lib/student/session";

export async function markWhatsappJoined() {
  const session = await getStudentSession();
  if (!session) redirect("/student/login");

  await setStudentSession({ ...session, whatsapp_joined: true });
  redirect("/student");
}

export async function studentSignOut() {
  await clearStudentSession();
  redirect("/student/login");
}

