# Tài liệu Kiến trúc Frontend

## 1. Tổng quan Kiến trúc (Overview)

Dự án Frontend được xây dựng theo mô hình SPA với React và Vite, ưu tiên tốc độ phát triển, vòng phản hồi nhanh và khả năng mở rộng theo module.

- React đảm nhiệm tầng UI (component-driven architecture), chia nhỏ giao diện thành các thành phần tái sử dụng.
- Vite cung cấp môi trường build/dev nhẹ, nhanh và tối ưu cho TypeScript.
- Tailwind CSS phụ trách hệ thống style utility-first, giúp chuẩn hóa giao diện và giảm chi phí bảo trì CSS truyền thống.
- Zustand đảm nhiệm State Management theo hướng tối giản, thay thế Context ở các luồng state chia sẻ rộng, giảm Props Drilling và giảm độ phức tạp khi mở rộng.

Trong kiến trúc hiện tại, luồng dữ liệu được tổ chức theo nguyên tắc Single Source of Truth: state dùng chung được tập trung trong store, còn UI component chỉ subscribe phần dữ liệu cần thiết để render.

## 2. Sơ đồ Thư mục (Directory Structure)

```text
src/
|-- components/
|   |-- admin/
|   `-- ui/
|-- pages/
|   |-- admin/
|   |-- auth/
|   `-- user/
|-- layouts/
|-- store/
|-- data/
|-- types/
|-- assets/
|-- App.tsx
`-- main.tsx
```

Vai trò từng thư mục cốt lõi:

- `components/`: Chứa các khối UI tái sử dụng. `ui/` là primitive component (Button, Input...), `admin/` là component nghiệp vụ cho trang quản trị.
- `pages/`: Chứa màn hình theo route và use-case cụ thể. Đây là nơi kết hợp component, selector từ store và dữ liệu nghiệp vụ để tạo thành màn hình hoàn chỉnh.
- `layouts/`: Định nghĩa khung giao diện dùng chung (sidebar, topbar, vùng nội dung) cho từng nhóm màn hình.
- `store/`: Trạm phát sóng trung tâm của ứng dụng, nơi đặt global state và action (Zustand). Đây là nguồn dữ liệu duy nhất cho state dùng chung.
- `data/`: Chứa mock data và hằng số nghiệp vụ phục vụ phát triển hoặc mô phỏng dữ liệu backend.
- `types/`: Bản thiết kế dữ liệu (interfaces/types), nơi chuẩn hóa model để các module dùng thống nhất.

## 3. Luồng Dữ liệu (Data Flow với Zustand)

Sau khi migrate từ Context sang Zustand, hệ thống quản lý state tập trung theo mô hình store-driven:

1. Store khởi tạo dữ liệu ban đầu trong `useFacilityStore`, bao gồm:

- `facilities`
- `selectedFacilityId`
- `selectedFacility`
- `setSelectedFacilityId(...)`

2. Component không nhận state qua chuỗi props dài và không cần Provider bao quanh cây component cho facility selection.

3. Mỗi màn hình hoặc component lấy đúng phần state cần dùng bằng selector:

- Ví dụ trang quản trị chỉ subscribe `selectedFacilityId`.
- Topbar subscribe cả `selectedFacilityId` và action `setSelectedFacilityId`.

4. Khi action được gọi, store cập nhật state một lần tại trung tâm.

5. Các component đang subscribe các phần state bị thay đổi sẽ tự động re-render, đảm bảo đồng bộ UI theo lựa chọn mới.

### Kịch bản User Flow mẫu

Khi quản trị viên đổi Sân bóng trên Topbar:

1. Người dùng chọn facility mới trong dropdown ở Topbar.
2. Topbar gọi action `setSelectedFacilityId` trong `useFacilityStore`.
3. Store cập nhật `selectedFacilityId` và suy ra lại `selectedFacility` tương ứng.
4. Các trang admin (ví dụ Settings, Orders, Field Schedule, Dashboard) đang subscribe state này nhận dữ liệu mới.
5. Logic lọc dữ liệu theo facility được chạy lại tại từng page.
6. UI re-render theo facility đang chọn, không cần truyền dữ liệu vòng qua nhiều cấp component.

Kết quả: luồng dữ liệu ngắn hơn, dễ truy vết hơn, giảm coupling và thuận lợi mở rộng business logic state trong tương lai.

## 4. Quy chuẩn Code (Coding Standards)

### 4.1 Quy tắc export cho React Fast Refresh

File chứa React Component phải tuân thủ nguyên tắc chỉ export thành phần phù hợp với Fast Refresh (component/hook), không export lẫn types/interfaces/constants không liên quan.

Mục tiêu:

- Tránh vi phạm lint rule `react-refresh/only-export-components`.
- Giữ hành vi HMR ổn định, tránh reload không mong muốn.

### 4.2 Quy chuẩn đặt Type

Mọi định nghĩa dữ liệu dùng chung (interface/type) phải đặt trong `src/types/` để đảm bảo:

- Single Source of Truth cho schema dữ liệu.
- Tránh circular dependency giữa module dữ liệu và module UI/store.
- Dễ bảo trì khi refactor model nghiệp vụ.

### 4.3 Quy chuẩn tổ chức State Management

- Store chỉ giữ state dùng chung và action cập nhật state.
- Page/Component chỉ lấy phần state cần dùng qua selector để giảm re-render thừa.
- Không tái tạo state toàn cục bằng Context khi đã có store tương đương.

### 4.4 Quy chuẩn phụ thuộc module

- `types/` không phụ thuộc ngược lại `data/`, `pages/`, `components/`.
- `data/` được phép import type từ `types/`.
- `store/` ưu tiên import type từ `types/` và dữ liệu nguồn từ `data/`.
- `pages/` và `components/` chỉ consume state thông qua store hoặc props, không chứa định nghĩa model dùng chung.
