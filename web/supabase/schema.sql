-- ============================================
-- PROCHESS DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text unique not null,
  fide_id text,
  fide_rating integer,
  role text default 'student' check (role in ('student', 'coach', 'admin')),
  avatar_url text,
  phone text,
  country text default 'Nigeria',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tournaments
create table if not exists tournaments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  date date not null,
  end_date date,
  format text check (format in ('swiss', 'round-robin', 'knockout')),
  status text default 'upcoming' check (status in ('upcoming', 'ongoing', 'completed')),
  lichess_broadcast_id text,
  venue text,
  prize_pool text,
  registration_open boolean default true,
  sections text[],
  registration_fee integer default 0,
  image_url text,
  created_at timestamptz default now()
);

-- Tournament registrations
create table if not exists tournament_registrations (
  id uuid default gen_random_uuid() primary key,
  tournament_id uuid references tournaments(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  section text not null,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'waived')),
  registered_at timestamptz default now(),
  unique(tournament_id, user_id)
);

-- Courses
create table if not exists courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  description text,
  duration_hours integer,
  total_lessons integer default 0,
  image_url text,
  order_index integer,
  created_at timestamptz default now()
);

-- Course lessons
create table if not exists lessons (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  video_url text,
  duration_minutes integer,
  order_index integer,
  created_at timestamptz default now()
);

-- Course progress
create table if not exists course_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed boolean default false,
  completed_at timestamptz,
  unique(user_id, lesson_id)
);

-- Puzzles
create table if not exists puzzles (
  id uuid default gen_random_uuid() primary key,
  fen text not null,
  solution_moves text[] not null,
  difficulty integer check (difficulty between 1 and 5),
  theme text,
  description text,
  times_solved integer default 0,
  times_failed integer default 0,
  created_at timestamptz default now()
);

-- Puzzle attempts
create table if not exists puzzle_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  puzzle_id uuid references puzzles(id) on delete cascade,
  solved boolean not null,
  time_taken_seconds integer,
  attempted_at timestamptz default now()
);

-- Daily puzzle tracking
create table if not exists daily_puzzles (
  id uuid default gen_random_uuid() primary key,
  puzzle_id uuid references puzzles(id),
  date date unique not null,
  created_at timestamptz default now()
);

-- Broadcasts (cached from Lichess)
create table if not exists broadcasts (
  id uuid default gen_random_uuid() primary key,
  lichess_round_id text unique not null,
  title text not null,
  description text,
  status text default 'upcoming',
  start_time timestamptz,
  url text,
  created_at timestamptz default now()
);

-- Summer camp registrations
create table if not exists camp_registrations (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text not null,
  phone text not null,
  age integer,
  parent_name text,
  parent_phone text,
  weeks integer check (weeks in (1, 2, 3)),
  amount_paid integer,
  payment_status text default 'pending',
  registered_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table profiles enable row level security;
alter table tournaments enable row level security;
alter table tournament_registrations enable row level security;
alter table courses enable row level security;
alter table lessons enable row level security;
alter table course_progress enable row level security;
alter table puzzles enable row level security;
alter table puzzle_attempts enable row level security;
alter table daily_puzzles enable row level security;
alter table broadcasts enable row level security;
alter table camp_registrations enable row level security;

-- RLS Policies
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Tournaments visible to all"
  on tournaments for select using (true);

create policy "Users can register for tournaments"
  on tournament_registrations for insert
  with check (auth.uid() = user_id);

create policy "Users can view own registrations"
  on tournament_registrations for select
  using (auth.uid() = user_id);

create policy "Courses visible to all"
  on courses for select using (true);

create policy "Lessons visible to all"
  on lessons for select using (true);

create policy "Users can view own progress"
  on course_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on course_progress for insert
  with check (auth.uid() = user_id);

create policy "Puzzles visible to all"
  on puzzles for select using (true);

create policy "Users can view own attempts"
  on puzzle_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert own attempts"
  on puzzle_attempts for insert
  with check (auth.uid() = user_id);

create policy "Daily puzzles visible to all"
  on daily_puzzles for select using (true);

create policy "Broadcasts visible to all"
  on broadcasts for select using (true);

create policy "Anyone can register for camp"
  on camp_registrations for insert
  with check (true);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
