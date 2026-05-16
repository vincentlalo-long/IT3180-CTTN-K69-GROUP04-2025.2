CREATE TABLE IF NOT EXISTS `users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE,
    `password` VARCHAR(255),
    `role` VARCHAR(255),
    `created_at` DATETIME,
    `team_id` INT,
    `phone_number` VARCHAR(20),
    `avatar_url` VARCHAR(255),
    PRIMARY KEY (`id`)
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

CREATE TABLE IF NOT EXISTS `time_slots` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `pitch_id` INT NOT NULL,
    `slot_number` INT NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `is_active` BIT(1) NOT NULL DEFAULT b'1',
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_time_slots_pitch_id`
        FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`) ON DELETE CASCADE,
    CONSTRAINT `uk_time_slots_pitch_slot`
        UNIQUE (`pitch_id`, `slot_number`)
);

CREATE TABLE IF NOT EXISTS `price_rules` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `pitch_id` INT,
    `slot_number` INT NOT NULL,
    `is_weekend` BIT(1) NOT NULL,
    `price` DECIMAL(38,2) NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_price_rules_pitch_id`
        FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`),
    CONSTRAINT `uk_price_rules_pitch_slot_weekend`
        UNIQUE (`pitch_id`, `slot_number`, `is_weekend`)
);

CREATE TABLE IF NOT EXISTS `services` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `pitch_id` INT,
    `name` VARCHAR(255),
    `price` DECIMAL(38,2),
    `unit` VARCHAR(255),
    PRIMARY KEY (`id`),
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
    `created_at` DATETIME,
    `time_slot_id` INT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_bookings_player_id`
        FOREIGN KEY (`player_id`) REFERENCES `users` (`id`),
    CONSTRAINT `fk_bookings_pitch_id`
        FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`),
    CONSTRAINT `fk_bookings_time_slot_id`
        FOREIGN KEY (`time_slot_id`) REFERENCES `time_slots` (`id`),
    CONSTRAINT `uk_bookings_date_slot`
        UNIQUE (`booking_date`, `time_slot_id`)
);

CREATE TABLE IF NOT EXISTS `pitch_reviews` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `pitch_id` INT NOT NULL,
    `player_id` INT NOT NULL,
    `rating` INT NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_pitch_reviews_pitch_id`
        FOREIGN KEY (`pitch_id`) REFERENCES `pitches` (`id`),
    CONSTRAINT `fk_pitch_reviews_player_id`
        FOREIGN KEY (`player_id`) REFERENCES `users` (`id`)
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

