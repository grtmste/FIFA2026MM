-- FIFA World Cup 2026 Prediction App - Seed Data
-- Run this AFTER schema.sql in the Supabase SQL editor.
--
-- Times are stored as Estonian local time (EEST, UTC+3) for the group stage,
-- matching the "Jalka MM 2026" prediction game schedule.

-- ---------------------------------------------------------------------------
-- Group stage matches (72 matches, groups A-L)
-- ---------------------------------------------------------------------------

insert into matches (id, stage, group_name, home_team, away_team, match_date, venue, actual_home_score, actual_away_score) values
(1,  'group', 'A', 'Mehhiko', 'Lõuna-Aafrika', '2026-06-11 22:00:00+03', null, null, null),
(2,  'group', 'A', 'Lõuna-Korea', 'Tšehhi', '2026-06-12 05:00:00+03', null, null, null),
(3,  'group', 'B', 'Kanada', 'Bosnia ja Hertsegoviina', '2026-06-12 22:00:00+03', null, null, null),
(4,  'group', 'D', 'USA', 'Paraguay', '2026-06-13 04:00:00+03', null, null, null),
(5,  'group', 'B', 'Katar', 'Šveits', '2026-06-13 22:00:00+03', null, null, null),
(6,  'group', 'C', 'Brasiilia', 'Maroko', '2026-06-14 01:00:00+03', null, null, null),
(7,  'group', 'C', 'Haiti', 'Šotimaa', '2026-06-14 04:00:00+03', null, null, null),
(8,  'group', 'D', 'Austraalia', 'Türgi', '2026-06-14 07:00:00+03', null, null, null),
(9,  'group', 'E', 'Saksamaa', 'Curaçao', '2026-06-14 20:00:00+03', null, null, null),
(10, 'group', 'F', 'Holland', 'Jaapan', '2026-06-14 23:00:00+03', null, null, null),
(11, 'group', 'E', 'Elevandiluurannik', 'Ecuador', '2026-06-15 02:00:00+03', null, null, null),
(12, 'group', 'F', 'Rootsi', 'Tuneesia', '2026-06-15 05:00:00+03', null, null, null),
(13, 'group', 'H', 'Hispaania', 'Roheneemesaared', '2026-06-15 19:00:00+03', null, null, null),
(14, 'group', 'G', 'Belgia', 'Egiptus', '2026-06-15 22:00:00+03', null, null, null),
(15, 'group', 'H', 'Saudi Araabia', 'Uruguay', '2026-06-16 01:00:00+03', null, null, null),
(16, 'group', 'G', 'Iraan', 'Uus-Meremaa', '2026-06-16 04:00:00+03', null, null, null),
(17, 'group', 'I', 'Prantsusmaa', 'Senegal', '2026-06-16 22:00:00+03', null, null, null),
(18, 'group', 'I', 'Iraak', 'Norra', '2026-06-17 01:00:00+03', null, null, null),
(19, 'group', 'J', 'Argentiina', 'Alžeeria', '2026-06-17 04:00:00+03', null, null, null),
(20, 'group', 'J', 'Austria', 'Jordaania', '2026-06-17 07:00:00+03', null, null, null),
(21, 'group', 'K', 'Portugal', 'Kongo', '2026-06-17 20:00:00+03', null, null, null),
(22, 'group', 'L', 'Inglismaa', 'Horvaatia', '2026-06-17 23:00:00+03', null, null, null),
(23, 'group', 'L', 'Ghana', 'Panama', '2026-06-18 02:00:00+03', null, null, null),
(24, 'group', 'K', 'Usbekistan', 'Colombia', '2026-06-18 05:00:00+03', null, null, null),
(25, 'group', 'A', 'Tšehhi', 'Lõuna-Aafrika', '2026-06-18 19:00:00+03', null, null, null),
(26, 'group', 'B', 'Šveits', 'Bosnia ja Hertsegoviina', '2026-06-18 22:00:00+03', null, null, null),
(27, 'group', 'B', 'Kanada', 'Katar', '2026-06-19 01:00:00+03', null, null, null),
(28, 'group', 'A', 'Mehhiko', 'Lõuna-Korea', '2026-06-19 04:00:00+03', null, null, null),
(29, 'group', 'D', 'USA', 'Austraalia', '2026-06-19 22:00:00+03', null, null, null),
(30, 'group', 'C', 'Šotimaa', 'Maroko', '2026-06-20 01:00:00+03', null, null, null),
(31, 'group', 'C', 'Brasiilia', 'Haiti', '2026-06-20 03:30:00+03', null, null, null),
(32, 'group', 'D', 'Türgi', 'Paraguay', '2026-06-20 06:00:00+03', null, null, null),
(33, 'group', 'F', 'Holland', 'Rootsi', '2026-06-20 20:00:00+03', null, null, null),
(34, 'group', 'E', 'Saksamaa', 'Elevandiluurannik', '2026-06-20 23:00:00+03', null, null, null),
(35, 'group', 'E', 'Ecuador', 'Curaçao', '2026-06-21 03:00:00+03', null, null, null),
(36, 'group', 'F', 'Tuneesia', 'Jaapan', '2026-06-21 07:00:00+03', null, null, null),
(37, 'group', 'H', 'Hispaania', 'Saudi Araabia', '2026-06-21 19:00:00+03', null, null, null),
(38, 'group', 'G', 'Belgia', 'Iraan', '2026-06-21 22:00:00+03', null, null, null),
(39, 'group', 'H', 'Uruguay', 'Roheneemesaared', '2026-06-22 01:00:00+03', null, null, null),
(40, 'group', 'G', 'Uus-Meremaa', 'Egiptus', '2026-06-22 04:00:00+03', null, null, null),
(41, 'group', 'J', 'Argentiina', 'Austria', '2026-06-22 20:00:00+03', null, null, null),
(42, 'group', 'I', 'Prantsusmaa', 'Iraak', '2026-06-23 00:00:00+03', null, null, null),
(43, 'group', 'I', 'Norra', 'Senegal', '2026-06-23 03:00:00+03', null, null, null),
(44, 'group', 'J', 'Jordaania', 'Alžeeria', '2026-06-23 06:00:00+03', null, null, null),
(45, 'group', 'K', 'Portugal', 'Usbekistan', '2026-06-23 20:00:00+03', null, null, null),
(46, 'group', 'L', 'Inglismaa', 'Ghana', '2026-06-23 23:00:00+03', null, null, null),
(47, 'group', 'L', 'Panama', 'Horvaatia', '2026-06-24 02:00:00+03', null, null, null),
(48, 'group', 'K', 'Colombia', 'Kongo', '2026-06-24 05:00:00+03', null, null, null),
(49, 'group', 'B', 'Šveits', 'Kanada', '2026-06-24 22:00:00+03', null, null, null),
(50, 'group', 'B', 'Bosnia ja Hertsegoviina', 'Katar', '2026-06-24 22:00:00+03', null, null, null),
(51, 'group', 'C', 'Šotimaa', 'Brasiilia', '2026-06-25 01:00:00+03', null, null, null),
(52, 'group', 'C', 'Maroko', 'Haiti', '2026-06-25 01:00:00+03', null, null, null),
(53, 'group', 'A', 'Tšehhi', 'Mehhiko', '2026-06-25 04:00:00+03', null, null, null),
(54, 'group', 'A', 'Lõuna-Aafrika', 'Lõuna-Korea', '2026-06-25 04:00:00+03', null, null, null),
(55, 'group', 'E', 'Curaçao', 'Elevandiluurannik', '2026-06-25 23:00:00+03', null, null, null),
(56, 'group', 'E', 'Ecuador', 'Saksamaa', '2026-06-25 23:00:00+03', null, null, null),
(57, 'group', 'F', 'Jaapan', 'Rootsi', '2026-06-26 02:00:00+03', null, null, null),
(58, 'group', 'F', 'Tuneesia', 'Holland', '2026-06-26 02:00:00+03', null, null, null),
(59, 'group', 'D', 'Türgi', 'USA', '2026-06-26 05:00:00+03', null, null, null),
(60, 'group', 'D', 'Paraguay', 'Austraalia', '2026-06-26 05:00:00+03', null, null, null),
(61, 'group', 'I', 'Norra', 'Prantsusmaa', '2026-06-26 22:00:00+03', null, null, null),
(62, 'group', 'I', 'Senegal', 'Iraak', '2026-06-26 22:00:00+03', null, null, null),
(63, 'group', 'H', 'Roheneemesaared', 'Saudi Araabia', '2026-06-27 03:00:00+03', null, null, null),
(64, 'group', 'H', 'Uruguay', 'Hispaania', '2026-06-27 03:00:00+03', null, null, null),
(65, 'group', 'G', 'Egiptus', 'Iraan', '2026-06-27 06:00:00+03', null, null, null),
(66, 'group', 'G', 'Uus-Meremaa', 'Belgia', '2026-06-27 06:00:00+03', null, null, null),
(67, 'group', 'L', 'Panama', 'Inglismaa', '2026-06-27 22:00:00+03', null, null, null),
(68, 'group', 'L', 'Horvaatia', 'Ghana', '2026-06-27 22:00:00+03', null, null, null),
(69, 'group', 'K', 'Colombia', 'Portugal', '2026-06-28 00:30:00+03', null, null, null),
(70, 'group', 'K', 'Kongo', 'Usbekistan', '2026-06-28 00:30:00+03', null, null, null),
(71, 'group', 'J', 'Alžeeria', 'Austria', '2026-06-28 05:00:00+03', null, null, null),
(72, 'group', 'J', 'Jordaania', 'Argentiina', '2026-06-28 05:00:00+03', null, null, null);

