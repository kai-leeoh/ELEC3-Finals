import Link from "next/link";
import { supabase } from "../../lib/supabase";
import LocationSwitcher from "../../components/LocationSwitcher";
import BranchNotFound from "../../components/BranchNotFound";
import ProductCard from "../../components/ProductCard";
import { formatHours, formatPrice } from "../../lib/format";
import type { Barber, Location, Product, Service } from "../../lib/types";

function ServiceCard({ services }: { services: Service[] }) {
  return (
    <div className="card service-card">
      <ul className="service-list">
        {services.map((s) => (
          <li key={s.id} className="service">
            <div className="service-title">
              <span>{s.name}</span>
              <span className="service-leader" aria-hidden="true" />
              <span className="service-price">{formatPrice(s.price)}</span>
            </div>
            {s.description && <p>{s.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Public branch page: /main, /second, etc.
export default async function LocationPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location: slug } = await params;

  const { data: allLocations } = await supabase
    .from("locations")
    .select("name, slug")
    .order("created_at");

  const { data: location } = await supabase
    .from("locations")
    .select("*")
    .eq("slug", slug)
    .single<Location>();

  if (!location) return <BranchNotFound />;

  const hours = formatHours(location.opens_at, location.closes_at);

  const { data: barbers } = await supabase
    .from("barbers")
    .select("*")
    .eq("location_id", location.id)
    .eq("active", true)
    .returns<Barber[]>();

  // Services scoped to this location, plus any shared (location_id null) ones
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .or(`location_id.eq.${location.id},location_id.is.null`)
    .order("sort_order")
    .returns<Service[]>();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("sort_order")
    .returns<Product[]>();

  const barberServices = (services ?? []).filter((s) => s.category !== "spa");
  const spaServices = (services ?? []).filter((s) => s.category === "spa");

  return (
    <main className="page">
      <header className="page-header">
        <h1>{location.name}</h1>
        <LocationSwitcher locations={allLocations ?? []} currentSlug={slug} />
      </header>

      <div className="chips">
        {location.address && (
          <span className="chip">
            <i className="dot" />
            {location.address}
          </span>
        )}
        {location.phone && (
          <span className="chip">
            <i className="dot" />
            {location.phone}
          </span>
        )}
        {hours && (
          <span className="chip">
            <i className="dot" />
            {hours}
          </span>
        )}
      </div>

      <h2 className="section-title">Barbers ({barbers?.length ?? 0})</h2>
      <ul className="barbers">
        {barbers?.map((b) => (
          <li key={b.id} className="barber">
            <span className="avatar" aria-hidden="true">
              {b.name.charAt(0)}
            </span>
            {b.name}
          </li>
        ))}
      </ul>

      <h2 className="section-title">Services</h2>
      <ServiceCard services={barberServices} />

      {spaServices.length > 0 && (
        <>
          <h2 className="section-title">Offers and spa</h2>
          <ServiceCard services={spaServices} />
        </>
      )}

      {products && products.length > 0 && (
        <>
          <h2 className="section-title">Products</h2>
          <ProductCard products={products} />
        </>
      )}

      <Link href={`/${slug}/book`} className="btn cta">
        Book an appointment
      </Link>
    </main>
  );
}
