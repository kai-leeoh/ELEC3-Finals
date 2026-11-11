import { supabase } from "../../../lib/supabase";
import BookingForm from "../../../components/BookingForm";
import BranchNotFound from "../../../components/BranchNotFound";
import type { Barber, Location, Service } from "../../../lib/types";

export default async function BookPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location: slug } = await params;

  const { data: location } = await supabase
    .from("locations")
    .select("*")
    .eq("slug", slug)
    .single<Location>();

  if (!location) return <BranchNotFound />;

  const { data: barbers } = await supabase
    .from("barbers")
    .select("*")
    .eq("location_id", location.id)
    .eq("active", true)
    .returns<Barber[]>();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .or(`location_id.eq.${location.id},location_id.is.null`)
    .order("sort_order")
    .returns<Service[]>();

  return (
    <main className="page">
      <h1>Book at {location.name}</h1>
      <p className="sub">
        Takes about a minute. We'll hold your slot once you confirm.
      </p>
      <div className="card">
        <BookingForm
          locationId={location.id}
          barbers={barbers ?? []}
          services={services ?? []}
        />
      </div>
    </main>
  );
}
