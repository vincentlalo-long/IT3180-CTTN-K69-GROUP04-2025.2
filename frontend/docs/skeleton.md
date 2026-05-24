# Bản đồ thư mục Frontend (Skeleton)

```text
frontend/
├── docs/                        # Tài liệu dự án. TUYỆT ĐỐI KHÔNG chứa code.
├── public/                      # Static assets không cần bundler xử lý.
├── src/
│   ├── assets/                  # Ảnh, icon (cần xử lý qua Vite).
│   ├── data/                    # Mock data tĩnh dùng tạm thời.
│   ├── features/                # Chứa TẤT CẢ logic/nghiệp vụ (chia theo Feature-Sliced Design).
│   │   ├── account/             # Nghiệp vụ: Cập nhật hồ sơ, bảo mật cá nhân.
│   │   ├── auth/                # Nghiệp vụ: Đăng nhập, Đăng ký, Quản lý Session.
│   │   ├── booking/             # Nghiệp vụ: Đặt lịch sân bóng của Player.
│   │   ├── matchmaking/         # Nghiệp vụ: Tìm cáp kèo, đối tác thi đấu.
│   │   ├── statistics/          # Nghiệp vụ: Thống kê dữ liệu cho Admin.
│   │   ├── team/                # Nghiệp vụ: Quản lý đội hình, thành viên nhóm.
│   │   └── venue/               # Nghiệp vụ: Quản lý cấu hình sân bãi, lịch kinh doanh (Admin).
│   ├── layouts/                 # Layout bọc ngoài (Navbar, Sidebar). KHÔNG chứa logic nghiệp vụ.
│   ├── pages/                   # Nơi map Route. Chỉ import component từ features/, KHÔNG tự viết logic.
│   ├── shared/                  # Code dùng chung (UI basic, configs, helpers toàn cục).
│   │   ├── api/                 # Cấu hình network cơ sở (Axios client...).
│   │   ├── components/          # UI components cơ bản (Button, Input...).
│   │   ├── types/               # Type TS chung toàn dự án.
│   │   └── utils/               # Helper functions.
│   ├── App.tsx                  # Gốc ứng dụng (Providers, Router definition).
│   ├── index.css                # File CSS core (chứa setup Tailwind).
│   └── main.tsx                 # Entry-point (mount React DOM).
├── package.json                 # Quản lý thư viện.
├── tailwind.config.js           # Cấu hình override Tailwind.
└── vite.config.ts               # Cấu hình Vite & Path aliases.
```
