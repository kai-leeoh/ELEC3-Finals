import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { getAvailableSlots, isUuid } from '../../../lib/slots';
import { shopDate } from '../../../lib/shop';
import type { BookingBody } from '../../../lib/types';

// POST /api/bookings
export async function POST(req: NextRequest) {
  let body: Partial<BookingBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { locationId, name, phone, barberId, serviceId, startsAt, referredBy } = body;
  const start = new Date(startsAt ?? '');

  if (
    !name?.trim() ||
    !phone?.trim() ||
    !isUuid(locationId) ||
    !isUuid(barberId) ||
    !isUuid(serviceId) ||
    Number.isNaN(start.getTime())
  ) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  const db = supabaseAdmin();

  // Only accept start times the slot list would have offered. The length
  // comes from the service row, never from the browser.
  const result = await getAvailableSlots({ db, locationId, barberId, serviceId, date: shopDate(start) });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  if (!result.slots.includes(start.toISOString())) {
    return NextResponse.json({ error: 'slot_taken' }, { status: 409 });
  }
  const end = new Date(start.getTime() + result.durationMinutes * 60 * 1000);

  // Upsert by phone so returning customers keep one record and their history.
  const { data: customer, error: customerErr } = await db
    .from('customers')
    .upsert({ name: name.trim(), phone: phone.trim() }, { onConflict: 'phone' })
    .select()
    .single();

  if (customerErr || !customer) {
    return NextResponse.json({ error: customerErr?.message ?? 'Customer save failed' }, { status: 500 });
  }

  const { data: appointment, error: apptErr } = await db
    .from('appointments')
    .insert({
      location_id: locationId,
      barber_id: barberId,
      customer_id: customer.id,
      service_id: serviceId,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      referred_by: referredBy || null,
    })
    .select()
    .single();

  if (apptErr) {
    // 23P01 is Postgres's exclusion violation, from no_overlapping_bookings.
    // It catches two people booking the same barber in the same second.
    if (apptErr.code === '23P01') {
      return NextResponse.json({ error: 'slot_taken' }, { status: 409 });
    }
    return NextResponse.json({ error: apptErr.message }, { status: 500 });
  }

  // TODO: send the booking confirmation on Messenger here.

  return NextResponse.json({ appointment }, { status: 201 });
}
