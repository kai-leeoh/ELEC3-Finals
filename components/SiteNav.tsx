"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Top bar with the Pau Cutz logo and a Menu button that opens
// the branch links and the staff link.
export default function SiteNav({
  locations,
}: {
  locations: { name: string; slug: string }[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isOn = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header">
      <div className="site-nav">
        <Link href="/" className="logo" onClick={() => setOpen(false)}>
          <i className="pole" aria-hidden="true" />
          <span>
            Pau Cutz
            <small>Barber shop</small>
          </span>
        </Link>
        <button
          type="button"
          className="navbtn"
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav id="site-menu" className="menu" aria-label="Main">
          {locations.map((loc) => (
            <Link
              key={loc.slug}
              href={`/${loc.slug}`}
              className={isOn(`/${loc.slug}`) ? "on" : ""}
              onClick={() => setOpen(false)}
            >
              {loc.name}
            </Link>
          ))}
          <Link
            href="/admin"
            className={isOn("/admin") ? "on" : ""}
            onClick={() => setOpen(false)}
          >
            Staff
          </Link>
        </nav>
      )}
    </header>
  );
}
