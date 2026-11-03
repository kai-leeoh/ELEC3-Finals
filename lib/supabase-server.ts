import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { supabaseAdmin } from './supabase';

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Client that reads the logged-in user's session from cookies.
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list: CookieToSet[]) => {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server components can't set cookies; proxy.ts refreshes the session instead.
          }
        },
      },
    }
  );
}

export interface AdminAccess {
  user: User;
  locationIds: string[];
  rows: { location_id: string; role: string }[];
}

// Returns the logged-in user plus the branches they manage, or null.
// A user with no admin_users rows is logged in but not an admin.
export async function getAdminAccess(): Promise<AdminAccess | null> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  if (!user) return null;

  const { data: rows } = await supabaseAdmin()
    .from('admin_users')
    .select('location_id, role')
    .eq('auth_user_id', user.id);

  if (!rows?.length) return null;
  return { user, locationIds: rows.map((r) => r.location_id as string), rows };
}
