-- Knockout games are scored on normal time, but the admin can record that a
-- game went to a penalty shootout and which side advanced. This is shown to
-- users under the normal-time score; it does not affect points.
--
-- Run this in the Supabase SQL editor.
--
-- penalty_winner: 'home' | 'away' | null (null = decided in normal time).

alter table matches
  add column if not exists penalty_winner text;
