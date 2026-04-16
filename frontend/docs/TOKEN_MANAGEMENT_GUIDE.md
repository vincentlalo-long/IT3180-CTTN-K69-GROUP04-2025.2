# Token Management Feature Documentation

## Tổng quan

Feature này xử lý lưu token vào localStorage sau khi đăng nhập hoặc đăng ký, giúp người dùng vẫn đăng nhập khi tải lại trang.

## Các file được tạo/sửa

### 1. **Utils - Token Storage** (`src/utils/tokenStorage.ts`)
Quản lý tất cả các hoạt động lưu trữ token trong localStorage.

**Các function chính:**
- `saveTokenToStorage()` - Lưu token và thông tin user
- `getTokenFromStorage()` - Lấy token từ storage
- `getUserFromStorage()` - Lấy thông tin user từ storage
- `clearTokenFromStorage()` - Xóa token khi logout
- `isTokenValid()` - Kiểm tra token có hợp lệ
- `getBearerToken()` - Lấy token với định dạng Bearer

**Cách sử dụng:**
```typescript
import { saveTokenToStorage, getTokenFromStorage, clearTokenFromStorage } from '@/utils/tokenStorage';

// Lưu token
saveTokenToStorage("jwt_token_here", {
  role: "player",
  email: "user@example.com",
  username: "John"
});

// Lấy token
const token = getTokenFromStorage();

// Xóa token (logout)
clearTokenFromStorage();
```

---

### 2. **API Service** (`src/services/authApi.ts`)
Tập trung hóa tất cả API calls liên quan đến authentication.

**Các function:**
- `loginUser(loginData)` - Gọi API đăng nhập
- `registerUser(registerData)` - Gọi API đăng ký
- `refreshToken(oldToken)` - Làm mới token (nếu backend hỗ trợ)

**Cách sử dụng:**
```typescript
import { loginUser, registerUser } from '@/services/authApi';

// Đăng nhập
const response = await loginUser({
  email: "user@example.com",
  password: "password123",
  role: "player"
});

// Đăng ký
const response = await registerUser({
  username: "John",
  email: "user@example.com",
  password: "password123",
  role: "player"
});
```

---

### 3. **Auth Context** (`src/contexts/AuthContext.tsx`)
Quản lý trạng thái authentication toàn cục.

**Provider Properties:**
```typescript
interface AuthContextValue {
  user: AuthUser;          // Thông tin user hiện tại
  isAuthenticated: boolean; // Kiểm tra user đã đăng nhập
  isLoading: boolean;      // Trạng thái loading
  setUser: (user) => void; // Cập nhật thông tin user
  logout: () => void;      // Logout
  checkAuth: () => void;   // Kiểm tra xem user vẫn hợp lệ
}
```

**Cách sử dụng:**
```typescript
import { AuthProvider } from '@/contexts/AuthProvider';

// Bọc app với provider
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes */}
      </Routes>
    </AuthProvider>
  );
}
```

---

### 4. **useAuthContext Hook** (`src/contexts/useAuthContext.ts`)
Custom hook để sử dụng Auth Context.

**Cách sử dụng:**
```typescript
import { useAuthContext } from '@/contexts/useAuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuthContext();
  
  if (isAuthenticated) {
    return <div>Xin chào, {user.username}!</div>;
  }
  
  return <div>Vui lòng đăng nhập</div>;
}
```

---

### 5. **Updated Files**

#### LoginPage (`src/pages/auth/LoginPage.tsx`)
- Sử dụng `saveTokenToStorage()` từ utility
- Gọi API đăng nhập và lưu token

#### RegisterPage (`src/pages/auth/RegisterPage.tsx`)
- Thêm handler function `handleRegister`
- Gọi API đăng ký và lưu token
- Truyền handler vào RegisterForm

#### RegisterForm (`src/pages/auth/RegisterForm.tsx`)
- Thêm `onSubmit` prop để hỗ trợ API callback
- Thêm error handling cho global errors
- Giống cấu trúc của LoginForm

