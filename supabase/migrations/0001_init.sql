-- Family Timeline: initial schema
-- Multi-tenant model: a "timeline" belongs to one child. Any number of users
-- (parents, grandparents, etc.) can be members of a timeline with a role.
-- Every table is locked down with Row Level Security scoped to timeline
-- membership, so one family's data is never visible to another family.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Family Member',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- timelines + membership
-- ---------------------------------------------------------------------------
create type public.timeline_role as enum ('owner', 'editor', 'viewer');

create table public.timelines (
  id uuid primary key default gen_random_uuid(),
  child_name text not null,
  description text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.timeline_members (
  timeline_id uuid not null references public.timelines (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.timeline_role not null default 'editor',
  created_at timestamptz not null default now(),
  primary key (timeline_id, user_id)
);

alter table public.timelines enable row level security;
alter table public.timeline_members enable row level security;

-- Helper functions (security definer = bypass RLS internally) so policies
-- can check membership without recursive-policy problems.
create function public.is_timeline_member(_timeline_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.timeline_members
    where timeline_id = _timeline_id and user_id = auth.uid()
  );
$$;

create function public.timeline_role(_timeline_id uuid)
returns public.timeline_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.timeline_members
  where timeline_id = _timeline_id and user_id = auth.uid();
$$;

-- Timelines can only be created via this function, which creates the row
-- and its owner-membership row together. Direct INSERTs are not granted to
-- `authenticated`, so there's no way to create a timeline without also
-- becoming its owner.
create function public.create_timeline(_child_name text, _description text default null)
returns public.timelines
language plpgsql
security definer
set search_path = public
as $$
declare
  new_timeline public.timelines;
begin
  insert into public.timelines (child_name, description, created_by)
  values (_child_name, _description, auth.uid())
  returning * into new_timeline;

  insert into public.timeline_members (timeline_id, user_id, role)
  values (new_timeline.id, auth.uid(), 'owner');

  return new_timeline;
end;
$$;

create policy "Members can view their timelines"
  on public.timelines for select
  using (public.is_timeline_member(id));

create policy "Owners and editors can update timeline"
  on public.timelines for update
  using (public.timeline_role(id) in ('owner', 'editor'));

create policy "Owners can delete timeline"
  on public.timelines for delete
  using (public.timeline_role(id) = 'owner');

create policy "Members can view other members"
  on public.timeline_members for select
  using (public.is_timeline_member(timeline_id));

create policy "Owners can add members"
  on public.timeline_members for insert
  with check (public.timeline_role(timeline_id) = 'owner');

create policy "Owners can remove members, members can leave"
  on public.timeline_members for delete
  using (public.timeline_role(timeline_id) = 'owner' or user_id = auth.uid());

-- Profiles are otherwise private; this lets people see the display names of
-- others who share at least one timeline with them (e.g. to list members).
create function public.shares_timeline_with(_other_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.timeline_members tm1
    join public.timeline_members tm2 on tm1.timeline_id = tm2.timeline_id
    where tm1.user_id = auth.uid() and tm2.user_id = _other_user_id
  );
$$;

create policy "Users can view own or co-member profiles"
  on public.profiles for select
  using (auth.uid() = id or public.shares_timeline_with(id));

grant select on public.profiles to authenticated;

-- Resolves an email to a user id so an owner can invite someone by email
-- without the client ever querying auth.users directly.
create function public.get_user_id_by_email(_email text)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from auth.users where email = _email;
$$;

grant execute on function public.create_timeline(text, text) to authenticated;
grant execute on function public.get_user_id_by_email(text) to authenticated;
grant select, update, delete on public.timelines to authenticated;
grant select, insert, delete on public.timeline_members to authenticated;

-- ---------------------------------------------------------------------------
-- events (milestones) + media (photos/videos)
-- ---------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  timeline_id uuid not null references public.timelines (id) on delete cascade,
  title text not null,
  narration text,
  event_date date not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create type public.media_type as enum ('photo', 'video');

create table public.event_media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  storage_path text not null,
  media_type public.media_type not null,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;
alter table public.event_media enable row level security;

create function public.event_timeline_id(_event_id uuid)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select timeline_id from public.events where id = _event_id;
$$;

create policy "Members can view events"
  on public.events for select
  using (public.is_timeline_member(timeline_id));

create policy "Owners and editors can add events"
  on public.events for insert
  with check (public.timeline_role(timeline_id) in ('owner', 'editor') and created_by = auth.uid());

create policy "Owners and editors can update events"
  on public.events for update
  using (public.timeline_role(timeline_id) in ('owner', 'editor'));

create policy "Owners and editors can delete events"
  on public.events for delete
  using (public.timeline_role(timeline_id) in ('owner', 'editor'));

create policy "Members can view event media"
  on public.event_media for select
  using (public.is_timeline_member(public.event_timeline_id(event_id)));

create policy "Owners and editors can add event media"
  on public.event_media for insert
  with check (public.timeline_role(public.event_timeline_id(event_id)) in ('owner', 'editor'));

create policy "Owners and editors can delete event media"
  on public.event_media for delete
  using (public.timeline_role(public.event_timeline_id(event_id)) in ('owner', 'editor'));

grant select, insert, update, delete on public.events to authenticated;
grant select, insert, delete on public.event_media to authenticated;

-- ---------------------------------------------------------------------------
-- storage: private bucket for photos/videos, path convention
-- {timeline_id}/{event_id}/{filename}
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

create policy "Timeline members can read media files"
  on storage.objects for select
  using (
    bucket_id = 'media'
    and public.is_timeline_member((storage.foldername(name))[1]::uuid)
  );

create policy "Timeline owners and editors can upload media files"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and public.timeline_role((storage.foldername(name))[1]::uuid) in ('owner', 'editor')
  );

create policy "Timeline owners and editors can delete media files"
  on storage.objects for delete
  using (
    bucket_id = 'media'
    and public.timeline_role((storage.foldername(name))[1]::uuid) in ('owner', 'editor')
  );
