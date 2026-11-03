import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { getAdminAccess } from '../../../../lib/supabase-server';
import type { AppointmentStatus } from '../../../../lib/types';

const ALLOWED: AppointmentStatus[] = ['booked', 'completed', 'no_show', 'cancelled'];

// PATCH /api/appointments/:id
// body: { status: 'booked' | 'completed' | 'no_show' | 'cancelled' }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await getAdminAccess();
  if (!access) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const { id } = await params;
  const { status } = (await req.json()) as { status?: AppointmentStatus };

  if (!status || !ALLOWED.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin()
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .in('location_id', access.locationIds)
    .select()
    .single();

  // No row back means the appointment is missing or belongs to another branch.
  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ appointment: data });
}
