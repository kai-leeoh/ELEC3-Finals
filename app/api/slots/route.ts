import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { getAvailableSlots, isUuid } from '../../../lib/slots';

// GET /api/slots?locationId=&barberId=&serviceId=&date=YYYY-MM-DD
// Public on purpose: it only returns free times, never customer data.
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const locationId = p.get('locationId');
  const barberId = p.get('barberId');
  const serviceId = p.get('serviceId');
  const date = p.get('date') ?? '';

  if (!isUuid(locationId) || !isUuid(barberId) || !isUuid(serviceId)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const result = await getAvailableSlots({ db: supabaseAdmin(), locationId, barberId, serviceId, date });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ slots: result.slots });
}
