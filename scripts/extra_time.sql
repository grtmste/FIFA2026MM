-- Knockout games can also be decided in extra time (after the normal 90
-- minutes) without penalties. Like penalty_winner, this is display/advance
-- metadata only — points stay scored on normal time.
--
-- Run this in the Supabase SQL editor.
--
-- extra_time_winner: 'home' | 'away' | null (null = normal time or penalties).

alter table matches
  add column if not exists extra_time_winner text;
