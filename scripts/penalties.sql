-- Knockout games are scored on normal time, but the admin can record that a
-- game went to a penalty shootout and which side advanced. This is shown to
-- users under the normal-time score; it does not affect points.
--
-- Run this in the Supabase SQL editor.
--
-- penalty_winner: 'home' | 'away' | null (null = decided in normal time).
-- penalty_home_score / penalty_away_score: optional shootout score (e.g. 2-3).

alter table matches
  add column if not exists penalty_winner text;
alter table matches
  add column if not exists penalty_home_score integer;
alter table matches
  add column if not exists penalty_away_score integer;
