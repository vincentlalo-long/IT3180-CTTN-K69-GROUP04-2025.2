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
}