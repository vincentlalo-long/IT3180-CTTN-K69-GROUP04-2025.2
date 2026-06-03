SET NAMES 'utf8mb4';

SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- CLEAR DATA (EXCEPT USERS TO PROTECT TOKENS)
-- ==========================================
DELETE FROM `activity_logs`;
DELETE FROM `booking_payments`;
<<<<<<< HEAD

DELETE FROM `booking_services`;

=======
>>>>>>> origin/dev
DELETE FROM `pitch_reviews`;
DELETE FROM `bookings`;
DELETE FROM `time_slots`;
DELETE FROM `services`;
DELETE FROM `price_rules`;
DELETE FROM `pitches`;
DELETE FROM `matches`;
DELETE FROM `venues`;
DELETE FROM `team_members`;
DELETE FROM `teams`;

-- Reset auto increments
ALTER TABLE `activity_logs` AUTO_INCREMENT = 1;
ALTER TABLE `venues` AUTO_INCREMENT = 1;
ALTER TABLE `pitches` AUTO_INCREMENT = 1;
ALTER TABLE `price_rules` AUTO_INCREMENT = 1;
ALTER TABLE `services` AUTO_INCREMENT = 1;
ALTER TABLE `time_slots` AUTO_INCREMENT = 1;
ALTER TABLE `bookings` AUTO_INCREMENT = 1;
ALTER TABLE `pitch_reviews` AUTO_INCREMENT = 1;
ALTER TABLE `booking_payments` AUTO_INCREMENT = 1;
ALTER TABLE `teams` AUTO_INCREMENT = 1;
ALTER TABLE `matches` AUTO_INCREMENT = 1;

