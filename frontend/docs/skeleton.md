# TÀI LIỆU ĐẶC TẢ CẤU TRÚC TRANG (PAGE STRUCTURE)

**Hệ thống Quản lý và Đặt sân Bóng đá trực tuyến**

Hệ thống được thiết kế chia thành hai phân hệ (module) riêng biệt để phục vụ đúng nhu cầu của hai nhóm đối tượng: **Người chơi (End-User)** và **Chủ sân/Công ty (Admin/Owner)**.

---

## 1. Phân hệ Người chơi (User Module)

Giao diện (Frontend) dành cho khách hàng tìm kiếm, đặt sân và tham gia các hoạt động cộng đồng.

### 1.1. Luồng Xác thực (Authentication)

- **Trang Đăng nhập / Đăng ký:** Cung cấp form đăng nhập bằng tài khoản hoặc mạng xã hội.
- **Trang Quên mật khẩu:** Xử lý luồng cấp lại mật khẩu qua email/OTP.

### 1.2. Luồng Tìm kiếm và Đặt sân (Core Booking Flow)

- **Trang chủ (Landing Page):** \* Hiển thị banner chiến dịch, danh sách các sân bóng nổi bật, các cụm sân gần vị trí người dùng.
  - Tích hợp thanh tìm kiếm nhanh (theo tên sân, khu vực, ngày giờ).
- **Trang Danh sách Sân (Explore/Search Results):** \* Hiển thị kết quả tìm kiếm kèm bộ lọc chi tiết (loại sân 5/7/11 người, khoảng giá, khoảng cách).
  - Thiết kế dạng lưới (Grid/Card) hoặc hiển thị trên Bản đồ (Map View).
- **Trang Chi tiết Sân bóng (Field Detail):** \* Hiển thị thông tin tổng quan: Hình ảnh, mô tả, địa chỉ, các dịch vụ đi kèm (thuê áo bib, nước uống, bóng).
  - Giao diện chọn ca trống (Booking Calendar): Hiển thị trực quan các khung giờ còn trống/đã kín và bảng giá tương ứng theo từng khung giờ.
- **Trang Thanh toán & Xác nhận (Checkout):** \* Hiển thị tóm tắt đơn đặt sân (thời gian, cụm sân, tổng tiền).
  - Cung cấp thông tin thanh toán tiền cọc (thường là 20-30% giá trị ca sân) qua mã QR Code. Xử lý trạng thái "Giữ chỗ tạm thời" trong lúc chờ thanh toán.

### 1.3. Luồng Cá nhân và Cộng đồng

- **Trang Quản lý Hồ sơ (Profile & Dashboard):** \* Cập nhật thông tin cá nhân.
  - Quản lý lịch sử đặt sân (đơn chờ duyệt, đã xác nhận, đã hủy).
  - Theo dõi điểm uy tín (Credibility Score) để hạn chế tình trạng đặt ảo.
- **Trang Ghép kèo / Giao lưu (Matchmaking):** \* Bảng tin cộng đồng cho phép các đội đăng bài "tìm đối", hiển thị thông tin kèo (thời gian, sân, trình độ) và nút chức năng để "nhận kèo".

---

## 2. Phân hệ Chủ sân (Owner/Admin Module)

Giao diện quản trị (Dashboard) giúp công ty thiết lập và vận hành hệ thống.

### 2.1. Tổng quan hoạt động

- **Trang Bảng điều khiển (Admin Dashboard):** \* Hiển thị các chỉ số thống kê (Metrics): Doanh thu trong ngày/tuần, tỷ lệ lấp đầy sân, số lượng đơn đặt mới cần xử lý.
  - Biểu đồ trực quan và danh sách thao tác nhanh.

### 2.2. Quản lý Tài nguyên

- **Trang Quản lý Thông tin Cụm sân:** \* Thêm mới, chỉnh sửa thông tin, cập nhật hình ảnh cơ sở vật chất.
  - Quản lý danh sách các sân con (sân 1, sân 2...).
- **Trang Cấu hình Bảng giá:** \* Thiết lập giá linh hoạt theo từng khung giờ (giờ vàng, giờ hành chính) và theo loại sân.

### 2.3. Vận hành cốt lõi (Operations)

- **Trang Quản lý Lịch đặt (Booking Calendar/Schedule):** \* Hiển thị lịch timeline tổng thể của tất cả các sân con trong ngày/tuần.
  - Cung cấp tính năng **"Khóa sân nhanh" (Quick Block)** để chủ sân tự cập nhật các đơn khách gọi điện đặt trực tiếp (offline), tránh xung đột dữ liệu (race condition) với hệ thống online.
- **Trang Quản lý Đơn hàng (Order Management):** \* Danh sách các đơn đặt sân từ hệ thống web.
  - Chức năng xác nhận đã nhận cọc, duyệt đơn hoặc hủy đơn.

### 2.4. Quản lý Khách hàng và Mở rộng

- **Trang Quản lý Người dùng (User Management):** \* Kiểm soát danh sách tài khoản khách hàng, lịch sử giao dịch.
  - Xử lý đưa vào danh sách đen (Blacklist) các tài khoản vi phạm (ví dụ: boom sân quá 2 lần).
- **Trang Quản lý Giải đấu (Tournament Management):** \* Tạo giải đấu nội bộ, quản lý danh sách đội đăng ký.
  - Cập nhật lịch thi đấu, tỷ số và bảng xếp hạng.
