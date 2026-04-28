import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client with service role key.
 * Use this ONLY in API routes and server actions — never expose to the browser.
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn(
      '⚠️ Server Supabase credentials not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.local'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}
