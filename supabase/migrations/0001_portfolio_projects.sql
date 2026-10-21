-- Phase 1: the single-owner project publishing flow.
-- Create the Auth user first, then add that user's UUID to admin_users using
-- the Supabase SQL editor. Public sign-ups should remain disabled.

create table if not exists public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  description_markdown text not null default '',
  technology_tags text[] not null default '{}',
  live_url text,
  source_url text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint projects_title_length check (char_length(title) between 2 and 100),
  constraint projects_summary_length check (char_length(summary) between 10 and 240),
  constraint projects_published_timestamp check (status <> 'published' or published_at is not null)
);

create index if not exists projects_public_order_idx
  on public.projects (sort_order asc, published_at desc)
  where status = 'published';

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
before update on public.projects
for each row execute function public.touch_updated_at();

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where id = (select auth.uid())
  );
$$;

revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.projects enable row level security;

drop policy if exists "Administrators can read their own record" on public.admin_users;
create policy "Administrators can read their own record"
  on public.admin_users for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
  on public.projects for select to anon, authenticated
  using (status = 'published');

drop policy if exists "Administrators can read all projects" on public.projects;
create policy "Administrators can read all projects"
  on public.projects for select to authenticated
  using ((select public.is_portfolio_admin()));

drop policy if exists "Administrators can create projects" on public.projects;
create policy "Administrators can create projects"
  on public.projects for insert to authenticated
  with check ((select public.is_portfolio_admin()));

drop policy if exists "Administrators can update projects" on public.projects;
create policy "Administrators can update projects"
  on public.projects for update to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));

grant select on public.projects to anon, authenticated;
grant insert, update on public.projects to authenticated;
grant select on public.admin_users to authenticated;
