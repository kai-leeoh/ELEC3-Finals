import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import LocationSwitcher from '../../components/LocationSwitcher';
import type { Barber, Location, Service } from '../../lib/types';

// Public branch page: /main, /second, etc.
export default async function LocationPage({ params }: { params: Promise<{ location: string }> }) {
  const { location: slug } = await params;

  const { data: allLocations } = await supabase.from('locations').select('name, slug');

  const { data: location } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', slug)
    .single<Location>();

  if (!location) {
    return <main className="page"><p>We couldn't find that branch.</p></main>;
  }

  const { data: barbers } = await supabase
    .from('barbers')
    .select('*')
    .eq('location_id', location.id)
    .eq('active', true)
    .returns<Barber[]>();

  // Services scoped to this location, plus any shared (location_id null) ones
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .or(`location_id.eq.${location.id},location_id.is.null`)
    .returns<Service[]>();

  return (
    <main className="page">
      <header className="page-header">
        <h1>{location.name}</h1>
        <LocationSwitcher locations={allLocations ?? []} currentSlug={slug} />
      </header>

      <section>
        <p>{location.address}</p>
        <p>{location.phone}</p>
      </section>

      <section>
        <h2>Barbers</h2>
        <ul className="barber-list">
          {barbers?.map((b) => (
            <li key={b.id}>{b.name}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Services</h2>
        <ul className="service-list">
          {services?.map((s) => (
            <li key={s.id}>
              {s.name}: ₱{s.price}
            </li>
          ))}
        </ul>
      </section>

      <Link href={`/${slug}/book`} className="cta">
        Book an appointment
      </Link>
    </main>
  );
}
