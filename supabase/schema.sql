-- Run this script in the Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  species text not null check (species in ('Perro', 'Gato')),
  breed text not null,
  age smallint not null check (age between 0 and 30),
  gender text not null check (gender in ('Hembra', 'Macho')),
  size text not null check (size in ('Pequeño', 'Mediano', 'Grande')),
  description text not null,
  health_status text not null default 'A confirmar',
  image_path text not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.adoption_applications (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete restrict,
  pet_name text not null,
  applicant_name text not null,
  email text not null,
  phone text not null,
  message text not null default '',
  status text not null default 'Pendiente'
    check (status in ('Pendiente', 'Aprobada', 'Rechazada')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists pets_available_species_idx
  on public.pets (species, created_at desc) where is_available = true;
create index if not exists adoption_applications_created_at_idx
  on public.adoption_applications (created_at desc);

alter table public.pets enable row level security;
alter table public.adoption_applications enable row level security;
revoke all on public.pets, public.adoption_applications from anon, authenticated;
grant all on public.pets, public.adoption_applications to service_role;

-- Pet photos are publicly viewable; uploads remain server-side using the secret key.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pet-images', 'pet-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
