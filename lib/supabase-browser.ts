import { createBrowserClient } from '@supabase/ssr';

// Used only in client components (the login form and sign-out button).
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