-- ---------------------------------------------------------------------------
-- Knockout stage placeholders (teams TBD - "Selgub")
-- 1/16 finaali (R32): 16 matches, 1/8 finaali (R16): 8, veerandfinaal (QF): 4,
-- poolfinaal (SF): 2, finaal: 1
-- ---------------------------------------------------------------------------

insert into matches (id, stage, group_name, home_team, away_team, match_date, venue, actual_home_score, actual_away_score) values
(73,  'r32', null, 'Lõuna-Aafrika', 'Kanada', '2026-06-28 22:00:00+03', null, null, null),
(74,  'r32', null, 'Brasiilia', 'Jaapan', '2026-06-29 20:00:00+03', null, null, null),
(75,  'r32', null, 'Saksamaa', 'Paraguay', '2026-06-29 23:30:00+03', null, null, null),
(76,  'r32', null, 'Holland', 'Maroko', '2026-06-30 04:00:00+03', null, null, null),
(77,  'r32', null, 'Elevandiluurannik', 'Norra', '2026-06-30 20:00:00+03', null, null, null),
(78,  'r32', null, 'Prantsusmaa', 'Rootsi', '2026-07-01 00:00:00+03', null, null, null),
(79,  'r32', null, 'Mehhiko', 'Ecuador', '2026-07-01 04:00:00+03', null, null, null),
(80,  'r32', null, 'Inglismaa', 'Kongo', '2026-07-01 19:00:00+03', null, null, null),
(81,  'r32', null, 'Belgia', 'Senegal', '2026-07-01 23:00:00+03', null, null, null),
(82,  'r32', null, 'USA', 'Bosnia ja Hertsegoviina', '2026-07-02 03:00:00+03', null, null, null),
(83,  'r32', null, 'Hispaania', 'Austria', '2026-07-02 22:00:00+03', null, null, null),
(84,  'r32', null, 'Portugal', 'Horvaatia', '2026-07-03 02:00:00+03', null, null, null),
(85,  'r32', null, 'Šveits', 'Alžeeria', '2026-07-03 06:00:00+03', null, null, null),
(86,  'r32', null, 'Austraalia', 'Egiptus', '2026-07-03 21:00:00+03', null, null, null),
(87,  'r32', null, 'Argentiina', 'Roheneemesaared', '2026-07-04 01:00:00+03', null, null, null),
(88,  'r32', null, 'Colombia', 'Ghana', '2026-07-04 04:30:00+03', null, null, null),
(89,  'r16', null, 'Kanada', 'Maroko', '2026-07-04 20:00:00+03', null, null, null),
(90,  'r16', null, 'Paraguay', 'Prantsusmaa', '2026-07-05 00:00:00+03', null, null, null),
(91,  'r16', null, 'Brasiilia', 'Norra', '2026-07-05 23:00:00+03', null, null, null),
(92,  'r16', null, 'Mehhiko', 'Inglismaa', '2026-07-06 03:00:00+03', null, null, null),
(93,  'r16', null, 'Portugal', 'Hispaania', '2026-07-06 22:00:00+03', null, null, null),
(94,  'r16', null, 'USA', 'Belgia', '2026-07-07 03:00:00+03', null, null, null),
(95,  'r16', null, 'Argentiina', 'Egiptus', '2026-07-07 19:00:00+03', null, null, null),
(96,  'r16', null, 'Šveits', 'Colombia', '2026-07-07 23:00:00+03', null, null, null),
(97,  'qf',  null, 'Prantsusmaa', 'Maroko', '2026-07-09 23:00:00+03', null, null, null),
(98,  'qf',  null, 'Hispaania', 'Belgia', '2026-07-10 22:00:00+03', null, null, null),
(99,  'qf',  null, 'Norra', 'Inglismaa', '2026-07-12 00:00:00+03', null, null, null),
(100, 'qf',  null, 'Argentiina', 'Šveits', '2026-07-12 04:00:00+03', null, null, null),
(101, 'sf',  null, 'Prantsusmaa', 'Hispaania', '2026-07-14 22:00:00+03', null, null, null),
(102, 'sf',  null, 'Inglismaa', 'Argentiina', '2026-07-15 22:00:00+03', null, null, null),
(103, 'final', null, 'Hispaania', 'Argentiina', '2026-07-19 22:00:00+03', null, null, null),
(104, 'third', null, 'Prantsusmaa', 'Inglismaa', '2026-07-19 00:00:00+03', null, null, null);

