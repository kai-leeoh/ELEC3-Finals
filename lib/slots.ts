import type { SupabaseClient } from "@supabase/supabase-js";
import { SHOP_OFFSET, SLOT_MINUTES } from "./shop";

const MINUTE = 60 * 1000;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);
}

interface BusyRange {
  starts_at: string;
  ends_at: string;
}

interface ComputeArgs {
  date: string; // YYYY-MM-DD in shop time
  opensAt: string; // "09:00:00"
  closesAt: string;
  durationMinutes: number;
  busy: BusyRange[];
  now?: Date;
}

// Free start times for one day. Pure function so it can be tested alone.
export function computeSlots({
  date,
  opensAt,
  closesAt,
  durationMinutes,
  busy,
  now = new Date(),
}: ComputeArgs): string[] {
  const open = new Date(`${date}T${opensAt}${SHOP_OFFSET}`).getTime();
  const close = new Date(`${date}T${closesAt}${SHOP_OFFSET}`).getTime();
  const slots: string[] = [];

  for (
    let start = open;
    start + durationMinutes * MINUTE <= close;
    start += SLOT_MINUTES * MINUTE
  ) {
    const end = start + durationMinutes * MINUTE;
    const inPast = start <= now.getTime();
    const clashes = busy.some(
      (b) =>
        start < new Date(b.ends_at).getTime() &&
        end > new Date(b.starts_at).getTime(),
    );
    if (!inPast && !clashes) slots.push(new Date(start).toISOString());
  }
  return slots;
}

export type SlotsResult =
  | { error: "bad_date" | "not_found" }
  | { error?: undefined; slots: string[]; durationMinutes: number };

// Loads the branch hours, barber days off, service length and existing
// bookings, then returns the free start times. Callers must pass UUIDs
// that already passed isUuid, since they are used in a filter string.
export async function getAvailableSlots(args: {
  db: SupabaseClient;
  locationId: string;
  barberId: string;
  serviceId: string;
  date: string;
}): Promise<SlotsResult> {
  const { db, locationId, barberId, serviceId, date } = args;

  const noon = new Date(`${date}T12:00:00${SHOP_OFFSET}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(noon.getTime())) {
    return { error: "bad_date" };
  }

  const [{ data: location }, { data: barber }, { data: service }] =
    await Promise.all([
      db
        .from("locations")
        .select("opens_at, closes_at")
        .eq("id", locationId)
        .single(),
      db
        .from("barbers")
        .select("days_off")
        .eq("id", barberId)
        .eq("location_id", locationId)
        .eq("active", true)
        .single(),
      db
        .from("services")
        .select("duration_minutes")
        .eq("id", serviceId)
        .or(`location_id.eq.${locationId},location_id.is.null`)
        .single(),
    ]);
  console.log("slots debug", { location, barber, service });
  if (!location || !barber || !service) return { error: "not_found" };

  const durationMinutes = service.duration_minutes as number;

  // 0 is Sunday. Noon in the shop's timezone is still the same day in UTC.
  if ((barber.days_off as number[]).includes(noon.getUTCDay())) {
    return { slots: [], durationMinutes };
  }

  const dayStart = new Date(`${date}T00:00:00${SHOP_OFFSET}`).toISOString();
  const dayEnd = new Date(`${date}T23:59:59${SHOP_OFFSET}`).toISOString();

  const { data: busy } = await db
    .from("appointments")
    .select("starts_at, ends_at")
    .eq("barber_id", barberId)
    .neq("status", "cancelled")
    .gte("ends_at", dayStart)
    .lte("starts_at", dayEnd);

  const slots = computeSlots({
    date,
    opensAt: location.opens_at as string,
    closesAt: location.closes_at as string,
    durationMinutes,
    busy: (busy ?? []) as BusyRange[],
  });
  return { slots, durationMinutes };
}
