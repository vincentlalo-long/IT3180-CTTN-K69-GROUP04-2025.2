package com.kstn.group4.backend.payload;

public class LoginRequest {
    private String email;
    private String password;
    private String role; // Thêm biến role để hứng tư cách đăng nhập từ UI

    public LoginRequest() {
    }

    public LoginRequest(String email, String password, String role) {
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Tự sinh Getter/Setter thay vì dùng Lombok để tránh lỗi IDE
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
