# AI Context Rules: Database Schema

## Tổng quan các Bảng (Tables) và Mối quan hệ
Toàn bộ database dùng tên bảng số nhiều (`users`, `venues`), column dùng `snake_case`. Các schema tuân thủ quy tắc khóa chính (PK) là `id INT AUTO_INCREMENT`.

### 1. `users` (Người dùng)
- **Cấu trúc:** `id` (PK), `username`, `email` (UNIQUE), `password`, `role`, `team_id`, `phone_number`, `avatar_url`, `created_at`.

### 2. `venues` (Khu sân bóng/Chi nhánh)
- **Cấu trúc:** `id` (PK), `name`, `address`, `description`, `image_url`, `open_time`, `close_time`.
- **FK:** `manager_id` -> `users(id)`.

### 3. `pitches` (Sân bóng cụ thể)
- **Cấu trúc:** `id` (PK), `name`, `pitch_type`, `is_active` (BIT/Boolean), `base_price` (DECIMAL).
- **FK:** `venue_id` -> `venues(id)`.

### 4. `time_slots` (Khung giờ sân bóng)
- **Cấu trúc:** `id` (PK), `slot_number`, `start_time` (TIME), `end_time` (TIME), `is_active` (BIT).
- **FK:** `pitch_id` -> `pitches(id)` (ON DELETE CASCADE).
- **Constraints:** UNIQUE (`pitch_id`, `slot_number`).

### 5. `price_rules` (Quy tắc giá theo khung giờ)
- **Cấu trúc:** `id` (PK), `slot_number`, `is_weekend` (BIT), `price` (DECIMAL).
- **FK:** `pitch_id` -> `pitches(id)`.
- **Constraints:** UNIQUE (`pitch_id`, `slot_number`, `is_weekend`).

### 6. `services` (Dịch vụ kèm theo)
- **Cấu trúc:** `id` (PK), `name`, `price`, `unit`.
- **FK:** `pitch_id` -> `pitches(id)`.

### 7. `bookings` (Luồng đặt sân)
- **Cấu trúc:** `id` (PK), `booking_date` (DATE), `start_time`, `end_time`, `status`, `booking_type`, `total_price`, `created_at`.
- **FK:** `player_id` -> `users(id)`, `pitch_id` -> `pitches(id)`, `time_slot_id` -> `time_slots(id)`.
- **Constraints:** UNIQUE (`booking_date`, `time_slot_id`).

### 8. `pitch_reviews` (Đánh giá sân bóng)
- **Cấu trúc:** `id` (PK), `rating`, `content`, `created_at`.
- **FK:** `pitch_id` -> `pitches(id)`, `player_id` -> `users(id)`.

### 9. `booking_payments` (Thanh toán đặt sân)
- **Cấu trúc:** `id` (PK), `paid_amount`, `payment_method`, `payment_status`, `paid_at`, `created_at`.
- **FK:** `booking_id` -> `bookings(id)`, `payer_id` -> `users(id)`.

## Dữ liệu Mẫu (Data Patterns)
Dựa theo Data Seed, hãy dùng đúng định dạng này khi map dữ liệu:
- **`role` in `users`:** Lưu dạng string VIẾT HOA (Ví dụ: `'ADMIN'`, `'PLAYER'`).
- **Mật khẩu:** Phải được encode Bcrypt (VD: `$2a$10$Y9...`).
- **Thời gian (Date/Time):** 
  - Function `NOW()` cho cột `created_at` (DATETIME).
  - Định dạng TIME chuẩn (giờ cột `open_time`, `close_time`, `start_time`).