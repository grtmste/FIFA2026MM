-- FIFA World Cup 2026 — actual Round of 16 (1/16 finaali) fixtures.
--
-- Run this in the Supabase SQL editor to fill matches 89-96 with the real
-- Round of 16 fixtures and kickoff times.
--
-- Times are Estonian local time (EEST, UTC+3), matching the other rounds.
-- Only team names and kickoff dates are updated; actual scores are left as-is.

update matches set home_team = 'Kanada',      away_team = 'Maroko',       match_date = '2026-07-04 20:00:00+03' where id = 89;
update matches set home_team = 'Paraguay',    away_team = 'Prantsusmaa',  match_date = '2026-07-05 00:00:00+03' where id = 90;
update matches set home_team = 'Brasiilia',   away_team = 'Norra',        match_date = '2026-07-05 23:00:00+03' where id = 91;
update matches set home_team = 'Mehhiko',     away_team = 'Inglismaa',    match_date = '2026-07-06 03:00:00+03' where id = 92;
update matches set home_team = 'Portugal',    away_team = 'Hispaania',    match_date = '2026-07-06 22:00:00+03' where id = 93;
update matches set home_team = 'USA',         away_team = 'Belgia',       match_date = '2026-07-07 03:00:00+03' where id = 94;
update matches set home_team = 'Argentiina',  away_team = 'Egiptus',      match_date = '2026-07-07 19:00:00+03' where id = 95;
update matches set home_team = 'Šveits',      away_team = 'Colombia',     match_date = '2026-07-07 23:00:00+03' where id = 96;

-- ---------------------------------------------------------------------------
-- 1/16 bonus questions (category '1/16')
-- ---------------------------------------------------------------------------

insert into bonus_questions (id, question_text, max_points, correct_answer, category, description) values
(13, 'Mitu mängu läheb lisaajale?',                          3, null, '1/16', null),
(14, 'Mitu punast kaarti jagatakse?',                        3, null, '1/16', null),
(15, 'Mitmendal minutil lüüakse vooru avavärav?',            7, null, '1/16', null),
(16, 'Millises mängus lüüakse kõige rohkem väravaid?',       4, null, '1/16', null),
(17, 'Mitu kollast kaarti antakse Kanada vs Maroko mängus?', 4, null, '1/16', null),
(18, 'Mitu väravat lüüakse vasaku jalaga?',                  5, null, '1/16', null)
on conflict (id) do update set
  question_text = excluded.question_text,
  max_points = excluded.max_points,
  category = excluded.category,
  description = excluded.description;
