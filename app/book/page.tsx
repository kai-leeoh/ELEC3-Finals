import Link from "next/link";
import { redirect } from "next/navigation";
import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

// Booking tab: choose which branch to book at.
export default async function BookingPage() {
  const { data: locations, error } = await supabase
    .from("locations")
    .select("id, name, slug, address")
    .order("created_at");

  if (error) {
    console.error("Could not load locations:", error);
    return (
      <main className="page">
        <p className="alert" role="alert">
          Couldn't load branches. Check the Supabase keys in .env.local and the
          terminal for details.
        </p>
      </main>
    );
  }

  if (!locations?.length) {
    return (
      <main className="page">
        <p className="empty-state">
          No branches yet. Run supabase/seed.sql in the Supabase SQL Editor.
        </p>
      </main>
    );
  }

  if (locations.length === 1) {
    redirect(`/${locations[0].slug}`);
  }

  const { data: barbers } = await supabase
    .from("barbers")
    .select("location_id")
    .eq("active", true);
  const countFor = (id: string) =>
    barbers?.filter((b) => b.location_id === id).length ?? 0;

  return (
    <main className="page">
      <h1>Choose a branch</h1>
      <p className="sub">
        Pick the shop closest to you, then book your appointment.
      </p>
      <ul className="location-list">
        {locations.map((loc) => (
          <li key={loc.slug}>
            <Link href={`/${loc.slug}`}>
              <div>
                {loc.name}
                <small>
                  {loc.address || "Address to be added"} · {countFor(loc.id)}{" "}
                  barbers
                </small>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
