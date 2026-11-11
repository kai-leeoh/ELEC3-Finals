import LocationSwitcher from "../../components/LocationSwitcher";
import SignOutButton from "../../components/SignOutButton";
import StatusButtons from "../../components/StatusButtons";
import { SHOP_OFFSET, SHOP_TIMEZONE, shopDate } from "../../lib/shop";
import { supabaseAdmin } from "../../lib/supabase";
import { getAdminAccess } from "../../lib/supabase-server";
import type { AppointmentRow } from "../../lib/types";

// Admin dashboard: /admin?location=main
// Only shows branches listed for this user in admin_users.
export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ location?: string }>;
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
  const activeSlug = (await searchParams)?.location;

  const { data: locations } = await db
    .from("locations")
    .select("id, name, slug")
    .in("id", access.locationIds);
  const current =
    locations?.find((l) => l.slug === activeSlug) ?? locations?.[0];
  if (!current) {
    return (
      <main className="page">
        <p className="empty-state">No locations set up yet.</p>
      </main>
    );
  }

  // "Today" means today in the Philippines, whatever timezone the server runs in.
  const today = shopDate();
  const startOfDay = new Date(`${today}T00:00:00${SHOP_OFFSET}`);
  const endOfDay = new Date(`${today}T23:59:59.999${SHOP_OFFSET}`);

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
          Couldn't load today's bookings. Refresh the page to try again.
        </p>
      </main>
    );
  }

  const appointments = (data ?? []) as unknown as AppointmentRow[];
  const noShowCount = appointments.filter((a) => a.status === "no_show").length;
  const total = appointments.length;

  return (
    <main className="page admin-dashboard">
      <header className="page-header">
        <div>
          <h1>Today's schedule</h1>
          <p className="sub">{current.name}</p>
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

      <section className="stats">
        <div className="stat">
          <strong>{total}</strong>
          <span>booked today</span>
        </div>
        <div className="stat no-shows">
          <strong>{noShowCount}</strong>
          <span>no-shows</span>
        </div>
      </section>

      {total === 0 ? (
        <div className="card empty-state">
          <b>No bookings yet today</b>
          New appointments at {current.name} will show up here.
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
