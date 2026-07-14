-- Poolfinaali (semi-final) bonus questions (ids 25-30, category 'sf').
--
-- Run this in the Supabase SQL editor. Safe to re-run.

insert into bonus_questions (id, question_text, max_points, correct_answer, category, description) values
(25, 'Kummas mängus lüüakse avapoolajal rohkem nurgalööke?',                              2, null, 'sf', null),
(26, 'Mitmendal minutil teeb Prantsusmaa väravavaht esimese pallipuute?',                 4, null, 'sf', null),
(27, 'Kes (mängija) lööb Inglismaa vs Argentiina mängus esimese värava?',                 7, null, 'sf', null),
(28, 'Mitu kollast kaarti antakse Inglismaa ja Prantsusmaa võistkondade peale kokku?',    4, null, 'sf', null),
(29, 'Millised võistkonnad jõuavad finaali?',                                             3, null, 'sf', null),
(30, 'Kes võidab meie ennustusvõistluse?',                                                4, null, 'sf', null)
on conflict (id) do update set
  question_text = excluded.question_text,
  max_points = excluded.max_points,
  category = excluded.category,
  description = excluded.description;
