/** Only ever redirect to a same-site relative path — never let a `next=`
 *  param send someone off to an attacker-controlled URL. */
export function safeRelativePath(raw: string | null | undefined, fallback = "/"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}
