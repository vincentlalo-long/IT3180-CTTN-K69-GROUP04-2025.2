# Bản đồ thư mục Backend (Skeleton)

```text
backend/
├── docs/                        # Tài liệu dự án. TUYỆT ĐỐI KHÔNG chứa code.
├── src/main/java/.../backend/   # Source code chính của ứng dụng Spring Boot.
│   ├── auth/                    # Module xử lý Đăng nhập, Đăng ký và cấp phát JWT.
│   ├── booking/                 # Module xử lý nghiệp vụ đặt sân và thời gian.
│   ├── config/                  # Cấu hình chung cho framework (Security, Cors, Jackson...).
│   ├── exception/               # Xử lý lỗi tập trung toàn cục bằng @RestControllerAdvice.
│   ├── user/                    # Module quản lý thông tin User độc lập.
│   └── venue/                   # Module quản lý đối tượng Sân Bãi, chi nhánh.
├── src/main/resources/          # Tài nguyên tĩnh và cấu hình.
│   ├── application.yaml         # File cấu hình biến môi trường chính của Spring Boot.
│   ├── schema.sql               # Script DDL khởi tạo rỗng cấu trúc các bảng Database.
│   └── seed.sql                 # Script DML chèn dữ liệu mẫu phục vụ lúc boot hệ thống.
├── compose.yaml                 # Cấu hình Docker Compose để bật MySQL cục bộ.
└── pom.xml                      # Cấu hình Maven (Dependencies, Compiler, Plugins).
```