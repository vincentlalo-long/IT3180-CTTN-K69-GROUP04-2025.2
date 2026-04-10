# Tài liệu giải thích code frontend

## Mục tiêu tài liệu

Tài liệu này mô tả từng file code và file cấu hình trong thư mục frontend:

- File dùng để làm gì.
- File hoạt động ra sao trong luồng chạy ứng dụng.

Lưu ý:

- Thư mục node_modules và dist không phải mã nguồn tự viết.
- Các file ảnh/icon là tài nguyên tĩnh, không chứa logic TypeScript/React.

---

## 1. Nhóm file cấu hình ở root frontend

### .gitignore

Mục đích:

- Loại trừ log, thư mục build, thư viện cài đặt và file tạm khỏi Git.

Cách hoạt động:

- Git đọc file này để không track các đường dẫn như node_modules, dist, \*.log.

### package.json

Mục đích:

- Khai báo metadata project, scripts và dependency.

Cách hoạt động:

- npm đọc file này để cài package và chạy lệnh:
  - dev: chạy Vite local.
  - build: compile TypeScript rồi build Vite.
  - lint: chạy ESLint.
  - preview: chạy server preview bản build.

### package-lock.json

Mục đích:

- Khóa chính xác version dependency đã cài.

Cách hoạt động:

- npm dùng lock file để tái tạo môi trường cài đặt nhất quán giữa các máy.

### index.html

Mục đích:

- HTML shell gốc cho ứng dụng SPA.

Cách hoạt động:

- Trình duyệt load file này, mount app vào div id root.
- Script module /src/main.tsx khởi chạy React app.

### vite.config.ts

Mục đích:

- Cấu hình Vite.

Cách hoạt động:

- defineConfig bật plugin React.
- Vite dùng file này khi chạy dev/build.

### postcss.config.js

Mục đích:

- Cấu hình pipeline PostCSS cho CSS.

Cách hoạt động:

- Dùng @tailwindcss/postcss để xử lý Tailwind v4.
- Dùng autoprefixer để thêm vendor prefix CSS.

### tailwind.config.js

Mục đích:

- Cấu hình theme/content cho Tailwind.

Cách hoạt động:

- Tailwind quét class trong index.html và src.
- File này hiện khai báo thêm color/font theo kiểu truyền thống.
- Với Tailwind v4, bạn đang dùng thêm token tại src/index.css qua @theme.

### eslint.config.js

Mục đích:

- Cấu hình lint cho TypeScript + React.

Cách hoạt động:

- Áp rule recommended của ESLint, typescript-eslint, react-hooks và react-refresh.
- Bỏ qua thư mục dist.

### tsconfig.json

Mục đích:

- File tsconfig gốc dạng project reference.

Cách hoạt động:

- Trỏ tới tsconfig.app.json và tsconfig.node.json để chia cấu hình theo ngữ cảnh.

### tsconfig.app.json

Mục đích:

- Cấu hình TypeScript cho mã ứng dụng React trong src.

Cách hoạt động:

- Dùng moduleResolution bundler, jsx react-jsx, noEmit.
- Bật các rule kiểm tra như noUnusedLocals/noUnusedParameters.

### tsconfig.node.json

Mục đích:

- Cấu hình TypeScript cho file chạy phía tooling Node (vite.config.ts).

Cách hoạt động:

- Dùng type node, noEmit, moduleResolution bundler.

### README.md

Mục đích:

- Tài liệu mặc định từ template Vite React TS.

Cách hoạt động:

- Chủ yếu mô tả setup chung, chưa phản ánh đầy đủ kiến trúc hiện tại của dự án.

---

## 2. Nhóm file public

### public/favicon.svg

Mục đích:

- Icon tab trình duyệt.

Cách hoạt động:

- Được tham chiếu trong index.html qua link rel icon.

### public/icons.svg

Mục đích:

- File icon tĩnh bổ sung (nếu cần dùng lại trong UI).

Cách hoạt động:

- Có thể tham chiếu trực tiếp qua đường dẫn public khi render.

---

## 3. Nhóm khởi động ứng dụng trong src

### src/main.tsx

Mục đích:

- Entry point React.

Cách hoạt động:

- Import CSS global.
- Bọc App bằng BrowserRouter.
- Render vào root bằng createRoot.

### src/App.tsx

Mục đích:

- Khai báo routing chính của app.

Cách hoạt động:

- Dùng Routes/Route từ react-router-dom.
- Toàn bộ route dùng DashboardLayout làm khung.
- Route index là OverviewPage.
- Các route còn lại dùng PlaceholderPage.
- Route wildcard chuyển về /.

### src/index.css

Mục đích:

- CSS global + design token + animation dùng chung.

Cách hoạt động:

- Import Google Fonts.
- Import Tailwind bằng @import "tailwindcss".
- Khai báo token màu/font/radius/shadow qua @theme.
- Định nghĩa utility class custom:
  - page-enter
  - dashboard-card
  - panel-hover
  - pixelated-icon
- Đặt background tổng thể và keyframe fade-slide-in.

---

## 4. Nhóm assets và kiểu dữ liệu

### src/assets/index.ts

Mục đích:

- Tập trung export tất cả icon/ảnh của dashboard.

Cách hoạt động:

- Import asset từ assets/icons và assets/images.
- Gói vào object assets để các component dùng nhất quán.

