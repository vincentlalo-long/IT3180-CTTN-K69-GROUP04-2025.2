SET
    NAMES 'utf8mb4';

-- =========================
-- CLEAR DATA
-- =========================
DELETE FROM `booking_payments`;

DELETE FROM `pitch_reviews`;

DELETE FROM `bookings`;

DELETE FROM `services`;

DELETE FROM `price_rules`;

DELETE FROM `pitches`;

DELETE FROM `venues`;

DELETE FROM `users`;

-- reset auto increment
ALTER TABLE `users` AUTO_INCREMENT = 1;

ALTER TABLE `venues` AUTO_INCREMENT = 1;

ALTER TABLE `pitches` AUTO_INCREMENT = 1;

ALTER TABLE `price_rules` AUTO_INCREMENT = 1;

ALTER TABLE `services` AUTO_INCREMENT = 1;

ALTER TABLE `bookings` AUTO_INCREMENT = 1;

ALTER TABLE `pitch_reviews` AUTO_INCREMENT = 1;

ALTER TABLE `booking_payments` AUTO_INCREMENT = 1;

-- =========================
-- 1. USERS (3 users: 1 ADMIN, 2 PLAYERS)
-- =========================
-- Password: "password123" -> BCrypt encoded
INSERT INTO
    `users` (
        `id`,
        `username`,
        `email`,
        `password`,
        `role`,
        `created_at`,
        `phone_number`,
        `avatar_url`
    )
VALUES
    (
        1,
        'owner_hoang',
        'hoang.owner@football.vn',
        '$2a$10$Y9O5YLMY2VVLvxPUQXUuZOBV0ZQTvEVjYQhxFQDXvJ5y3YJ1dQrGG',
        'ADMIN',
        NOW (),
        '0909123456',
        NULL
    ),
    (
        2,
        'player_minh',
        'minh.player@football.vn',
        '$2a$10$slYQmyNdGzin7olVN3p5be3DlH.PKZbv5H8KnzzigXXbVxzy6QMOG',
        'PLAYER',
        NOW (),
        '0912345678',
        NULL
    ),
    (
        3,
        'player_tuan',
        'tuan.player@football.vn',
        '$2a$10$slYQmyNdGzin7olVN3p5be3DlH.PKZbv5H8KnzzigXXbVxzy6QMOG',
        'PLAYER',
        NOW (),
        '0987654321',
        NULL
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
-- 4. PRICE RULES (10 time slots linked to pitches)
-- =========================
-- Slot numbers represent time periods: 1-10 (e.g., 6:30-7:30, 7:30-8:30, etc.)
-- is_weekend: 0 = weekday, 1 = weekend
INSERT INTO
    `price_rules` (`pitch_id`, `slot_number`, `is_weekend`, `price`)
VALUES
    -- Pitch 1 (5-a-side) - 2 time slots
    (1, 1, 0, 150000), -- Morning slot (weekday)
    (1, 2, 1, 180000), -- Morning slot (weekend)
    -- Pitch 2 (5-a-side) - 2 time slots
    (2, 3, 0, 150000), -- Afternoon slot (weekday)
    (2, 4, 1, 180000), -- Afternoon slot (weekend)
    -- Pitch 3 (7-a-side) - 2 time slots
    (3, 5, 0, 250000), -- Evening slot (weekday)
    (3, 6, 1, 300000), -- Evening slot (weekend)
    -- Pitch 4 (7-a-side) - 2 time slots
    (4, 7, 0, 250000), -- Night slot (weekday)
    (4, 8, 1, 300000), -- Night slot (weekend)
    -- Pitch 5 (11-a-side) - 2 time slots
    (5, 9, 0, 500000), -- Standard weekday
    (5, 10, 1, 600000);

-- =========================
-- 5. SERVICES
-- =========================
INSERT INTO
    `services` (`pitch_id`, `name`, `price`, `unit`)
VALUES
    (1, 'Nuoc khoang', 10000.00, 'chai'),
    (2, 'Thue ao bib', 25000.00, 'bo'),
    (3, 'Bong thi dau', 150000.00, 'qua');

-- =========================
-- 6. BOOKINGS (DISABLED FOR TEST COMPATIBILITY)
-- =========================
-- Commented out due to potential H2 compatibility issues with date functions
-- INSERT INTO
--     `bookings` (
--         `player_id`,
--         `pitch_id`,
--         `booking_date`,
--         `start_time`,
--         `end_time`,
--         `status`,
--         `booking_type`,
--         `total_price`,
--         `created_at`
--     )
-- VALUES
--     (
--         2,
--         1,
--         CURRENT_DATE,
--         '17:00:00',
--         '18:30:00',
--         'RESERVED',
--         'MATCH',
--         500000.00,
--         NOW ()
--     ),
--     (
--         2,
--         2,
--         DATE_ADD (CURRENT_DATE, INTERVAL 1 DAY),
--         '18:30:00',
--         '20:00:00',
--         'RESERVED',
--         'TOUR',
--         900000.00,
--         NOW ()
--     ),
--     (
--         2,
--         3,
--         DATE_ADD (CURRENT_DATE, INTERVAL -1 DAY),
--         '14:00:00',
--         '15:30:00',
--         'PLAYING',
--         'MATCH',
--         900000.00,
--         NOW ()
--     );
-- =========================
-- 7. REVIEWS (DISABLED FOR TEST COMPATIBILITY)
-- =========================
-- Commented out due to potential foreign key constraints
-- INSERT INTO
--     `pitch_reviews` (
--         `pitch_id`,
--         `player_id`,
--         `rating`,
--         `content`,
--         `created_at`
--     )
-- VALUES
--     (1, 2, 5, 'San dep, chat luong tot', NOW ()),
--     (2, 2, 4, 'Gia hop ly, anh sang on', NOW ());