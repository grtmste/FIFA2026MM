-- Extra participant fields: champion flag (shows a trophy next to the name)
-- and a free-text results history (past World Cups / European Championships).
--
-- Run this in the Supabase SQL editor.

alter table participants
  add column if not exists is_champion boolean not null default false;
alter table participants
  add column if not exists history text;
