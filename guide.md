# Nhóm 04: K69 - ITTN

**Tech:** Java 25, Spring Boot, React, Vite, Tailwind, Docker

---

## 1. Công cụ cần chuẩn bị

Anh em bộ tộc cần cài đặt các thành phần cốt lõi sau:

* **Java:** Eclipse Temurin JDK 25
  (Java 21 cũng ok nhưng nên cài 25 để chạy Virtual Threads)

* **Node.js:** Phiên bản 18.x trở lên

* **IDE:** IntelliJ IDEA hoặc VS Code
  (Khuyên dùng bản Ultimate được free cho student để hỗ trợ tốt nhất cho Spring & React)

---

## 2. Thiết lập Database (Chọn 1 trong 2 hướng)

### - Hướng A: Dùng Docker (Khuyên dùng - Nhanh & Sạch máy)

* Cài Docker Desktop
* Mở Terminal tại thư mục gốc của dự án
* Chạy lệnh:

```bash
docker compose up -d
```

--> Docker sẽ tự tạo MySQL với đúng mật khẩu và cấu hình nhóm đã thống nhất

---

### - Hướng B: Dùng MySQL cài thủ công trên máy (Local)

Nếu không muốn dùng Docker:

* Đảm bảo MySQL Server đang chạy

* Tạo một database tên là `soccer_db` (hoặc tên theo `application.yaml`)

* Quan trọng:
  Phải vào file:

```bash
backend/src/main/resources/application.yaml
```

 để sửa `username` và `password` khớp với tài khoản MySQL trên máy

---

## 3. Chạy Backend (Spring Boot)

### -  Nếu dùng IntelliJ (Cách dễ nhất)

* Mở folder `backend`, đợi Maven load xong
* Tìm file `BackendApplication.java` và nhấn nút Run

---

### -  Nếu dùng Terminal

```bash
cd backend
./mvnw spring-boot:run
```

---

## 4. Chạy Frontend (React + Vite)

### - Nếu là lần đầu tiên clone dự án

Cần cài đặt các thư viện (`node_modules`):

```bash
cd frontend
npm install
```

---

### -  Chạy giao diện để code

```bash
npm run dev
```

 Truy cập: http://localhost:5173
