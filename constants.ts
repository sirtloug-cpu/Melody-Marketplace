
import { Track } from './types';

// Empty initial state to force DB usage
export const MOCK_TRACKS: Track[] = [];

export const APP_GENRES = ['Amapiano', 'Gospel', 'Jazz', 'RnB', 'Hip Hop', 'House'];

export const LOGO_URL = "https://lh3.googleusercontent.com/d/18wPQZhZvfhHKol8OIAyFnlU5TDpadfQz";

export const DATABASE_SCHEMA_SQL = `
-- Run this in your Supabase SQL Editor

-- 0. Enable required extensions
create extension if not exists "uuid-ossp";

-- 1. Profiles
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  is_artist boolean default false,
  balance numeric default 0,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tracks
create table if not exists public.tracks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  artist text not null,
  artist_id uuid references public.profiles(id),
  album text,
  price numeric default 0,
  cover_url text,
  audio_url text,
  duration text,
  genre text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. User Library (Purchased Tracks)
create table if not exists public.user_library (
  user_id uuid references public.profiles(id) not null,
  track_id uuid references public.tracks(id) on delete cascade not null,
  purchased_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, track_id)
);

-- 4. Likes
create table if not exists public.likes (
  user_id uuid references public.profiles(id) not null,
  track_id uuid references public.tracks(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, track_id)
);

-- 5. Playlists
create table if not exists public.playlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Playlist Tracks
create table if not exists public.playlist_tracks (
  playlist_id uuid references public.playlists(id) on delete cascade not null,
  track_id uuid references public.tracks(id) on delete cascade not null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (playlist_id, track_id)
);

-- 11. Comments
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  track_id uuid references public.tracks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Storage Buckets (Idempotent)
insert into storage.buckets (id, name, public) values ('audio', 'audio', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('covers', 'covers', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;

-- 8. Enable RLS
alter table public.profiles enable row level security;
alter table public.tracks enable row level security;
alter table public.user_library enable row level security;
alter table public.likes enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.comments enable row level security;

-- 9. Policies

-- Profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Tracks
create policy "Tracks are viewable by everyone." on public.tracks for select using (true);
create policy "Artists can insert tracks." on public.tracks for insert with check (auth.uid() = artist_id);
create policy "Artists can update own tracks." on public.tracks for update using (auth.uid() = artist_id);
create policy "Artists can delete own tracks." on public.tracks for delete using (auth.uid() = artist_id);

-- User Library
create policy "Users can see own library" on public.user_library for select using (auth.uid() = user_id);
create policy "Users can add to library" on public.user_library for insert with check (auth.uid() = user_id);
create policy "Users can remove from library" on public.user_library for delete using (auth.uid() = user_id);

-- Likes
create policy "Users can see own likes" on public.likes for select using (auth.uid() = user_id);
create policy "Users can like tracks" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike tracks" on public.likes for delete using (auth.uid() = user_id);

-- Playlists
create policy "Users can see own playlists" on public.playlists for select using (auth.uid() = user_id);
create policy "Users can create playlists" on public.playlists for insert with check (auth.uid() = user_id);

-- Playlist Tracks
create policy "Users can see own playlist tracks" on public.playlist_tracks for select using (
  exists ( select 1 from public.playlists where id = playlist_id and user_id = auth.uid() )
);
create policy "Users can add to own playlists" on public.playlist_tracks for insert with check (
  exists ( select 1 from public.playlists where id = playlist_id and user_id = auth.uid() )
);

-- Comments Policies
create policy "Comments are viewable by everyone" on public.comments for select using (true);
create policy "Authenticated users can insert comments" on public.comments for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);
create policy "Users can delete their own comments" on public.comments for delete using (auth.uid() = user_id);

-- Storage Policies
create policy "Public Access Audio" on storage.objects for select using ( bucket_id = 'audio' );
create policy "Auth Upload Audio" on storage.objects for insert with check ( bucket_id = 'audio' AND auth.role() = 'authenticated' );

create policy "Public Access Covers" on storage.objects for select using ( bucket_id = 'covers' );
create policy "Auth Upload Covers" on storage.objects for insert with check ( bucket_id = 'covers' AND auth.role() = 'authenticated' );

create policy "Public Access Avatars" on storage.objects for select using ( bucket_id = 'avatars' );
create policy "Auth Upload Avatars" on storage.objects for insert with check ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
create policy "Auth Update Avatars" on storage.objects for update using ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- 10. Triggers
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, is_artist)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', (new.raw_user_meta_data->>'is_artist')::boolean);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
`;
