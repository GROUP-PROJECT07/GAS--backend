-- USERS TABLE
create table if not exists users (
  id uuid primary key references auth.users(id),
  email text unique,
  role text check (role in ('admin', 'user')),
  department text
);

-- CORRESPONDENCE TABLE
create table if not exists correspondence (
  id uuid primary key default gen_random_uuid(),
  subject text,
  sender text,
  recipient text,
  date date,
  department text,
  status text default 'received',
  registry_number text,
  file_url text,
  created_by uuid references users(id),
  created_at timestamp default now()
);

-- RLS POLICIES
alter table users enable row level security;
alter table correspondence enable row level security;

create policy "Users can manage their data"
on users for all using (auth.uid() = id);

create policy "Viewable by admins or same department"
on correspondence for select using (
  auth.uid() = created_by OR
  exists (
    select 1 from users where id = auth.uid()
    and (role = 'admin' or department = correspondence.department)
  )
);

create policy "Insert by valid users"
on correspondence for insert with check (
  auth.uid() = created_by
);
