import Link from "next/link";
import AutoRefresh from "../../components/AutoRefresh";
import LocationSwitcher from "../../components/LocationSwitcher";
import SignOutButton from "../../components/SignOutButton";
import StatusButtons from "../../components/StatusButtons";
import { supabaseAdmin } from "../../lib/supabase";
import { getAdminAccess } from "../../lib/supabase-server";
import { SHOP_TIMEZONE, shopDate, SHOP_OFFSET } from "../../lib/shop";
import type { AppointmentRow } from "../../lib/types";

// Shop-time date (YYYY-MM-DD) one day before or after the given one.
function shiftDate(date: string, days: number): string {
  const noon = new Date(`${date}T12:00:00${SHOP_OFFSET}`);
  return shopDate(new Date(noon.getTime() + days * 24 * 60 * 60 * 1000));
}

function isValidDate(value: string | undefined): value is string {
  return (
    !!value &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(`${value}T12:00:00${SHOP_OFFSET}`).getTime())
  );
}

// Admin dashboard: /admin?location=main&date=2026-11-12
// Only shows branches listed for this user in admin_users.
export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; date?: string }>;
}) {
  const access = await getAdminAccess();
  if (!access) {
    return (
      <main className="page">
        <p className="alert" role="alert">
          This account isn't set up as staff for any branch. Ask the owner to
          add you.
        </p>
        <SignOutButton />
      </main>
    );
  }

  const db = supabaseAdmin();
  const params = await searchParams;
  const activeSlug = params?.location;

  const { data: locations } = await db
    .from("locations")
    .select("id, name, slug")
    .in("id", access.locationIds)
    .order("created_at");
  const current =
    locations?.find((l) => l.slug === activeSlug) ?? locations?.[0];
  if (!current) {
    return (
      <main className="page">
        <p className="empty-state">No locations set up yet.</p>
      </main>
    );
  }

  // Dates are in the Philippines, whatever timezone the server runs in.
  const today = shopDate();
  const date = isValidDate(params?.date) ? params.date : today;
  const isToday = date === today;

  const startOfDay = new Date(`${date}T00:00:00${SHOP_OFFSET}`);
  const endOfDay = new Date(`${date}T23:59:59.999${SHOP_OFFSET}`);

  const dateLabel = new Date(
    `${date}T12:00:00${SHOP_OFFSET}`,
  ).toLocaleDateString("en-PH", {
    timeZone: SHOP_TIMEZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hrefFor = (d: string) => `/admin?location=${current.slug}&date=${d}`;

  const { data, error } = await db
    .from("appointments")
    .select("*, customers(name, phone), barbers(name), services(name, price)")
    .eq("location_id", current.id)
    .gte("starts_at", startOfDay.toISOString())
    .lte("starts_at", endOfDay.toISOString())
    .order("starts_at", { ascending: true });

  if (error) {
    return (
      <main className="page">
        <p className="alert" role="alert">
          Couldn't load the bookings. Refresh the page to try again.
        </p>
      </main>
    );
  }

  const appointments = (data ?? []) as unknown as AppointmentRow[];
  const noShowCount = appointments.filter((a) => a.status === "no_show").length;
  const total = appointments.length;

  return (
    <main className="page admin-dashboard">
      <AutoRefresh seconds={10} />
      <header className="page-header">
        <div>
          <h1>{isToday ? "Today's schedule" : "Schedule"}</h1>
          <p className="sub">
            {current.name} · {dateLabel}
          </p>
        </div>
        <div className="header-row">
          <LocationSwitcher
            locations={locations ?? []}
            currentSlug={current.slug}
            basePath="/admin"
            queryParam="location"
          />
          <SignOutButton />
        </div>
      </header>

      <nav className="date-nav" aria-label="Choose a day">
        <Link href={hrefFor(shiftDate(date, -1))} className="date-btn">
          ← Previous
        </Link>
        <Link
          href={hrefFor(today)}
          className="date-btn"
          aria-current={isToday ? "date" : undefined}
        >
          Today
        </Link>
        <Link href={hrefFor(shiftDate(date, 1))} className="date-btn">
          Next →
        </Link>
        {/* key={date} makes the picker reset to the new date after Previous/Next/Today */}
        <form key={date} action="/admin" method="get" className="date-form">
          <input type="hidden" name="location" value={current.slug} />
          <input
            type="date"
            name="date"
            defaultValue={date}
            aria-label="Pick a date"
            className="date-input"
          />
          <button type="submit" className="date-btn">
            Go
          </button>
        </form>
      </nav>

      <section className="stats">
        <div className="stat">
          <strong>{total}</strong>
          <span>{isToday ? "booked today" : "booked this day"}</span>
        </div>
        <div className="stat no-shows">
          <strong>{noShowCount}</strong>
          <span>no-shows</span>
        </div>
      </section>

      {total === 0 ? (
        <div className="card empty-state">
          <b>No bookings on this day</b>
          Appointments at {current.name} for {dateLabel} will show up here.
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="appointment-table">
            <thead>
              <tr>
                <th scope="col">Time</th>
                <th scope="col">Customer</th>
                <th scope="col">Barber</th>
                <th scope="col">Service</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td data-label="Time">
                    <b>
                      {new Date(a.starts_at).toLocaleTimeString("en-PH", {
                        timeZone: SHOP_TIMEZONE,
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </b>
                  </td>
                  <td data-label="Customer">
                    <span>
                      {a.customers?.name}
                      <small>{a.customers?.phone}</small>
                    </span>
                  </td>
                  <td data-label="Barber">{a.barbers?.name}</td>
                  <td data-label="Service">{a.services?.name}</td>
                  <td data-label="Status">
                    <StatusButtons
                      key={`${a.id}-${a.status}`}
                      appointmentId={a.id}
                      initialStatus={a.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
