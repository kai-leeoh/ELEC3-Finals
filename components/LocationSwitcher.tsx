'use client';

import { useRouter } from 'next/navigation';
import type { ChangeEvent } from 'react';

interface Props {
  locations: { name: string; slug: string }[];
  currentSlug: string;
  basePath?: string;
  queryParam?: string;
}

// Branch dropdown for customers and multi-branch admins.
// Public pages use path routing (/main); the dashboard passes
// queryParam so it navigates to /admin?location=main instead.
export default function LocationSwitcher({ locations, currentSlug, basePath = '', queryParam }: Props) {
  const router = useRouter();

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const slug = e.target.value;
    router.push(queryParam ? `${basePath}?${queryParam}=${slug}` : `${basePath}/${slug}`);
  }

  if (locations.length <= 1) return null;

  return (
    <select
      value={currentSlug}
      onChange={handleChange}
      className="location-switcher"
      aria-label="Choose a branch"
    >
      {locations.map((loc) => (
        <option key={loc.slug} value={loc.slug}>
          {loc.name}
        </option>
      ))}
    </select>
  );
}
