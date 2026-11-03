'use client';

import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '../lib/supabase-browser';

export default function SignOutButton() {
  const router = useRouter();

  async function handleClick() {
    await supabaseBrowser().auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button type="button" onClick={handleClick} className="link-button">
      Sign out
    </button>
  );
}
