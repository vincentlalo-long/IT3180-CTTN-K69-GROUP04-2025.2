# SKELETON FRONTEND (CẬP NHẬT)

## 1. Cây thư mục `src/`

```text
src/
├─ App.tsx
├─ main.tsx
├─ index.css
├─ assets/
│  ├─ icons/
│  │  ├─ eye-off.svg
│  │  ├─ eye.svg
│  │  ├─ facebook.svg
│  │  ├─ google.svg
│  │  └─ mixifoot-logo.svg
│  └─ images/
│     ├─ auth-background.jpg
│     ├─ hero-lamine.webp
│     ├─ logo-amixi.png
│     └─ mixifoot-figure.png
├─ components/
│  ├─ admin/
│  │  ├─ Sidebar.tsx
│  │  ├─ StatCard.tsx
│  │  └─ Topbar.tsx
│  └─ ui/
│     ├─ Button.tsx
│     ├─ SocialIconButton.tsx
│     └─ TextInput.tsx
├─ contexts/
│  └─ FacilityContext.tsx
├─ data/
│  └─ mockAdminData.ts
├─ layouts/
│  ├─ AdminLayout.tsx
│  └─ AuthLayout.tsx
└─ pages/
   ├─ LandingPage.tsx
   ├─ admin/
   │  ├─ AdminDashboardPage.tsx
   │  ├─ AdminFeatureLandingPage.tsx
   │  ├─ FieldSchedulePage.tsx
   │  └─ SettingsPage.tsx
   └─ auth/
      ├─ LoginForm.tsx
      ├─ LoginPage.tsx
      ├─ RegisterForm.tsx
      └─ RegisterPage.tsx
```

## 2. Ghi chú kiến trúc ngắn

- Luồng User nằm ở `LandingPage`, `LoginPage`, `RegisterPage`.
- Luồng Admin nằm trong `AdminLayout` với nested routes (`/admin/*`).
- Dữ liệu giả lập tập trung tại `data/mockAdminData.ts`.
- State toàn cục cho chọn khu sân dùng `contexts/FacilityContext.tsx`.
- Các thành phần dùng chung ưu tiên ở `components/ui`.
- Các thành phần đặc thù dashboard admin nằm ở `components/admin`.
