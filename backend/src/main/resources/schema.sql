DROP TABLE IF EXISTS `booking_services`;
DROP TABLE IF EXISTS `booking_payments`;
DROP TABLE IF EXISTS `pitch_reviews`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `services`;
DROP TABLE IF EXISTS `price_rules`;
DROP TABLE IF EXISTS `pitches`;
DROP TABLE IF EXISTS `match_requests`;
DROP TABLE IF EXISTS `matches`;
DROP TABLE IF EXISTS `league_registrations`;
DROP TABLE IF EXISTS `leagues`;
DROP TABLE IF EXISTS `venues`;
DROP TABLE IF EXISTS `team_members`;
DROP TABLE IF EXISTS `teams`;
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `time_slots`;

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE,
    `password` VARCHAR(255),
    `role` VARCHAR(255),
    `created_at` DATETIME,
    `team_id` BIGINT,
    `phone_number` VARCHAR(20),
    `avatar_url` VARCHAR(255),
    `membership_points` INT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(255) NOT NULL UNIQUE,
    `expiry_date` DATETIME NOT NULL,
    `user_id` INT NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_password_reset_tokens_user_id`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `leagues` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `format` VARCHAR(50) NOT NULL,
    `number_of_teams` INT NOT NULL,
    `prize` TEXT,
    `status` VARCHAR(50) NOT NULL,
    `manager_id` INT NOT NULL,
    `created_at` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_leagues_manager_id`
        FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`)
);

CREATE TABLE IF NOT EXISTS `venues` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `address` TEXT,
    `description` TEXT,
    `image_url` VARCHAR(255),
    `manager_id` INT NOT NULL,
    `open_time` TIME NOT NULL,
    `close_time` TIME NOT NULL,
    `latitude` DOUBLE,
    `longitude` DOUBLE,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_venues_manager_id`
        FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`)
);

CREATE TABLE IF NOT EXISTS `pitches` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255),
    `pitch_type` VARCHAR(255),
    `is_active` BIT(1) NOT NULL,
    `base_price` DECIMAL(38,2),
    `venue_id` INT NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_pitches_venue_id`
        FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`)
);

-- ============================================================
-- TIME_SLOTS: Master Data — chỉ 11 dòng duy nhất cho toàn hệ thống
-- Không có pitch_id. Mỗi dòng là 1 khung giờ 90 phút cố định.
-- ============================================================
CREATE TABLE IF NOT EXISTS `time_slots` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `slot_number` INT NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `is_active` BIT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    CONSTRAINT `uk_time_slots_slot_number`
        UNIQUE (`slot_number`)
);

CREATE TABLE IF NOT EXISTS `price_rules` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `pitch_id` INT,
    `slot_number` INT NOT NULL,
    `is_weekend` BIT(1) NOT NULL,
    `coefficient` DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_price_rules_pitch_id`
        FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`),
    CONSTRAINT `uk_price_rules_pitch_slot_weekend`
        UNIQUE (`pitch_id`, `slot_number`, `is_weekend`)
);

CREATE TABLE IF NOT EXISTS `services` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `venue_id` INT,
    `pitch_id` INT,
    `name` VARCHAR(255),
    `description` TEXT,
    `price` DECIMAL(38,2),
    `unit` VARCHAR(255),
    `status` VARCHAR(50) DEFAULT 'ACTIVE',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_services_venue_id`
        FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`),
    CONSTRAINT `fk_services_pitch_id`
        FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`)
);

