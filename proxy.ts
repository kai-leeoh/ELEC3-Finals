import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Keeps the session fresh and sends logged-out visitors to the login page.
// This is only the first gate: pages and API routes re-check access themselves.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list: CookieToSet[]) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const isLogin = request.nextUrl.pathname === '/admin/login';

  if (!data?.user && !isLogin) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  if (data?.user && isLogin) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
