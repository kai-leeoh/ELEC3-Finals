import Link from "next/link";
import { supabase } from "../lib/supabase";
import { formatPrice } from "../lib/format";
import ProductCard from "../components/ProductCard";
import type { Product, Service } from "../lib/types";

export const dynamic = "force-dynamic";

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

// Dashboard tab: the offers (services list) and the spa offers.
export default async function Dashboard() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order")
    .returns<Service[]>();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("sort_order")
    .returns<Product[]>();

  if (error) {
    console.error("Could not load offers:", error);
    return (
      <main className="page">
        <p className="alert" role="alert">
          Couldn't load offers. Check the Supabase keys in .env.local and the
          terminal for details.
        </p>
      </main>
    );
  }

  // The same service name is listed once, even if it is saved for more than one branch.
  const all = (data ?? []).filter(
    (s, i, list) => list.findIndex((o) => o.name === s.name) === i,
  );
  const services = all.filter((s) => s.category !== "spa");
  const spaOffers = all.filter((s) => s.category === "spa");

  return (
    <main className="page">
      <h1>Offers</h1>
      <p className="sub">Our services and offers, available at every branch.</p>

      <h2 className="section-title">Services</h2>
      {services.length === 0 ? (
        <div className="card empty-state">
          <b>No offers right now</b>
          Check back soon.
        </div>
      ) : (
        <ServiceCard services={services} />
      )}

      {spaOffers.length > 0 && (
        <>
          <h2 className="section-title">Offers and spa</h2>
          <ServiceCard services={spaOffers} />
        </>
      )}

      {products && products.length > 0 && (
        <>
          <h2 className="section-title">Products</h2>
          <ProductCard products={products} />
        </>
      )}

      <Link href="/book" className="btn cta">
        Book an appointment
      </Link>
    </main>
  );
}
