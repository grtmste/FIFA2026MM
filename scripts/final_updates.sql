-- Finaali (final round) bonus questions (ids 31-36, category 'final').
--
-- Run this in the Supabase SQL editor. Safe to re-run.

insert into bonus_questions (id, question_text, max_points, correct_answer, category, description) values
(31, 'Kas VAR võtab mõne värava ära?',                              2, null, 'final', null),
(32, 'Mitu tõrjet teeb finaali võitja võistkonna väravavaht?',     4, null, 'final', null),
(33, 'Kas mõni vahetusmängija lööb värava?',                       3, null, 'final', null),
(34, 'Kes valitakse pronksimängu parimaks mängijaks?',             4, null, 'final', null),
(35, 'Kes (mängija) lööb turniiri viimase värava?',                4, null, 'final', null),
(36, 'Milline mängija läbib finaalis kõige pikema vahemaa?',       4, null, 'final', null)
on conflict (id) do update set
  question_text = excluded.question_text,
  max_points = excluded.max_points,
  category = excluded.category,
  description = excluded.description;
