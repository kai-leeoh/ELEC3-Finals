# Barbershop booking system (TypeScript)

Next.js 16 + TypeScript + Supabase. Public booking site, staff dashboard,
multi-branch from the start. This is the TypeScript version of the
JavaScript project: same behavior, with types on the data and props.

## Layout

```
app/                    routes (pages and API handlers)
  [location]/           public branch page and booking page
  admin/                staff dashboard and login
  api/bookings          create a booking (re-checks the time server side)
  api/slots             free start times for a barber, service and date
  api/appointments/[id] change a booking's status (staff only)
components/             client components (booking form, status select, login)
lib/types.ts            row types that mirror supabase/schema.sql
lib/slots.ts            slot logic (pure function plus the database lookup)
lib/shop.ts             shop timezone helpers (Asia/Manila)
lib/supabase*.ts        browser, server and admin Supabase clients
proxy.ts                sends logged-out visitors to /admin/login
supabase/               schema.sql, then seed.sql
```

## Setup

1. Create a Supabase project and run `supabase/schema.sql`, then
   `supabase/seed.sql`, in the SQL Editor.
2. Copy `.env.example` to `.env.local` and fill in the three keys.
3. `npm install` (needs Node 20.9 or newer)
4. `npm run dev`
5. `npm run typecheck` checks the types without building.

## Staff login

1. Supabase dashboard > Authentication > Users > Add user, with auto confirm on.
2. In the SQL Editor, give that user access (owner of every branch):

```sql
insert into admin_users (auth_user_id, location_id, role)
select u.id, l.id, 'owner'
from auth.users u cross join locations l
where u.email = 'YOUR_EMAIL_HERE';
```

For a manager of one branch, add `and l.slug = 'main'` and use `'manager'`.

## How booking works

- Services have a hidden `duration_minutes`. Start times are every 30 minutes
  inside the branch's `opens_at` and `closes_at`, minus the barber's
  `days_off` and any overlapping bookings.
- The server re-checks the chosen time, and the database refuses overlapping
  bookings for one barber (`no_overlapping_bookings`).
- Staff only see branches listed for them in `admin_users`.

## Still to build

- Messenger confirmations and reminders (`TODO` in `app/api/bookings/route.ts`)
- Walk-in button on the dashboard, so walk-ins block a barber's time
- Remember a customer's regular barber by phone number
"# ELEC3-Finals" 
