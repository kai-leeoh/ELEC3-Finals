import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabase } from '../lib/supabase';

export const dynamic = 'force-dynamic';

// With one branch, skip the picker so a single-shop site feels like a normal site.
export default async function Home() {
  const { data: locations, error } = await supabase.from('locations').select('name, slug');

  if (error) {
    console.error('Could not load locations:', error);
    return (
      <main className="page">
        <p className="error" role="alert">
          Couldn't load branches. Check the Supabase keys in .env.local and the terminal for details.
        </p>
      </main>
    );
  }

  if (!locations?.length) {
    return (
      <main className="page">
        <p className="empty-state">No branches yet. Run supabase/seed.sql in the Supabase SQL Editor.</p>
      </main>
    );
  }

  if (locations.length === 1) {
    redirect(`/${locations[0].slug}`);
  }

  return (
    <main className="page">
      <h1>Choose a branch</h1>
      <ul className="location-list">
        {locations.map((loc) => (
          <li key={loc.slug}>
            <Link href={`/${loc.slug}`}>{loc.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