CREATE TABLE IF NOT EXISTS `bookings` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `player_id` INT,
    `pitch_id` INT,
    `booking_date` DATE,
    `start_time` TIME,
    `end_time` TIME,
    `status` VARCHAR(255),
    `booking_type` VARCHAR(255),
    `total_price` DECIMAL(38,2),
    `pricing_mode` VARCHAR(50) DEFAULT 'AUTO',
    `created_at` DATETIME,
    `time_slot_id` INT NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_bookings_player_id`
        FOREIGN KEY (`player_id`) REFERENCES `users` (`id`),
    CONSTRAINT `fk_bookings_pitch_id`
        FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`),
    CONSTRAINT `fk_bookings_time_slot_id`
        FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`),
    CONSTRAINT `uk_bookings_date_pitch_slot`
        UNIQUE (`booking_date`, `pitch_id`, `time_slot_id`)
);

CREATE TABLE IF NOT EXISTS `pitch_reviews` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `pitch_id` INT NOT NULL,
    `player_id` INT NOT NULL,
    `booking_id` INT NOT NULL,
    `rating` INT NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_pitch_reviews_pitch_id`
        FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`),
    CONSTRAINT `fk_pitch_reviews_player_id`
        FOREIGN KEY (`player_id`) REFERENCES `users` (`id`),
    CONSTRAINT `fk_pitch_reviews_booking_id`
        FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
    CONSTRAINT `uk_pitch_reviews_booking_id`
        UNIQUE (`booking_id`)
);

CREATE TABLE IF NOT EXISTS `booking_services` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `booking_id` INT NOT NULL,
    `service_id` INT NOT NULL,
    `quantity` INT NOT NULL,
    `price_at_booking` DECIMAL(38,2) NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_booking_services_booking_id`
        FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_booking_services_service_id`
        FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
);

CREATE TABLE IF NOT EXISTS `booking_payments` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `booking_id` INT NOT NULL,
    `payer_id` INT NOT NULL,
    `paid_amount` DECIMAL(38,2) NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `payment_status` VARCHAR(50) NOT NULL,
    `paid_at` DATETIME,
    `created_at` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_booking_payments_booking_id`
        FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
    CONSTRAINT `fk_booking_payments_payer_id`
        FOREIGN KEY (`payer_id`) REFERENCES `users` (`id`)
);

CREATE TABLE IF NOT EXISTS `teams` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `captain_id` INT NOT NULL,
    `description` TEXT,
    `reputation_score` INT DEFAULT 100,
    `status` VARCHAR(50) NOT NULL,
    `banned_until` DATETIME DEFAULT NULL,
    `created_at` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_teams_captain_id`
        FOREIGN KEY (`captain_id`) REFERENCES `users` (`id`)
);

CREATE TABLE IF NOT EXISTS `team_members` (
    `team_id` BIGINT NOT NULL,
    `user_email` VARCHAR(255) NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`team_id`, `user_email`),
    CONSTRAINT `fk_team_members_team_id`
        FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`)
);

CREATE TABLE IF NOT EXISTS `matches` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `venue_id` INT NOT NULL,
    `host_team_id` BIGINT NOT NULL,
    `guest_team_id` BIGINT,
    `skill_level` VARCHAR(50) NOT NULL,
    `match_time` DATETIME NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `description` TEXT,
    `pitch_type` INT,
    `time_slot_id` INT,
    `home_score` INT,
    `away_score` INT,
    `round_number` INT,
    `next_match_id` INT,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_matches_venue_id`
        FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`),
    CONSTRAINT `fk_matches_host_team_id`
        FOREIGN KEY (`host_team_id`) REFERENCES `teams` (`id`),
    CONSTRAINT `fk_matches_guest_team_id`
        FOREIGN KEY (`guest_team_id`) REFERENCES `teams` (`id`),
    CONSTRAINT `fk_matches_time_slot`
        FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`)
);

CREATE TABLE IF NOT EXISTS `match_requests` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `match_id` INT NOT NULL,
    `guest_team_id` BIGINT NOT NULL,
    `created_by_user_id` INT NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `created_at` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_match_requests_match_id`
        FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_match_requests_guest_team_id`
        FOREIGN KEY (`guest_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_match_requests_created_by_user_id`
        FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `league_registrations` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `league_id` INT NOT NULL,
    `team_id` BIGINT NOT NULL,
    `captain_id` INT NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `created_at` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_league_registrations_league_id`
        FOREIGN KEY (`league_id`) REFERENCES `leagues` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_league_registrations_team_id`
        FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_league_registrations_captain_id`
        FOREIGN KEY (`captain_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `uk_league_registrations_league_team`
        UNIQUE (`league_id`, `team_id`)
);

CREATE TABLE IF NOT EXISTS `activity_logs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` INT,
    `user_name` VARCHAR(255) NOT NULL,
    `action_type` VARCHAR(255) NOT NULL,
    `target_type` VARCHAR(255) NOT NULL,
    `target_id` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `old_value` TEXT,
    `new_value` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
);
