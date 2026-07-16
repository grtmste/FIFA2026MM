-- FIFA World Cup 2026 — third-place play-off and final fixtures.
--
-- Run this in the Supabase SQL editor. Times are Estonian local time
-- (EEST, UTC+3). Safe to re-run. (Requires the 'third' stage / match 104 from
-- scripts/third_place.sql.)

update matches set home_team = 'Prantsusmaa', away_team = 'Inglismaa',  match_date = '2026-07-19 00:00:00+03' where id = 104; -- 3. koha mäng
update matches set home_team = 'Hispaania',   away_team = 'Argentiina', match_date = '2026-07-19 22:00:00+03' where id = 103; -- finaal
