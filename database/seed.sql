SET
    NAMES 'utf8mb4';

-- =========================
-- CLEAR DATA
-- =========================
DELETE FROM `league_registrations`;
DELETE FROM `leagues`;
DELETE FROM `booking_payments`;
DELETE FROM `booking_services`;
DELETE FROM `pitch_reviews`;

DELETE FROM `bookings`;

DELETE FROM `time_slots`;

DELETE FROM `services`;

DELETE FROM `price_rules`;

DELETE FROM `pitches`;

DELETE FROM `matches`;

DELETE FROM `venues`;


-- 1) Seed 1 Venue (manager_id map toi user da dang ky)
INSERT INTO `venues` (
	`id`, `name`, `address`, `description`, `image_url`, `manager_id`, `open_time`, `close_time`
) VALUES
(
	1,
	'Cum san Bong Da Yen Hoa',
	'123 Nguyen Chi Thanh, Cau Giay, Ha Noi',
	'Cum san phuc vu cho phong trao va giai dau ban chuyen',
	'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
	1,
	'06:30:00',
	'23:00:00'
);

-- 2) Seed 3 Pitches
INSERT INTO `pitches` (`id`, `name`, `pitch_type`, `is_active`, `base_price`, `venue_id`) VALUES
(1, 'San 5A',  'SAN_5',  b'1', 350000.00, 1),
(2, 'San 7B',  'SAN_7',  b'1', 500000.00, 1),
(3, 'San 11C', 'SAN_11', b'1', 900000.00, 1);

-- 3) Seed Price Rules (moi san 2 rule: ngay thuong/cuoi tuan cho slot 1)
INSERT INTO `price_rules` (`pitch_id`, `slot_number`, `is_weekend`, `coefficient`) VALUES
(1, 1, b'0', 1.00),
(1, 1, b'1', 1.20),
(2, 1, b'0', 1.00),
(2, 1, b'1', 1.16),
(3, 1, b'0', 1.00),
(3, 1, b'1', 1.11);

-- 4) Seed Services
INSERT INTO `services` (`venue_id`, `pitch_id`, `name`, `description`, `price`, `unit`, `status`) VALUES
(1, NULL, 'Nước khoáng', 'Nước uống đóng chai', 10000.00, 'chai', 'ACTIVE'),
(1, NULL, 'Thuê áo bib', 'Áo bib phân đội', 25000.00, 'bộ', 'ACTIVE'),
(1, NULL, 'Bóng thi đấu', 'Bóng tiêu chuẩn sân 5/7/11', 150000.00, 'quả', 'ACTIVE');

-- 5) Seed >=10 Bookings de demo Dashboard
-- Luu y: status theo BookingStatus enum hien tai: RESERVED, CANCELLED, PLAYING.
INSERT INTO `bookings` (
	`player_id`, `pitch_id`, `booking_date`, `start_time`, `end_time`, `status`, `booking_type`, `total_price`, `created_at`
) VALUES
(2, 1, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '06:30:00', '08:00:00', 'PLAYING',   'MATCH',    350000.00, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, 2, DATE_SUB(CURDATE(), INTERVAL 6 DAY), '08:00:00', '09:30:00', 'PLAYING',   'TRAINING', 500000.00, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '09:30:00', '11:00:00', 'CANCELLED', 'MATCH',    900000.00, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '11:00:00', '12:30:00', 'PLAYING',   'FRIENDLY', 350000.00, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '12:30:00', '14:00:00', 'CANCELLED', 'MATCH',    500000.00, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '14:00:00', '15:30:00', 'PLAYING',   'TOUR',     900000.00, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '15:30:00', '17:00:00', 'PLAYING',   'MATCH',    350000.00, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 2, CURDATE(),                            '17:00:00', '18:30:00', 'RESERVED',  'MATCH',    500000.00, NOW()),
(2, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:30:00', '20:00:00', 'RESERVED',  'TOUR',     900000.00, NOW()),
(2, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '20:00:00', '21:30:00', 'CANCELLED', 'FRIENDLY', 350000.00, NOW());

-- 6) Seed reviews (optional cho demo)
INSERT INTO `pitch_reviews` (`pitch_id`, `player_id`, `booking_id`, `rating`, `content`, `created_at`) VALUES
(1, 2, 1, 5, 'Sân đẹp, chất lượng tốt', NOW()),
(2, 2, 2, 4, 'Giá hợp lý, ánh sáng ổn', NOW());

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

ALTER TABLE `leagues` AUTO_INCREMENT = 1;

