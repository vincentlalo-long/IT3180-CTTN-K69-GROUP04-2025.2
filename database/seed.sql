SET NAMES 'utf8mb4';
-- 1. Seed Users (Admin, Owners, Players)
-- Passwords: 'password123' (đã mã hóa hoặc để text tùy cấu hình của ông)
INSERT INTO `users` (`username`, `email`, `password`, `role`, `created_at`, `phone_number`, `avatar_url`) VALUES
('admin_hust', 'admin@hust.edu.vn', 'password123', 'ADMIN', NOW(), '0912345678', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'),
('owner_hieu', 'hieu.owner@gmail.com', 'password123', 'OWNER', NOW(), '0988888888', 'https://api.dicebear.com/7.x/avataaars/svg?seed=hieu'),
('owner_long', 'long.owner@gmail.com', 'password123', 'OWNER', NOW(), '0977777777', 'https://api.dicebear.com/7.x/avataaars/svg?seed=long'),
('player_son', 'son.player@gmail.com', 'password123', 'PLAYER', NOW(), '0966666666', 'https://api.dicebear.com/7.x/avataaars/svg?seed=son'),
('player_linh', 'linh.player@gmail.com', 'password123', 'PLAYER', NOW(), '0955555555', 'https://api.dicebear.com/7.x/avataaars/svg?seed=linh');

-- 2. Seed Pitches (Các khu sân bóng)
-- Giả sử ID 2 và 3 là các Manager (OWNER)
INSERT INTO `pitches` (`manager_id`, `name`, `address`, `pitch_type`, `surface_type`, `base_price`, `image_url`, `status`) VALUES
(2, 'Sân bóng Bách Khoa', 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội', 'Sân 7 người', 'Cỏ nhân tạo', 500000.00, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018', 'ACTIVE'),
(2, 'Sân bóng Đền Lừ', 'Hoàng Mai, Hà Nội', 'Sân 5 người', 'Cỏ nhân tạo', 300000.00, 'https://images.unsplash.com/photo-1529900948638-21f49463c46a', 'ACTIVE'),
(3, 'Sân bóng Ninh Bình', 'TP. Ninh Bình', 'Sân 11 người', 'Cỏ tự nhiên', 1200000.00, 'https://images.unsplash.com/photo-1431324155629-1a6eda1eed15', 'ACTIVE');

-- 3. Seed Price Rules (Quy định giá theo khung giờ cao điểm)
INSERT INTO `price_rules` (`pitch_id`, `day_of_week`, `start_time`, `end_time`, `price`) VALUES
(1, 'MONDAY', '17:00:00', '22:00:00', 700000.00), -- Giờ cao điểm sân BK
(1, 'SUNDAY', '07:00:00', '23:00:00', 800000.00), -- Cuối tuần sân BK
(2, 'EVERYDAY', '18:00:00', '21:00:00', 450000.00);

-- 4. Seed Services (Dịch vụ đi kèm)
INSERT INTO `services` (`pitch_id`, `name`, `price`, `unit`) VALUES
(1, 'Nước khoáng Lavie', 10000.00, 'Chai'),
(1, 'Thuê áo bib', 20000.00, 'Bộ'),
(2, 'Nước ngọt Sting', 15000.00, 'Lon');

-- 5. Seed Bookings (Dữ liệu để Dashboard tính Doanh thu và Tỷ lệ trống)
-- Lưu ý: booking_date lấy quanh thời điểm hiện tại để dashboard có số liệu mới nhất
INSERT INTO `bookings` (`player_id`, `pitch_id`, `booking_date`, `start_time`, `end_time`, `status`, `booking_type`, `total_price`, `created_at`) VALUES
(4, 1, CURDATE(), '18:00:00', '19:30:00', 'CONFIRMED', 'MATCH', 750000.00, NOW()),
(5, 1, CURDATE(), '20:00:00', '21:30:00', 'CONFIRMED', 'FRIENDLY', 750000.00, NOW()),
(4, 2, CURDATE(), '17:00:00', '18:00:00', 'PENDING', 'PRACTICE', 300000.00, NOW()),
(5, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '19:00:00', '20:30:00', 'COMPLETED', 'MATCH', 750000.00, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '15:00:00', '17:00:00', 'COMPLETED', 'MATCH', 2400000.00, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- 6. Seed Reviews
INSERT INTO `pitch_reviews` (`pitch_id`, `player_id`, `rating`, `content`, `created_at`) VALUES
(1, 4, 5, 'Sân đẹp, đèn sáng, chủ sân nhiệt tình!', NOW()),
(1, 5, 4, 'Chất lượng cỏ tốt nhưng hơi xa chỗ gửi xe.', NOW());

INSERT INTO `bookings` (`player_id`, `pitch_id`, `booking_date`, `start_time`, `end_time`, `status`, `booking_type`, `total_price`, `created_at`) VALUES
(4, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', '19:30:00', 'CONFIRMED', 'MATCH', 450000.00, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(5, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:00:00', '21:30:00', 'COMPLETED', 'MATCH', 450000.00, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(4, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '17:00:00', '18:30:00', 'CONFIRMED', 'FRIENDLY', 700000.00, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(5, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:00:00', '20:30:00', 'PENDING', 'PRACTICE', 700000.00, DATE_SUB(NOW(), INTERVAL 3 HOUR));

INSERT INTO `booking_payments` (`booking_id`, `payer_id`, `paid_amount`, `payment_method`, `payment_status`, `paid_at`, `created_at`) VALUES
(1, 4, 750000.00, 'BANK_TRANSFER', 'PAID', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 5, 750000.00, 'BANK_TRANSFER', 'PAID', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 5, 750000.00, 'CASH', 'PAID', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 4, 2400000.00, 'BANK_TRANSFER', 'PAID', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(6, 4, 450000.00, 'BANK_TRANSFER', 'PAID', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(7, 5, 450000.00, 'CASH', 'PAID', DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(8, 4, 700000.00, 'BANK_TRANSFER', 'PAID', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(9, 5, 0.00, 'BANK_TRANSFER', 'PENDING', NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR));