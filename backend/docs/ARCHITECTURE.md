# AI Context Rules: Backend Architecture

## 1. Kiến trúc & Phân lớp
- Áp dụng cấu trúc **Feature-based Packaging** kết hợp **3-Layer Architecture** bên trong mỗi module (`controller` -> `service` -> `repository`).
- **Luồng dữ liệu chuẩn:** Request DTO gửi đến `Controller` -> Truyền xuống `Service` xử lý logic -> Gọi xuống DB thông qua `Repository` (Spring Data JPA) -> Chuyển Entity thành Response DTO trả ra.
- Dịch vụ mang tính đặc thù được chia nhỏ (ví dụ: `venue/service/admin/` và `venue/service/player/`).

## 2. Database & ORM
- **Database:** Sử dụng `MySQL`, thiết lập thông qua Docker Compose cục bộ, cấu hình tại `application.yaml`.
- **Schema Management:** Không dùng Hibernate auto-create, KHÔNG dùng Flyway/Liquibase. Chạy Script DDL thủ công tại `schema.sql` (thiết lập Spring Data JPA với `ddl-auto: none`).
- **ORM:** Khai thác **Spring Data JPA** & **Hibernate** để ánh xạ entity vào CSDL.
- **Data Mapping:** Bắt buộc Mapping thủ công giữa `Entity` và `DTO` ngay tại Tầng Controller hoặc Service. Tránh đổ trực tiếp Entity ra ngoài Network. KHÔNG dùng auto mappers (MapStruct hay ModelMapper).

## 3. Security & Chuẩn hóa API
- **Security:** 
  - Stateless auth dùng **JWT** (`io.jsonwebtoken`), xác thực token tại Request Filters theo tầng (Cấu hình ở nhánh `config/security/`).
  - Quản lý phân quyền dựa vào `role` gán trên bảng `users`.
- **Response Format:**
  - Dự án KHÔNG có custom class bọc toàn cục như `ApiResponse<T>`. Trả thẳng body qua type `ResponseEntity<T>` của Spring Boot (VD: `ResponseEntity<AuthResponse>`).
- **Exception Handling:**
  - File `GlobalExceptionHandler.java` kiểm soát toàn cục các exceptions, mapping thủ công ra lỗi định dạng Map chứa error data cho Client.
  - Sử dụng các exceptions chuyên biệt để set HTTP codes: `BusinessException` (400), `ResourceNotFoundException` (404), `ResourceConflictException` (409).

## 4. Quy ước Code (Coding Conventions)
- **Naming Conventions:**
  - Lớp DB (@Table, @Column): Bắt buộc dùng `snake_case`. Tên DB Table định dạng số nhiều (VD: `users`, `venues`, `time_slots`), tên Column số ít.
  - Class và Interfaces Java: `PascalCase`.
  - Parameters và Method: `camelCase`.
- **Validation:** 
  - Khai báo annotators `@Valid` tại Request body trên Controller + Các ràng buộc `@NotBlank`, `@Size` (`jakarta.validation.*`) đặt trên Model DTO.
- **Boilerplate/Injection:** 
  - BẮT BUỘC dùng **Lombok** (`@Getter`, `@Setter`, `@RequiredArgsConstructor`...). Field Injection đã bị cấm, chỉ Inject dependency qua Constructor.