import { createSupabaseAdminClient } from "../src/lib/supabase/admin";
import fs from "fs";
import path from "path";

// Basic .env.local loader
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf-8");
  env.split("\n").forEach((line) => {
    const [key, ...value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.join("=").trim().replace(/^["']|["']$/g, "");
    }
  });
}

async function debug() {
  const admin = createSupabaseAdminClient();
  const { data: attempts, error } = await admin.from("exam_attempts").select("id, student_id, status");
  console.log("Total Attempts:", attempts?.length);
  console.log("Error:", error);
  if (attempts && attempts.length > 0) {
    console.log("First Attempt:", attempts[0]);
    const { data: st } = await admin.from("students").select("id, name, activation_code, team_id").eq("id", attempts[0].student_id).single();
    console.log("Student for Attempt:", st);
  }
  
  const { data: joined, error: jErr } = await admin
    .from("students")
    .select("id, name, exam_attempts(status)")
    .eq("id", "46a19b4b-b259-48cb-9f88-fcfc61885c81");
  console.log("Joined Data (Array):", joined);
  const { data: allStudents } = await admin.from("students").select("id, name, auth_user_id, activation_code");
  console.log("All Students:", allStudents);
}

debug();
