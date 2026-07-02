-- Knockout games can also be decided in extra time (after the normal 90
-- minutes) without penalties. Like penalty_winner, this is display/advance
-- metadata only — points stay scored on normal time.
--
-- Run this in the Supabase SQL editor.
--
-- extra_time_winner: 'home' | 'away' | null (null = normal time or penalties).
-- extra_time_home_score / extra_time_away_score: optional full-time score
-- after extra time (e.g. 2-3).

alter table matches
  add column if not exists extra_time_winner text;
alter table matches
  add column if not exists extra_time_home_score integer;
alter table matches
  add column if not exists extra_time_away_score integer;