-- ---------------------------------------------------------------------------
-- Bonus questions
-- ---------------------------------------------------------------------------

insert into bonus_questions (id, question_text, max_points, correct_answer, category, description) values
(1, 'Milline meeskond võidab turniiri?', 10, null, 'alagrupp', null),
(2, 'Kes on turniiri suurim väravakütt?', 5, null, 'alagrupp', null),
(3, 'Millised 4 meeskonda jõuavad poolfinaali?', 7, null, 'alagrupp', null),
(4, 'Mitu mängu lõppevad viigiga alagrupi faasis?', 4, null, 'alagrupp', null),
(5, 'Millisele meeskonnale lüüakse alagrupi faasis kõige rohkem väravaid?', 5, null, 'alagrupp', null),
(6, 'Milline on edukaim Aafrika võistkond?', 6, null, 'alagrupp', null),
(7, 'Kas Marju laseb seekord kellelgi teisel võita?', 3, null, 'alagrupp', null),
-- 1/32 bonus round
(8,  'Mitu suluseisu fikseeritakse mängude peale kokku?', 5, null, '1/32', null),
(9,  'Mitu nurgalööki teenib Prantsusmaa Rootsi vastu?', 3, null, '1/32', null),
(10, 'Mitu söötu teeb Inglismaa (+/- 20)?',               4, null, '1/32', null),
(11, 'Kas mõni mäng läheb penaltiseeriasse?',             2, null, '1/32', null),
-- Jokker combo (optional, all-or-nothing)
(12, 'Jokker combo (valikuline)', 25, null, 'jokker',
'Kui valid selle jokker combo, siis nende mängude ennustused (täidetud üleval) eraldi arvesse ei lähe. Selleks, et võita Jokker comboga, peavad kõik etteantud 6 küsimust täppi minema:
1. Norra võidab Elevandiluurannikut
2. Ecuador võidab Mehhikot
3. Portugal võidab Horvaatiat
4. Egiptus võidab Austraaliat
5. Maroko võidab Hollandit
6. Belgia ja Senegal mängivad viiki

Kehtib endiselt reegel, et tulemusi arvestatakse normaalaja kohta.'),
-- 1/16 bonus round
(13, 'Mitu mängu läheb lisaajale?',                          3, null, '1/16', null),
(14, 'Mitu punast kaarti jagatakse?',                        3, null, '1/16', null),
(15, 'Mitmendal minutil lüüakse vooru avavärav?',            7, null, '1/16', null),
(16, 'Millises mängus lüüakse kõige rohkem väravaid?',       4, null, '1/16', null),
(17, 'Mitu kollast kaarti antakse Kanada vs Maroko mängus?', 4, null, '1/16', null),
(18, 'Mitu väravat lüüakse vasaku jalaga?',                  5, null, '1/16', null),
-- Veerandfinaali bonus round
(19, 'Mitu väravat lüüakse väljastpoolt karistusala?',            3, null, 'qf', null),
(20, 'Mitu nurgalööki antakse mängude esimesel poolajal kokku?',  5, null, 'qf', null),
(21, 'Norra vs Inglismaa pallivaldamise protsent?',               4, null, 'qf', null),
(22, 'Kas Maroko läheb Prantsusmaa vastu juhtima?',               2, null, 'qf', null),
(23, 'Belgia võidab Hispaaniat rohkem kui 1 väravaga?',           3, null, 'qf', null),
-- QF Jokker (optional)
(24, 'Jokker (valikuline)', 35, null, 'jokker-qf',
'Kui valid Jokkeri, siis läheb arvesse ainult ühe mängu ennustus. Ükskõik milline mäng, aga skoor peab olema täpselt ennustatud.
Jokkeri võit & ühe mängu skoor täpselt ennustatud = 35p + 5p. Jokkeri kaotus & ühe mängu skoor täpselt ennustatud = 5p.
1. Prantsusmaa juhib Marokot esimese poolaja lõpus.
2. Hispaania vs Belgia mäng läheb lisaajale.
3. Norra vs Inglismaa mängus lüüakse teisel poolajal rohkem kui 2 väravat.
4. Kaks mängu jäävad esimese poolaja lõpus 0-0.
5. Prantsusmaa, Hispaania, Inglismaa ja Argentiina lähevad järgmisesse ringi.'),
-- Poolfinaali bonus round
(25, 'Kummas mängus lüüakse avapoolajal rohkem nurgalööke?',                              2, null, 'sf', null),
(26, 'Mitmendal minutil teeb Prantsusmaa väravavaht esimese pallipuute?',                 4, null, 'sf', null),
(27, 'Kes (mängija) lööb Inglismaa vs Argentiina mängus esimese värava?',                 7, null, 'sf', null),
(28, 'Mitu kollast kaarti antakse Inglismaa ja Prantsusmaa võistkondade peale kokku?',    4, null, 'sf', null),
(29, 'Millised võistkonnad jõuavad finaali?',                                             3, null, 'sf', null),
(30, 'Kes võidab meie ennustusvõistluse?',                                                4, null, 'sf', null);
