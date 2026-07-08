-- Quarter-final round updates:
--  1) veerandfinaali bonus questions (ids 19-23, category 'qf')
--  2) the QF Jokker (id 24, category 'jokker-qf')
--  3) participants.points_adjustment — a manual +/- correction the admin can
--     set per participant (e.g. removing regular-round points for a failed
--     Jokker), added to the participant's total on the leaderboard.
--
-- Run this in the Supabase SQL editor. Safe to re-run.

insert into bonus_questions (id, question_text, max_points, correct_answer, category, description) values
(19, 'Mitu väravat lüüakse väljastpoolt karistusala?',            3, null, 'qf', null),
(20, 'Mitu nurgalööki antakse mängude esimesel poolajal kokku?',  5, null, 'qf', null),
(21, 'Norra vs Inglismaa pallivaldamise protsent?',               4, null, 'qf', null),
(22, 'Kas Maroko läheb Prantsusmaa vastu juhtima?',               2, null, 'qf', null),
(23, 'Belgia võidab Hispaaniat rohkem kui 1 väravaga?',           3, null, 'qf', null),
(24, 'Jokker (valikuline)', 35, null, 'jokker-qf',
'Kui valid Jokkeri, siis läheb arvesse ainult ühe mängu ennustus. Ükskõik milline mäng, aga skoor peab olema täpselt ennustatud.
Jokkeri võit & ühe mängu skoor täpselt ennustatud = 35p + 5p. Jokkeri kaotus & ühe mängu skoor täpselt ennustatud = 5p.
1. Prantsusmaa juhib Marokot esimese poolaja lõpus.
2. Hispaania vs Belgia mäng läheb lisaajale.
3. Norra vs Inglismaa mängus lüüakse teisel poolajal rohkem kui 2 väravat.
4. Kaks mängu jäävad esimese poolaja lõpus 0-0.
5. Prantsusmaa, Hispaania, Inglismaa ja Argentiina lähevad järgmisesse ringi.')
on conflict (id) do update set
  question_text = excluded.question_text,
  max_points = excluded.max_points,
  category = excluded.category,
  description = excluded.description;

alter table participants
  add column if not exists points_adjustment integer not null default 0;
