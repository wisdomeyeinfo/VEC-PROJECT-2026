import crypto from "crypto";

/**
 * Generates a unique 10-digit Exam ID
 * Format: Year (2 digits) + Team Prefix (3 digits) + Random (5 digits)
 * For simplicity here, we just generate a random 10-digit number.
 * In a real robust system, you'd check for collisions in the DB.
 */
export function generateExamId(): string {
  // Generate a random number between 1000000000 and 9999999999
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

/**
 * Generates a simple, human-readable temporary password
 */
export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking chars (0, O, 1, I, L)
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Hashes a password using PBKDF2
 */
export function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT || "vec-default-salt";
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}
