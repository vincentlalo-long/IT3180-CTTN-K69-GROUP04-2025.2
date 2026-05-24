# AI Context Rules: Frontend Architecture

## 1. Kiến trúc & Đường dẫn
- Áp dụng cấu trúc **Feature-Sliced Design Lite**.
- **Quy tắc tuyệt đối:** Viết logic nghiệp vụ, UI phức tạp tại `src/features/[tên-feature]/`.
- Các file ở `src/pages/` chỉ nhận nhiệm vụ import các component hoàn chỉnh từ `features/` và trả về kết hợp với react-router, TUYỆT ĐỐI KHÔNG tự viết UI logic ở đây.
- Các UI Components dùng chung đặt hoàn toàn ở `src/shared/components/`.
- **Absolute Path Alias:** BẮT BUỘC dùng `@/` (trỏ đến `frontend/src/`) cho các file import nằm ngoài phạm vi local directory.

## 2. Quản lý Trạng thái (State Management)
- **Công cụ Core:** BẮT BUỘC sử dụng **React Context API** (`createContext`) cùng **Local State** (`useState`). Dự án KHÔNG dùng Redux hay Zustand.
- **Global State:** Chỉ dùng thông qua Context API (VD: `AuthContext` lưu thông tin User, Token).
- **Phân tách Data Logic:** Toàn bộ quá trình gọi API và xử lý dữ liệu phải được wrap trong các Custom Hook (VD: `useProfile()`) và tách riêng đặt trong `src/features/[feature]/hooks/`.

## 3. Giao tiếp API (Network)
- **Cấu hình Axios Core:** File tại `src/shared/api/apiClient.ts`.
- **Handling Token/401:** 
  - Token đã được tự động gắn vào Header `Authorization: Bearer <token>` thông qua Interceptor từ `tokenStorage.ts`. KHÔNG thủ công truyền token ở các hàm gọi API.
  - Khi có lỗi 401 Unauthorized API, Client tự xóa token và redirect `/login`.
- **Quy ước API Call:** 
  - Mọi Endpoints phải đặt riêng biệt vào folder `api/` thuộc về từng Feature cụ thể (Ví dụ: `src/features/account/api/account.api.ts`).
  - Hàm gọi API viết dạng `async/await`, trả về original response data từ axios.

## 4. Quy ước Code (Coding Conventions)
- **Naming Conventions:**
  - Components/Pages/Layouts: Viết dạng `PascalCase` (VD: `MatchmakingPage.tsx`).
  - Hooks: Dùng `camelCase` đi kèm chữ `use` (VD: `useBookingForm.ts`).
  - Types/Interfaces: Hậu tố đuôi định dạng `.types.ts`. KHÔNG dùng tiền tố `I` cho Interface.
- **Form & Validation:** 
  - BẮT BUỘC sử dụng **`react-hook-form`** + Validator là **`zod`** (`@hookform/resolvers/zod`).
  - Cấu trúc Validation schemas bằng Zod để chặt trong thư mục `src/features/[feature]/schemas/`.
- **Styling:** 
  - BẮT BUỘC tuân thủ **Tailwind CSS v4** hoàn toàn, apply dán trực tiếp qua `className`.
  - Icon: Dùng gói `lucide-react`.
  - Nghiêm cấm tạo file CSS riêng ở từng component (không có Module CSS), chỉ sử dụng cấu hình Tailwind gốc tại `index.css`.
