

CREATE TABLE
    `users` (
        `id` integer PRIMARY KEY,
        `username` varchar(255) NOT NULL,
        `email` varchar(255) UNIQUE,
        `password` varchar(255),
        `role` varchar(255) COMMENT 'manager hoặc player',
        `created_at` timestamp,
        `team_id` integer
    );

CREATE TABLE
    `pitches` (
        `id` integer PRIMARY KEY,
        `manager_id` integer,
        `name` varchar(255),
        `address` text,
        `pitch_type` varchar(255) COMMENT '5, 7, 11 người',
        `surface_type` varchar(255) COMMENT 'Cỏ nhân tạo, tự nhiên',
        `base_price` decimal,
        `image_url` varchar(255)
    );

CREATE TABLE
    `bookings` (
        `id` integer PRIMARY KEY,
        `player_id` integer,
        `pitch_id` integer,
        `booking_date` date,
        `start_time` time,
        `end_time` time,
        `status` varchar(255) COMMENT 'pending, approved, rejected, canceled',
        `booking_type` varchar(255) COMMENT 'one-time, recurring',
        `total_price` decimal,
        `created_at` timestamp
    );

CREATE TABLE
    `services` (
        `id` integer PRIMARY KEY,
        `pitch_id` integer,
        `name` varchar(255) COMMENT 'Nước, áo bib, bóng, Trọng tài...',
        `price` decimal,
        `unit` varchar(255) COMMENT 'chai, bộ, quả...'
    );

CREATE TABLE
    `booking_services` (
        `booking_id` integer,
        `service_id` integer,
        `quantity` integer,
        `subtotal` decimal
    );

CREATE TABLE
    `teams` (
        `id` integer PRIMARY KEY,
        `captain_id` integer,
        `name` varchar(255),
        `logo` varchar(255)
    );

CREATE TABLE
    `matchmaking_posts` (
        `id` integer PRIMARY KEY,
        `team_id` integer,
        `match_time` timestamp,
        `area` varchar(255),
        `skill_level` varchar(255) COMMENT 'Yếu, Trung bình, Khá',
        `status` varchar(255) COMMENT 'open, matched'
    );

CREATE TABLE
    `tournaments` (
        `id` integer PRIMARY KEY,
        `organizer_id` integer,
        `pitch_id` integer,
        `name` varchar(255) NOT NULL,
        `description` text,
        `start_date` date,
        `end_date` date,
        `format` varchar(255) COMMENT 'vòng tròn, loại trực tiếp...',
        `status` varchar(255) COMMENT 'upcoming, ongoing, completed'
    );

CREATE TABLE
    `tournament_teams` (
        `tournament_id` integer,
        `team_id` integer,
        `enrolled_at` timestamp,
        `status` varchar(255) COMMENT 'pending, approved'
    );

CREATE TABLE
    `matches` (
        `id` integer PRIMARY KEY,
        `tournament_id` integer,
        `home_team_id` integer,
        `away_team_id` integer,
        `pitch_id` integer,
        `match_time` timestamp,
        `home_score` integer DEFAULT 0,
        `away_score` integer DEFAULT 0,
        `status` varchar(255) COMMENT 'scheduled, finished'
    );

CREATE TABLE
    `match_statistics` (
        `id` integer PRIMARY KEY,
        `match_id` integer,
        `player_id` integer,
        `team_id` integer,
        `goals` integer DEFAULT 0,
        `assists` integer DEFAULT 0
    );

CREATE TABLE
    `sponsors` (
        `id` integer PRIMARY KEY,
        `name` varchar(255) NOT NULL,
        `logo_url` varchar(255),
        `website_url` varchar(255),
        `description` text
    );

CREATE TABLE
    `tournament_sponsors` (
        `tournament_id` integer,
        `sponsor_id` integer,
        `sponsor_level` varchar(255) COMMENT 'Kim cương, Vàng, Bạc, Đồng',
        `contribution_amount` decimal COMMENT 'Số tiền hoặc giá trị vật chất tài trợ'
    );

CREATE TABLE
    `reviews` (
        `id` integer PRIMARY KEY,
        `player_id` integer,
        `pitch_id` integer,
        `rating` integer COMMENT '1-5 sao',
        `comment` text,
        `created_at` timestamp
    );

CREATE TABLE
    `price_rules` (
        `id` integer PRIMARY KEY,
        `pitch_id` integer,
        `day_of_week` varchar(255) COMMENT 'Monday, Sunday...',
        `start_time` time,
        `end_time` time,
        `price` decimal COMMENT 'Giá riêng cho khung giờ này'
    );

ALTER TABLE `users` ADD FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`);

ALTER TABLE `pitches` ADD FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`);

ALTER TABLE `bookings` ADD FOREIGN KEY (`player_id`) REFERENCES `users` (`id`);

ALTER TABLE `bookings` ADD FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`);

ALTER TABLE `services` ADD FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`);

ALTER TABLE `booking_services` ADD FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`);

ALTER TABLE `booking_services` ADD FOREIGN KEY (`service_id`) REFERENCES `services` (`id`);

ALTER TABLE `teams` ADD FOREIGN KEY (`captain_id`) REFERENCES `users` (`id`);

ALTER TABLE `matchmaking_posts` ADD FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`);

ALTER TABLE `tournaments` ADD FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`);

ALTER TABLE `tournaments` ADD FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`);

ALTER TABLE `tournament_teams` ADD FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`);

ALTER TABLE `tournament_teams` ADD FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`);

ALTER TABLE `matches` ADD FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`);

ALTER TABLE `matches` ADD FOREIGN KEY (`home_team_id`) REFERENCES `teams` (`id`);

ALTER TABLE `matches` ADD FOREIGN KEY (`away_team_id`) REFERENCES `teams` (`id`);

ALTER TABLE `matches` ADD FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`);

ALTER TABLE `match_statistics` ADD FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`);

ALTER TABLE `match_statistics` ADD FOREIGN KEY (`player_id`) REFERENCES `users` (`id`);

ALTER TABLE `match_statistics` ADD FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`);

ALTER TABLE `tournament_sponsors` ADD FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`);

ALTER TABLE `tournament_sponsors` ADD FOREIGN KEY (`sponsor_id`) REFERENCES `sponsors` (`id`);

ALTER TABLE `reviews` ADD FOREIGN KEY (`player_id`) REFERENCES `users` (`id`);

ALTER TABLE `reviews` ADD FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`);

ALTER TABLE `price_rules` ADD FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`);