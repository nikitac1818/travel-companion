-- Travel Companion — Supabase schema
-- Run this in your Supabase project: Dashboard -> SQL Editor -> New query -> paste -> Run

-- ---------- profiles ----------
-- Extra user data beyond what Supabase auth.users stores (full_name, connect/matching fields, SOS state).
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  age int,
  location text,
  interests text[],
  current_destination text,
  connect_opt_in boolean default false,
  emergency_status text,
  emergency_location text,
  emergency_timestamp timestamptz,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Connect page needs to browse other users' public profile fields to find matches.
-- Uncomment if you want that feature to work against real data:
-- create policy "Profiles are viewable by other authenticated users for matching"
--   on profiles for select using (auth.role() = 'authenticated');


-- ---------- trips ----------
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  created_by text not null, -- user's email, kept for parity with the base44Client shim
  destination text not null,
  start_date date not null,
  end_date date not null,
  budget numeric,
  interests text[],
  itinerary jsonb,
  trip_type text default 'adventure' check (trip_type in ('adventure','cultural','relaxed','romantic','family')),
  created_date timestamptz default now()
);

alter table trips enable row level security;

create policy "Users can view their own trips"
  on trips for select using (created_by = auth.jwt() ->> 'email');

create policy "Users can insert their own trips"
  on trips for insert with check (created_by = auth.jwt() ->> 'email');

create policy "Users can update their own trips"
  on trips for update using (created_by = auth.jwt() ->> 'email');

create policy "Users can delete their own trips"
  on trips for delete using (created_by = auth.jwt() ->> 'email');


-- ---------- bookings ----------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_by text not null,
  type text not null check (type in ('flight','train')),
  service_name text not null,
  service_number text,
  route text not null,
  date date not null,
  passengers int,
  seats text,
  total_price numeric,
  status text default 'confirmed' check (status in ('confirmed','pending','cancelled')),
  pnr text,
  synced_at timestamptz,
  external_booking_id text,
  provider text,
  created_date timestamptz default now()
);

alter table bookings enable row level security;

create policy "Users can view their own bookings"
  on bookings for select using (created_by = auth.jwt() ->> 'email');

create policy "Users can insert their own bookings"
  on bookings for insert with check (created_by = auth.jwt() ->> 'email');

create policy "Users can update their own bookings"
  on bookings for update using (created_by = auth.jwt() ->> 'email');

create policy "Users can delete their own bookings"
  on bookings for delete using (created_by = auth.jwt() ->> 'email');


-- ---------- reviews ----------
-- Community page: reviews are publicly readable (it's a feed), but only the
-- author can create/edit/delete their own.
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  created_by text not null,
  destination text not null,
  content text not null,
  rating numeric check (rating >= 1 and rating <= 5),
  images text[],
  tags text[],
  likes int default 0,
  comments jsonb default '[]'::jsonb,
  created_date timestamptz default now()
);

alter table reviews enable row level security;

create policy "Anyone authenticated can view reviews"
  on reviews for select using (auth.role() = 'authenticated');

create policy "Users can insert their own reviews"
  on reviews for insert with check (created_by = auth.jwt() ->> 'email');

create policy "Users can update their own reviews"
  on reviews for update using (created_by = auth.jwt() ->> 'email');

create policy "Users can delete their own reviews"
  on reviews for delete using (created_by = auth.jwt() ->> 'email');


-- ---------- emergency_contacts ----------
create table if not exists emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  created_by text not null,
  contact_name text not null,
  phone_number text not null,
  relationship text,
  email text,
  created_date timestamptz default now()
);

alter table emergency_contacts enable row level security;

create policy "Users can view their own emergency contacts"
  on emergency_contacts for select using (created_by = auth.jwt() ->> 'email');

create policy "Users can insert their own emergency contacts"
  on emergency_contacts for insert with check (created_by = auth.jwt() ->> 'email');

create policy "Users can update their own emergency contacts"
  on emergency_contacts for update using (created_by = auth.jwt() ->> 'email');

create policy "Users can delete their own emergency contacts"
  on emergency_contacts for delete using (created_by = auth.jwt() ->> 'email');
