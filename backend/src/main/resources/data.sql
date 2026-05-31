SET NAMES 'utf8mb4';

-- =========================
-- CLEAR DATA
-- =========================
DELETE FROM `booking_payments`;
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
DELETE FROM `users`;

-- reset auto increment
ALTER TABLE `users` AUTO_INCREMENT = 1;
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

-- =========================
-- 1. USERS (3 users: 1 ADMIN, 2 PLAYERS)
-- =========================
-- Password: "password123" -> BCrypt encoded
INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`, `phone_number`, `avatar_url`)
VALUES
    (1, 'owner_hoang', 'hoang.owner@football.vn', '$2a$10$Y9O5YLMY2VVLvxPUQXUuZOBV0ZQTvEVjYQhxFQDXvJ5y3YJ1dQrGG', 'ADMIN', NOW(), '0909123456', NULL),
    (2, 'player_minh', 'minh.player@football.vn', '$2a$10$slYQmyNdGzin7olVN3p5be3DlH.PKZbv5H8KnzzigXXbVxzy6QMOG', 'PLAYER', NOW(), '0912345678', NULL),
    (3, 'player_tuan', 'tuan.player@football.vn', '$2a$10$slYQmyNdGzin7olVN3p5be3DlH.PKZbv5H8KnzzigXXbVxzy6QMOG', 'PLAYER', NOW(), '0987654321', NULL);

-- =========================
-- 2. VENUES (2 Venues)
-- =========================
INSERT INTO `venues` (`id`, `name`, `address`, `description`, `image_url`, `manager_id`, `open_time`, `close_time`)
VALUES
    (1, 'Cụm sân Bóng Đá Yên Hòa', '123 Nguyễn Chí Thanh, Cầu Giấy, Hà Nội', 'Cụm sân phục vụ cho phong trào và giải đấu bán chuyên', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018', 1, '06:30:00', '23:00:00'),
    (2, 'Cụm sân Bóng Đá Dịch Vọng', '45 Trần Thái Tông, Cầu Giấy, Hà Nội', 'Sân cỏ nhân tạo chất lượng cao, có bãi đỗ xe rộng rãi', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2', 1, '06:00:00', '22:00:00');

-- =========================
-- 3. PITCHES (5 fields)
-- =========================
INSERT INTO `pitches` (`id`, `name`, `pitch_type`, `is_active`, `base_price`, `venue_id`)
VALUES
    (1, 'Sân 1 - Yên Hòa', 'SAN_5', 1, 150000, 1),
    (2, 'Sân 2 - Yên Hòa', 'SAN_5', 1, 150000, 1),
    (3, 'Sân 3 - Yên Hòa', 'SAN_7', 1, 250000, 1),
    (4, 'Sân 1 - Dịch Vọng', 'SAN_7', 1, 260000, 2),
    (5, 'Sân 2 - Dịch Vọng', 'SAN_11', 1, 550000, 2);

-- =========================
-- 4. TIME SLOTS
-- =========================
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

-- =========================
-- 5. PRICE RULES
-- =========================
INSERT INTO `price_rules` (`pitch_id`, `slot_number`, `is_weekend`, `price`)
VALUES
    (1, 1, 0, 150000), (1, 1, 1, 180000),
    (2, 3, 0, 150000), (2, 3, 1, 180000),
    (3, 5, 0, 250000), (3, 5, 1, 300000),
    (4, 7, 0, 260000), (4, 7, 1, 310000),
    (5, 9, 0, 550000), (5, 9, 1, 650000);

-- =========================
-- 6. TEAMS (3 teams: APPROVED, PENDING, BANNED)
-- =========================
INSERT INTO `teams` (`id`, `name`, `captain_id`, `description`, `reputation_score`, `status`, `banned_until`, `created_at`)
VALUES
    (1, 'FC Mixi', 2, 'Đội bóng phong trào khu vực Cầu Giấy', 100, 'APPROVED', NULL, NOW()),
    (2, 'FC Refund', 3, 'Giao lưu vui vẻ, không quạu', 95, 'PENDING', NULL, NOW()),
    (3, 'FC Banned', 2, 'Đội bóng bị cấm thi đấu tạm thời do vi phạm điều khoản', 80, 'BANNED', DATE_ADD(NOW(), INTERVAL 7 DAY), NOW());

-- =========================
-- 7. TEAM MEMBERS
-- =========================
INSERT INTO `team_members` (`team_id`, `user_email`, `status`)
VALUES
    (1, 'minh.player@football.vn', 'ACTIVE'),
    (1, 'member1@football.vn', 'ACTIVE'),
    (1, 'member2@football.vn', 'INVITED'),
    (2, 'tuan.player@football.vn', 'ACTIVE'),
    (2, 'member3@football.vn', 'ACTIVE'),
    (3, 'minh.player@football.vn', 'ACTIVE'),
    (3, 'banned_member@football.vn', 'ACTIVE');

-- Update users team_id mapping
UPDATE `users` SET `team_id` = 1 WHERE `id` = 2;
UPDATE `users` SET `team_id` = 2 WHERE `id` = 3;

-- =========================
-- 8. MATCHES (4 matches: OPEN, MATCHED, CANCELLED, OPEN)
-- =========================
INSERT INTO `matches` (`id`, `venue_id`, `host_team_id`, `guest_team_id`, `skill_level`, `match_time`, `status`)
VALUES
    -- Open match at venue 1
    (1, 1, 1, NULL, 'AVERAGE', DATE_ADD(NOW(), INTERVAL 2 DAY), 'OPEN'),
    -- Matched match at venue 1
    (2, 1, 1, 2, 'AVERAGE', DATE_ADD(NOW(), INTERVAL 3 DAY), 'MATCHED'),
    -- Cancelled match at venue 2
    (3, 2, 2, NULL, 'WEAK', DATE_ADD(NOW(), INTERVAL 1 DAY), 'CANCELLED'),
    -- Open match at venue 2
    (4, 2, 1, NULL, 'GOOD', DATE_ADD(NOW(), INTERVAL 4 DAY), 'OPEN');
