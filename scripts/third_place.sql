-- Adds the third-place play-off (3. koha mäng) as match 104.
--
-- Run this in the Supabase SQL editor. Safe to re-run.

-- Allow the new 'third' stage in the check constraint.
alter table matches drop constraint if exists matches_stage_check;
alter table matches add constraint matches_stage_check
  check (stage in ('group', 'r32', 'r16', 'qf', 'sf', 'third', 'final'));

-- Insert the match (teams TBD until the semi-finals finish).
insert into matches (id, stage, group_name, home_team, away_team, match_date, venue, actual_home_score, actual_away_score)
values (104, 'third', null, 'Selgub', 'Selgub', '2026-07-19 00:00:00+03', null, null, null)
on conflict (id) do nothing;
