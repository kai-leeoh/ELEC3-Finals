"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Top bar: logo plus three links (Dashboard, Booking, Staff).
// Booking opens the booking form for the branch you are viewing,
// or the first branch if you are somewhere else.
export default function SiteNav({
  locations,
}: {
  locations: { name: string; slug: string }[];
}) {
  const pathname = usePathname();

  const firstSegment = pathname.split("/")[1] ?? "";
  const branchSlug =
    locations.find((l) => l.slug === firstSegment)?.slug ?? locations[0]?.slug;
  const bookingHref = branchSlug ? `/${branchSlug}/book` : "/";

  const onStaff = pathname === "/admin" || pathname.startsWith("/admin/");
  const onBooking = !onStaff && pathname.endsWith("/book");
  const onDashboard = !onStaff && !onBooking;

  const links = [
    { label: "Dashboard", href: "/", on: onDashboard },
    { label: "Booking", href: bookingHref, on: onBooking },
    { label: "Staff", href: "/admin", on: onStaff },
  ];

  return (
    <header className="site-header">
      <div className="site-nav">
        <Link href="/" className="logo">
          <i className="pole" aria-hidden="true" />
          <span>
            Pau Cutz
            <small>Barber shop</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={l.on ? "on" : ""}
              aria-current={l.on ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
