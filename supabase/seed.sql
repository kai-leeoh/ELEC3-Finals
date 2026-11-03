-- Sample data for local testing. Every name, address, phone and price below
-- is a placeholder. Replace them with the shop's real details.
-- Run once in the Supabase SQL Editor, after schema.sql.

with main_branch as (
  insert into locations (name, slug, address, phone, opens_at, closes_at)
  values ('Main Branch', 'main', '[ADDRESS]', '[PHONE]', '09:00', '19:00')
  returning id
),
second_branch as (
  insert into locations (name, slug, address, phone, opens_at, closes_at)
  values ('Second Branch', 'second', '[ADDRESS]', '[PHONE]', '10:00', '19:00')
  returning id
),
main_barbers as (
  insert into barbers (location_id, name)
  select id, n from main_branch,
    unnest(array['Barber 1', 'Barber 2', 'Barber 3', 'Barber 4', 'Barber 5', 'Barber 6']) as n
  returning id
)
insert into barbers (location_id, name)
select id, n from second_branch,
  unnest(array['Barber 7', 'Barber 8', 'Barber 9', 'Barber 10']) as n;

-- location_id null means the service is offered at every branch.
-- duration_minutes sets how many 30-minute slots a booking takes.
insert into services (location_id, name, price, duration_minutes) values
  (null, 'Haircut', 150, 30),
  (null, 'Haircut and beard trim', 250, 60),
  (null, 'Shave', 100, 30);
