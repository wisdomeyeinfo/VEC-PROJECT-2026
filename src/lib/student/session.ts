import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "vfa_student";

type StudentSessionPayload = {
  student_id: string;
  team_id: string;
  language: string;
  whatsapp_joined?: boolean;
};

function getSecretKey() {
  const secret = process.env.STUDENT_SESSION_SECRET;
  if (!secret) throw new Error("Missing STUDENT_SESSION_SECRET");
  return new TextEncoder().encode(secret);
}

export async function setStudentSession(payload: StudentSessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearStudentSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getStudentSession(): Promise<StudentSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const student_id = String(payload.student_id || "");
    const team_id = String(payload.team_id || "");
    const language = String(payload.language || "");
    const whatsapp_joined = Boolean(payload.whatsapp_joined);

    if (!student_id || !team_id || !language) return null;
    return { student_id, team_id, language, whatsapp_joined };
  } catch {
    return null;
  }
}

