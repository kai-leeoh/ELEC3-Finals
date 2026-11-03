-- Barbershop booking system schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)

create extension if not exists btree_gist;

-- === LOCATIONS ===
-- One row per physical branch. Everything else hangs off location_id,
-- so adding a new branch later is just a new row here, not a new table.
create table locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- "Downtown Branch"
  slug text unique not null,          -- "downtown" -> used in the URL
  address text,
  phone text,
  opens_at time not null default '09:00',
  closes_at time not null default '19:00',
  created_at timestamptz default now()
);

-- === BARBERS ===
create table barbers (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations(id) on delete cascade,
  name text not null,
  photo_url text,
  active boolean default true,
  days_off int[] not null default '{}',   -- 0 = Sunday ... 6 = Saturday
  created_at timestamptz default now()
);

-- === SERVICES ===
-- Services can be shared across locations (e.g. "Haircut" everywhere) or
-- location-specific if a branch has something unique. location_id nullable
-- means "offered at every location" unless overridden.
create table services (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  duration_minutes int not null default 30,   -- hidden from customers, sets how many slots a booking takes
  created_at timestamptz default now()
);

-- === CUSTOMERS ===
-- Customers are global, not per-location, so someone's history follows
-- them if they visit a different branch.
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text unique not null,
  notes text,                         -- "usual: fade, short sides"
  preferred_barber_id uuid references barbers(id),
  created_at timestamptz default now()
);

-- === APPOINTMENTS ===
create table appointments (
  id uuid primary key default gen_random_uuid(),
  location_id uuid references locations(id) not null,
  barber_id uuid references barbers(id) not null,
  customer_id uuid references customers(id) not null,
  service_id uuid references services(id) not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'booked', -- booked | completed | no_show | cancelled
  referred_by text,
  created_at timestamptz default now()
);

create index idx_appointments_location_date on appointments(location_id, starts_at);
create index idx_appointments_barber_date on appointments(barber_id, starts_at);

-- A barber can't have two active bookings that overlap in time.
-- Cancelled bookings free the slot.
alter table appointments
  add constraint no_overlapping_bookings
  exclude using gist (
    barber_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status <> 'cancelled');

-- === ADMIN USERS ===
-- Ties a Supabase auth user to one or more locations they can manage.
-- An owner with 3 branches gets 3 rows here, one per location.
create table admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  role text not null default 'manager', -- owner | manager
  created_at timestamptz default now()
);

-- Row Level Security: an admin can only see rows for locations they're
-- assigned to. Enable this before going to production.
alter table appointments enable row level security;
alter table customers enable row level security;

create policy "admins see their location's appointments"
  on appointments for select
  using (
    location_id in (
      select location_id from admin_users where auth_user_id = auth.uid()
    )
  );

-- Public read access for the customer-facing site. Customers and
-- appointments stay locked; only the server (secret key) writes to them.
alter table locations enable row level security;
alter table barbers enable row level security;
alter table services enable row level security;

create policy "public read locations" on locations for select using (true);
create policy "public read barbers" on barbers for select using (true);
create policy "public read services" on services for select using (true);
