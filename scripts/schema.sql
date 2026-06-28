-- FIFA World Cup 2026 Prediction App - Database Schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id integer primary key,
  stage text not null check (stage in ('group', 'r32', 'r16', 'qf', 'sf', 'final')),
  group_name text,
  home_team text not null,
  away_team text not null,
  match_date timestamptz,
  venue text,
  actual_home_score integer,
  actual_away_score integer
);

create table if not exists predictions (
  id bigserial primary key,
  participant_id uuid not null references participants(id) on delete cascade,
  match_id integer not null references matches(id) on delete cascade,
  predicted_home_score integer not null,
  predicted_away_score integer not null,
  unique (participant_id, match_id)
);

create table if not exists bonus_questions (
  id integer primary key,
  question_text text not null,
  max_points integer not null,
  correct_answer text,
  category text not null default 'alagrupp',
  description text
);

create table if not exists bonus_answers (
  id bigserial primary key,
  participant_id uuid not null references participants(id) on delete cascade,
  question_id integer not null references bonus_questions(id) on delete cascade,
  answer_text text,
  points_awarded integer,
  unique (participant_id, question_id)
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists predictions_participant_idx on predictions(participant_id);
create index if not exists predictions_match_idx on predictions(match_id);
create index if not exists bonus_answers_participant_idx on bonus_answers(participant_id);
create index if not exists bonus_answers_question_idx on bonus_answers(question_id);
create index if not exists matches_stage_idx on matches(stage);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- All tables are publicly readable (anon key) so the leaderboard, matches and
-- bonus pages work without authentication. Writes are only performed from
-- server-side admin actions using the service role key, which bypasses RLS,
-- so no insert/update/delete policies are defined for the anon role.
-- ---------------------------------------------------------------------------

alter table participants enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;
alter table bonus_questions enable row level security;
alter table bonus_answers enable row level security;

create policy "Public read access" on participants for select using (true);
create policy "Public read access" on matches for select using (true);
create policy "Public read access" on predictions for select using (true);
create policy "Public read access" on bonus_questions for select using (true);
create policy "Public read access" on bonus_answers for select using (true);

-- ---------------------------------------------------------------------------
-- Realtime
-- Enable realtime so the leaderboard can subscribe to live changes.
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table predictions;
alter publication supabase_realtime add table bonus_answers;
alter publication supabase_realtime add table participants;