ALTER TABLE `league_registrations` AUTO_INCREMENT = 1;

-- =========================
-- 1. USERS (3 users: 1 ADMIN, 2 PLAYERS)
-- =========================
-- Password: "123456" -> BCrypt encoded
INSERT INTO
    `users` (
    `id`,
    `username`,
    `email`,
    `password`,
    `role`,
    `created_at`,
    `phone_number`,
    `avatar_url`,
    `membership_points`
)
VALUES
    (
        1,
        'owner_hoang',
        'hoang.owner@football.vn',
        '$2a$10$gI6fyFeS.5m5GStiXfpl9OLT1UUZ7r6A7gt466M7H/boSx1ppfUzq',
        'ADMIN',
        NOW(),
        '0909123456',
        NULL,
        0
    ),
    (
        2,
        'player_minh',
        'minh.player@football.vn',
        '$2a$10$gI6fyFeS.5m5GStiXfpl9OLT1UUZ7r6A7gt466M7H/boSx1ppfUzq',
        'PLAYER',
        NOW(),
        '0912345678',
        NULL,
        0
    ),
    (
        3,
        'player_tuan',
        'tuan.player@football.vn',
        '$2a$10$gI6fyFeS.5m5GStiXfpl9OLT1UUZ7r6A7gt466M7H/boSx1ppfUzq',
        'PLAYER',
        NOW(),
        '0987654321',
        NULL,
        0
    );

-- =========================
-- 2. VENUE
-- =========================
INSERT INTO
    `venues` (
    `id`,
    `name`,
    `address`,
    `description`,
    `image_url`,
    `manager_id`,
    `open_time`,
    `close_time`
)
VALUES
    (
        1,
        'Cum san Bong Da Yen Hoa',
        '123 Nguyen Chi Thanh, Cau Giay, Ha Noi',
        'Cum san phuc vu cho phong trao va giai dau ban chuyen',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018',
        1,
        '06:30:00',
        '23:00:00'
    );

-- =========================
-- 3. PITCHES (5 fields with different types and prices)
-- =========================
-- Pitch types: SAN_5 (5-a-side), SAN_7 (7-a-side), SAN_11 (full size)
INSERT INTO
    `pitches` (
    `id`,
    `name`,
    `pitch_type`,
    `is_active`,
    `base_price`,
    `venue_id`
)
VALUES
    (1, 'San 1 - 5 Nguoi', 'SAN_5', 1, 150000, 1),
    (2, 'San 2 - 5 Nguoi', 'SAN_5', 1, 150000, 1),
    (3, 'San 3 - 7 Nguoi', 'SAN_7', 1, 250000, 1),
    (4, 'San 4 - 7 Nguoi', 'SAN_7', 1, 250000, 1),
    (5, 'San 5 - 11 Nguoi', 'SAN_11', 1, 500000, 1);

-- =========================
-- 4. PRICE RULES
-- =========================
INSERT INTO
    `price_rules` (`pitch_id`, `slot_number`, `is_weekend`, `price`)
VALUES
    -- Pitch 1 (5-a-side) - sample slots
    (1, 1, 0, 150000),
    (1, 1, 1, 180000),
    (1, 2, 0, 150000),
    (1, 2, 1, 180000),
    -- Pitch 2 (5-a-side) - sample slots
    (2, 3, 0, 150000),
    (2, 3, 1, 180000),
    (2, 4, 0, 150000),
    (2, 4, 1, 180000),
    -- Pitch 3 (7-a-side) - sample slots
    (3, 5, 0, 250000),
    (3, 5, 1, 300000),
    (3, 6, 0, 250000),
    (3, 6, 1, 300000),
    -- Pitch 4 (7-a-side) - sample slots
    (4, 7, 0, 250000),
    (4, 7, 1, 300000),
    (4, 8, 0, 250000),
    (4, 8, 1, 300000),
    -- Pitch 5 (11-a-side) - sample slots
    (5, 9, 0, 500000),
    (5, 9, 1, 600000),
    (5, 10, 0, 500000),
    (5, 10, 1, 600000);

-- =========================
-- 5. TIME SLOTS — MASTER DATA (11 khung giờ duy nhất, không gắn pitch)
-- =========================
-- Slot 1=06:30-08:00, 2=08:00-09:30, ..., 11=21:30-23:00
INSERT INTO
    `time_slots` (`id`, `slot_number`, `start_time`, `end_time`, `is_active`)
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
-- 6. SERVICES
-- =========================
INSERT INTO
    `services` (`pitch_id`, `name`, `price`, `unit`)
