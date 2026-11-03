import { createClient } from '@supabase/supabase-js';

// Public client, used on customer-facing pages (branch pages, booking form).
// Safe to expose in the browser: RLS on the tables keeps writes scoped.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side client, used only in API routes and server components that
// need to bypass RLS. Never import this into a client component.
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
