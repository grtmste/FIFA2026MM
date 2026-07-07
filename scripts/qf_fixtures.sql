-- FIFA World Cup 2026 — actual quarter-final (veerandfinaal) fixtures.
--
-- Run this in the Supabase SQL editor to fill matches 97-100 with the real
-- quarter-final fixtures and kickoff times.
--
-- Times are Estonian local time (EEST, UTC+3), matching the other rounds.
-- Only team names and kickoff dates are updated; actual scores are left as-is.

update matches set home_team = 'Prantsusmaa', away_team = 'Maroko',    match_date = '2026-07-09 23:00:00+03' where id = 97;
update matches set home_team = 'Hispaania',   away_team = 'Belgia',    match_date = '2026-07-10 22:00:00+03' where id = 98;
update matches set home_team = 'Norra',       away_team = 'Inglismaa', match_date = '2026-07-12 00:00:00+03' where id = 99;
update matches set home_team = 'Argentiina',  away_team = 'Šveits',    match_date = '2026-07-12 04:00:00+03' where id = 100;
