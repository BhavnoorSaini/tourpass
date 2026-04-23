create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists avatar_url text;

create table if not exists public.route_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  route_id uuid references public.routes(id) on delete set null,
  route_title text,
  city text,
  completed_at timestamptz not null default now()
);

create index if not exists route_completions_user_route_idx
  on public.route_completions (user_id, route_id);

create index if not exists route_completions_user_completed_at_idx
  on public.route_completions (user_id, completed_at desc);

alter table public.route_completions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'route_completions'
      and policyname = 'Users can read own route completions'
  ) then
    create policy "Users can read own route completions"
      on public.route_completions
      for select
      using (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'route_completions'
      and policyname = 'Users can record own route completions'
  ) then
    create policy "Users can record own route completions"
      on public.route_completions
      for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'route_completions'
      and policyname = 'Users can update own route completions'
  ) then
    create policy "Users can update own route completions"
      on public.route_completions
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

create table if not exists public.help_center_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('support', 'bug')),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'reviewing', 'resolved', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists help_center_submissions_created_at_idx
  on public.help_center_submissions (created_at desc);

create index if not exists help_center_submissions_user_created_at_idx
  on public.help_center_submissions (user_id, created_at desc);

alter table public.help_center_submissions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'help_center_submissions'
      and policyname = 'Users can create own help center submissions'
  ) then
    create policy "Users can create own help center submissions"
      on public.help_center_submissions
      for insert
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'help_center_submissions'
      and policyname = 'Users can read own help center submissions'
  ) then
    create policy "Users can read own help center submissions"
      on public.help_center_submissions
      for select
      using (auth.uid() = user_id);
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Avatar images are publicly accessible'
  ) then
    create policy "Avatar images are publicly accessible"
      on storage.objects
      for select
      using (bucket_id = 'avatars');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can upload their own avatar'
  ) then
    create policy "Users can upload their own avatar"
      on storage.objects
      for insert
      with check (
        bucket_id = 'avatars'
        and auth.role() = 'authenticated'
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can update their own avatar'
  ) then
    create policy "Users can update their own avatar"
      on storage.objects
      for update
      using (
        bucket_id = 'avatars'
        and auth.uid() = owner
      )
      with check (
        bucket_id = 'avatars'
        and auth.uid() = owner
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can delete their own avatar'
  ) then
    create policy "Users can delete their own avatar"
      on storage.objects
      for delete
      using (
        bucket_id = 'avatars'
        and auth.uid() = owner
      );
  end if;
end $$;
