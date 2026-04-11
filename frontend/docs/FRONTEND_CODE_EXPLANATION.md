# FRONTEND CODE EXPLANATION (CẬP NHẬT)

## 1. Tổng quan

Frontend hiện tại được tổ chức thành 2 luồng chính:

- Luồng User (public): Landing + đăng nhập/đăng ký.
- Luồng Admin (private dashboard): quản trị đa khu sân theo mô hình Multi-Facility.

Stack chính:

- React + TypeScript
- React Router
- Tailwind CSS v4

---

## 2. Kiến trúc Routing

File trung tâm: `src/App.tsx`.

### 2.1 Luồng User

- `/` -> `LandingPage`
- `/login` -> `LoginPage`
- `/register` -> `RegisterPage`

Mục tiêu:

- Người dùng vào trang chủ trước, sau đó điều hướng sang đăng nhập/đăng ký.

### 2.2 Luồng Admin (Nested Routing)

- `/admin` -> `AdminLayout`
  - index -> `AdminDashboardPage`
  - `/admin/bookings` -> `AdminFeatureLandingPage`
  - `/admin/schedule` -> `FieldSchedulePage`
  - `/admin/settings` -> `SettingsPage`
  - `/admin/calendar` -> redirect về `/admin/schedule`

Ý nghĩa kiến trúc:

- `AdminLayout` là shell dùng chung (Sidebar + Topbar + Outlet).
- Mọi trang admin con kế thừa layout và state toàn cục của admin.

---

## 3. Quản lý State Toàn cục (FacilityContext)

File: `src/contexts/FacilityContext.tsx`.

`FacilityContext` cung cấp:

- `selectedFacilityId`
- `selectedFacility`
- `setSelectedFacilityId`
- danh sách `facilities`

Provider được bọc trong `AdminLayout`, nên toàn bộ trang `/admin/*` dùng chung trạng thái chọn khu sân.

### Luồng hoạt động

1. Người dùng chọn khu sân ở dropdown trong `Topbar`.
2. `selectedFacilityId` đổi trong context.
3. Các trang admin đang subscribe context tự render lại dữ liệu theo khu sân mới.

---

## 4. Dữ liệu giả lập (Mock Data Layer)

File: `src/data/mockAdminData.ts`.

Các thực thể chính:

- `Facility`: thông tin khu sân.
- `Field`: sân thuộc khu sân nào (`facilityId`).
- `Booking`: đơn đặt/đang đá/bảo trì theo `fieldId`, `facilityId`, `startTime`.
- `Order`: dữ liệu doanh thu theo khu sân.
- `ADMIN_TIME_SLOTS` + `TIME_SLOT_PRICING`: khung giờ và giá động.

Lợi ích:

- Tách dữ liệu khỏi UI.
- Dễ chuyển sang API thật sau này.

---

## 5. Kiến trúc UI lõi

### 5.1 Dashboard (`AdminDashboardPage`)

Trang này lọc dữ liệu theo `selectedFacilityId`:

- Doanh thu lấy từ `mockOrders`.
- Đơn đặt và tỷ lệ trống sân lấy từ `mockBookings` + `fields` + `ADMIN_TIME_SLOTS`.
- Khi chọn “Tất cả khu sân” -> số liệu cộng dồn.
- Khi chọn 1 khu sân cụ thể -> chỉ số của khu đó.

### 5.2 Lịch Sân (`FieldSchedulePage`) - Time-Block Grid

Đây là core UI của hệ thống vận hành:

- Trục X: `ADMIN_TIME_SLOTS` (11 khung giờ).
- Trục Y: danh sách `fields` sau khi lọc theo khu sân đã chọn.
- Header hiển thị giá theo `TIME_SLOT_PRICING`.
- Ô lịch render theo trạng thái:
  - `available`
  - `booked`
  - `in-progress`
  - `maintenance`
- Click ô `booked`/`in-progress` hiển thị thông tin chi tiết.

Kỹ thuật UI:

- Bảng có `overflow-x-auto overflow-y-auto`.
- Cột đầu sticky (`left-0`) để giữ tên sân khi cuộn ngang.
- Header sticky theo trục dọc để luôn thấy khung giờ.

### 5.3 Settings (`SettingsPage`)

Trang cài đặt theo tab, tab mặc định là “Thông tin cơ sở”:

- Form nhập tên khu, địa chỉ, hotline.
- Chọn giờ mở/đóng.
- Nút lưu có loading state.

Các tab khác giữ placeholder để mở rộng dần:

- Quản lý sân bóng
- Cấu hình thanh toán
- Quản lý nhân viên

---

## 6. Tái sử dụng Component

`src/components/ui`:

- `TextInput` dùng lại cho auth + settings.
- `Button` dùng cho các CTA/form submit.
- `SocialIconButton` dùng cho auth.

`src/components/admin`:

- `Sidebar`, `Topbar`, `StatCard` là lõi tái sử dụng của dashboard admin.

---

## 7. Ghi chú Tech Debt hiện tại

- Có một số route admin (`users`) vẫn đang dùng tạm `AdminDashboardPage` (placeholder logic).
- Một số trang vẫn dùng mock data, chưa kết nối API backend.
- Một số assets cũ có thể không còn dùng (cần xác nhận trước khi xóa).
