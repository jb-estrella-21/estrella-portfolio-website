-- Phase 2: editable public profile, skills, fixed section navigation, and
-- private project media that is readable only while its project is published.

create table if not exists public.site_profile (
  id integer primary key default 1 check (id = 1),
  display_name text not null default '' check (char_length(display_name) <= 100),
  professional_title text not null default '' check (char_length(professional_title) <= 140),
  intro_line text not null default '' check (char_length(intro_line) <= 240),
  biography_markdown text not null default '' check (char_length(biography_markdown) <= 12000),
  experience_markdown text not null default '' check (char_length(experience_markdown) <= 12000),
  contact_email text check (contact_email is null or char_length(contact_email) <= 254),
  linkedin_url text,
  github_url text,
  other_url text,
  updated_at timestamptz not null default now()
);

insert into public.site_profile (id) values (1) on conflict (id) do nothing;

drop trigger if exists site_profile_touch_updated_at on public.site_profile;
create trigger site_profile_touch_updated_at
before update on public.site_profile
for each row execute function public.touch_updated_at();

alter table public.site_profile enable row level security;
drop policy if exists "Public can read portfolio profile" on public.site_profile;
create policy "Public can read portfolio profile"
  on public.site_profile for select to anon, authenticated using (true);
drop policy if exists "Administrators can update portfolio profile" on public.site_profile;
create policy "Administrators can update portfolio profile"
  on public.site_profile for update to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));
grant select on public.site_profile to anon, authenticated;
grant update on public.site_profile to authenticated;

create table if not exists public.portfolio_sections (
  section_key text primary key check (section_key in ('about', 'projects', 'skills', 'experience', 'contact')),
  label text not null,
  sort_order integer not null default 0 check (sort_order between 0 and 1000),
  is_visible boolean not null default true,
  constraint core_sections_stay_visible check (section_key not in ('projects', 'contact') or is_visible)
);

insert into public.portfolio_sections (section_key, label, sort_order, is_visible) values
  ('about', 'About', 10, true),
  ('projects', 'Projects', 20, true),
  ('skills', 'Skills', 30, true),
  ('experience', 'Experience / education', 40, false),
  ('contact', 'Contact', 50, true)
on conflict (section_key) do nothing;

alter table public.portfolio_sections enable row level security;
drop policy if exists "Public can read visible sections" on public.portfolio_sections;
create policy "Public can read visible sections"
  on public.portfolio_sections for select to anon, authenticated using (is_visible);
drop policy if exists "Administrators can read all sections" on public.portfolio_sections;
create policy "Administrators can read all sections"
  on public.portfolio_sections for select to authenticated
  using ((select public.is_portfolio_admin()));
drop policy if exists "Administrators can create sections" on public.portfolio_sections;
create policy "Administrators can create sections"
  on public.portfolio_sections for insert to authenticated
  with check ((select public.is_portfolio_admin()));
drop policy if exists "Administrators can update sections" on public.portfolio_sections;
create policy "Administrators can update sections"
  on public.portfolio_sections for update to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));
grant select on public.portfolio_sections to anon, authenticated;
grant insert, update on public.portfolio_sections to authenticated;

drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
  on public.projects for select to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1 from public.portfolio_sections
      where section_key = 'projects' and is_visible
    )
  );

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  label text not null check (char_length(label) between 1 and 80),
  category text not null default '' check (char_length(category) <= 80),
  sort_order integer not null default 0 check (sort_order between 0 and 1000),
  created_at timestamptz not null default now()
);

create unique index if not exists skills_label_category_unique_idx
  on public.skills (lower(label), lower(category));
create index if not exists skills_display_order_idx on public.skills (sort_order asc, label asc);

alter table public.skills enable row level security;
drop policy if exists "Public can read skills when section is visible" on public.skills;
create policy "Public can read skills when section is visible"
  on public.skills for select to anon, authenticated
  using (exists (
    select 1 from public.portfolio_sections
    where section_key = 'skills' and is_visible
  ));
drop policy if exists "Administrators can manage skills" on public.skills;
create policy "Administrators can manage skills"
  on public.skills for all to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));
grant select on public.skills to anon, authenticated;
grant insert, update, delete on public.skills to authenticated;

create or replace function public.replace_portfolio_skills(p_skills jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_portfolio_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if p_skills is null or jsonb_typeof(p_skills) <> 'array' then
    raise exception 'Skills must be an array' using errcode = '22023';
  end if;

  if jsonb_array_length(p_skills) > 100 then
    raise exception 'A maximum of 100 skills is allowed' using errcode = '22023';
  end if;

  delete from public.skills;

  insert into public.skills (label, category, sort_order)
  select trim(item.label), coalesce(trim(item.category), ''), item.sort_order
  from jsonb_to_recordset(p_skills) as item(label text, category text, sort_order integer);
end;
$$;

revoke all on function public.replace_portfolio_skills(jsonb) from public;
grant execute on function public.replace_portfolio_skills(jsonb) to authenticated;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete restrict,
  storage_path text not null unique,
  alt_text text not null check (char_length(alt_text) between 3 and 200),
  mime_type text not null check (mime_type = 'image/webp'),
  byte_size integer not null check (byte_size between 1 and 5242880),
  width integer not null check (width between 1 and 2400),
  height integer not null check (height between 1 and 1600),
  display_order integer not null default 0 check (display_order between 0 and 10000),
  created_at timestamptz not null default now()
);

create index if not exists media_assets_project_order_idx
  on public.media_assets (project_id, display_order asc, created_at asc);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'projects_sort_order_range'
  ) then
    alter table public.projects
      add constraint projects_sort_order_range check (sort_order between 0 and 10000);
  end if;
end;
$$;

alter table public.media_assets enable row level security;
drop policy if exists "Public can read media for published projects" on public.media_assets;
create policy "Public can read media for published projects"
  on public.media_assets for select to anon, authenticated
  using (exists (
    select 1 from public.projects
    where projects.id = media_assets.project_id
      and projects.status = 'published'
      and exists (
        select 1 from public.portfolio_sections
        where section_key = 'projects' and is_visible
      )
  ));
drop policy if exists "Administrators can manage project media" on public.media_assets;
create policy "Administrators can manage project media"
  on public.media_assets for all to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));
grant select on public.media_assets to anon, authenticated;
grant insert, update, delete on public.media_assets to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-media', 'portfolio-media', false, 5242880, array['image/webp'])
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/webp'];

drop policy if exists "Administrators can read portfolio media" on storage.objects;
create policy "Administrators can read portfolio media"
  on storage.objects for select to authenticated
  using (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));
drop policy if exists "Administrators can upload portfolio media" on storage.objects;
create policy "Administrators can upload portfolio media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));
drop policy if exists "Administrators can delete portfolio media" on storage.objects;
create policy "Administrators can delete portfolio media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));
drop policy if exists "Public can read media for published projects" on storage.objects;
create policy "Public can read media for published projects"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'portfolio-media'
    and exists (
      select 1
      from public.media_assets
      join public.projects on projects.id = media_assets.project_id
      where media_assets.storage_path = storage.objects.name
        and projects.status = 'published'
        and exists (
          select 1 from public.portfolio_sections
          where section_key = 'projects' and is_visible
        )
    )
  );
