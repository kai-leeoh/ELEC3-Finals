"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Simple line icons, drawn inline so no extra package is needed.
const icons: Record<string, ReactNode> = {
  Dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </>
  ),
  Booking: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  Staff: (
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
};

// Logo at the top. The three-tab bar at the bottom only appears once the
// client is in the booking flow (/book, branch pages and the booking form).
export default function SiteNav() {
  const pathname = usePathname();

  const onStaff = pathname === "/admin" || pathname.startsWith("/admin/");
  const onDashboard = pathname === "/";
  const onBooking = !onStaff && !onDashboard; // /book, branch pages and the booking form

  const showBottomNav = onBooking;

  const links = [
    { label: "Dashboard", href: "/", on: onDashboard },
    { label: "Booking", href: "/book", on: onBooking },
    { label: "Staff", href: "/admin", on: onStaff },
  ];

  return (
    <>
      <header className="site-header">
        <div className="site-nav">
          <Link href="/" className="logo">
            <i className="pole" aria-hidden="true" />
            <span>
              Pau Cutz
              <small>Barber shop</small>
            </span>
          </Link>
        </div>
      </header>

      {showBottomNav && (
        <nav className="bottom-nav" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className={l.on ? "on" : ""}
              aria-current={l.on ? "page" : undefined}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {icons[l.label]}
              </svg>
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