VALUES
    (1, 'Nước khoáng', 10000.00, 'chai'),
    (2, 'Thuê áo bib', 25000.00, 'bộ'),
    (3, 'Bóng thi đấu', 150000.00, 'quả');

-- =========================
-- 7. BOOKINGS FOR 2026-06-06 TEST DATA
-- =========================
-- time_slot_id now maps to global master: 8 = Ca 8 (17:00-18:30)
-- 1. Booking: San 1, Ca 8 (17:00 - 18:30)
INSERT INTO `bookings` (`player_id`, `pitch_id`, `booking_date`, `start_time`, `end_time`, `status`, `booking_type`, `total_price`, `created_at`, `time_slot_id`)
VALUES (2, 1, '2026-06-06', '17:00:00', '18:30:00', 'CONFIRMED', 'SINGLE', 150000, NOW(), 8);

-- 2. Booking: San 2, Ca 9 (18:30 - 20:00)
INSERT INTO `bookings` (`player_id`, `pitch_id`, `booking_date`, `start_time`, `end_time`, `status`, `booking_type`, `total_price`, `created_at`, `time_slot_id`)
VALUES (3, 2, '2026-06-06', '18:30:00', '20:00:00', 'CONFIRMED', 'SINGLE', 180000, NOW(), 9);

-- 3. Slot Bao tri: San 3, Ca 2 (08:00 - 09:30)
INSERT INTO `bookings` (`player_id`, `pitch_id`, `booking_date`, `start_time`, `end_time`, `status`, `booking_type`, `total_price`, `created_at`, `time_slot_id`)
VALUES (1, 3, '2026-06-06', '08:00:00', '09:30:00', 'MAINTENANCE', 'MAINTENANCE', 0, NOW(), 2);

-- 4. Slot Bao tri: San 3, Ca 3 (09:30 - 11:00)
INSERT INTO `bookings` (`player_id`, `pitch_id`, `booking_date`, `start_time`, `end_time`, `status`, `booking_type`, `total_price`, `created_at`, `time_slot_id`)
VALUES (1, 3, '2026-06-06', '09:30:00', '11:00:00', 'MAINTENANCE', 'MAINTENANCE', 0, NOW(), 3);

-- =========================
-- 8. TEAMS & TEAM MEMBERS
-- =========================
INSERT INTO `teams` (`id`, `name`, `captain_id`, `description`, `reputation_score`, `status`, `created_at`)
VALUES
    (1, 'FC Mixi', 2, 'Doi bong phong trao khu vuc Cau Giay', 100, 'APPROVED', NOW()),
    (2, 'FC Refund', 3, 'Giao luu vui ve, khong quau', 95, 'PENDING', NOW());

-- player 2 is captain of team 1, player 3 is captain of team 2
-- add members
INSERT INTO `team_members` (`team_id`, `user_email`, `status`)
VALUES
    (1, 'minh.player@football.vn', 'ACTIVE'),
    (1, 'member1@football.vn', 'ACTIVE'),
    (1, 'member2@football.vn', 'INVITED'),
    (2, 'tuan.player@football.vn', 'ACTIVE'),
    (2, 'member3@football.vn', 'ACTIVE');

-- update users team_id
UPDATE `users` SET `team_id` = 1 WHERE `id` = 2;
UPDATE `users` SET `team_id` = 2 WHERE `id` = 3;

-- =========================
-- 9. MATCHES
-- =========================
INSERT INTO `matches` (`id`, `venue_id`, `host_team_id`, `guest_team_id`, `skill_level`, `match_time`, `status`)
VALUES
    -- Open match
    (1, 1, 1, NULL, 'AVERAGE', DATE_ADD(NOW(), INTERVAL 2 DAY), 'OPEN'),
    -- Matched match
    (2, 1, 1, 2, 'AVERAGE', DATE_ADD(NOW(), INTERVAL 3 DAY), 'MATCHED');

-- =========================
-- 10. LEAGUES
-- =========================
INSERT INTO `leagues` (`id`, `name`, `format`, `number_of_teams`, `prize`, `status`, `manager_id`, `created_at`)
VALUES
    (1, 'Giải Ngoại Hạng Yên Hòa 2026', 'ROUND_ROBIN', 4, 'Cúp vô địch + 10,000,000 VND', 'OPENING', 1, NOW()),
    (2, 'Champions League Yên Hòa 2026', 'KNOCKOUT', 8, 'Cúp vô địch + 20,000,000 VND', 'OPENING', 1, NOW());
