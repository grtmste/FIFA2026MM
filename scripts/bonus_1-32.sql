-- Adds the 1/32 bonus round + Jokker combo to the bonus questions, and groups
-- bonus questions into categories for the Boonused page sections.
--
-- Run this in the Supabase SQL editor.

-- 1) Category + free-text description columns (description holds the Jokker
--    combo rules / conditions). Existing rows default to the group-stage round.
alter table bonus_questions
  add column if not exists category text not null default 'alagrupp';
alter table bonus_questions
  add column if not exists description text;

-- 2) Existing questions belong to the group-stage round.
update bonus_questions set category = 'alagrupp' where category is null or category = '';

-- 3) New 1/32 bonus questions.
insert into bonus_questions (id, question_text, max_points, correct_answer, category, description) values
(8,  'Mitu suluseisu fikseeritakse mängude peale kokku?', 5, null, '1/32', null),
(9,  'Mitu nurgalööki teenib Prantsusmaa Rootsi vastu?', 3, null, '1/32', null),
(10, 'Mitu söötu teeb Inglismaa (+/- 20)?',               4, null, '1/32', null),
(11, 'Kas mõni mäng läheb penaltiseeriasse?',             2, null, '1/32', null)
on conflict (id) do update set
  question_text = excluded.question_text,
  max_points = excluded.max_points,
  category = excluded.category,
  description = excluded.description;

-- 4) Jokker combo (optional, all-or-nothing 25p). The description carries the
--    rules and the 6 required outcomes shown on the Boonused page.
insert into bonus_questions (id, question_text, max_points, correct_answer, category, description) values
(12, 'Jokker combo (valikuline)', 25, null, 'jokker',
'Kui valid selle jokker combo, siis nende mängude ennustused (täidetud üleval) eraldi arvesse ei lähe. Selleks, et võita Jokker comboga, peavad kõik etteantud 6 küsimust täppi minema:
1. Norra võidab Elevandiluurannikut
2. Ecuador võidab Mehhikot
3. Portugal võidab Horvaatiat
4. Egiptus võidab Austraaliat
5. Maroko võidab Hollandit
6. Belgia ja Senegal mängivad viiki

Kehtib endiselt reegel, et tulemusi arvestatakse normaalaja kohta.')
on conflict (id) do update set
  question_text = excluded.question_text,
  max_points = excluded.max_points,
  category = excluded.category,
  description = excluded.description;
