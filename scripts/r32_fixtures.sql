-- FIFA World Cup 2026 — actual Round of 32 (1/32 finaali) fixtures.
--
-- Run this in the Supabase SQL editor to replace the "Selgub" placeholders
-- (or any incorrectly auto-resolved pairings) on matches 73-88 with the real
-- Round of 32 fixtures and kickoff times.
--
-- Times are Estonian local time (EEST, UTC+3), matching the group-stage rows.
-- Only team names and kickoff dates are updated; actual scores are left as-is.

update matches set home_team = 'Lõuna-Aafrika',       away_team = 'Kanada',                    match_date = '2026-06-28 22:00:00+03' where id = 73;
update matches set home_team = 'Brasiilia',           away_team = 'Jaapan',                    match_date = '2026-06-29 20:00:00+03' where id = 74;
update matches set home_team = 'Saksamaa',            away_team = 'Paraguay',                  match_date = '2026-06-29 23:30:00+03' where id = 75;
update matches set home_team = 'Holland',             away_team = 'Maroko',                    match_date = '2026-06-30 04:00:00+03' where id = 76;
update matches set home_team = 'Elevandiluurannik',  away_team = 'Norra',                     match_date = '2026-06-30 20:00:00+03' where id = 77;
update matches set home_team = 'Prantsusmaa',         away_team = 'Rootsi',                    match_date = '2026-07-01 00:00:00+03' where id = 78;
update matches set home_team = 'Mehhiko',             away_team = 'Ecuador',                   match_date = '2026-07-01 04:00:00+03' where id = 79;
update matches set home_team = 'Inglismaa',           away_team = 'Kongo',                     match_date = '2026-07-01 19:00:00+03' where id = 80;
update matches set home_team = 'Belgia',              away_team = 'Senegal',                   match_date = '2026-07-01 23:00:00+03' where id = 81;
update matches set home_team = 'USA',                 away_team = 'Bosnia ja Hertsegoviina',   match_date = '2026-07-02 03:00:00+03' where id = 82;
update matches set home_team = 'Hispaania',           away_team = 'Austria',                   match_date = '2026-07-02 22:00:00+03' where id = 83;
update matches set home_team = 'Portugal',            away_team = 'Horvaatia',                 match_date = '2026-07-03 02:00:00+03' where id = 84;
update matches set home_team = 'Šveits',              away_team = 'Alžeeria',                  match_date = '2026-07-03 06:00:00+03' where id = 85;
update matches set home_team = 'Austraalia',          away_team = 'Egiptus',                   match_date = '2026-07-03 21:00:00+03' where id = 86;
update matches set home_team = 'Argentiina',          away_team = 'Roheneemesaared',           match_date = '2026-07-04 01:00:00+03' where id = 87;
update matches set home_team = 'Colombia',            away_team = 'Ghana',                     match_date = '2026-07-04 04:30:00+03' where id = 88;
