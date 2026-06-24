SET NAMES 'utf8mb4';

SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- CLEAR DATA (EXCEPT USERS TO PROTECT TOKENS)
-- ==========================================
DELETE FROM `league_standings`;
DELETE FROM `league_registrations`;
DELETE FROM `league_announcement_comments`;
DELETE FROM `league_announcements`;
DELETE FROM `leagues`;
DELETE FROM `activity_logs`;
DELETE FROM `booking_payments`;
DELETE FROM `booking_services`;
DELETE FROM `pitch_reviews`;
DELETE FROM `bookings`;
DELETE FROM `time_slots`;
DELETE FROM `services`;
DELETE FROM `price_rules`;
DELETE FROM `pitches`;
DELETE FROM `match_requests`;
DELETE FROM `matches`;
DELETE FROM `venues`;
DELETE FROM `team_members`;
DELETE FROM `teams`;
DELETE FROM `users`;

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
ALTER TABLE `leagues` AUTO_INCREMENT = 1;
ALTER TABLE `league_registrations` AUTO_INCREMENT = 1;
ALTER TABLE `league_standings` AUTO_INCREMENT = 1;
ALTER TABLE `users` AUTO_INCREMENT = 1;

-- ==========================================
-- 1. USERS (30 Players + 5 Admins, all password '123456')
-- ==========================================
INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`, `phone_number`, `avatar_url`, `membership_points`, `wallet_balance`)
VALUES
    -- 30 Players (Mật khẩu '123456' -> Hashed)
    (1, 'Hoàng Thế Anh', 'theanh.hoang@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234501', NULL, 80, 500000.00),
    (2, 'Vũ Minh Ngọc', 'minhngoc.vu@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234502', NULL, 120, 800000.00),
    (3, 'Đỗ Anh Duy', 'anhduy.do@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234503', NULL, 65, 350000.00),
    (4, 'Phan Tuyết Mai', 'tuyetmai.phan@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234504', NULL, 40, 200000.00),
    (5, 'Bùi Minh Quân', 'minhquan.bui@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234505', NULL, 95, 750000.00),
    (6, 'Nguyễn Văn Hùng', 'vanhung.nguyen@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234506', NULL, 50, 300000.00),
    (7, 'Lê Thị Mai', 'thimai.le@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234507', NULL, 30, 150000.00),
    (8, 'Trần Hoàng Nam', 'hoangnam.tran@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234508', NULL, 20, 100000.00),
    (9, 'Phạm Quang Huy', 'quanghuy.pham@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234509', NULL, 10, 50000.00),
    (10, 'Nguyễn Thanh Tùng', 'thanhtung.nguyen@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234510', NULL, 0, 0.00),
    (11, 'Hoàng Minh Đức', 'minhduc.hoang@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234511', NULL, 0, 0.00),
    (12, 'Vũ Thị Thảo', 'thithao.vu@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234512', NULL, 0, 0.00),
    (13, 'Trần Quốc Anh', 'quocanh.tran@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234513', NULL, 0, 0.00),
    (14, 'Lê Quang Liêm', 'quangliem.le@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234514', NULL, 0, 0.00),
    (15, 'Phạm Thanh Hà', 'thanhha.pham@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234515', NULL, 0, 0.00),
    (16, 'Nguyễn Hải Đăng', 'haidang.nguyen@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234516', NULL, 0, 0.00),
    (17, 'Trần Thị Lan', 'thilan.tran@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234517', NULL, 0, 0.00),
    (18, 'Lê Hoàng Long', 'hoanglong.le@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234518', NULL, 0, 0.00),
    (19, 'Phạm Minh Tuấn', 'minhtuan.pham@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234519', NULL, 0, 0.00),
    (20, 'Nguyễn Thị Kiều', 'thikieu.nguyen@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234520', NULL, 0, 0.00),
    (21, 'Vũ Xuân Sáng', 'xuansang.vu@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234521', NULL, 0, 0.00),
    (22, 'Trần Khánh Ly', 'khanhly.tran@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234522', NULL, 0, 0.00),
    (23, 'Lê Ngọc Sơn', 'ngocson.le@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234523', NULL, 0, 0.00),
    (24, 'Phạm Đăng Khoa', 'dangkhoa.pham@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234524', NULL, 0, 0.00),
    (25, 'Nguyễn Văn An', 'vanan.nguyen@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234525', NULL, 0, 0.00),
    (26, 'Trần Ngọc Bảo', 'ngocbao.tran@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234526', NULL, 0, 0.00),
    (27, 'Lê Quốc Việt', 'quocviet.le@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234527', NULL, 0, 0.00),
    (28, 'Phạm Thị Hương', 'thihuong.pham@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234528', NULL, 0, 0.00),
    (29, 'Nguyễn Anh Khoa', 'anhkhoa.nguyen@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234529', NULL, 0, 0.00),
    (30, 'Trần Quang Hải', 'quanghai.tran@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'PLAYER', NOW(), '0981234530', NULL, 0, 0.00),
    
    -- 5 Admins (Mật khẩu '123456' -> Hashed)
    (31, 'Nguyễn Hùng Cường', 'cuong.admin@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'ADMIN', NOW(), '0901234561', NULL, 0, 12000000.00),
    (32, 'Lê Thị Mai Lan', 'lan.admin@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'ADMIN', NOW(), '0901234562', NULL, 0, 5000000.00),
    (33, 'Phạm Quốc Dũng', 'dung.admin@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'ADMIN', NOW(), '0901234563', NULL, 0, 3000000.00),
    (34, 'Nguyễn Thanh Hoa', 'hoa.admin@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'ADMIN', NOW(), '0901234564', NULL, 0, 4000000.00),
    (35, 'Trần Trung Thanh', 'thanh.admin@football.vn', '$2a$10$iiU2RfZ5ZNmxiAOQjVBXQuuYaSGVxaKvhKwvFsTtDakd2.eeIzyn.', 'ADMIN', NOW(), '0901234565', NULL, 0, 2500000.00)
ON DUPLICATE KEY UPDATE `password` = VALUES(`password`);

-- ==========================================
-- 2. VENUES (4 Venues)
-- ==========================================
INSERT INTO `venues` (`id`, `name`, `address`, `description`, `image_url`, `manager_id`, `open_time`, `close_time`, `latitude`, `longitude`)
VALUES
    (1, 'Cụm sân Bóng Đá Yên Hòa', '123 Nguyễn Chí Thanh, Cầu Giấy, Hà Nội', 'Cụm sân phục vụ cho phong trào và giải đấu bán chuyên', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018', 31, '06:30:00', '23:00:00', 21.0227, 105.8019),
    (2, 'Cụm sân Bóng Đá Dịch Vọng', '45 Trần Thái Tông, Cầu Giấy, Hà Nội', 'Sân cỏ nhân tạo chất lượng cao, có bãi đỗ xe rộng rãi', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2', 31, '06:00:00', '22:00:00', 21.0294, 105.7906),
    (3, 'Cụm sân Bóng Đá Thanh Xuân', '10 Khuất Duy Tiến, Thanh Xuân, Hà Nội', 'Sân cỏ tiêu chuẩn FIFA, chất lượng cao, phục vụ khu vực Thanh Xuân', 'https://images.unsplash.com/photo-1459865264687-595d652de67e', 33, '06:00:00', '23:00:00', 20.9982, 105.8001),
    (4, 'Cụm sân Bóng Đá Tây Hồ', '68 Võ Chí Công, Tây Hồ, Hà Nội', 'Sân bóng ven hồ thoáng mát, dịch vụ đầy đủ, bãi đỗ xe ô tô miễn phí', 'https://images.unsplash.com/photo-1517649763962-0c623066013b', 31, '05:30:00', '23:30:00', 21.0718, 105.8015);

-- ==========================================
-- 3. PITCHES (10 fields)
-- ==========================================
INSERT INTO `pitches` (`id`, `name`, `pitch_type`, `is_active`, `base_price`, `venue_id`)
VALUES
    (1, 'Sân 1 - Yên Hòa', 'SAN_5', 1, 150000.00, 1),
    (2, 'Sân 2 - Yên Hòa', 'SAN_5', 1, 150000.00, 1),
    (3, 'Sân 3 - Yên Hòa', 'SAN_7', 1, 250000.00, 1),
    (4, 'Sân 1 - Dịch Vọng', 'SAN_7', 1, 260000.00, 2),
    (5, 'Sân 2 - Dịch Vọng', 'SAN_11', 1, 550000.00, 2),
    (6, 'Sân 1 - Thanh Xuân', 'SAN_5', 1, 180000.00, 3),
    (7, 'Sân 2 - Thanh Xuân', 'SAN_7', 1, 280000.00, 3),
    (8, 'Sân 3 - Thanh Xuân', 'SAN_7', 1, 280000.00, 3),
    (9, 'Sân 1 - Tây Hồ', 'SAN_7', 1, 300000.00, 4),
    (10, 'Sân 2 - Tây Hồ', 'SAN_11', 1, 600000.00, 4);

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
    (5, 9, 0, 1.00), (5, 9, 1, 1.20),
    -- Pitch 6
    (6, 8, 0, 1.00), (6, 8, 1, 1.25),
    (6, 9, 0, 1.10), (6, 9, 1, 1.30),
    -- Pitch 7
    (7, 8, 0, 1.00), (7, 8, 1, 1.20),
    (7, 9, 0, 1.10), (7, 9, 1, 1.25),
    -- Pitch 9
    (9, 8, 0, 1.00), (9, 8, 1, 1.20),
    (9, 9, 0, 1.10), (9, 9, 1, 1.30);

-- ==========================================
-- 6. SERVICES (Exposed per venue)
-- ==========================================
INSERT INTO `services` (`id`, `venue_id`, `pitch_id`, `name`, `description`, `price`, `unit`, `status`)
VALUES
    -- Venue 1
    (1, 1, NULL, 'Nước khoáng', 'Nước uống đóng chai Lavie', 10000.00, 'chai', 'ACTIVE'),
    (2, 1, NULL, 'Thuê áo bib', 'Áo bib phân đội', 25000.00, 'bộ', 'ACTIVE'),
    (3, 1, NULL, 'Bóng thi đấu', 'Bóng tiêu chuẩn sân 5/7/11', 150000.00, 'quả', 'ACTIVE'),
    -- Venue 2
    (4, 2, NULL, 'Nước ngọt', 'Coca-cola / Sting', 15000.00, 'lon', 'ACTIVE'),
    (5, 2, NULL, 'Thuê giày đá bóng', 'Giày bata Thượng Đình', 30000.00, 'đôi', 'ACTIVE'),
    -- Venue 3
    (6, 3, NULL, 'Nước khoáng Aquafina', 'Nước uống đóng chai Aquafina', 10000.00, 'chai', 'ACTIVE'),
    (7, 3, NULL, 'Thuê áo bib', 'Áo bib phân đội cao cấp', 20000.00, 'bộ', 'ACTIVE'),
    -- Venue 4
    (8, 4, NULL, 'Nước điện giải', 'Pocari Sweat', 20000.00, 'chai', 'ACTIVE');

-- ==========================================
-- 7. TEAMS & TEAM MEMBERS
-- ==========================================
INSERT INTO `teams` (`id`, `name`, `captain_id`, `description`, `reputation_score`, `status`, `banned_until`, `created_at`, `skill_level`)
VALUES
    (1, 'FC Mixi', 2, 'Đội bóng phong trào khu vực Cầu Giấy', 100, 'APPROVED', NULL, NOW(), 'AVERAGE'),
    (2, 'FC Refund', 3, 'Giao lưu vui vẻ, không quạu', 95, 'APPROVED', NULL, NOW(), 'BELOW_AVERAGE'),
    (3, 'FC Banned', 4, 'Đội bóng bị cấm thi đấu tạm thời', 80, 'BANNED', DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), 'WEAK'),
    (4, 'FC Thanh Xuân', 5, 'Đội bóng năng động quận Thanh Xuân', 100, 'APPROVED', NULL, NOW(), 'GOOD'),
    (5, 'FC Tây Hồ', 25, 'Hào sảng, đá đẹp, không đặt nặng thắng thua', 98, 'APPROVED', NULL, NOW(), 'AVERAGE'),
    (6, 'FC Cầu Giấy', 7, 'CLB bóng đá trẻ quận Cầu Giấy', 100, 'APPROVED', NULL, NOW(), 'GOOD');

INSERT INTO `team_members` (`team_id`, `user_email`, `status`)
VALUES
    -- Team 1 (FC Mixi - 7 members)
    (1, 'minhngoc.vu@football.vn', 'ACTIVE'),
    (1, 'theanh.hoang@football.vn', 'ACTIVE'),
    (1, 'vanhung.nguyen@football.vn', 'ACTIVE'),
    (1, 'hoangnam.tran@football.vn', 'ACTIVE'),
    (1, 'quanghuy.pham@football.vn', 'ACTIVE'),
    (1, 'thanhtung.nguyen@football.vn', 'ACTIVE'),
    (1, 'minhduc.hoang@football.vn', 'ACTIVE'),
    
    -- Team 2 (FC Refund - 7 members)
    (2, 'anhduy.do@football.vn', 'ACTIVE'),
    (2, 'tuyetmai.phan@football.vn', 'ACTIVE'),
    (2, 'thithao.vu@football.vn', 'ACTIVE'),
    (2, 'quocanh.tran@football.vn', 'ACTIVE'),
    (2, 'quangliem.le@football.vn', 'ACTIVE'),
    (2, 'thanhha.pham@football.vn', 'ACTIVE'),
    (2, 'haidang.nguyen@football.vn', 'ACTIVE'),
    
    -- Team 3 (FC Banned - 3 members)
    (3, 'tuyetmai.phan@football.vn', 'ACTIVE'),
    (3, 'thithao.vu@football.vn', 'ACTIVE'),
    (3, 'quocanh.tran@football.vn', 'ACTIVE'),

    -- Team 4 (FC Thanh Xuân - 7 members)
    (4, 'minhquan.bui@football.vn', 'ACTIVE'),
    (4, 'thimai.le@football.vn', 'ACTIVE'),
    (4, 'thilan.tran@football.vn', 'ACTIVE'),
    (4, 'hoanglong.le@football.vn', 'ACTIVE'),
    (4, 'minhtuan.pham@football.vn', 'ACTIVE'),
    (4, 'thikieu.nguyen@football.vn', 'ACTIVE'),
    (4, 'xuansang.vu@football.vn', 'ACTIVE'),
    
    -- Team 5 (FC Tây Hồ - 9 members)
    (5, 'vanan.nguyen@football.vn', 'ACTIVE'),
    (5, 'khanhly.tran@football.vn', 'ACTIVE'),
    (5, 'ngocson.le@football.vn', 'ACTIVE'),
    (5, 'dangkhoa.pham@football.vn', 'ACTIVE'),
    (5, 'ngocbao.tran@football.vn', 'ACTIVE'),
    (5, 'quocviet.le@football.vn', 'ACTIVE'),
    (5, 'thihuong.pham@football.vn', 'ACTIVE'),
    (5, 'anhkhoa.nguyen@football.vn', 'ACTIVE'),
    (5, 'quanghai.tran@football.vn', 'ACTIVE'),

    -- Team 6 (FC Cầu Giấy - 2 members)
    (6, 'thimai.le@football.vn', 'ACTIVE'),
    (6, 'quanghai.tran@football.vn', 'ACTIVE');

-- Update users team_id mapping (safely map all team members to their corresponding team_id)
UPDATE `users` SET `team_id` = 1 WHERE `id` IN (2, 1, 6, 8, 9, 10, 11);
UPDATE `users` SET `team_id` = 2 WHERE `id` IN (3, 4, 12, 13, 14, 15, 16);
UPDATE `users` SET `team_id` = 4 WHERE `id` IN (5, 7, 17, 18, 19, 20, 21);
UPDATE `users` SET `team_id` = 5 WHERE `id` IN (25, 22, 23, 24, 26, 27, 28, 29, 30);

-- ==========================================
-- 8. BOOKINGS
-- ==========================================
INSERT INTO `bookings` (`id`, `player_id`, `pitch_id`, `booking_date`, `start_time`, `end_time`, `status`, `booking_type`, `total_price`, `created_at`, `time_slot_id`)
VALUES
    -- 2026-05-25 (Yên Hòa)
    (1, 2, 1, '2026-05-25', '17:00:00', '18:30:00', 'COMPLETED', 'SINGLE', 150000.00, '2026-05-24 10:00:00', 8),
    (2, 3, 1, '2026-05-25', '18:30:00', '20:00:00', 'COMPLETED', 'SINGLE', 180000.00, '2026-05-24 11:00:00', 9),
    (3, 2, 2, '2026-05-25', '17:00:00', '18:30:00', 'CANCELLED', 'SINGLE', 150000.00, '2026-05-24 12:00:00', 8),
    -- 2026-05-26
    (4, 2, 1, '2026-05-26', '20:00:00', '21:30:00', 'COMPLETED', 'SINGLE', 180000.00, '2026-05-25 09:00:00', 10),
    (5, 3, 3, '2026-05-26', '17:00:00', '18:30:00', 'CONFIRMED', 'SINGLE', 250000.00, '2026-05-25 14:00:00', 8),
    -- 2026-05-27 (Dịch Vọng)
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
    -- 2026-06-02
    (22, 2, 1, '2026-06-02', '17:00:00', '18:30:00', 'COMPLETED', 'SINGLE', 150000.00, '2026-06-01 10:00:00', 8),
    (23, 3, 2, '2026-06-02', '18:30:00', '20:00:00', 'COMPLETED', 'SINGLE', 150000.00, '2026-06-01 11:00:00', 9),
    (24, 2, 3, '2026-06-02', '17:00:00', '18:30:00', 'CONFIRMED', 'SINGLE', 250000.00, '2026-06-01 12:00:00', 8),
    (25, 3, 4, '2026-06-02', '18:30:00', '20:00:00', 'CONFIRMED', 'SINGLE', 260000.00, '2026-06-01 13:00:00', 9),
    (26, 2, 5, '2026-06-02', '17:00:00', '18:30:00', 'CANCELLED', 'SINGLE', 550000.00, '2026-06-01 14:00:00', 8),
    
    -- June & July 2026 Data
    -- Thanh Xuân bookings (using player 5 - buiminhquan)
    (27, 5, 6, '2026-06-10', '17:00:00', '18:30:00', 'COMPLETED', 'SINGLE', 180000.00, '2026-06-09 08:30:00', 8),
    (28, 5, 7, '2026-06-10', '18:30:00', '20:00:00', 'COMPLETED', 'SINGLE', 308000.00, '2026-06-09 09:00:00', 9),
    (29, 6, 8, '2026-06-12', '20:00:00', '21:30:00', 'CONFIRMED', 'SINGLE', 280000.00, '2026-06-11 14:20:00', 10),
    (30, 7, 7, '2026-06-13', '17:00:00', '18:30:00', 'CONFIRMED', 'SINGLE', 336000.00, '2026-06-11 15:00:00', 8),
    -- Tây Hồ bookings (using player 8 - tranhoangnam)
    (31, 8, 9, '2026-06-14', '18:30:00', '20:00:00', 'COMPLETED', 'SINGLE', 390000.00, '2026-06-12 10:15:00', 9),
    (32, 9, 10, '2026-06-15', '17:00:00', '18:30:00', 'CONFIRMED', 'SINGLE', 600000.00, '2026-06-14 09:30:00', 8),
    (33, 5, 9, '2026-06-16', '18:30:00', '20:00:00', 'CONFIRMED', 'SINGLE', 330000.00, '2026-06-15 16:45:00', 9),
    -- Future bookings
    (34, 2, 6, '2026-06-20', '17:00:00', '18:30:00', 'CONFIRMED', 'SINGLE', 180000.00, '2026-06-15 10:00:00', 8),
    (35, 3, 7, '2026-06-20', '18:30:00', '20:00:00', 'CONFIRMED', 'SINGLE', 336000.00, '2026-06-15 11:00:00', 9),
    (36, 6, 9, '2026-06-21', '17:00:00', '18:30:00', 'CONFIRMED', 'SINGLE', 360000.00, '2026-06-16 08:30:00', 8);

-- ==========================================
-- 9. BOOKING SERVICES & PAYMENTS
-- ==========================================
INSERT INTO `booking_services` (`id`, `booking_id`, `service_id`, `quantity`, `price_at_booking`)
VALUES
    (1, 1, 1, 5, 10000.00),
    (2, 1, 2, 2, 25000.00),
    (3, 2, 1, 3, 10000.00),
    (4, 27, 6, 10, 10000.00),
    (5, 28, 7, 1, 20000.00),
    (6, 31, 8, 4, 20000.00);

INSERT INTO `booking_payments` (`id`, `booking_id`, `payer_id`, `paid_amount`, `payment_method`, `payment_status`, `paid_at`, `created_at`)
VALUES
    (1, 1, 2, 200000.00, 'WALLET', 'PAID', '2026-05-24 10:05:00', '2026-05-24 10:00:00'),
    (2, 2, 3, 210000.00, 'WALLET', 'PAID', '2026-05-24 11:10:00', '2026-05-24 11:00:00'),
    (3, 4, 2, 180000.00, 'VNPAY', 'PAID', '2026-05-25 09:15:00', '2026-05-25 09:00:00'),
    (4, 27, 5, 280000.00, 'WALLET', 'PAID', '2026-06-09 08:35:00', '2026-06-09 08:30:00'),
    (5, 28, 5, 328000.00, 'WALLET', 'PAID', '2026-06-09 09:05:00', '2026-06-09 09:00:00'),
    (6, 31, 8, 470000.00, 'VNPAY', 'PAID', '2026-06-12 10:20:00', '2026-06-12 10:15:00');

-- ==========================================
-- 10. PITCH REVIEWS
-- ==========================================
INSERT INTO `pitch_reviews` (`id`, `pitch_id`, `player_id`, `booking_id`, `rating`, `content`, `created_at`)
VALUES
    (1, 1, 2, 1, 5, 'Sân đẹp, mặt cỏ rất tốt, dịch vụ nước uống chu đáo.', '2026-05-25 21:00:00'),
    (2, 1, 3, 2, 4, 'Ánh sáng đèn LED ban đêm ổn, nhân viên thân thiện.', '2026-05-25 22:00:00'),
    (3, 6, 5, 27, 5, 'Sân mới ở Thanh Xuân đá rất êm chân, giá cả phải chăng.', '2026-06-10 21:30:00'),
    (4, 9, 8, 31, 4, 'Sân Tây Hồ mát mẻ, đỗ xe thoải mái, tuy nhiên giá hơi cao vào cuối tuần.', '2026-06-14 22:00:00');

-- ==========================================
-- 11. LEAGUES & REGISTRATIONS (4 real teams registered for League 1)
-- ==========================================
INSERT INTO `leagues` (`id`, `name`, `description`, `format`, `number_of_teams`, `prize`, `status`, `manager_id`, `start_date`, `end_date`, `venue_id`, `time_slot_id`, `created_at`)
VALUES
    (1, 'Giải Ngoại Hạng Yên Hòa 2026', 'Giải đấu phong trào quy tụ 4 đội mạnh nhất khu vực Yên Hòa', 'ROUND_ROBIN', 4, 'Cúp vô địch + 10,000,000 VND + Cờ lưu niệm', 'OPENING', 31, '2026-06-01', '2026-06-30', 1, 8, NOW()),
    (2, 'Champions League Yên Hòa 2026', 'Giải đấu loại trực tiếp tranh cúp vô địch Yên Hòa mở rộng', 'KNOCKOUT', 8, 'Cúp vô địch + 20,000,000 VND', 'OPENING', 31, '2026-07-01', '2026-07-15', 1, 9, NOW()),
    (3, 'Thanh Xuân Super Cup 2026', 'Giải đấu thường niên tranh cúp Thanh Xuân mở rộng', 'ROUND_ROBIN', 4, 'Cúp + 15,000,000 VND', 'OPENING', 33, '2026-06-15', '2026-07-15', 3, 9, NOW());

INSERT INTO `league_registrations` (`id`, `league_id`, `team_id`, `captain_id`, `status`, `created_at`)
VALUES
    -- League 1 (4 real teams: FC Mixi, FC Refund, FC Thanh Xuân, FC Tây Hồ)
    (1, 1, 1, 2, 'APPROVED', NOW()), -- FC Mixi (captain vuminhngoc - user 2)
    (2, 1, 2, 3, 'APPROVED', NOW()), -- FC Refund (captain doanhduy - user 3)
    (3, 1, 4, 5, 'APPROVED', NOW()), -- FC Thanh Xuân (captain buiminhquan - user 5)
    (4, 1, 5, 25, 'APPROVED', NOW()), -- FC Tây Hồ (captain nguyenvanan - user 25)
    
    -- League 3 (FC Thanh Xuân, FC Cầu Giấy)
    (5, 3, 4, 5, 'APPROVED', NOW()),
    (6, 3, 6, 7, 'APPROVED', NOW());

-- ==========================================
-- 12. LEAGUE STANDINGS
-- ==========================================
INSERT INTO `league_standings` (`id`, `league_id`, `team_id`, `played`, `won`, `drawn`, `lost`, `goals_for`, `goals_against`, `goal_difference`, `points`)
VALUES
    -- League 1 Standings (4 real teams)
    (1, 1, 1, 3, 2, 1, 0, 8, 4, 4, 7),   -- FC Mixi
    (2, 1, 4, 3, 1, 2, 0, 6, 5, 1, 5),   -- FC Thanh Xuân
    (3, 1, 2, 3, 1, 0, 2, 4, 6, -2, 3),  -- FC Refund
    (4, 1, 5, 3, 0, 1, 2, 3, 6, -3, 1),  -- FC Tây Hồ
    
    -- League 3 Standings
    (5, 3, 4, 1, 1, 0, 0, 3, 1, 2, 3),   -- FC Thanh Xuân
    (6, 3, 6, 1, 0, 0, 1, 1, 3, -2, 0);  -- FC Cầu Giấy

-- ==========================================
-- 13. MATCHES & MATCH REQUESTS
-- ==========================================
INSERT INTO `matches` (`id`, `league_id`, `venue_id`, `host_team_id`, `guest_team_id`, `skill_level`, `match_time`, `status`, `description`, `pitch_type`, `time_slot_id`, `home_score`, `away_score`, `round_number`)
VALUES
    -- League 1 Matches (Round 1)
    (1, 1, 1, 1, 2, 'AVERAGE', '2026-06-05 17:00:00', 'COMPLETED', 'Trận đấu khai mạc giải Ngoại hạng Yên Hòa', 5, 8, 3, 1, 1),
    (2, 1, 1, 4, 5, 'GOOD', '2026-06-05 17:00:00', 'COMPLETED', 'Trận đấu vòng 1 sân số 2', 7, 8, 2, 2, 1),
    -- League 1 Matches (Round 2)
    (3, 1, 1, 1, 4, 'GOOD', '2026-06-12 17:00:00', 'COMPLETED', 'Đại chiến giành ngôi đầu bảng', 5, 8, 2, 2, 2),
    (4, 1, 1, 2, 5, 'AVERAGE', '2026-06-12 17:00:00', 'COMPLETED', 'Cả hai đội tìm kiếm điểm số đầu tiên', 7, 8, 2, 1, 2),
    -- League 1 Matches (Round 3)
    (5, 1, 1, 1, 5, 'AVERAGE', '2026-06-19 17:00:00', 'MATCHED', 'Trận đấu vòng 3 quyết định', 5, 8, NULL, NULL, 3),
    (6, 1, 1, 4, 2, 'GOOD', '2026-06-19 17:00:00', 'MATCHED', 'Trận đấu vòng 3 đầy kịch tính', 7, 8, NULL, NULL, 3),
    -- Casual/Friendly Matches
    (7, NULL, 3, 4, NULL, 'GOOD', DATE_ADD(NOW(), INTERVAL 2 DAY), 'OPEN', 'FC Thanh Xuân cần tìm đối tác đá sân 7, độ tuổi 20-30.', 7, 9, NULL, NULL, NULL),
    (8, NULL, 4, 5, 6, 'AVERAGE', DATE_ADD(NOW(), INTERVAL 3 DAY), 'MATCHED', 'Giao lưu bóng đá sân 11 Tây Hồ cuối tuần', 11, 8, NULL, NULL, NULL);

INSERT INTO `match_requests` (`id`, `match_id`, `guest_team_id`, `created_by_user_id`, `status`, `created_at`)
VALUES
    (1, 7, 6, 7, 'PENDING', NOW()), -- FC Cầu Giấy challenges FC Thanh Xuân
    (2, 7, 1, 2, 'PENDING', NOW()); -- FC Mixi challenges FC Thanh Xuân

SET FOREIGN_KEY_CHECKS = 1;