---

## Luồng xử lý

### Đăng nhập
```
LoginForm (UI) 
  ↓
loginForm.handleSubmit() gọi onSubmit callback
  ↓
LoginPage.handleLogin() 
  ↓
authApi.loginUser() gọi API
  ↓
API trả về token
  ↓
saveTokenToStorage() lưu token
  ↓
LoginForm navigate đến trang chủ
```

### Đăng ký
```
RegisterForm (UI)
  ↓
registerForm.handleSubmit() gọi onSubmit callback
  ↓
RegisterPage.handleRegister()
  ↓
authApi.registerUser() gọi API
  ↓
API trả về token (hoặc chỉ success message)
  ↓
saveTokenToStorage() lưu token
  ↓
RegisterForm navigate đến login hoặc home
```

### Sử dụng token trong các API calls
```typescript
import { getBearerToken } from '@/utils/tokenStorage';

// Khi gọi API cần authentication
const token = getBearerToken(); // "Bearer eyJhbGc..."
const response = await fetch('/api/user/profile', {
  headers: {
    'Authorization': token
  }
});
```

---

## Setup (Bắt buộc)

### 1. Wrap App với AuthProvider
Cập nhật file `main.tsx` hoặc file mount app:

```typescript
import { AuthProvider } from '@/contexts/AuthProvider';

ReactDOM.render(
  <AuthProvider>
    <App />
  </AuthProvider>,
  document.getElementById('root')
);
```

### 2. Cấu hình API endpoint
Nếu backend URL khác, cập nhật:
- `API_BASE_URL` trong `src/services/authApi.ts`
- URL trong `LoginPage.tsx` và `RegisterPage.tsx`

---

## Token Storage Structure in localStorage

```javascript
// localStorage sau khi đăng nhập thành công:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userRole": "player",
  "userEmail": "user@example.com",
  "userId": "123456",
  "userName": "John Doe"
}
```

---

## Best Practices

### 1. Sử dụng utility functions thay vì trực tiếp localStorage
```typescript
// ✅ Tốt
import { saveTokenToStorage } from '@/utils/tokenStorage';
saveTokenToStorage(token, userData);

// ❌ Tránh
localStorage.setItem("accessToken", token);
```

### 2. Sử dụng Auth Context để check authentication
```typescript
// Tốt
const { isAuthenticated, user } = useAuthContext();

//  Tránh
const token = localStorage.getItem("accessToken");
```

### 3. Luôn wrap API calls với try-catch
```typescript
try {
  const response = await loginUser(loginData);
  saveTokenToStorage(response.token, response);
} catch (error) {
  setErrors({ global: error.message });
}
```

### 4. Sử dụng centralized API service
```typescript
// Tốt
import { loginUser } from '@/services/authApi';

// Tránh
fetch('http://localhost:8080/auth/login', ...)
```

---

## Troubleshooting

### Token không được lưu
- Kiểm tra browser localStorage có bị disable không
- Kiểm tra console log có error gì không
- Kiểm tra API response có trả về token không

### Token bị mất sau tải lại trang
- Kiểm tra localStorage đã bị xóa không
- Kiểm tra token expiration time
- Kiểm tra xem có code nào xóa localStorage không

### API call không gửi token
- Kiểm tra Authorization header có được gửi không
- Kiểm trap token format (phải có "Bearer " prefix)
- Kiểm tra backend có nhận Bearer token không

---

## Future Enhancements

1. **Token Refresh**: Tự động làm mới token khi sắp hết hạn
2. **Token Expiration**: Hiển thị warning khi token sắp hết hạn
3. **Remember Me**: Cho phép lưu credentials (cần sử dụng secure methods)
4. **Two-Factor Authentication**: Thêm 2FA cho bảo mật cao hơn
5. **OAuth Integration**: Tích hợp Google, Facebook login
6. **Logout All Devices**: Logout khỏi tất cả thiết bị