-- ==========================================
-- 1. USERS (INSERT IGNORE TO PROTECT ACTIVE TOKENS)
-- ==========================================
INSERT IGNORE INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`, `phone_number`, `avatar_url`)
VALUES
    (1, 'owner_hoang', 'hoang.owner@football.vn', '$2a$10$Y9O5YLMY2VVLvxPUQXUuZOBV0ZQTvEVjYQhxFQDXvJ5y3YJ1dQrGG', 'ADMIN', NOW(), '0909123456', NULL),
    (2, 'player_minh', 'minh.player@football.vn', '$2a$10$slYQmyNdGzin7olVN3p5be3DlH.PKZbv5H8KnzzigXXbVxzy6QMOG', 'PLAYER', NOW(), '0912345678', NULL),
    (3, 'player_tuan', 'tuan.player@football.vn', '$2a$10$slYQmyNdGzin7olVN3p5be3DlH.PKZbv5H8KnzzigXXbVxzy6QMOG', 'PLAYER', NOW(), '0987654321', NULL);

-- ==========================================
-- 2. VENUES (2 Venues)
-- ==========================================
INSERT INTO `venues` (`id`, `name`, `address`, `description`, `image_url`, `manager_id`, `open_time`, `close_time`)
VALUES
    (1, 'Cụm sân Bóng Đá Yên Hòa', '123 Nguyễn Chí Thanh, Cầu Giấy, Hà Nội', 'Cụm sân phục vụ cho phong trào và giải đấu bán chuyên', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018', 1, '06:30:00', '23:00:00'),
    (2, 'Cụm sân Bóng Đá Dịch Vọng', '45 Trần Thái Tông, Cầu Giấy, Hà Nội', 'Sân cỏ nhân tạo chất lượng cao, có bãi đỗ xe rộng rãi', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2', 1, '06:00:00', '22:00:00');

-- ==========================================
-- 3. PITCHES (5 fields)
-- ==========================================
INSERT INTO `pitches` (`id`, `name`, `pitch_type`, `is_active`, `base_price`, `venue_id`)
VALUES
    (1, 'Sân 1 - Yên Hòa', 'SAN_5', 1, 150000, 1),
    (2, 'Sân 2 - Yên Hòa', 'SAN_5', 1, 150000, 1),
    (3, 'Sân 3 - Yên Hòa', 'SAN_7', 1, 250000, 1),
    (4, 'Sân 1 - Dịch Vọng', 'SAN_7', 1, 260000, 2),
    (5, 'Sân 2 - Dịch Vọng', 'SAN_11', 1, 550000, 2);

-- ==========================================
-- 4. TIME SLOTS — MASTER DATA (11 fixed time slots)
-- ==========================================
INSERT INTO `time_slots` (`id`, `slot_number`, `start_time`, `end_time`, `is_active`)
VALUES
    (1,  1,  '06:30:00', '08:00:00', 1),
    (2,  2,  '08:00:00', '09:30:00', 1),
    (3,  3,  '09:30:00', '11:00:00', 1),
    (4,  4,  '11:00:00', '12:30:00', 1),
    (5,  5,  '12:30:00', '14:00:00', 1),
    (6,  6,  '14:00:00', '15:30:00', 1),
    (7,  7,  '15:30:00', '17:00:00', 1),
    (8,  8,  '17:00:00', '18:30:00', 1),
    (9,  9,  '18:30:00', '20:00:00', 1),
    (10, 10, '20:00:00', '21:30:00', 1),
    (11, 11, '21:30:00', '23:00:00', 1);

-- ==========================================
-- 5. PRICE RULES
-- ==========================================
INSERT INTO `price_rules` (`pitch_id`, `slot_number`, `is_weekend`, `coefficient`)
VALUES
    -- Pitch 1
    (1, 1, 0, 1.00), (1, 1, 1, 1.20),
    (1, 8, 0, 1.00), (1, 8, 1, 1.20),
    (1, 9, 0, 1.00), (1, 9, 1, 1.20),
    (1, 10, 0, 1.00), (1, 10, 1, 1.20),
    -- Pitch 2
    (2, 3, 0, 1.00), (2, 3, 1, 1.20),
    (2, 8, 0, 1.00), (2, 8, 1, 1.20),
    (2, 9, 0, 1.00), (2, 9, 1, 1.20),
    -- Pitch 3
    (3, 5, 0, 1.00), (3, 5, 1, 1.20),
    (3, 8, 0, 1.00), (3, 8, 1, 1.20),
    (3, 10, 0, 1.00), (3, 10, 1, 1.20),
    -- Pitch 4
    (4, 7, 0, 1.00), (4, 7, 1, 1.20),
    (4, 8, 0, 1.00), (4, 8, 1, 1.20),
    (4, 9, 0, 1.00), (4, 9, 1, 1.20),
    (4, 10, 0, 1.00), (4, 10, 1, 1.20),
    -- Pitch 5
    (5, 8, 0, 1.00), (5, 8, 1, 1.20),
    (5, 9, 0, 1.00), (5, 9, 1, 1.20);

<<<<<<< HEAD
-- =========================
-- 5. SERVICES
-- =========================
-- =========================
INSERT INTO
    `services` (`venue_id`, `pitch_id`, `name`, `description`, `price`, `unit`, `status`)
VALUES
    (1, NULL, 'Nuoc khoang', 'Nuoc uong dong chai', 10000.00, 'chai', 'ACTIVE'),
    (1, NULL, 'Thue ao bib', 'Ao bib phan doi', 25000.00, 'bo', 'ACTIVE'),
    (1, NULL, 'Bong thi dau', 'Bong tieu chuan san 5/7/11', 150000.00, 'qua', 'ACTIVE');
=======
-- ==========================================
-- 6. SERVICES
-- ==========================================
INSERT INTO `services` (`pitch_id`, `name`, `price`, `unit`)
VALUES
    (1, 'Nước khoáng', 10000.00, 'chai'),
    (2, 'Thuê áo bib', 25000.00, 'bộ'),
    (3, 'Bóng thi đấu', 150000.00, 'quả');
>>>>>>> origin/dev

-- ==========================================
-- 7. TEAMS & TEAM MEMBERS
-- ==========================================
INSERT INTO `teams` (`id`, `name`, `captain_id`, `description`, `reputation_score`, `status`, `banned_until`, `created_at`)
VALUES
    (1, 'FC Mixi', 2, 'Đội bóng phong trào khu vực Cầu Giấy', 100, 'APPROVED', NULL, NOW()),
    (2, 'FC Refund', 3, 'Giao lưu vui vẻ, không quạu', 95, 'PENDING', NULL, NOW()),
    (3, 'FC Banned', 2, 'Đội bóng bị cấm thi đấu tạm thời', 80, 'BANNED', DATE_ADD(NOW(), INTERVAL 7 DAY), NOW());

INSERT INTO `team_members` (`team_id`, `user_email`, `status`)
VALUES
    (1, 'minh.player@football.vn', 'ACTIVE'),
    (1, 'member1@football.vn', 'ACTIVE'),
    (1, 'member2@football.vn', 'INVITED'),
    (2, 'tuan.player@football.vn', 'ACTIVE'),
    (2, 'member3@football.vn', 'ACTIVE'),
    (3, 'minh.player@football.vn', 'ACTIVE'),
    (3, 'banned_member@football.vn', 'ACTIVE');

-- Update users team_id mapping (safely)
UPDATE `users` SET `team_id` = 1 WHERE `id` = 2;
UPDATE `users` SET `team_id` = 2 WHERE `id` = 3;

-- ==========================================
-- 8. BOOKINGS (Enriched with late May and June 2026 dates)
-- ==========================================
INSERT INTO `bookings` (`id`, `player_id`, `pitch_id`, `booking_date`, `start_time`, `end_time`, `status`, `booking_type`, `total_price`, `created_at`, `time_slot_id`)
VALUES
    -- 2026-05-25
    (1, 2, 1, '2026-05-25', '17:00:00', '18:30:00', 'CONFIRMED', 'SINGLE', 150000.00, '2026-05-24 10:00:00', 8),
    (2, 3, 1, '2026-05-25', '18:30:00', '20:00:00', 'CONFIRMED', 'SINGLE', 180000.00, '2026-05-24 11:00:00', 9),
    (3, 2, 2, '2026-05-25', '17:00:00', '18:30:00', 'CANCELLED', 'SINGLE', 150000.00, '2026-05-24 12:00:00', 8),
    -- 2026-05-26
    (4, 2, 1, '2026-05-26', '20:00:00', '21:30:00', 'CONFIRMED', 'SINGLE', 180000.00, '2026-05-25 09:00:00', 10),
    (5, 3, 3, '2026-05-26', '17:00:00', '18:30:00', 'CONFIRMED', 'SINGLE', 250000.00, '2026-05-25 14:00:00', 8),
    -- 2026-05-27
    (6, 2, 2, '2026-05-27', '18:30:00', '20:00:00', 'PLAYING', 'SINGLE', 150000.00, '2026-05-26 15:00:00', 9),
    (7, 3, 4, '2026-05-27', '17:00:00', '18:30:00', 'CANCELLED', 'SINGLE', 260000.00, '2026-05-26 16:00:00', 8),
    -- 2026-05-28
    (8, 2, 1, '2026-05-28', '17:00:00', '18:30:00', 'CONFIRMED', 'SINGLE', 150000.00, '2026-05-27 10:00:00', 8),
    (9, 3, 5, '2026-05-28', '18:30:00', '20:00:00', 'CONFIRMED', 'SINGLE', 550000.00, '2026-05-27 11:00:00', 9),
    -- 2026-05-29
    (10, 2, 3, '2026-05-29', '20:00:00', '21:30:00', 'CONFIRMED', 'SINGLE', 300000.00, '2026-05-28 09:00:00', 10),
    (11, 3, 4, '2026-05-29', '18:30:00', '20:00:00', 'CONFIRMED', 'SINGLE', 260000.00, '2026-05-28 14:00:00', 9),
    (12, 2, 1, '2026-05-29', '18:30:00', '20:00:00', 'CANCELLED', 'SINGLE', 150000.00, '2026-05-28 15:00:00', 9),
    -- 2026-05-30 (Weekend)
    (13, 3, 1, '2026-05-30', '17:00:00', '18:30:00', 'CONFIRMED', 'SINGLE', 180000.00, '2026-05-29 10:00:00', 8),
    (14, 2, 2, '2026-05-30', '18:30:00', '20:00:00', 'CONFIRMED', 'SINGLE', 180000.00, '2026-05-29 11:00:00', 9),
    (15, 3, 3, '2026-05-30', '17:00:00', '18:30:00', 'CANCELLED', 'SINGLE', 300000.00, '2026-05-29 12:00:00', 8),
    -- 2026-05-31 (Weekend)
    (16, 2, 1, '2026-05-31', '18:30:00', '20:00:00', 'CONFIRMED', 'SINGLE', 180000.00, '2026-05-30 09:00:00', 9),
    (17, 3, 4, '2026-05-31', '20:00:00', '21:30:00', 'CONFIRMED', 'SINGLE', 312000.00, '2026-05-30 14:00:00', 10),
    -- 2026-06-01
    (18, 2, 1, '2026-06-01', '17:00:00', '18:30:00', 'CONFIRMED', 'SINGLE', 150000.00, '2026-05-31 10:00:00', 8),
    (19, 3, 2, '2026-06-01', '18:30:00', '20:00:00', 'CONFIRMED', 'SINGLE', 150000.00, '2026-05-31 11:00:00', 9),
    (20, 2, 3, '2026-06-01', '17:00:00', '18:30:00', 'CONFIRMED', 'SINGLE', 250000.00, '2026-05-31 12:00:00', 8),
    (21, 3, 4, '2026-06-01', '17:00:00', '18:30:00', 'CANCELLED', 'SINGLE', 260000.00, '2026-05-31 13:00:00', 8),
    -- 2026-06-02 (Today)
    (22, 2, 1, '2026-06-02', '17:00:00', '18:30:00', 'PLAYING', 'SINGLE', 150000.00, '2026-06-01 10:00:00', 8),
    (23, 3, 2, '2026-06-02', '18:30:00', '20:00:00', 'PLAYING', 'SINGLE', 150000.00, '2026-06-01 11:00:00', 9),
    (24, 2, 3, '2026-06-02', '17:00:00', '18:30:00', 'CONFIRMED', 'SINGLE', 250000.00, '2026-06-01 12:00:00', 8),
    (25, 3, 4, '2026-06-02', '18:30:00', '20:00:00', 'PENDING', 'SINGLE', 260000.00, '2026-06-01 13:00:00', 9),
    (26, 2, 5, '2026-06-02', '17:00:00', '18:30:00', 'CANCELLED', 'SINGLE', 550000.00, '2026-06-01 14:00:00', 8);

-- ==========================================
-- 9. MATCHES
-- ==========================================
INSERT INTO `matches` (`id`, `venue_id`, `host_team_id`, `guest_team_id`, `skill_level`, `match_time`, `status`, `pitch_type`, `time_slot_id`)
VALUES
    -- Open match
    (1, 1, 1, NULL, 'AVERAGE', DATE_ADD(NOW(), INTERVAL 2 DAY), 'OPEN', 5, 8),
    -- Matched match
    (2, 1, 1, 2, 'AVERAGE', DATE_ADD(NOW(), INTERVAL 3 DAY), 'MATCHED', 5, 9),
    -- Cancelled match
    (3, 2, 2, NULL, 'WEAK', DATE_ADD(NOW(), INTERVAL 1 DAY), 'CANCELLED', 7, 8),
    -- Open match 2
    (4, 2, 1, NULL, 'GOOD', DATE_ADD(NOW(), INTERVAL 4 DAY), 'OPEN', 11, 10);

SET FOREIGN_KEY_CHECKS = 1;
