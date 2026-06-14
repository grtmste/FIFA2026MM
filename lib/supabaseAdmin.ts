import { createClient } from "@supabase/supabase-js";

// Fall back to placeholder values so the client can be constructed during
// the build (e.g. static page generation) even if env vars are not yet set.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder";

/**
 * Server-only client using the service role key. Bypasses Row Level Security.
 * Never import this in client components.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
