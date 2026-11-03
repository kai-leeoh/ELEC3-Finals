import { supabase } from '../../../lib/supabase';
import BookingForm from '../../../components/BookingForm';
import type { Barber, Location, Service } from '../../../lib/types';

export default async function BookPage({ params }: { params: Promise<{ location: string }> }) {
  const { location: slug } = await params;

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

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .or(`location_id.eq.${location.id},location_id.is.null`)
    .returns<Service[]>();

  return (
    <main className="page">
      <h1>Book at {location.name}</h1>
      <BookingForm locationId={location.id} barbers={barbers ?? []} services={services ?? []} />
    </main>
  );
}
