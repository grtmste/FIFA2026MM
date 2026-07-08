-- Per-match manual points override. When set, it replaces the automatically
-- calculated points for that participant's prediction on that match
-- (leaderboard, participant overview and match pages all use it).
-- NULL = automatic scoring.
--
-- Run this in the Supabase SQL editor. Safe to re-run.

alter table predictions
  add column if not exists points_override integer;
