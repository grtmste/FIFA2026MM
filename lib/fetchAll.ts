import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Fetch every row from a table, working around PostgREST's default 1000-row
 * cap by paginating with .range(). Without this, large tables (e.g. all
 * predictions across many participants) are silently truncated.
 */
export async function fetchAllRows<T = Record<string, unknown>>(
  client: SupabaseClient,
  table: string
): Promise<T[]> {
  const PAGE = 1000;
  let from = 0;
  const all: T[] = [];
  for (;;) {
    const { data, error } = await client
      .from(table)
      .select("*")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...(data as T[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}
