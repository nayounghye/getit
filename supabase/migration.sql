-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Places
create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Stores
create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references places(id) on delete cascade,
  name text not null,
  floor text,
  memo text,
  benefits text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Items
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  image_url text not null,
  price int,
  is_checked boolean not null default false,
  priority text not null default 'optional' check (priority in ('must', 'optional')),
  memo text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_stores_place_id on stores(place_id);
create index if not exists idx_items_store_id on items(store_id);
create index if not exists idx_items_user_id on items(user_id);

-- RLS (simple multi-user: all public access via anon key)
alter table users enable row level security;
alter table places enable row level security;
alter table stores enable row level security;
alter table items enable row level security;

create policy "Public access users" on users for all using (true) with check (true);
create policy "Public access places" on places for all using (true) with check (true);
create policy "Public access stores" on stores for all using (true) with check (true);
create policy "Public access items" on items for all using (true) with check (true);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

-- Allow public read/write for item-images (personal project, no auth)
create policy "Public read item-images" on storage.objects
  for select using (bucket_id = 'item-images');

create policy "Public insert item-images" on storage.objects
  for insert with check (bucket_id = 'item-images');

create policy "Public delete item-images" on storage.objects
  for delete using (bucket_id = 'item-images');
