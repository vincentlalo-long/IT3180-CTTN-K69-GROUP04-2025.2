package com.kstn.group4.backend.controller;

import com.kstn.group4.backend.config.security.jwt.JwtTokenProvider;
import com.kstn.group4.backend.config.security.services.UserPrincipal;
import com.kstn.group4.backend.payload.JwtResponse;
import com.kstn.group4.backend.payload.LoginRequest;
import com.kstn.group4.backend.payload.RegisterRequest;
import com.kstn.group4.backend.entity.User;
import com.kstn.group4.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    JwtTokenProvider jwtUtils;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {

        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username đã tồn tại!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email đã được sử dụng!");
        }


        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());


        user.setPassword(encoder.encode(signUpRequest.getPassword()));


        String strRole = signUpRequest.getRole();
        if (strRole == null || strRole.isEmpty()) {
            user.setRole("player"); // Mặc định là player theo chú thích schema
        } else {

            user.setRole(strRole.toLowerCase());
        }

        userRepository.save(user);

        return ResponseEntity.ok("Người dùng đã đăng ký thành công!");
    }

   @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {

        // Bước 1: Xác thực tài khoản (Email + Mật khẩu)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        // Bước 2: Lưu thông tin xác thực vào Context
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();

        // Bước 3: KIỂM TRA ROLE
        // So sánh role gửi lên từ Frontend với role thực tế trong Database
        if (loginRequest.getRole() == null || !userDetails.getRole().equalsIgnoreCase(loginRequest.getRole())) {
            return ResponseEntity.status(403) // 403 Forbidden
                    .body("Lỗi: Tài khoản của bạn không có quyền đăng nhập với vai trò " + loginRequest.getRole());
        }

        // Bước 4: Tạo JWT Token nếu role hợp lệ
        String jwt = jwtUtils.generateToken(authentication);

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getRole()));
    }
    }