### src/types/dashboard.ts

Mục đích:

- Định nghĩa type/interface dùng cho dashboard.

Cách hoạt động:

- DashboardPath: union type của route hợp lệ.
- NavItem, ActivityPoint, HighlightContact, ExpenseSlice: chuẩn hóa dữ liệu hiển thị.

### src/data/overviewData.ts

Mục đích:

- Chứa dữ liệu giả lập cho sidebar, biểu đồ, card và title route.

Cách hoạt động:

- dashboardTitles map pathname -> title topbar.
- navItems cung cấp data cho sidebar.
- contacts cho khối Kèo nổi bật.
- weeklyActivity + yAxisTicks cho biểu đồ cột.
- expenseSlices cho biểu đồ doanh thu dạng donut/conic.

---

## 5. Nhóm components theo Atomic Design

## 5.1 Atoms

### src/components/atoms/Avatar.tsx

Mục đích:

- Hiển thị avatar hình tròn cho người dùng.

Cách hoạt động:

- Nhận src và alt.
- Dùng class group-hover để scale nhẹ khi hover card cha.

### src/components/atoms/IconButton.tsx

Mục đích:

- Nút icon tròn dùng cho topbar.

Cách hoạt động:

- Nhận iconSrc và alt.
- Render button có trạng thái hover nhẹ.

### src/components/atoms/NavLinkItem.tsx

Mục đích:

- Item điều hướng sidebar.

Cách hoạt động:

- Dùng NavLink để tự nhận trạng thái active từ route.
- Active: đổi màu text + nền.
- Nếu item.pixelated = true thì bật class pixelated-icon cho icon.

### src/components/atoms/SectionTitle.tsx

Mục đích:

- Tiêu đề section tái sử dụng.

Cách hoạt động:

- Nhận text và render h3 với style heading chuẩn.

## 5.2 Molecules

### src/components/molecules/MetricCard.tsx

Mục đích:

- Card thông tin tài chính Tổng quan.

Cách hoạt động:

- Nhận title/amount/holder/validThru/cardNumber.
- Render card gồm phần đầu và phần số thẻ tách bằng border-top.

### src/components/molecules/HighlightCard.tsx

Mục đích:

- Khối Kèo nổi bật gồm danh sách người và ô nhập số tiền + nút Send.

Cách hoạt động:

- Lặp contacts để render avatar + tên + vai trò.
- Nút next icon độc lập.
- Input giữ giá trị mặc định 525.50.
- Nút Send dùng shadow/token và transition hover.

### src/components/molecules/WeeklyBarChart.tsx

Mục đích:

- Biểu đồ cột so sánh deposit/withdraw theo ngày.

Cách hoạt động:

- Tính maxValue từ data.
- Hàm resolveBarHeight quy đổi giá trị thành chiều cao cột theo chartHeight.
- Render trục Y, grid line và 2 cột mỗi ngày.

### src/components/molecules/RevenueDonut.tsx

Mục đích:

- Biểu đồ donut doanh thu bằng CSS gradient.

Cách hoạt động:

- createGradient tạo chuỗi conic-gradient từ danh sách slices.
- Render text label tuyệt đối theo positionClass từng slice.

## 5.3 Organisms

### src/components/organisms/Sidebar.tsx

Mục đích:

- Sidebar đầy đủ gồm logo, avatar khung tròn decor và menu.

Cách hoạt động:

- Render title MIXIFOOT.
- Map navItems thành danh sách NavLinkItem.
- Responsive: desktop là cột dọc, mobile cho phép cuộn ngang menu.

### src/components/organisms/Topbar.tsx

Mục đích:

- Thanh topbar gồm tiêu đề trang và 2 icon action.

Cách hoạt động:

- Nhận title từ layout.
- Dùng IconButton cho Notifications và Profile.

## 5.4 Layouts

### src/components/layouts/DashboardLayout.tsx

Mục đích:

- Khung giao diện chung cho toàn bộ dashboard route.

Cách hoạt động:

- Lấy pathname từ useLocation.
- Tra title tương ứng từ dashboardTitles.
- Render Sidebar + Topbar + Outlet (nội dung trang con).

---

## 6. Nhóm pages

### src/pages/OverviewPage.tsx

Mục đích:

- Trang dashboard chính theo thiết kế Figma.

Cách hoạt động:

- Ghép các section bằng component tái sử dụng:
  - SectionTitle
  - MetricCard
  - HighlightCard
  - WeeklyBarChart
  - RevenueDonut
- Data lấy từ overviewData.ts.

### src/pages/PlaceholderPage.tsx

Mục đích:

- Trang tạm cho route chưa triển khai chi tiết.

Cách hoạt động:

- Nhận title và hiển thị thông điệp sẵn sàng mở rộng.
- Dùng style card nhất quán với hệ dashboard.

---

## 7. Tóm tắt luồng chạy tổng thể

1. index.html nạp main.tsx.
2. main.tsx khởi tạo React + BrowserRouter.
3. App.tsx định nghĩa route, tất cả vào DashboardLayout.
4. DashboardLayout dựng khung sidebar/topbar và render page con qua Outlet.
5. OverviewPage ghép dữ liệu và component để tạo dashboard hoàn chỉnh.
6. Styling lấy từ Tailwind v4 + token trong index.css.
