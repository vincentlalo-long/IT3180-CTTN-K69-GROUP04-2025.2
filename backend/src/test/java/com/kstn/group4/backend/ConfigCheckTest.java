package com.kstn.group4.backend;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ConfigCheckTest {

    @Value("${spring.application.name}")
    private String appName;

    @Value("${application.security.jwt.secret-key}")
    private String jwtSecret;

    @Test
    void verifyYamlIsWorking() {
        System.out.println(" Tên ứng dụng đang đọc từ YAML: " + appName);
        System.out.println("JWT Secret đang đọc từ YAML: " + jwtSecret);
        assertThat(appName).isEqualTo("football-system");
        assertThat(jwtSecret).isNotNull();
    }

    @Test
    void testPasswords() {
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        String[] passwords = {"password123"};
        for (String p : passwords) {
            if (encoder.matches(p, "$2a$10$Y9O5YLMY2VVLvxPUQXUuZOBV0ZQTvEVjYQhxFQDXvJ5y3YJ1dQrGG")) {
                System.out.println("MATCH_OWNER_HOANG: " + p);
            }
            if (encoder.matches(p, "$2a$10$slYQmyNdGzin7olVN3p5be3DlH.PKZbv5H8KnzzigXXbVxzy6QMOG")) {
                System.out.println("MATCH_PLAYER_MINH: " + p);
            }
        }
    }
}