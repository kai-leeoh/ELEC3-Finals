// Row shapes for the tables in supabase/schema.sql. Keep the two in sync.

export type AppointmentStatus =
  | "booked"
  | "completed"
  | "no_show"
  | "cancelled";

export interface Location {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  opens_at: string; // "09:00:00"
  closes_at: string;
}

export interface Barber {
  id: string;
  location_id: string;
  name: string;
  active: boolean;
  days_off: number[]; // 0 = Sunday ... 6 = Saturday
}

export interface Service {
  id: string;
  location_id: string | null; // null means offered at every branch
  name: string;
  price: number;
  duration_minutes: number;
  description?: string | null; // shown under the name on the branch page
  category?: "barber" | "spa"; // 'spa' services appear under "Offers and spa"
}

export interface Appointment {
  id: string;
  location_id: string;
  barber_id: string;
  customer_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  referred_by: string | null;
}

// What the admin dashboard query returns, with joined names.
export interface AppointmentRow extends Appointment {
  customers: { name: string; phone: string } | null;
  barbers: { name: string } | null;
  services: { name: string; price: number } | null;
}

export interface BookingBody {
  locationId: string;
  name: string;
  phone: string;
  barberId: string;
  serviceId: string;
  startsAt: string;
  referredBy?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  sort_order?: number;
}
