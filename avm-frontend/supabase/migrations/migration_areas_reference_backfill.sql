-- migration_areas_reference_backfill.sql
-- ===================================================
-- APPLIED LIVE to hzgkmvhvivqczxkdcfek. Closes item #4 from the
-- "what's left" audit -- and the real scope turned out far bigger than
-- the ticket name suggested. Original finding: "JVC (area_id=59)
-- missing from areas_reference's 301 rows." Checked the actual scope
-- before fixing it: 140 real, transaction-backed area_ids exist in avm
-- with ZERO matching row in areas_reference -- including some of
-- Dubai's most well-known areas (Business Bay: 14,317 real
-- transactions, Dubai Hills Estate: 5,306, Dubai Marina: 5,028, JBR,
-- JLT, Dubai Creek Harbour, multiple Arabian Ranches phases). JVC was
-- just the one a prior session happened to hit live -- roughly half of
-- Dubai's real transaction volume by area_id was affected, not one
-- area.
--
-- IMPORTANT HONESTY NOTE: this table is NOT currently read by the live
-- chat pipeline at all -- confirmed by checking normalize_area()
-- (clients.py), which uses a small hardcoded alias dict, not a join
-- against this table. Its own comments explicitly flag "the complete
-- fix is the areas_reference-based canonical join (doc issue #1/#6,
-- P0)" as separate, unbuilt work. This migration makes the reference
-- table itself complete and correct -- it does NOT change any live
-- chat answer today, and should not be represented as such. It removes
-- a real blocker for whenever the P0 canonical-join resolver actually
-- gets built.
--
-- SOURCE OF TRUTH: avm itself (area_id, area_name_en), the same table
-- every other part of this pipeline already treats as ground truth --
-- not a guess, not a second dataset.
--
-- name_ar and municipality_number are deliberately left NULL for every
-- new row here. This project's own stated discipline is "never
-- fabricate a value" -- existing areas_reference rows have real DLD
-- municipality numbers and Arabic names sourced from wherever the
-- original 301-row load came from; no equivalent authoritative source
-- for these 140 was available in this session, so guessing was not an
-- acceptable substitute for leaving them null.
--
-- TWO DATA-QUALITY ISSUES FOUND AND HANDLED, NOT SILENTLY WORKED
-- AROUND:
-- 1. area_id=999998 appears repeatedly in avm attached to garbage
--    "names" (literal digit strings like "5178"/"603"/"2299", a stray
--    " Central Heating") -- a catch-all/malformed bucket in the source
--    feed, not a real area. Excluded entirely from this insert.
-- 2. Two genuine area_id collisions where avm has the SAME area_id
--    under two different names: 89789 ("Al Yelayiss 1", 9,644 real
--    transactions vs "DAMAC Islands 2", 322) and 100073 ("Al Thanayah
--    Fourth", 12,809 vs "Emirates Living", 292). areas_reference.area_id
--    is a PRIMARY KEY, so only one name per id is possible -- the
--    dominant name by transaction count was kept for each.
--
-- Verified after applying: areas_reference row count 301 -> 441
-- (exactly +140), area_id=59 confirmed present as
-- "Jumeirah Village Circle (JVC)".

INSERT INTO areas_reference (area_id, name_en)
VALUES
(10, 'Downtown Dubai'),  -- 3 real transactions on record
(12, 'Jumeirah Lake Towers (JLT)'),  -- 63 real transactions on record
(13, 'Discovery Gardens'),  -- 1,817 real transactions on record
(23, 'Jumeirah'),  -- 317 real transactions on record
(25, 'Barsha Heights (Tecom)'),  -- 937 real transactions on record
(36, 'Dubai Marina'),  -- 5,028 real transactions on record
(41, 'Al Furjan'),  -- 5,282 real transactions on record
(43, 'Meydan'),  -- 2,688 real transactions on record
(51, 'Dubailand'),  -- 636 real transactions on record
(52, 'Living Legends'),  -- 512 real transactions on record
(53, 'Dubai Hills Estate'),  -- 5,306 real transactions on record
(54, 'Business Bay'),  -- 14,317 real transactions on record
(59, 'Jumeirah Village Circle (JVC)'),  -- 20,796 real transactions on record
(67, 'Dubai Sports City'),  -- 5,002 real transactions on record
(73, 'Jumeirah Park'),  -- 136 real transactions on record
(81, 'Dubai Studio City'),  -- 2,369 real transactions on record
(91, 'Arjan'),  -- 6,795 real transactions on record
(95, 'Dubai Media City'),  -- 1 real transactions on record
(103, 'Jebel Ali'),  -- 183 real transactions on record
(105, 'Al Barsha'),  -- 102 real transactions on record
(117, 'DIFC'),  -- 369 real transactions on record
(133, 'Arabian Ranches 2'),  -- 84 real transactions on record
(161, 'Nad Al Sheba'),  -- 934 real transactions on record
(190, 'Culture Village (Jaddaf Waterfront)'),  -- 2,138 real transactions on record
(194, 'Falcon City of Wonders'),  -- 711 real transactions on record
(197, 'Al Badaa'),  -- 6 real transactions on record
(532, 'Al Qusais'),  -- 14 real transactions on record
(545, 'Deira'),  -- 63 real transactions on record
(562, 'Al Warsan'),  -- 1 real transactions on record
(603, 'Dubai Land Residence Complex'),  -- 11,038 real transactions on record
(673, 'Green Community'),  -- 36 real transactions on record
(849, 'Jumeirah Heights'),  -- 275 real transactions on record
(914, 'Al Wasl'),  -- 3,502 real transactions on record
(926, 'Al Safa'),  -- 1 real transactions on record
(1036, 'Ras Al Khor'),  -- 57 real transactions on record
(1141, 'Al Khawaneej'),  -- 34 real transactions on record
(1167, 'Al Jafiliya'),  -- 1 real transactions on record
(1187, 'Al Twar'),  -- 4 real transactions on record
(1257, 'Al Warqaa'),  -- 17 real transactions on record
(1347, 'Al Satwa'),  -- 3,956 real transactions on record
(1509, 'Al Jaddaf'),  -- 2,037 real transactions on record
(1519, 'Palm Jebel Ali'),  -- 260 real transactions on record
(1621, 'Dubai Internet City'),  -- 2 real transactions on record
(1754, 'Bluewaters Island'),  -- 488 real transactions on record
(1793, 'Muhaisnah'),  -- 28 real transactions on record
(1973, 'City of Arabia'),  -- 2,781 real transactions on record
(2418, 'Al Rashidiya'),  -- 6,281 real transactions on record
(2848, 'Dubai Maritime City'),  -- 3,517 real transactions on record
(3355, 'Dubai South'),  -- 3,705 real transactions on record
(3512, 'Dubai Harbour'),  -- 1,402 real transactions on record
(5036, 'Dubai Production City (IMPZ)'),  -- 5,079 real transactions on record
(5099, 'Dubai Industrial City'),  -- 1,046 real transactions on record
(5173, 'Tilal Al Ghaf'),  -- 470 real transactions on record
(5178, 'Dubai Islands'),  -- 8,516 real transactions on record
(16296, 'Arabian Ranches 3'),  -- 583 real transactions on record
(22688, 'Dubai Design District'),  -- 457 real transactions on record
(75266, 'DAMAC Lagoons'),  -- 1,629 real transactions on record
(75598, 'Liwan 2'),  -- 44 real transactions on record
(84238, 'Dubai International Airport'),  -- 2 real transactions on record
(85082, 'Expo City'),  -- 478 real transactions on record
(87020, 'Athlon by Aldar'),  -- 518 real transactions on record
(89404, 'Meydan Horizon'),  -- 889 real transactions on record
(89789, 'Al Yelayiss 1'),  -- 9,644 real transactions on record
(100001, 'Majan'),  -- 5,263 real transactions on record
(100002, 'Jumeirah Village Triangle'),  -- 3,323 real transactions on record
(100003, 'Business Park'),  -- 2,527 real transactions on record
(100004, 'Jumeirah Lakes Towers'),  -- 2,065 real transactions on record
(100005, 'Al Yelayiss 5'),  -- 1,761 real transactions on record
(100006, 'International City Ph 1'),  -- 1,736 real transactions on record
(100007, 'Dubai Science Park'),  -- 1,574 real transactions on record
(100008, 'Horizon'),  -- 1,411 real transactions on record
(100009, 'Dubai Creek Harbour'),  -- 1,273 real transactions on record
(100010, 'Tecom Site A'),  -- 1,134 real transactions on record
(100011, 'Dubai Hills'),  -- 1,162 real transactions on record
(100012, 'Meydan One'),  -- 1,161 real transactions on record
(100013, 'Sama Al Jadaf'),  -- 1,032 real transactions on record
(100014, 'International City Ph 2 & 3'),  -- 1,271 real transactions on record
(100015, 'Sobha Heartland'),  -- 997 real transactions on record
(100016, 'Liwan'),  -- 848 real transactions on record
(100017, 'Dubai Healthcare City - Phase 2'),  -- 679 real transactions on record
(100018, 'Al Barari'),  -- 474 real transactions on record
(100020, 'Down Town Jabal Ali'),  -- 833 real transactions on record
(100023, 'Jumeirah Beach Residence (JBR)'),  -- 353 real transactions on record
(100024, 'Emaar South'),  -- 260 real transactions on record
(100025, 'City Walk, Al Wasl'),  -- 257 real transactions on record
(100026, 'Remraam'),  -- 235 real transactions on record
(100027, 'Meydan Avenue'),  -- 230 real transactions on record
(100028, 'Arabian Ranches I'),  -- 229 real transactions on record
(100029, 'Dubai Water Canal'),  -- 232 real transactions on record
(100030, 'Jumeirah Golf'),  -- 199 real transactions on record
(100031, 'Sufouh Gardens'),  -- 178 real transactions on record
(100032, 'Villanova'),  -- 180 real transactions on record
(100033, 'Jebel Ali Hills, Jebel Ali'),  -- 161 real transactions on record
(100034, 'Mira'),  -- 159 real transactions on record
(100035, 'Mudon'),  -- 142 real transactions on record
(100037, 'La Mer'),  -- 119 real transactions on record
(100038, 'Al Khail Heights'),  -- 118 real transactions on record
(100039, 'The Field'),  -- 118 real transactions on record
(100040, 'The Valley by Emaar'),  -- 110 real transactions on record
(100041, 'The Lakes'),  -- 118 real transactions on record
(100042, 'Arabian Ranches Iii'),  -- 103 real transactions on record
(100043, 'Mbr District 1'),  -- 133 real transactions on record
(100044, 'Garden View Villas'),  -- 80 real transactions on record
(100045, 'The Villa'),  -- 88 real transactions on record
(100046, 'Mbr District 7'),  -- 87 real transactions on record
(100047, 'Serena'),  -- 81 real transactions on record
(100048, 'Arabian Ranches Ii'),  -- 77 real transactions on record
(100049, 'Jumeirah Islands'),  -- 64 real transactions on record
(100050, 'Jumeirah Living'),  -- 59 real transactions on record
(100051, 'The World Islands'),  -- 43 real transactions on record
(100052, 'Rukan'),  -- 37 real transactions on record
(100053, 'Grand Views'),  -- 31 real transactions on record
(100054, 'Dubai Lifestyle City'),  -- 26 real transactions on record
(100055, 'Sustainable City'),  -- 23 real transactions on record
(100056, 'Al Waha'),  -- 22 real transactions on record
(100057, 'Dubai WaterFront'),  -- 19 real transactions on record
(100058, 'Mina Rashid'),  -- 19 real transactions on record
(100059, 'Cherrywoods'),  -- 20 real transactions on record
(100060, 'Dubai Golf City'),  -- 14 real transactions on record
(100061, 'Tecom Site D'),  -- 13 real transactions on record
(100062, 'Polo Townhouses Igo'),  -- 9 real transactions on record
(100063, 'Dubai Healthcare City Phase 1, Bur Dubai'),  -- 10 real transactions on record
(100064, 'Millennium'),  -- 5 real transactions on record
(100065, 'Jumeira Bay'),  -- 6 real transactions on record
(100066, 'Arabian Ranches Polo Club'),  -- 4 real transactions on record
(100067, 'Palmarosa'),  -- 2 real transactions on record
(100068, 'Medyan Race Course Villas'),  -- 2 real transactions on record
(100069, 'Al Maha'),  -- 2 real transactions on record
(100071, 'Dmcc-Ez2'),  -- 481 real transactions on record
(100073, 'Al Thanayah Fourth'),  -- 12,809 real transactions on record
(100074, 'The Greens and The Views'),  -- 375 real transactions on record
(200001, 'Al Qoaz'),  -- 10 real transactions on record
(200002, 'Tawaa Al Sayegh'),  -- 2 real transactions on record
(200003, 'Margham'),  -- 6 real transactions on record
(200004, 'Tawi Al Muraqqab'),  -- 6 real transactions on record
(200005, 'Al Warsan Second'),  -- 26 real transactions on record
(200006, 'Al Warsan Third'),  -- 54 real transactions on record
(200007, 'Al Goze Third'),  -- 8 real transactions on record
(200008, 'Al Thanayah Fourth'),  -- 805 real transactions on record
(200009, 'Al Barsha First')  -- 275 real transactions on record
ON CONFLICT (area_id) DO NOTHING;
