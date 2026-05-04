/**
 * Central language normalization for VEC 2026.
 *
 * The DB (students.language) stores full names like "English", "Hindi", "Marathi".
 * The question_sets.language column stores the same full names.
 * The i18n module uses short codes: "en", "hi", "mr", etc.
 *
 * Use these helpers to convert between the two forms safely everywhere.
 */

export const LANGUAGE_OPTIONS = [
  { label: "English",  value: "English",  code: "en" },
  { label: "Hindi",    value: "Hindi",    code: "hi" },
  { label: "Marathi",  value: "Marathi",  code: "mr" },
  { label: "Gujarati", value: "Gujarati", code: "gu" },
  { label: "Tamil",    value: "Tamil",    code: "ta" },
  { label: "Bengali",  value: "Bengali",  code: "bn" },
  { label: "Kannada",  value: "Kannada",  code: "kn" },
] as const;

export type LanguageValue = typeof LANGUAGE_OPTIONS[number]["value"];
export type LanguageCode  = typeof LANGUAGE_OPTIONS[number]["code"];

/** Full name → short code  e.g. "English" → "en"  (falls back to "en") */
export function langToCode(lang: string | null | undefined): LanguageCode {
  const found = LANGUAGE_OPTIONS.find(
    (l) => l.value.toLowerCase() === (lang ?? "").toLowerCase()
  );
  return (found?.code ?? "en") as LanguageCode;
}

/** Short code → full name  e.g. "en" → "English"  (falls back to "English") */
export function codeToLang(code: string | null | undefined): LanguageValue {
  const found = LANGUAGE_OPTIONS.find(
    (l) => l.code === (code ?? "").toLowerCase()
  );
  return (found?.value ?? "English") as LanguageValue;
}

/**
 * Normalize whatever is stored in the DB to a consistent full-name form.
 * Accepts both "en" and "English" and returns "English".
 */
export function normalizeLang(raw: string | null | undefined): LanguageValue {
  if (!raw) return "English";
  // If it's already a code, convert to full name first
  const byCode = LANGUAGE_OPTIONS.find((l) => l.code === raw.toLowerCase());
  if (byCode) return byCode.value;
  // If it's already a full name (case-insensitive)
  const byName = LANGUAGE_OPTIONS.find(
    (l) => l.value.toLowerCase() === raw.toLowerCase()
  );
  return (byName?.value ?? "English") as LanguageValue;
}

/** For display in the UI, returns the full name label */
export function langLabel(raw: string | null | undefined): string {
  return normalizeLang(raw);
}

/** Typo alias: "Gujrati" → "Gujarati" */
export function fixLangTypo(raw: string | null | undefined): string {
  if (!raw) return "";
  // Known DB typos
  const typos: Record<string, string> = {
    gujrati:  "Gujarati",
    gujarati: "Gujarati",
    bengali:  "Bengali",
    bangla:   "Bengali",
    kannada:  "Kannada",
  };
  return typos[raw.toLowerCase()] ?? raw;
}
