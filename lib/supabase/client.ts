import { createBrowserClient } from "@supabase/ssr";
import { normalizeSupabaseProjectUrl } from "@/lib/supabase/project-url";

export function createClient() {
  return createBrowserClient(
    normalizeSupabaseProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL!),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
