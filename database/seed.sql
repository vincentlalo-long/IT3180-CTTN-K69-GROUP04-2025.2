USE football_booking;

-- 1. Insert Users (Managers and Players)
INSERT INTO
    `users` (
        `id`,
        `username`,
        `email`,
        `password`,
        `role`,
        `created_at`
    )
VALUES
    (
        1,
        'manager_hanoi',
        'manager1@gmail.com',
        'password123',
        'manager',
        NOW ()
    ),
    (
        2,
        'manager_saigon',
        'manager2@gmail.com',
        'password123',
        'manager',
        NOW ()
    ),
    (
        3,
        'player_dung',
        'dung.player@gmail.com',
        'password123',
        'player',
        NOW ()
    ),
    (
        4,
        'player_nam',
        'nam.player@gmail.com',
        'password123',
        'player',
        NOW ()
    ),
    (
        5,
        'player_tu',
        'tu.player@gmail.com',
        'password123',
        'player',
        NOW ()
    );

-- 2. Insert Teams
INSERT INTO
    `teams` (`id`, `captain_id`, `name`, `logo`)
VALUES
    (1, 3, 'Dragons FC', 'logo_dragon.png'),
    (2, 4, 'Tigers United', 'logo_tiger.png');

-- Cập nhật team_id cho người dùng sau khi đã có team
UPDATE `users`
SET
    `team_id` = 1
WHERE
    `id` = 3;

UPDATE `users`
SET
    `team_id` = 2
WHERE
    `id` = 4;

UPDATE `users`
SET
    `team_id` = 1
WHERE
    `id` = 5;

-- 3. Insert Pitches
INSERT INTO
    `pitches` (
        `id`,
        `manager_id`,
        `name`,
        `address`,
        `pitch_type`,
        `surface_type`,
        `base_price`,
        `image_url`
    )
VALUES
    (
        1,
        1,
        'Sân bóng Bách Khoa',
        'Số 1 Đại Cồ Việt, Hà Nội',
        '7 người',
        'Cỏ nhân tạo',
        300000,
        'bk_pitch.jpg'
    ),
    (
        2,
        1,
        'Sân bóng Miền Đông',
        'Quận 9, TP.HCM',
        '5 người',
        'Cỏ nhân tạo',
        200000,
        'miendong_pitch.jpg'
    );

-- 4. Insert Services
INSERT INTO
    `services` (`id`, `name`, `price`, `unit`)
VALUES
    (1, 'Nước khoáng Lavie', 10000, 'chai'),
    (2, 'Thuê áo Bib', 20000, 'bộ'),
    (3, 'Trọng tài', 150000, 'trận');

-- 5. Insert Bookings
INSERT INTO
    `bookings` (
        `id`,
        `player_id`,
        `pitch_id`,
        `booking_date`,
        `start_time`,
        `end_time`,
        `status`,
        `booking_type`,
        `total_price`,
        `created_at`
    )
VALUES
    (
        1,
        3,
        1,
        '2026-04-10',
        '18:00:00',
        '19:30:00',
        'approved',
        'one-time',
        450000,
        NOW ()
    ),
    (
        2,
        4,
        2,
        '2026-04-11',
        '19:00:00',
        '20:00:00',
        'pending',
        'one-time',
        200000,
        NOW ()
    );

-- 6. Insert Booking Services
INSERT INTO
    `booking_services` (
        `booking_id`,
        `service_id`,
        `quantity`,
        `subtotal`
    )
VALUES
    (1, 1, 10, 100000), -- 10 chai nước cho booking 1
    (1, 2, 7, 140000);

-- 7 bộ bib cho booking 1
-- 7. Insert Matchmaking Posts (Tìm đối)
INSERT INTO
    `matchmaking_posts` (
        `id`,
        `team_id`,
        `match_time`,
        `area`,
        `skill_level`,
        `status`
    )
VALUES
    (
        1,
        1,
        '2026-04-12 17:00:00',
        'Hai Bà Trưng, Hà Nội',
        'Trung bình',
        'open'
    );

-- 8. Insert Tournaments
INSERT INTO
    `tournaments` (
        `id`,
        `organizer_id`,
        `pitch_id`,
        `name`,
        `description`,
        `start_date`,
        `end_date`,
        `format`,
        `status`
    )
VALUES
    (
        1,
        1,
        1,
        'BK Open Cup 2026',
        'Giải bóng đá chào mừng kỷ niệm thành lập trường',
        '2026-05-01',
        '2026-05-20',
        'loại trực tiếp',
        'upcoming'
    );

-- 9. Insert Tournament Teams
INSERT INTO
    `tournament_teams` (
        `tournament_id`,
        `team_id`,
        `enrolled_at`,
        `status`
    )
VALUES
    (1, 1, NOW (), 'approved'),
    (1, 2, NOW (), 'approved');

-- 10. Insert Matches
INSERT INTO
    `matches` (
        `id`,
        `tournament_id`,
        `home_team_id`,
        `away_team_id`,
        `pitch_id`,
        `match_time`,
        `home_score`,
        `away_score`,
        `status`
    )
VALUES
    (
        1,
        1,
        1,
        2,
        1,
        '2026-05-05 08:00:00',
        0,
        0,
        'scheduled'
    );

-- 11. Insert Sponsors
INSERT INTO
    `sponsors` (
        `id`,
        `name`,
        `logo_url`,
        `website_url`,
        `description`
    )
VALUES
    (
        1,
        'Nước tăng lực Sting',
        'sting_logo.png',
        'https://sting.com',
        'Tài trợ đồ uống chính thức'
    );

-- 12. Insert Tournament Sponsors
INSERT INTO
    `tournament_sponsors` (
        `tournament_id`,
        `sponsor_id`,
        `sponsor_level`,
        `contribution_amount`
    )
VALUES
    (1, 1, 'Vàng', 5000000);

-- 13. Insert Price Rules (Khung giờ vàng giá cao)
INSERT INTO
    `price_rules` (
        `id`,
        `pitch_id`,
        `day_of_week`,
        `start_time`,
        `end_time`,
        `price`
    )
VALUES
    (1, 1, 'Monday', '17:00:00', '21:00:00', 500000),
    (2, 1, 'Sunday', '07:00:00', '22:00:00', 600000);

-- 14. Insert Reviews
INSERT INTO
    `reviews` (
        `id`,
        `player_id`,
        `pitch_id`,
        `rating`,
        `comment`,
        `created_at`
    )
VALUES
    (1, 3, 1, 5, 'Sân rất đẹp, đèn sáng!', NOW ());