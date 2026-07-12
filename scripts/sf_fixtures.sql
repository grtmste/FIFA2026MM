-- FIFA World Cup 2026 — actual semi-final (poolfinaal) fixtures.
--
-- Run this in the Supabase SQL editor to fill matches 101-102 with the real
-- semi-final fixtures and kickoff times (EEST, UTC+3). Safe to re-run.

update matches set home_team = 'Prantsusmaa', away_team = 'Hispaania',  match_date = '2026-07-14 22:00:00+03' where id = 101;
update matches set home_team = 'Inglismaa',   away_team = 'Argentiina', match_date = '2026-07-15 22:00:00+03' where id = 102;
