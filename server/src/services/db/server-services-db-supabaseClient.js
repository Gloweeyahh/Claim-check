import { createClient } from '@supabase/supabase-js';

let client = null;

export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null; // logging is optional — verify still works without it
  }
  if (!client) {
    client = createClient(url, key);
  }
  return client;
}
