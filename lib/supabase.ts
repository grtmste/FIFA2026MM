import { createClient } from "@supabase/supabase-js";

// Fall back to placeholder values so the client can be constructed during
// the build (e.g. static page generation) even if env vars are not yet set.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
