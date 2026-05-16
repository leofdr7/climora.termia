/**
 * Supabase clients expect the project root (e.g. https://ref.supabase.co).
 * If NEXT_PUBLIC_SUPABASE_URL points at the REST API (…/rest/v1), Auth requests
 * get composed incorrectly and APIs return errors like "Invalid path specified in request URL".
 */
export function normalizeSupabaseProjectUrl(url: string): string {
  const trimmed = url.trim();
  try {
    const u = new URL(trimmed);
    const path = (u.pathname.replace(/\/+$/, "") || "/").toLowerCase();
    if (path === "/rest/v1" || path.startsWith("/rest/v1/")) {
      u.pathname = "";
      u.search = "";
      u.hash = "";
      return u.origin;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}
