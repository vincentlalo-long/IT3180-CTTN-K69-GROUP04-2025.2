import axios from 'axios';

// Khởi tạo instance Axios tập trung
const api = axios.create({
  // Thiết lập baseURL trỏ về Backend của nhóm
  baseURL: 'http://localhost:8080/api/v1',
  // Thiết lập headers mặc định là JSON
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm request interceptor để tự động gắn JWT token từ localStorage vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xóa token và user từ localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Chuyển hướng đến trang login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;