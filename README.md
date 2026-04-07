---
# Hệ Thống App Đặt Sân Bóng Đá và Quản Lý Giải Đấu

Dự án tập trung giải quyết các vấn đề thực tế trong bóng đá phong trào như quy trình đặt sân thủ công dễ gây trùng lịch, thiếu minh bạch về khung giờ trống và khó khăn trong việc quản lý đội hình, tìm đối thủ .

## Công nghệ sử dụng
* **Backend:** Java Spring Boot (Spring Data JPA, Spring Security, REST API).
* **Frontend:** React.js (Sử dụng Axios cho API, Tailwind CSS cho giao diện).
* **Database:** MySQL / PostgreSQL.
* **Quản lý build:** Maven (Backend) & NPM (Frontend).

## Cấu trúc thư mục (Web Architecture)

```text
soccer-booking-web/
├── backend/                        # Spring Boot Application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/hust/it3180/
│   │   │   │   ├── config/         # Cấu hình Security (JWT), CORS, JPA
│   │   │   │   ├── controllers/    # API Endpoints (Booking, Field, Tournament)
│   │   │   │   ├── services/       # Logic nghiệp vụ (Kiểm tra trùng lịch, xếp hạng)
│   │   │   │   ├── repositories/   # Tầng truy xuất dữ liệu
│   │   │   │   ├── entities/       # Lớp ánh xạ Database (Sân, Đơn đặt, Giải đấu)
│   │   │   │   └── dto/            # Data Transfer Objects
│   │   │   └── resources/
│   │   │       └── application.yml # Cấu hình Database & Server
│   │   └── test/                   # Unit & Integration Tests
│   └── pom.xml
├── frontend/                       # React.js Application
│   ├── public/                     # Tài nguyên tĩnh
│   ├── src/
│   │   ├── components/             # UI Components (Lịch, Card sân, Bảng xếp hạng)
│   │   ├── pages/                  # Trang chủ, Quản lý sân, Quản lý giải đấu
│   │   ├── services/               # API Clients kết nối Backend
│   │   ├── store/                  # Quản lý trạng thái (Zustand hoặc Redux)
│   │   └── utils/                  # Helper functions
│   ├── package.json
│   └── tailwind.config.js
├── database/
│    ├── schema.sql                 # File chạy để tạo bảng database 
│    └── seed.sql                   # File để add dữ liệu mẫu
│    └── database.md                # File hướng dẫn MD
├── docs/                           # Tài liệu dự án                
│   ├── erd/                        # Sơ đồ database                        
│   ├── diagrams/                   # Sơ đồ Use Case, ERD .
│   └── Idea_Proposal_IT3180.pdf    # Đề xuất ý tưởng gốc .
└── README.md
```

##  Tính năng chính theo đề xuất

### 1. Dành cho Người chơi & Đội bóng (Player/Team)
* **Tìm kiếm & Bộ lọc:** Tìm sân theo khu vực, khung giờ, giá và mặt sân.
* **Đặt sân trực tuyến:** Hỗ trợ đặt sân lẻ hoặc định kỳ theo tuần/tháng .
* **Quản lý đội hình:** Theo dõi lịch thi đấu, kết quả và danh sách thành viên.
* **Tìm đối thủ:** Chức năng "Ghép kèo" gợi ý các đội phù hợp về trình độ và khu vực .
* **Đánh giá & Tích điểm:** Đánh giá chất lượng sân và tích lũy điểm thưởng để nhận ưu đãi.

### 2. Dành cho Chủ sân (Manager)
* **Số hóa lịch đặt:** Giao diện lịch (Calendar view) trực quan giúp theo dõi tỷ lệ lấp đầy khung giờ .
* **Quản lý đơn hàng:** Duyệt/từ chối yêu cầu đặt sân, cấu hình chính sách hủy và đặt cọc.
* **Cấu hình dịch vụ:** Quản lý danh sách dịch vụ đi kèm như nước uống, áo bib, thuê trọng tài.
* **Tối ưu doanh thu:** Gợi ý điều chỉnh giá theo các khung giờ cao điểm hoặc giờ trống nhiều.

### 3. Quản lý giải đấu (League Management)
* **Tự động hóa:** Tự động sinh lịch thi đấu theo các thể thức vòng tròn hoặc loại trực tiếp.
* **Thống kê:** Cập nhật bảng xếp hạng, danh sách ghi bàn (Top Scorers) và kiến tạo.

##  Lộ trình hiện thực (Phạm vi môn học)
Trong khuôn khổ môn học, nhóm ưu tiên hiện thực các tính năng cốt lõi:
* [x] Quản lý thông tin sân bóng và hiển thị lịch trống.
* [x] Chức năng tìm kiếm và đặt sân trực tuyến.
* [x] Quản lý đơn đặt sân cho cả người chơi và chủ sân.
* [x] Quản lý giải đấu chi tiết và ghép kèo (Giai đoạn mở rộng).
